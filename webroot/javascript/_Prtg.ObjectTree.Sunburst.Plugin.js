// _Prtg.ObjectTree.Sunburst.Plugin.js
(function ( $, window, document, undefined ) {
	var pluginName = "sunburst";
	function Sunburst(element,data,parent){
		this.$element = $(element);
		this.data = data;
		if(!this.data.dataview){
			this.data.dataview = new Slick.Data.RemoteModel(this.data);
			if(!!data.options.filter){
				var self = this;
				$.each(data.options.filter,function(i,v){
					self.data.dataview.toggleFilter(v);
				});
			}
		}
		if(!!data.objects){
			this.data.dataview.initializeData(0, data.objects, false, 'sensorxref');
			this.$element.removeAttr('data-objects');
			this.initialRender = this.update;
		}
		this.parent = parent;
		this.layout = {};
		this.zoom = 1;
		this.init(this);
		this.initialRender();
	};
	Sunburst.prototype.initialRender = function dummy(){};

	Sunburst.prototype.init = function(me){
		var $self = me.$element
			, data = me.data;

			me.filter = data.dataview.Filters();
			me.offsetX = 0;
			me.offsetY = 0;
			me.sizePriority = me.getSize ('sunburstSizePriority');
			me.sizeSensors = me.getSize ('sunburstSizeSensors');
			me.partition = d3.layout.partition()
				.sort(function (a, b) { return a.name > b.name ? 1 : a.name < b.name ? -1 : 0; })
				.children(function (d) { return d._children.length > 0 ? $.grep(d._children, function(d){
					var ret = true;
					if(me.filter !== true && !!d && d.basetype === 'device')
						$.each(me.filter, function (i,e) {
							var sum = 0
								, types = _Prtg.Core.objects.group.sensorTypes.slice(0);
							$.each(types.splice(0,types.indexOf(e)+1), function(i,e){
							 sum += d[e+'sens'];
							});
							ret = ret && (sum === 0 || sum > d[e+'sens']);
						});
					return ret;
				}) : null; })
				.value(function (d) { return d.basetype === 'device' || /filter/.test(d.libkind) === true ? Math.pow((Math.log((me.sizeSensors ? d.totalsens + 2 : 4)) / Math.LN2), (me.sizePriority ? parseInt(d.priority) : 1)) : 1; });
      me.container = $self.find('.slick-viewport,#viewport').closest('.mapobjectpreviewcontainer').addBack().eq(0);
			me.vis = d3.select(me.container[0])
				.append("svg:svg")
				.attr({
								"version": 1.1,
      					"xmlns": "http://www.w3.org/2000/svg",
      					"xmlns:xmlns:xlink":"http://www.w3.org/1999/xlink",
								"class": 'sunburst d3'
							});
			me.arc = d3.svg.arc()
				.startAngle(function (d) { return d.x; })
				.endAngle(function (d) { return d.x + d.dx; })
				.innerRadius(function (d) { return d.sunburst.sqrtY; })
				.outerRadius(function (d) { return d.sunburst.arcwidth; });
			me.layout.element = $(me.vis[0]);
			me.layout.element
				.on('destroyed',function() {
					_Prtg.Plugins['groupviewsize'] ={init:function(){}};
				});

		if (!me.data.options.hideControls){
			_Prtg.Plugins['groupviewsize'].init = function(){me.groupviewsize.call(this,me)};
			_Prtg.Plugins['groupviewsize'].init.call($(me.data.options.controlsParent).find('.size-by-switch.control'));
		}

   _Prtg.Events.subscribe('resize.objecttree',$.proxy(me.refresh, me, true));

   me.$element.on('resize.objecttree', function(){
      $.proxy(me.refresh, me, true);
    });
  };

	Sunburst.prototype.groupviewsize = function(me){
		$(this)
			.addClass('show')
			.html($.jqote(_Prtg.Core.getObject('sensorTree').sunburst.template, [{sizePriority:me.sizePriority,sizeSensors:me.sizeSensors}]))
			.find("#sunburstSizePriority").click(function () {
					me.sizePriority = !me.sizePriority;
					try { ret = window.localStorage.setItem('sunburstSizePriority', me.sizePriority) } catch (e) { }
					me.update();
					return;
			})
			.end()
			.find("#sunburstSizeSensors").click(function () {
				me.sizeSensors = !me.sizeSensors;
				try { ret = window.localStorage.setItem('sunburstSizeSensors', me.sizeSensors) } catch (e) { }
				me.update();
				return;
			});
	};

	Sunburst.prototype.refresh = function(resize){
		this.startT = new Date().getTime();
		var me = this
      , $self = this.$element
			, data = this.data.dataview.Data()
			, svg = this.vis[0][0]
      , w = me.container.width()
      , h = me.container.height() //closest('#objecttreecontainer,#showalibrary').addBack().eq(0).height()
			, mwh = Math.min(w, h)
			, r = this.rr(mwh>>1)
			, id = $self.attr('id')
      , notZoomable = this.data.options.nozoom
      , filter = [];

    // w = h = Math.min(w,h)
		this.layout.element.detach().empty();
		this.filter = this.data.dataview.Filters();
    jQuery.each(_Prtg.Core.objects.group.sensorTypes, function(i, key){
      if(me.filter.indexOf(key) === -1)
        filter.push(key);
    });
    this.partition.size([2 * Math.PI, r*r]);
		this.vis.attr({
			'width':  w,
			'height': h
		});
    if(!!resize){
      this.zoom = 1;
		  this.translate = [w>>1,h>>1]
    }

		var sun_burst = this.vis.append("svg:g")
      .attr("transform", "translate("+me.translate+") scale("+me.zoom+")");

		if(!notZoomable && _Prtg.Core.objects.sunburstZoomDeviceCount < data[0].devicenum){
      var dragstart = [0,0];
      var dragging = false;
      var drag  = d3.behavior.drag()
        .on("dragstart", function(e){
          dragging = false
        })
        .on("drag", function(){
          if(dragging || Math.abs(d3.event.dx) > 3 || Math.abs(d3.event.dy) > 3){
            d3.event.sourceEvent.stopPropagation();
            dragging = true
            sun_burst.style("cursor", "move");
            me.translate = [d3.event.x,d3.event.y];
            sun_burst.attr("transform", "translate("+me.translate+") scale(" + me.zoom + ")");
          }
        })
        .on("dragend", function(){
          if(dragging){
            dragging = false;
            d3.event.sourceEvent.stopPropagation();
            sun_burst.style("cursor", "auto");
        }
        });
		  sun_burst
	      .call(d3.behavior.zoom().on("zoom", function(){
          d3.event.sourceEvent.stopPropagation();
	      	me.zoom = d3.event.scale;
	      	//me.translate = [(w>>1)+d3.event.translate[0],(h>>1)+d3.event.translate[1]];
          sun_burst.attr("transform", "translate("+me.translate+") scale(" + me.zoom + ")");
	      }));
        sun_burst.call(drag);
      var d = this.vis
	      .append("foreignObject")
	      	.attr('width','30')
	      	.attr('height','50')
	      	.append('xhtml:body')
	      	.append('div')
	      		.attr('id', 'Zoom_Sunburst')
	      		.attr('class','olControlZoom olControlNoSelect');
	      	d.append('a')
	      		.attr('class','olControlZoomIn olButton')
	      		.text('+');
	      	d.append('a')
	      		.attr('class','olControlZoomOut olButton')
	      		.text('-');
			  $(me.container)
	      	.off('click.zoom')
	      	.on('click.zoom','.olControlZoomOut',function(e){
            e.stopImmediatePropagation();
	      		me.zoom -= me.zoom  >= 0.2 ? 0.1 : 0;
            sun_burst.attr("transform", "translate("+me.translate+") scale(" + me.zoom + ")");
          })
	      	.on('click.zoom','.olControlZoomIn',function(e){
            e.stopImmediatePropagation();
	      		me.zoom += me.zoom  <= 3.0 ? 0.1 : 0;
            sun_burst.attr("transform", "translate("+me.translate+") scale(" + me.zoom + ")");
	      	});
		}

    var path = sun_burst
			.data(data)
			.selectAll("path")
			.data(this.partition.nodes)
			.enter()
			.append("svg:g")
			.each(this.stash)
			.attr("class", function (d) {
				var status = 'none';
				jQuery.each(filter, function (i,key) {
					if (d[key + 'sens'] > 0 ) {
						status = key;
						return false;
					}
				});
				return (!!d.parent ? (d.libkind||d.basetype) + ' ' + status : "uplink")  + (d.sunburst.radialtext ? ' radial':' noradial');
			})
			.attr('type', function(d){ return !!d.parent ? d.basetype : "uplink";});

		if( data[0].probegroupdevice.length > 1
		&& (data[0].probegroupdevice[0] !== -6
			|| data[0].probegroupdevice.length>2)){
			this.vis.selectAll('.uplink')
	      .append("a")
	      .attr("xlink:href", function(d){
	      		if(d.probegroupdevice[0] === -6
	      		&& d.basetype === 'library'){
	      			return '/library' + (d.probegroupdevice.length === 3 ? '' : 'object') +'.htm?id=' + (d.probegroupdevice.length>1 ? d.probegroupdevice[d.probegroupdevice.length-2] : d.probegroupdevice[1]);
	      		}
	      	return  '/' +  (d.probegroupdevice.length === 3 ? 'probenode' : 'group') + '.htm?id=' + (d.probegroupdevice.length>1 ? d.probegroupdevice[d.probegroupdevice.length-2] : 0);
	      })
				.append("svg:path")
	      .attr("class",'arc')
	      .attr("fill",'white')
				.attr("d", this.arc)
				.append("svg:title")
	      .text("Up");

			this.vis.selectAll('.uplink a')
				.insert("svg:g")
				.append('text')
			this.vis.selectAll('.uplink a text')
				.insert('tspan')
				.attr('rotate','90')
				.text(String.fromCharCode(8629))
				.append("svg:title")
	      .text("Up");
			this.vis.selectAll('.uplink a text')
				.insert('tspan')
				.attr('rotate','180')
				.text(' '+String.fromCharCode(168))
				.append("svg:title")
	      .text("Up");
	  }

		this.vis.selectAll('.probe, .group, .device, .filter, .node, .linked')
      .append("a")
      .attr("xlink:href", function(d){return '/' +  (d.basetype === 'probe' ? 'probenode' : d.basetype) + '.htm?id=' + d.objid;})
      .attr('data-id', function (d) { return d.objid; })
			.append("svg:path")
      .attr({
				'id': function (d) { return id+'-' + d._id },
				'path': function (d) { return d._id },
      	'data-id': function (d) { return d.objid; },
      	'objid': function(d){return d.objid;},
      	'class': function(d){return 'arc ' + d.basetype + 'menu';},
      	'type': function(d){return d.basetype;},
				'fill': function (d,i) {
						var status = 'none';
						jQuery.each(filter, function (i,key) {
							if (d[key + 'sens'] > 0 ) {
								status = 'status' + key;
								return false;
							}
						});
					return _Prtg.Colors[status];
				},
				'stroke': '#fff',
      	'popup': 3333,
				'd': this.arc
			})
			.append("svg:title")
      .text(function(d){return d.name})
      .insert('icon')
      .attr('style', function(d){return 'background-image:url('+_Prtg.Core.objects.icons.icon(d)+');'});
		this.vis
			.selectAll('g.probe.radial a,g.group.radial a,g.filter.radial a,g.node.radial a,g.linked.radial a')
			.append("svg:text")
		  .attr('class', 'fadeinpath')
			.attr('dy', function (d) { return ((Math.sqrt(d.y + d.dy) - d.sunburst.sqrtY) / 2 + d.sunburst.fontsize / 1.8)})
			.attr("style", 'display:none')
			.style("font-size", function (d) { return d.sunburst.fontsize +'px'; })
			.insert('svg:textPath')
			.attr("text-anchor", "middle")
			.attr('startOffset', '20%')
			.attr('xlink:href', function (d) { return '#'+id+ '-' + d._id })
			.text(function (d) { return d.sunburst.tanellipsis; });
		this.vis
			.selectAll('g.device a,g.probe.noradial a,g.group.noradial a,g.filter.noradial a,g.node.noradial a,g.linked.noradial a')
			.insert("svg:g")
			.attr("transform", this.rotate)
			.append("svg:text")
			.attr("text-anchor", function(d){return d.sunburst.leftside ? "end" : "start"})
  		.attr("dy", "0.9ex")
			.style('font-size', function (d) { return d.sunburst.fontsize + 'px'; })
			.text(function (d) { return d.sunburst.radellipsis})
			.append("svg:title")
      .text(function(d){return d.name})
      .insert('icon')
      .attr('style', function(d){return 'background-image:url('+_Prtg.Core.objects.icons.icon(d)+');'});



		if($self.parents('#mapeditor').length){
			this.layout.element.find('.fadeinpath').show();
			this.asImage(svg, w, h);
		}else{
			$self.find('.slick-viewport, #viewport').append(this.layout.element);
			setTimeout(function(){
				me.layout.element.find('.fadeinpath').show();
				// console.log((new Date()).getTime()-me.startT);
			}, 100);
		}
	};
	Sunburst.prototype.asImage = function(svg, w, h){
		var s = new XMLSerializer()
			, arr = _Prtg.Util.strToUTF8Arr((svg.outerHTML || s.serializeToString(svg)))
			, image = new Image()
			, $self =  this.$element
			, me = this;

		image.width = w;
		image.height = h;
		image.onload = function() {
			if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
			 	$self.find('.slick-viewport, #viewport').append(image);
			else{
			  var canvas = document.createElement('canvas');
			  canvas.width = w;
			  canvas.height = h;
			  var context = canvas.getContext('2d');
				context.drawImage(image,0,0);
				$self.find('.slick-viewport, #viewport').append(canvas);
				// console.log((new Date()).getTime()-me.startT);
			}
		};
		image.src = 'data:image/svg+xml;base64,' + _Prtg.Util.base64EncArr(arr);
	};
	Sunburst.prototype.update = function(data){
		var me = this;
		if(!!data && typeof(data) != "boolean")
			this.data.dataview.initializeData(0, data, false, 'sensorxref');
		return this.refresh(!data);
	};
	Sunburst.prototype.element = function(){
		return this.layout.element;
	};
	Sunburst.prototype.getSize = function (type) {
		var data = this.data
			, ret;
		if(data.options.hasOwnProperty(type))
			return data.options[type];
		try {
			ret = window.localStorage.getItem(type) === 'true'
		} catch (e) {
			ret = false;
		}
		ret = ret === null ? false : ret;
		return ret;
	};
	Sunburst.prototype.stash = function(d) {
		var arcwidth = Math.sqrt(d.y + d.dy * (d.basetype === 'device' ? 3 : 1))
			, sqrtY = Math.sqrt(d.y);
		d.sunburst = {
			'sqrtY':      sqrtY,
			'arcwidth':   arcwidth,
			'radialtext': ((arcwidth - sqrtY)*0.9 < sqrtY * d.dx)
		};
		d.sunburst.fontsize=Math.floor(Math.min(11, 11 * (d.sunburst.radialtext ? arcwidth - sqrtY : sqrtY * d.dx) / 11));
		d.sunburst.rotation=(d.x + d.dx / 2 - Math.PI / 2) / Math.PI * 180;
		d.sunburst.leftside = d.sunburst.rotation > 90 && d.sunburst.rotation < 270;
		d.sunburst.radellipsis=d.name.centerellipsis((arcwidth - sqrtY-6) / d.sunburst.fontsize * 1.5);
		d.sunburst.tanellipsis=d.name.centerellipsis(sqrtY * d.dx / d.sunburst.fontsize * 1.5);
	};
	Sunburst.prototype.rotate = function(d) {
		return "rotate(" + d.sunburst.rotation + ") "  +
			(d.sunburst.rotation > 90 && d.sunburst.rotation < 270
				? "matrix(-1 0 0 -1 0 0) translate(" + -(d.sunburst.sqrtY+3) + ")"
				: "translate(" + (d.sunburst.sqrtY+3) + ")");
	};
	Sunburst.prototype.rr = function(r){
		return r - r/this.data.dataview.treeDepth()*0.9;
	};

	$.fn[pluginName] = function(options, parent){
		return this.map(function() {
			var ret = $.data(this, "plugin_" + pluginName);
			if (!ret) {
				ret = new Sunburst(this, options, parent);
				$.data(this, "plugin_" + pluginName, ret);
			}
			return ret;
		});
	};
})(jQuery, window, document );
