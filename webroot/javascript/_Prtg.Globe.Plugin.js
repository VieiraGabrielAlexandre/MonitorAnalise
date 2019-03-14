// _Prtg.Globe.Plugin.js //
(function(_Prtg, $, window, document, undefined) {
  var pluginName = "prtg_globe"
    , world =  <#javascriptinclude file="/javascript/lib/world-110m.json.data">
    , acplaces = <#javascriptinclude file="/javascript/lib/places.json.data">
    , names = []
    , types = ['value','lookup']
    , i = -1
    , j = 0
    , places = {};

  function Globe(element, data, parent) {
    var map =  [3,0,2,1]
    this.element = element;
    this.$element = $(element);
    this.parent = parent;
    this.data = data;

    $.each(acplaces, function(i,d){d.data = {lookups:null,value:null}; });
    $.each(data, function(i,d){
      if(typeof(d) == 'object'){
        var name = d.name.split(')')[0]
          , type = !!d.info.data[0].lookups ? 'lookup': 'value'

        if(!name.length) return;
        name = name.split('(')[1];

        if(name && name.length && acplaces[name]){
          places[name] = acplaces[name];
          places[name].data[type] = d;

          if(type=='lookup'){
            places[name].data[type].info.data[0].lookups =
              places[name].data[type].info.data[0].lookups.sort(function(a,b){return map[a[2]]-map[b[2]]});
            // places[name].data[type].info.data[0].lastvalueraw  = (Math.floor(Math.random() * 5) + 1) * 100;
          }
        }
      }
    });
    names = Object.getOwnPropertyNames(places)
    if(names.length === 0){
      places[' '] = {
          name: ' '
        , point: [0,0]
        , data:{
            lookups: null
          , value: null
        }
      };
      names.push(' ')
    }
    this.init(this);
  }

  Globe.prototype.init = function(me){
    var radius = Math.max($(me.parent).height(),$(me.parent).width()) / 2
      , projection = d3.geo.orthographic()
          .scale(radius>>1)
          .translate([radius>>1, radius>>1])
          .clipAngle(90)
      , title = $(me.parent).find('.globetitle')
      , canvas = d3.select(me.element).append("canvas")
          .attr("width", radius)
          .attr("height", radius)
          .style({"margin-left": (($(me.parent).width()-radius)>>1)+'px'})
      , context = canvas.node().getContext("2d")
      , path = d3.geo.path()
        .projection(projection)
        .context(context)
      , globe = {type: "Sphere"}
      , land = topojson.feature(world, world.objects.land)
      , countries = topojson.feature(world, world.objects.countries).features
      , borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; })
      , m = types.length-1
      , n = names.length-1
      , colors = {"0": _Prtg.Colors.statusunknown, "1":_Prtg.Colors.statusup,"2":_Prtg.Colors.statusdown,"3":_Prtg.Colors.statuswarning}
      , color = function(d){
            return colors[d];
          }
      , duration = 1250//_Prtg.Options.refreshInterval*1000 / (n+2) / (m+2)
      , type = types[j]
      , r = radius * 0.08
      , arc = function(colour, start, end, dir){
          dir = !!dir;
          context.strokeStyle= color(colour), context.lineWidth=r/3, context.beginPath(), context.arc(radius>>1,radius>>1, r, start, end, dir), context.stroke(), context.closePath();
        }
      ;



    (function transition() {
      var o;
      d3.transition()
          .duration(duration)
          .each("start", function() {
            if(i+1 > n) {
              i = 0;
              j = j+1 > m ? 0 : j+1;
              type = types[j];
            }else
              ++i;
            o = places[names[i]];
          })
          .tween("rotate", function() {
            var p = o.point
              , r = d3.interpolate(projection.rotate(), [-p[1], -p[0]]);
            return function(t) {
              projection.rotate(r(t));
              context.clearRect(0, 0, radius, radius);
              context.strokeStyle = "#818285", context.fillStyle= "#818285", context.lineWidth = .5, context.beginPath(), path(globe), context.stroke(), context.fill() , context.closePath();
              context.fillStyle = "#606362", context.beginPath(), path(land), context.fill(), context.closePath();
              context.strokeStyle = "#fff", context.lineWidth = .3, context.beginPath(), path(borders), context.stroke() , context.closePath();
            };
          })
          .each("end", function(){
            if(type == 'lookup' && !!o.data.lookup){
              o.data.lookup.info.data[0].lookups.forEach(function(e,i,a){
                var angle = 2*Math.PI/ a.length
                  , start = 1.5*Math.PI
                  , gap = angle * .08;
                arc(e[2], start + angle*i +gap, start + angle*i+angle - gap);
                if(o.data.lookup.info.data[0].lastvalueraw >= e[0] && o.data.lookup.info.data[0].lastvalueraw <= e[3])
                  context.strokeStyle = 'black', context.lineCap = 'round', context.lineWidth=r*0.13, context.beginPath(), context.moveTo(radius>>1,radius>>1), context.lineTo(((Math.cos(start + angle*(i+.5)))*r*1.2 + (radius>>1)), ((Math.sin(start + angle*(i+.5)))*r*1.2 + (radius>>1))), context.stroke(), context.lineCap = 'butt', context.closePath();
              });
            }else if(o.data.value){
                var start = .7 * Math.PI
                  , end =   .3 * Math.PI
                  , data = o.data.value.info.data[0]
                  , part = 1.6 * Math.PI / (data.graphmaxraw-data.graphminraw)
                  , angle = start + part * data.lastvalueraw;
              if(data.lastvalueraw >= 0){
                arc("1", start, end);
                if(data.limitmaxwarning)
                  arc("3", start + part * data.limitmaxwarning, end);
                if(data.limitmaxerror)
                  arc("2", start + part * data.limitmaxerror, end);
                if(data.limitminwarning)
                  arc("3", start , start + part * data.limitminwarning);
                if(data.limitminerror)
                  arc("2", start , start + part * data.limitminerror);
              }else{
                arc("0", start, end);
              }
              context.strokeStyle = 'black', context.lineCap = 'round', context.lineWidth=r*0.13, context.beginPath(), context.moveTo(radius>>1,radius>>1), context.lineTo(((Math.cos(angle))*r*1.2 + (radius>>1)), ((Math.sin(angle))*r*1.2 + (radius>>1))), context.stroke(), context.lineCap = 'butt', context.closePath();
            }
              context.fillStyle = 'white', context.fillText(o.name, (radius>>1)+r*1.3, (radius>>1)+3);
          })
        .transition()
          .each("end", transition);
    })();
  };

  Globe.prototype.refresh = function(){

  };

 _Prtg.Plugins.registerPlugin(pluginName, Globe);
})(_Prtg, jQuery, window, document);
