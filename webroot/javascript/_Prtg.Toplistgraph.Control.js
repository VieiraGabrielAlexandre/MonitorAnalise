(function($, window, document, undefined) {
	var sourceRegex = /source/ig;
	var source2Regex = /(source|ip|channel)/ig;
	var destinRegex = /destination/ig;
	_Prtg.Graphixs = _Prtg.Graphixs || { "___": '_Prtg.Graphixs' };
	$.extend(true, _Prtg.Graphixs, {
    asImage: function($self, svg, w, h){
      var s = new XMLSerializer()
        , arr = _Prtg.Util.strToUTF8Arr((svg.outerHTML || s.serializeToString(svg)));
      return 'data:image/svg+xml;base64,' + _Prtg.Util.base64EncArr(arr);
    },
		Toplist: { 
			Chord: {
				render: function render(data, to, preview, width, height, legends, sourcesStr, destinationsStr, renderAsImage){

					to = typeof(to)==='string'?$(to):to;
					if(data.length===0 || data[0].Size===0 || to.length === 0) return;
					if(width === undefined) width = to.width();
					if(height=== undefined) height = to.height();

					var r1 = Math.min(width, height) / 2
						, r0 = preview===true?r1 -r1/7:r1 - r1*0.5
						, maxcaption = Math.floor(r1/2 / 8)
						, u = Math.floor(Math.PI * r1 * 0.15)
						, ourcolors=[_Prtg.Colors.mousegray, _Prtg.Colors.graph2, _Prtg.Colors.graph4, _Prtg.Colors.graph5,_Prtg.Colors.graph6, _Prtg.Colors.graph7, _Prtg.Colors.graph8]
						// we intentionally do not use colors 1 (red) and 3 (dark blue)
						, fill = d3.scale.ordinal().range(ourcolors)
						, chord = d3.layout.chord()
							.padding(0)
							.sortSubgroups(d3.descending)
							.sortChords(d3.ascending)
						, arc = d3.svg.arc()
							.innerRadius(r0)
							.outerRadius(r0 + r0/7)
						, vis = d3.select(to[0]).append("svg:svg")
                .attr({
                  "version": 1.1,
                  "xmlns": "http://www.w3.org/2000/svg",
                  "xmlns:xmlns:xlink":"http://www.w3.org/1999/xlink",
                  "width": width,
                  "height": height
                })
						, svg = vis.append("svg:g")
							.attr("transform", "translate(" + r1 + "," + r1 + ")")
						, indexByName = {}
						, nameByIndex = {}
						, matrix = []
						, n = 0
						, row = []
						, other = null
						, sources = (function(){
								var src = sourcesStr || $.map(Object.keys(data[0]),function(e){ if(sourceRegex.test(e)) return e;}); 
								return src.length> 0 ? src : [Object.keys(data[0])[1]];
							})()
						, destinations = destinationsStr || $.map(Object.keys(data[0]),function(e){ if(destinRegex.test(e)) return e;})
						// , destinations = destinationsStr || $.map(['DestinationIP','DestinationMAC','DestinationPort'], function(e){ if(data[0].hasOwnProperty(e)) return e;})
						, values = "Size"
						, src = names(sources)
						, dst = names(destinations)
						, sum = 0.0;
					
					if(sources.toString() === destinations.toString()){
							destinations = [];
							dst = names(destinations);
					}

					if(!data[0].hasOwnProperty(values))
						return;
					if(destinations.length === 0){
						sources = $.map(Object.keys(data[0]),function(e){ if(source2Regex.test(e)) return e;})
						// sources = $.map([ 'IP','Channel','SourceIP','SourceMAC','SourcePort'], function(e) { if(data[0].hasOwnProperty(e)) return e;});
						src = names(sources);
					}
					// search for the "other" record
					for(var i = 0; i < data.length; i++) {
						if(data[i]['position'] === _Prtg.Lang.common.strings.Other) {
							other = data[i];
							other[sources[0]] = data[i]['position'];
							other[destinations[0]] = data[i]['position'];
							break;
						}
					}
					// normalize to MB and sum values
					// move surplus records to other
					for(var i = 0; i < data.length; i++) {
						data[i][values+'x'] = data[i][values];
						data[i][values] = data[i][values] !==0 ? data[i][values]/0x100000 : data[i][values];
						sum += data[i][values];
						if(!!other && i > u){
							//other[values] += data[i][values];
							data[i][sources[0]] = other[sources[0]];

						}
					}
					// build up the lookup lists
					// creating the column names from source and destination properties
					// index by name and
					// name by index
					$.each(data,function(i,d) {
						var name = src.name(d);
						if(!indexByName.hasOwnProperty(name)){
							indexByName[name] = n;
							nameByIndex[n] = {
								src: name,
								dst: [
									{
										name:dst.name(d),
										val: d[values]
									}
								]
							};
							++n;
							name = dst.name(d);
							if(!indexByName.hasOwnProperty(name)){
								indexByName[name] = n;
								nameByIndex[n] = {
									src: name,
									dst: []
								};
								++n;
							}
		        } else {
							nameByIndex[indexByName[name]].dst.push(
		            {
		              name:dst.name(d),
									val: d[values]
								}
							);
						}
					});
					if(destinations.length > 0 && sources.length > 0){
						// initialize matrix columns
						$.each(nameByIndex,function() {
							row.push(0);
						});
						// initialize matrix rows
						$.each(nameByIndex,function() {
							matrix.push(row.slice(0));
						});

						// Construct a square matrix counting package imports.
						$.each(indexByName,function(i,r) {
								var d = nameByIndex[r];
								$.each(indexByName,function(j,c){
										var e = nameByIndex[c];
										if(d.src === e.src) {
											$.each(e.dst,function(i,x){
												c = indexByName[x.name];
												if(c !== undefined){
													matrix[r][c] += x.val;
												}
											});
										}
								});
						});
						chord.matrix(matrix);
						var g = svg.selectAll("g.group")
							.data(chord.groups)
							.enter().append("svg:g")
							.on('mouseover', function(d, i) {
		            $('.chord').not($('path.s'+d.index + ',path.t'+d.index)).css('opacity',0.05);
							})
							.on('mouseout', function(d, i) {
		            $('.chord').not($('path.s'+d.index + ',path.t'+d.index)).css('opacity',0.33);
							})
							.attr("class", function(d){return "group id-"+d.index;});
						g.append("svg:path")
							.style("fill", function(d) { return fill(d.index); })
							.style("stroke", function(d) { return fill(d.index); })
							.attr("d", arc)
							.insert("svg:title")
							.text(function(d) { return nameByIndex[d.index].src; });

						g.append('svg:text') //prozentzahlen
							.each(function(d) {
								d.angle = (d.startAngle + d.endAngle) / 2;
								d.width = (d.endAngle - d.startAngle) * r0;
							})
							.attr("dy", ".35em")
							.attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
							.attr("transform", function(d) {
								return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
									+ "translate(" + (r1 *0.5+3) + ")"
									+ (d.angle > Math.PI ? "rotate(180)" : "");
							})
							.attr("style", 'font-size:9px')
							.text(function(d) { return d.width > 9 ? percentage(d.value) : null; });

						g.append("svg:text") // Beschriftungen
							.attr("dy", ".35em")
							.attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
							.style("font-size", function(d) {if (d.width>10) {return "12px"; } else if (d.width>6) {return "9px"; } else  return "7px";}) //Label ausblenden wenn zu schmal
							.style("display", function(d) {if (d.width>3) {return ""; } else return "none";}) //Label ausblenden wenn zu schmal
							.attr("transform", function(d) {
								return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
										+ "translate(" + (r0 + r0/9+ 10) + ")"
										+ (d.angle > Math.PI ? "rotate(180)" : "");
							})
							.text(function(d) { return preview===true?null:nameByIndex[d.index].src.centerellipsis(maxcaption).trim(''); })
              .attr("class", "toplist-caption")
							.insert("svg:title")
							.text(function(d) { return nameByIndex[d.index].src; });

						svg.selectAll("path.chord")  //Bunte Bögen
							.data(chord.chords)
							.enter().append("svg:path")
							.on('mouseover', function(d, i){
		            $(this).css('opacity',1);
							})
							.on('mouseout', function(d, i){
		            $(this).css('opacity',0.33);
							})
							.attr("class", function(d){return "chord s" + d.source.index + ' t' + d.target.index;})
							.style("stroke", function(d) { return d3.rgb(fill(d.source.index)); })
							.style("stroke", function(d) { return d3.rgb(fill(d.source.index)).darker(0.5); })
							.style("fill", function(d){return fill(d.source.index);})
              .style("opacity",0.33)
							.style("display", function(d) { if (d.source.endAngle - d.source.startAngle < Math.PI) {return ""; } else  return "none";}) //ausblenden des kaputten Bogens wenn >180°
							.attr("d", d3.svg.chord().radius(r0))
							.insert("svg:title")
							.text(function(d) { return nameByIndex[d.source.index].src; });



						if(sources.length >1)
							to.append('<span>'+_Prtg.Lang.common.strings.Groups+': '+sources.join(':').replace(/Source/g,'')+'</span>');
					} else {

						////
						//// PIE Chart
						////
						$('.animation').hide();
						arc.innerRadius(r1/5);
						var pie = d3.layout.pie()
							.value(function(d) { return +d[values]; })
							.sort(function(a, b) { return b[values] - a[values]; });
						var g = svg.selectAll("g.group")
							.data(function(d) { return pie(data); })
							.enter().append("svg:g")
							.attr("class", "group");

						g.append("svg:path")
							.attr("fill", function(d) { return fill(src.name(d.data)||dst.name(d.data)); })
							.attr("stroke", function(d) { return fill(src.name(d.data)||dst.name(d.data)); })
							.attr("d", arc)
							.attr("data-legend", function(d){ return percentage(d.data[values]) >= 1 ? src.name(d.data) : null;})
							.insert("svg:title")
							.text(function(d) { return src.name(d.data); });
						g.append('svg:text')
							.each(function(d) {
								d.angle = (d.startAngle + d.endAngle) / 2;
								d.width = (d.endAngle - d.startAngle) * r0;
							}) 
							.attr("dy", ".35em")
							.attr("class", "values")
							.attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
							.attr("transform", function(d) {
								return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
									+ "translate(" + (r1 *.3) + ")"
									+ (d.angle > Math.PI ? "rotate(180)" : "");
							})
							.attr("style", 'font-size:9px')
							.text(function(d) { return d.width > 10 ? percentage(d.data[values]) +'%': null; });
						if(legends)
							svg.append("g")
		            .attr("class", "legend toplist-caption")
		            .attr("transform", "translate("+r0*1.5+",-"+r0+")")
		            .style("font-size", "12px")
		            .call(d3.legend);
		        else
							g.append("svg:text")
								.attr("dy", ".35em")
								.attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
								.style("font-size", function(d) {if (d.width>10) {return "12px" } else if (d.width>6) {return "9px" } else  return "7px";}) //Label ausblenden wenn zu schmal
								.attr("transform", function(d) {
									return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
									  + "translate(" + (r0 + r0/10+ 10) + ")"
										+ (d.angle > Math.PI ? "rotate(180)" : "");
								})
								.text(function(d) {return preview===true?null:d.width > 6 ? src.name(d.data).centerellipsis(maxcaption).trim('') : null; })
                .attr("class", "toplist-caption")
								.insert("svg:title")
								.text(function(d) { return src.name(d.data); });
					}
					if(to.hasClass('zoomable'))
						to.append('<a class="zoom" title="'+_Prtg.Lang.common.strings.ZoomGraph+'" href="" target="_blank"><i class="ui-icon ui-icon-newwin"></i></a>');
          if(renderAsImage)
            return _Prtg.Graphixs.asImage(to, vis[0][0], width, height);
            
					function names(c){
						return {
							name : function(d){
								var ret = [];
								$.each(this.columns, function(i,e){
									ret.push(d[e]);
								});
								return ret.join(' : ');
							},
							columns: c
						};
					}
					function percentage(a){
						var val = a / sum * 100;
						if(val < 1)
							return '<1%';
						else
							return Math.round(val,0);
					}
        }
			},
			Linkage:{
				render: function render(data,to, width, height, sourcesStr, destinationsStr){
				to = typeof(to)==='string'?$(to):to;
				if(!data[0] || to.length === 0) return;
				if(width === undefined) width = to.width();
				if(height=== undefined) height = to.height();

				var dx = {nodes:[],links:[]}
					, nameByIndex = {}
					, n = 0
					, u = 40
					, other = null
					, sources = $.map(['SourceIP','SourceMAC','SourcePort'], function(e){ if(data[0].hasOwnProperty(e)) return e;})
					, destinations = $.map(['DestinationIP','DestinationMAC','DestinationPort'], function(e){ if(data[0].hasOwnProperty(e)) return e;})
					, values = "Size"
					, src = names(sources)
					, dst = names(destinations)
					, sum = 0.0;


				var margin = {top: 80, right: 0, bottom: 10, left: 80},
					width = 600,
					height = 600;

				var x = d3.scale.ordinal().rangeBands([0, width]),
					z = d3.scale.pow().domain([0, 1.9]).clamp(true),
					c = d3.scale.category20().domain(d3.range(40));

				var svg = d3.select("body").append("svg")
						.attr("width", width + margin.left + margin.right)
						.attr("height", height + margin.top + margin.bottom)
						.style("margin-left", margin.left + "px")
					.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

					function render(data) {
						var matrix = [],
								nodes = data.nodes,
								n = nodes.length;

						// Compute index per node.
						nodes.forEach(function(node, i, a) {
								a[i] = {
										name:node.split(' : ')[0],
										group:node.split(' : ')[1],
									index:i,
									count:0};
							matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
						});

						// Convert links to matrix; count character occurrences.
						data.links.forEach(function(link) {
							matrix[link.source][link.target].z += link.value;
							matrix[link.target][link.source].z += link.value;
							matrix[link.source][link.source].z += link.value;
							matrix[link.target][link.target].z += link.value;
							nodes[link.source].count += link.value;
							nodes[link.target].count += link.value;
						});

						// Precompute the orders.
						var orders = {
							name: d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a].name, nodes[b].name); }),
							count: d3.range(n).sort(function(a, b) { return nodes[b].count - nodes[a].count; }),
							group: d3.range(n).sort(function(a, b) { return nodes[b].group - nodes[a].group; })
						};

						// The default sort order.
						x.domain(orders.name);

						svg.append("rect")
								.attr("class", "background")
								.attr("width", width)
								.attr("height", height);

						var row = svg.selectAll(".row")
								.data(matrix)
							.enter().append("g")
								.attr("class", "row")
								.attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
								.each(row);

						row.append("line")
								.attr("x2", width);

						row.append("text")
								.attr("x", -6)
								.attr("y", x.rangeBand() / 2)
								.attr("dy", ".32em")
								.attr("text-anchor", "end")
								.text(function(d, i) { return nodes[i].name; });

						var column = svg.selectAll(".column")
								.data(matrix)
							.enter().append("g")
								.attr("class", "column")
								.attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

						column.append("line")
								.attr("x1", -width);

						column.append("text")
								.attr("x", 6)
								.attr("y", x.rangeBand() / 2)
								.attr("dy", ".32em")
								.attr("text-anchor", "start")
								.text(function(d, i) { return nodes[i].name; });

						function row(row) {
							var cell = d3.select(this).selectAll(".cell")
									.data(row.filter(function(d) { return d.z; }))
								.enter().append("rect")
									.attr("class", "cell")
									.attr("x", function(d) { return x(d.x); })
									.attr("width", x.rangeBand())
									.attr("height", x.rangeBand())
									.style("fill-opacity", function(d) { return z(d.z); })
									.style("fill", function(d) { return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null; })
									.on("mouseover", mouseover)
									.on("mouseout", mouseout);
						}

						function mouseover(p) {
							d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
							d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
						}

						function mouseout() {
							d3.selectAll("text").classed("active", false);
						}

						d3.select("#order").on("change", function() {
							clearTimeout(timeout);
							order(this.value);
						});

						function order(value) {
							x.domain(orders[value]);

							var t = svg.transition().duration(2500);

							t.selectAll(".row")
									.delay(function(d, i) { return x(i) * 4; })
									.attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
								.selectAll(".cell")
									.delay(function(d) { return x(d.x) * 4; })
									.attr("x", function(d) { return x(d.x); });

							t.selectAll(".column")
									.delay(function(d, i) { return x(i) * 4; })
									.attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
						}

					};

					if(!data[0].hasOwnProperty(values))
						return;
					if(destinations.length === 0){
						sources = $.map([ 'IP','Channel','SourceIP','SourceMAC','SourcePort'], function(e){ if(data[0].hasOwnProperty(e)) return e;})
						src = names(sources)
					}
					for(var i = 0; i < data.length; i++) {
						if(data[i]['position'].lastIndexOf('.') === -1){
							data[i][sources[0]] = data[i]['position'];
							data[i][destinations[0]] = data[i]['position'];
							other = data[i];
							break;
						}
					}
					for(var i = 0; i < data.length; i++) {
						data[i][values] = data[i][values] !==0 ? data[i][values]/0x100000 : 0.0;
						if(!!other && i > u)
							other[values] += data[i][values];
					}
					 data = data.slice(0 , u);
					$.each(data,function(i,d) {
						var srcname = src.name(d)
								, srcidx = dx.nodes.indexOf(srcname);
						if(srcidx === -1)
								srcidx = dx.nodes.push(srcname)-1;
						 var dstname = dst.name(d)
								, dstidx = dx.nodes.indexOf(dstname);
						if(dstidx === -1)
								dstidx = dx.nodes.push(dstname)-1;

							dx.links.push({
								"source": srcidx,
								"target": dstidx,
								"value": d[values]
								});
					});

					renderMatrix(dx);
					function names(c){
						return {
							name : function(d){
								var ret = [];
								$.each(this.columns, function(i,e){
									ret.push(d[e]);
								});
								return ret.join(' : ');
							},
							columns: c
						}
					};
					function percentage(a){
						var val = a / sum * 100;
						if(val < 1)
							return '<1%';
						else
							return Math.round(val,0) +'%';
					};
				}
			}
		}
	});
})(jQuery, window, document);
