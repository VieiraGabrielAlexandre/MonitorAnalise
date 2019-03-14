/**
 * spinning globe for PRTG by Stefan Messner
 */
(function($, window, document, undefined) {
  var pluginName = 'globe'
    , world =  <#javascriptinclude file="/javascript/lib/world-110m.json.data">
  ;

	function globe(element, data, parent) {
    this.element = element;
    this.$element = $(element);
    this.parent = parent;
    this.id = 'me.current_globe_position'+ this.$element.attr("id")
    this.current = sessionStorage.getItem(this.id) || 0;
    this.data = data;
    this.status = this.$element.find("div.status-icon");
    this.init(this);
	};

  globe.prototype.init = function(me) {
    var h = me.$element.height()
      , w = me.$element.width()
      , radius = (!!h && !!w ? Math.min(h,w) : h+w) >> 1
      , rad = radius  * 0.9
      , projection = d3.geo.orthographic()
          .scale(rad)
          .translate([radius, radius])
          .clipAngle(90)
      , title = $(me.parent).find('.globetitle')
      , canvas = d3.select(me.element).append("canvas")
          .attr("width", radius<<1)
          .attr("height", radius<<1)
      , context = canvas.node().getContext("2d")
      , path = d3.geo.path()
        .projection(projection)
        .context(context)
      , globe = {type: "Sphere"}
      , land = topojson.feature(world, world.objects.land)
      , countries = topojson.feature(world, world.objects.countries).features
      , borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; })
      , duration = 0//_Prtg.Options.refreshInterval*1000 / (n+2) / (m+2)
      , locs = this.prepareData(this.data.objects.sensorxref)
      , names = Object.keys(locs)
      , name = ""
    ;

    me.status.css({top:radius,left:radius});
    (function transition() {
      var o
        , $status = me.status
        , id = me.id
      ;
      canvas.transition()
        .duration(duration)
        .each("start", function(d) {
          duration = 1250;
          me.current = me.current >= names.length ? 0 : me.current;
          name = names[me.current];
          sessionStorage.setItem(id, me.current++);
          o = locs[name];
        })
        .tween("rotate", function() {
          var p = null
            , r = null
          ;
        	if(!!o){
        		p = o.point;
        	}else{
        		p = [0,0];
        	}
        	r = d3.interpolate(projection.rotate(), [-p[1], -p[0]]);
          $status.hide();
          return function(t) {
            projection.rotate(r(t));
            context.clearRect(0, 0, radius, radius);
            context.save();
            context.strokeStyle = "#222", context.fillStyle= "#222", context.lineWidth = .05, context.beginPath(), path(globe), context.stroke(), context.fill() , context.closePath();
            context.fillStyle = "#333",context.beginPath(), path(land), context.fill(), context.stroke() ,context.closePath();
            context.strokeStyle = "#fff", context.beginPath(), path(borders), context.stroke() , context.closePath();
            context.restore();
          };
        })
        .each("end", function(){
        	if(!o) return;
          if(o.downsens > 0 || o.partialdownsens > 0){
            $status.attr("class","status-icon down").text(name).show()
          }
          else if (o.warnsens > 0){
            $status.attr("class","status-icon warning").text(name).show()
          }
          else if(o.unusualsens > 0){
            $status.attr("class","status-icon unusual").text(name).show()
          }
          else if(o.upsens > 0){
            $status.attr("class","status-icon up").text(name).show()
          }
          else if(o.pausedsens > 0){
            $status.attr("class","status-icon paused").text(name).show()
          }
          else{
            $status.attr("class","status-icon unknown").text(name).show()
          }
        })
      .transition()
        .each("end", transition);
    })();
  };


  globe.prototype.prepareData = function(data){
  	var ret = {};
  	for(i in data){
  		var d = null
  			, s = data[i]
  			, loc = s.location;
      if(!!s.lonlat){
        s["point"] = [s.lonlat.latitude,s.lonlat.longitude];
    		if(!ret.hasOwnProperty(loc)){
    			ret[loc] = s;
    		}else{
  	  		d = ret[loc];
  	  		['down','partialdown','warn','downack','up','paused','unusual','undefined', 'total'].forEach(function(elm){
  	  			d[elm+'sens'] += s[elm+'sens'];
  	  		});
  	  	}
    	}
    }
  	return ret;
  };

  $.fn[pluginName] = function(data, parent) {
    return this.each(function() {
      if (!$.data(this, 'plugin_'+pluginName)) {
        $.data(this, 'plugin_'+pluginName, new globe(this, data, parent));
      }
    });
  };
})(jQuery, window, document);
