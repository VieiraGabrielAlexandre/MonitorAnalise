(function($, window, document, undefined) {
	var pluginName = "clustermap";
	function clustermap(element, data, parent) {
		this.element = element;
		this.$element = $(element);
		this.data = data;
		this.preview = data.preview || false;
		this.r = 325;
		this.scale = Math.round(Math.min(this.$element.height(), this.$element.width())/2) / 325;
		this.center = 325 * this.scale;
		this.d3 = d3.select(element)
			.append('svg:svg')
			.attr('style','width:100%;height:100%;')
			.insert('g')
			.attr('transform','matrix({scale},0,0,{scale},{center},{center})'.printf(this));
		this.r -= 75;
		this.links = data.links;
		this.init(this);
	};

	clustermap.prototype.init = function(me){
		_Prtg.Events.subscribe('refresh.events.prtg', $.proxy(me.refresh, me));
		me.$element
			.removeAttr('data-objects')
			.on('destroyed',function() {
				_Prtg.Events.unsubscribe('refresh.events.prtg', $.proxy(me.refresh, me));
			})

		this.render(this.data.objects);
	};

	clustermap.prototype.render = function(data){
		var me = this
			, halfwidth = 75
			, clustermembercount = Object.keys(data).length
			, num = (clustermembercount===2 ? -0.5 : -1)
			, rotate  =(2*Math.PI / clustermembercount)
			, rotate2 =(  Math.PI / 2 / (clustermembercount-1));

		$(me.d3[0]).empty();
		var defs = me.d3
			.append('defs');
		var grad = defs.append('linearGradient')
			.attr('id','downplus')
			.attr('x1','0')
			.attr('y1','0')
			.attr('x2','1')
			.attr('y2','1');
		grad.append('stop').attr('offset','25%').attr('stop-color','gray');
		grad.append('stop').attr('offset','75%').attr('stop-color',_Prtg.Colors.statusdown);
		grad = defs.append('linearGradient')
			.attr('id','downminus')
			.attr('x1','1')
			.attr('y1','1')
			.attr('x2','0')
			.attr('y2','0');
		grad.append('stop').attr('offset','25%').attr('stop-color','gray');
		grad.append('stop').attr('offset','75%').attr('stop-color',_Prtg.Colors.statusdown);
		grad = defs.append('linearGradient')
			.attr('gradientUnits','objectBoundingBox')
			.attr('id','upminus')
			.attr('x1','0')
			.attr('y1','0')
			.attr('x2','1')
			.attr('y2','1');
		grad.append('stop').attr('offset','0').attr('stop-color',_Prtg.Colors.statusup);
		grad = defs.append('linearGradient')
			.attr('gradientUnits','objectBoundingBox')
			.attr('id','upplus')
			.attr('x1','1')
			.attr('y1','1')
			.attr('x2','0')
			.attr('y2','0');
		grad.append('stop').attr('offset','0').attr('stop-color',_Prtg.Colors.statusup);
		grad = defs.append('linearGradient')
			.attr('gradientUnits','objectBoundingBox')
			.attr('id','unknownminus')
			.attr('x1','0')
			.attr('y1','0')
			.attr('x2','1')
			.attr('y2','1');
		grad.append('stop').attr('offset','0').attr('stop-color','gray');
		grad = defs.append('linearGradient')
			.attr('gradientUnits','objectBoundingBox')
			.attr('id','unknownplus')
			.attr('x1','1')
			.attr('y1','1')
			.attr('x2','0')
			.attr('y2','0');
		grad.append('stop').attr('offset','0').attr('stop-color','gray');
		me.d3.append('marker')
			.attr('id',"arrow")
			.attr('viewBox',"0 0 10 10")
			.attr('refX',"5")
			.attr('refY',"5")
			.attr('markerUnits',"strokeWidth")
			.attr('markerWidth',"5")
			.attr('markerHeight',"5")
			.attr('orient',"auto")
			.insert('path')
				.attr('d',"M 0 0 L 10 5 L 0 10 z");
    me.d3.append('marker')
			.attr('id','circle')
			.attr('viewBox',"0 0 10 10")
			.attr('refX',"3")
			.attr('refY',"3")
			.attr('markerUnits',"strokeWidth")
			.attr('markerWidth',"6")
			.attr('markerHeight',"6")
			.attr('orient',"auto")
				.insert('circle')
					.attr('r',2)
					.attr('cx',3)
					.attr('cy',3);
		$.each(data, function(guid){
			var self = this
			 	, myclass=''
				, mytitle=''
				, myobject='cluster'+this.guid
				, icon='/images/clusternode.svg';
			++num;
			this.angle = num * rotate;
			if (this.status === 'maintenance')
				{mytitle=mytitle+_Prtg.Lang.clustermap.strings.maintenance;icon='/images/clusternode_inactive.svg';}
			else if (this.status === 'disconnected')
				{mytitle=mytitle+_Prtg.Lang.clustermap.strings.notlinked;icon='/images/clusternode_disconnected.svg';}
			else if (this.status === 'master')
				{mytitle=mytitle+_Prtg.Lang.clustermap.strings.currentmaster;myclass=" master";icon='/images/clusternode_master.svg';}
			else
				mytitle=mytitle+_Prtg.Lang.clustermap.strings.failover;
			this.position = {
				x:  Math.sin(this.angle)*me.r - halfwidth,
				y: -Math.cos(this.angle)*me.r - halfwidth
			};
			this.center = {
				x:  Math.sin(this.angle)*me.r,
				y: -Math.cos(this.angle)*me.r
			};
			this.node = me.d3
				.append('svg:g')
				.attr("transform", 'translate({x},{y})'.printf(this.position))
				.attr('id','clustermap-node-'+guid)
				.attr('class',"clustermap-node "+myclass);


			var link = this.node.append('svg:a')
				.attr('class','nohjax')
				.attr('target', '_blank')
				.attr('xlink:href',me.links[guid]||'#');
			link.append('image')
				.attr('transform', 'translate(11,0)')
				.attr('width',128)
				.attr('height',106)
				.attr('xlink:href',icon);
			link.append('text')
				.text(this.name)
				.attr('dy',120)
				.attr('x',halfwidth)
                .attr('class','clusternode_name')
				.attr('startOffset', '50%')
				.attr('text-anchor',"middle");
            link
                .append('text')
                .text(mytitle)
                .attr('dy',134)
                .attr('x',halfwidth)
                .attr('class','clusternode_type')
                .attr('text-anchor',"middle")
                .attr('startOffset', '50%')
                .attr('xlink:href','#P-'+guid);
		});
		var svgheight = (function(num){
			var ret = 0;
			switch(num){
				case 1:
					ret = 150;
					break;
				case 2:
					me.d3.attr("transform", 'translate({x},{y})'.printf({x:me.r + halfwidth,y:halfwidth}));
					ret = 150;
					break;
				case 3:
					ret = 480;
					break;
				default:
					ret = 630;
			}
			return ret;
		})(clustermembercount);
		$(".map_background").css({"height": svgheight +'px'});

		$.each(data, function(num){
			var src = this;
			$.each(this.connections, function(){
				var dst = data[this.guid]
					, xoff = src.center.x > dst.center.x
							? -5
							: src.center.x === dst.center.x
								? src.center.y > dst.center.y
									? 5
									: -5
								: 5
					, yoff = src.center.y > dst.center.y
							? 5
							: src.center.y === dst.center.y
								? xoff
								: -5
					, x1 = src.center.x + xoff
					, y1 = src.center.y + yoff
					, x2 = dst.center.x + xoff
					, y2 = dst.center.y + yoff
					, m = (y1 - y2 + 1) / (x1 - x2 + 1)
					, angle = Math.atan(1/m)
					, dx = Math.sin(angle) * halfwidth
					, dy =  Math.cos(angle) * halfwidth
					, f1 = (x2-x1)*(x2-x1)+(y2-y1)*(y2-y1) < (x2-x1+dx)*(x2-x1+dx)+(y2-y1+dy)*(y2-y1+dy) ? 1 : -1
					, f2 = (x2-x1)*(x2-x1)+(y2-y1)*(y2-y1) > (x2+dx-x1)*(x2+dx-x1)+(y2+dy-y1)*(y2+dy-y1) ? 1 : -1


				x1 = x1 + f1*dx;
				y1 = y1 + f1*dy;
				x2 = x2 + f2*dx;
				y2 = y2 + f2*dy;

				me.d3.append('g')
					.attr("stroke-width", 2)
					.attr("stroke", "url(#"+this.status+(x1<=x2?"minus":"plus")+")")
				.insert('line')
					.attr('x1',x1)
					.attr('y1',y1)
					.attr('x2',x2)
					.attr('y2',y2)
					.attr('marker-start',"url(#circle)")
					.attr('marker-end',"url(#arrow)")
			});
		});
		// if(clustermembercount===2)
    if(_Prtg.Options.browser == 'firefox')
      setTimeout(function(){$('table').hide(3).show(10)},200);
	};
	clustermap.prototype.refresh = function(){
		var  me=this;
		$.ajax({
			url: '/api/cluster.json',
			dataType:'json'
		}).done(function(data){
			me.render(data);
		});
	};
	clustermap.prototype.update = function(data){
		this.render(data);
	};

	$.fn[pluginName] = function(data, parent) {
	return this.each(function() {
		if (!$.data(this, 'plugin_' + pluginName)) {
			$.data(this, 'plugin_' + pluginName, new clustermap(this, data, parent));
		}
	});
};
})(jQuery, window, document);

