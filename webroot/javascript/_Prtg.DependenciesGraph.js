/* _Prtg.DependencyGraph.js */
(function($, window, document, undefined) {
  var pluginName = 'dependenciesGraph';

  var dependenciesGraph = function(element, data, parent) {
    var self = this;
    this.element  = element;
    this.$element = $(element);
    this.objid = data.objid;
    this.tree = data.objects;
    this.zoom = 1;
    this.masters = false;
    if(!this.tree) return;
    this.size = {
      translate: [0,0],
      width:  this.$element.width(),
      height: this.$element.height(),
      minwidth:  this.$element.width(),
      minheight:this.$element.height()
    };
    this.node = {
      width:200,
      height:20
    };
    this.$svg = this.$element.find('svg#dependencygraph');
    this.svg = d3.select(this.$svg[0])
      .attr("width", this.size.width)
      .attr("height", this.size.height);

    this.svg.append('svg:rect')
      .attr('width', "100%")
      .attr('height',"100%")
      // .call(d3.behavior.zoom().on("zoom",function(){
      //   self.zoom = d3.event.scale;
      //   zoom(self.zoom);
      //   d3.event.sourceEvent.cancelBubble = true;
      // }))
      .attr('fill', "white")
      .on('click',function(){
        self.pathes.classed('bolded',false);
        self.pathes.selectAll('.bold').classed('bold',false);
      });
    this.svg = this.svg
      .append('svg:g')
      .attr('fill', "white")

    this.pathes = this.svg.append('svg:g');

    this.d3tree = d3.layout
      .cluster()
      .nodeSize([this.node.height,this.node.width+20]);
    this.diagonal= d3.svg
      .diagonal()
      .projection(function(d) { return [d.x, d.y]; });

    this.mode = this.elbowTree;
    this.updateTree();

   $('#dependencygraphlegend')
      .off()
      .on('click','.radio', function(e){
        self.masters = $('#showmaster').is(':checked');
        self.refresh();
      });

    $('#Zoom_Sunburst')
      .off()
      .on('click','.olControlZoomOut',function(e){
        self.zoom -= self.zoom/10;
        zoom(self.zoom);
      })
      .on('click','.olControlZoomIn',function(e){
        self.zoom += self.zoom/10;
        zoom(self.zoom);
      });

    function zoom(zoom){
      var width = Math.ceil(self.size.width * zoom)
        , height = Math.ceil(self.size.height * zoom);
      width > self.size.minwidth
        && self.$element.css('width', width)
         , self.$svg.attr('width', width);
      height > self.size.minheight
        && self.$element.css('height',height)
         , self.$svg.attr('height',height);
      self.svg.attr("transform", "translate("+(self.size.translate[0]*zoom)+","+(self.size.translate[1]*zoom)+") scale(" + zoom + ")");
    }
  };

  dependenciesGraph.prototype = {
    refresh: function(){
        var self = this;
        if( $('#content').find('.loadspinner').length == 0){
            $('#content').append('<div class="loadspinner"></div>')
        }
        self.$svg.addClass('loading');
        $.ajax({
          type: 'GET',
          dataType: 'json',
          url: '/api/gettreeasjson.htm',
          data: {
            id:         0,
            probes:     1,
            groups:     1,
            devices:    1,
            allowone:   1,
            allowself:  1,
            showsensor: 1,
            dependency: 1,
            altformat:  1
          }
        }).fail(function(){
          $('#content').removeClass('loading');
          self.$svg.removeClass('loading');
        }).done(function(data){
          self.tree = data;
          self.updateTree();
        });
      },
    updateTree: function(){
      var self = this;
      self.tree.fixed = true;
      self.tree.type += " root";
      self.tree = self.initTree(self.tree, null);
      self.mode.init(self, self.tree);
      $('#dependencies-overview').removeClass('loading');
      self.$svg.removeClass('loading');
    },
    toggle: function(d,noupd){
      var mem;
      d.fixed = true;
      if(!!d._children){
        if (!d.fold) {
          mem = d.__children||[];
          d.__children = d.children;
          d.children = mem;
          d.fold = 1;
        } else {
          d.fold = 0;
          mem = d.children;
          d.children = d.__children;
          d.__children = mem;
        }
        self.mode.init(self, d);
      } else return false;
      return true;
    },

    initTree: function(tree) {
      self = this;
      function firstrun(parent,node){
        //set parent, dependency and hide sensors
        node.parent = parent;
        node.dependency = !!node.dependency ? 0 ^ node.dependency : node.dependency;
        switch(node.dependencytype){
          case 'Parent':
            node.dependency = parent;
            break;
          case 'Master':
          case 'Select':
            node.dependency = self.getObj(tree, node.dependency);
            break;
          default:
            node.dependency = null;
            break;
        }

        if(!!node.children)
          node.children.forEach(function(child){firstrun(node,child)});

        node._children = (node.children || []);
        node.children = [];

      };

      function secondrun(node, expand, master){
        function testpush(a,e){if(!!a && a.indexOf(e)<0)return a.push(e); else return false;};
        function ensure(n,u){
          var p = !!n ? n.parent : null
            , wayup  = u || "dependency";
          if(!p) return;
          if(node.broken
          && n.dependencytype === "Select"
          && n.type !== "sensor")
            ensure(n.parent,"parent");

          while(!!p){
            if(!testpush(p.children,n)){
              p=null;
            }else{
              n = n[wayup] || n.parent;
              p = n.parent;
            }
          }
        };

        node.childcount = 0;
        if(!!node._children
        && !!node._children.length){
          node.childcount = node._children.length;
          if(node.type !== "device"
          && node.type !== "sensor")
            node._children.forEach(function(e){secondrun(e, (expand || e.objid === self.objid), master);});
        }

        if(!expand) return;

        if(node.objid < 10
        || node.objid === self.objid){
          node.parent && ensure(node.parent);
          node.children = node._children;
          node.objid === self.objid && ensure(node);
        }

        if(!node.dependency // repair broken dependency
        && !!node.parent){
          if(!!node._children)
          var idx = node._children.push(
            {
              objid: 'x'+node.objid,
              dependency: node,
              dependencytype: 'Select',
              type: 'sensor',
              name: _Prtg.Lang.common.strings.unknownsensor,
              parent: node,
              broken: true,
              icon: '/images/transparent.gif'
            }
          );
            node.broken = true;
          ensure(node._children[idx-1],'parent');
          node.dependency = node.parent;
          node.dependencytype = 'Parent';
          ensure(node.parent);
        }

        if(node.dependencytype === "Select"){
          if((!!master
              && node.dependency.dependencytype === "Master")
          || node.dependency.dependencytype !== "Master"){
            if(!node.dependency.dependencies)
              node.dependency.dependencies=[];
            node.dependency.dependencies.push(node.objid);
            ensure(node,"parent");
            ensure(node.dependency);
          }
        }

        if(node.type === "device"
        && !!node._children
        && !!node._children.length){
          node._children.forEach(function(sensor){
            if((!!master
                && sensor.dependencytype === "Master")
            || sensor.dependencytype === "Select"){
              if(!sensor.dependency){ // repair broken dependency
                if(!node.brokensensor)
                  node.brokensensor = node._children.push(
                    {
                      objid: 'x'+node.objid,
                      dependency: node,
                      dependencytype: 'Parent',
                      type: 'sensor',
                      name:_Prtg.Lang.common.strings.unknownsensor,
                      parent: node,
                      broken: true,
                      icon: '/images/transparent.gif'
                    }
                  )-1;
                sensor.sensorbroken = true;
                sensor.dependency = node._children[node.brokensensor];
              }else{
                ensure(sensor.dependency,"parent");
                ensure(sensor.dependency.parent);
              }
              ensure(sensor);
              ensure(node);
              if(!sensor.dependency.dependencies)
                sensor.dependency.dependencies=[];
              sensor.dependency.dependencies.push(sensor.objid);
              if(sensor.dependencytype === "Master")
                sensor.dependency = sensor.parent;
            }else if(sensor.dependencytype === "Master"){
              sensor.dependency = sensor.parent;
              // sensor.dependencytype = node.parent.fold ? "Master" : "Parent";
            }
          });
        }
      };

      firstrun(null,tree);
      secondrun(tree,(tree.objid===self.objid), self.masters);
      return tree;
    },

    createLinksJson: function(nodes) {
      var links = [];
      var i = -1;
      var l = nodes.length;
      while(++i < l) {
        var node = nodes[i];
        if(!!node.dependency && nodes.indexOf(node.dependency)>-1){
          links.push({
            "type": node.dependencytype,
            "source": node,
            "target": node.dependency
          });
        }
        if(node.dependencytype !== "Parent"){
          links.push({
            "type": "Parent",
            "source": node,
            "target":  node.parent
          });
        }
      }
      return links;
    },
    getObj: function(data, objId) {
      var ret = null;
      function recurse(node){
        if(node.objid === objId)
          ret = node;
        else{
         if(!!node._children && !!node._children.length)
          node._children.some(function(node){
              if(!ret)
                ret = recurse(node);
              if(ret)
                return true;
          });
        if(!ret && !!node.children && !!node.children.length)
          node.children.some(function(node){
              if(!ret)
                ret = recurse(node);
              if(ret)
                return true;
          });
        }
        return ret;
      };
      recurse(data);
      return ret;
    },
    elbowTree:{
      init: function(self, node){
        var max={x:0,y:0}
          , min={x:0,y:0}
          , nodes = self.d3tree.nodes(self.tree);
        links = self.createLinksJson(nodes);
        nodes.forEach(function(d) {
          if(d.type !== 'sensor')
            d.y = d.depth *self.node.width;
        });
        nodes.forEach(function(d){
          max.x = d.x > max.x ? d.x : max.x;
          max.y = d.y > max.y ? d.y : max.y;
          min.x = d.x < min.x ? d.x : min.x;
          min.y = d.y < min.y ? d.y : min.y;
        });

        var width = Math.abs(max.y) + Math.abs(min.y) + self.node.width*3
          , height= Math.abs(max.x) + Math.abs(min.x) + self.node.height*2;
        self.size.translate = [Math.abs(self.node.width),Math.abs(min.x)+self.node.height];
        self.svg.attr('transform','translate('+self.size.translate+')');

        self.$element.css('width', width)
          ,self.$svg.attr('width', width)
          ,self.size.width = width;
        self.$element.css('height',height)
          ,self.$svg.attr('height',height)
          ,self.size.height = height;
        this.update(self, nodes, links, node);
      },
      update: function(self,nodes, links, node){
        var duration = 50
          , hoverTimer = 0
          , node = self.pathes.selectAll(".node")
                  .data(nodes, function(d){return d.objid;})
          , nodeEnter = node.enter().append("g")
              .attr('id', function(d){return 'g'+d.objid;})
              .attr("class", function(d) {return "node " + d.type + (!!d.broken?' Broken':'') + (!!d.sensorbroken?' SensorBroken':'') + " fold" + (d.fold || 0 )})
              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
        ;

        nodeEnter.filter(function(d){return !!d._children && d.type!=='sensor'?null:this;})
          .append('svg:clipPath')
          .attr('id',function(d){return 'clip-'+d.objid;})
          .insert("svg:rect")
          .attr("transform","translate(0,-7)")
          .attr("width",self.node.width-15)
          .attr("height",self.node.height-6);

        nodeEnter.filter(function(d){return !!d._children && d.type!=='sensor'?null:this;})
          .append("svg:rect")
          .attr("transform","translate(0,-7)")
          .attr("width",self.node.width+4)
          .attr("height",self.node.height-6);

        nodeEnter
          .append("svg:image")
          .attr("class","icon")
          .attr("xlink:href", function(d){return d.icon})
          .attr("width", 14)
          .attr("height",14)
          .attr("transform","translate(0,-7)")

        nodeEnter.filter(function(d){return !!d._children && d.type!=='sensor'?this:null;})
          .append("svg:image")
          .attr("class", function(d){return "fold folded" +  (d.fold||0);})
          .attr("xlink:href", function(d){return !d.fold
                                            ?"/css/images/tv-collapse-gray"+(d.fold  === 2?'-2':'')+".png"
                                            :"/css/images/tv-foldout-gray"+(!!d.___children?'-2':'')+".png"})
          .attr("width", 9)
          .attr("height",9)
          .attr("transform","translate(-12,-4.5)")
          .on('click', self.toggle);


        nodeEnter
          .append("svg:a")
          .attr("xlink:href", function(d){ return d.broken && d.type === 'sensor' ?  null : (d.type === 'device'||d.type==='sensor'?'/'+d.type+'.htm?id=':'/dependencies.htm?id=') + d.objid})
          .insert("text")
          .attr('clip-path',function(d){return d.type==='sensor'?'url(#clip-'+d.objid+')':null;})
          .attr('id',function(d){return 'obj-'+d.objid;})
          .attr('data-id',function(d){return d.objid;})
          .attr("class", function(d) {return d.broken && d.type === 'sensor' ? 'readonly' : 'readonly ' +(d.type==='probe'?'probenode':d.type) +'menu'})
          .attr("text-anchor",function(d){return d.depth==0 ? "end":'start';})
          .attr("transform", function(d){return d.depth===0 ? "translate(-16,4)" : "translate(16,4)"})
          .text(function(d) {return d.name.centerellipsis((d.childcount>=0?15:25)) + (d.childcount>=0?' ('+d.children.length+'/'+d.childcount+')':''); });

        nodeEnter
          .append("title")
          .text(function(d){
            return d.childcount>=0
              ?(d.childrencount=d.children.length,_Prtg.Lang.common.strings.dependenciestitle.printf(d))
              :d.name;});

        nodeEnter.filter(function(d){return (!!d._children||!!d.dependencies) && d.type==='sensor'?this:null;})
          .append("svg:use")
          .attr("xlink:href","#zoomicon")
          .attr("width", 14)
          .attr("height",14)
          .attr("transform","translate("+(self.node.width+5)+",-7)")
          .on('click',function(e){
            var target = d3.event.target
              , d = e
              , that = d3.select('#g'+d.objid)
              , bolded = d.bolded||false
              , dep ='g'+d.dependency.objid
              , id = 'g'+d.objid;
            self.pathes.classed('bolded',false);
            self.pathes.selectAll('.bold').classed('bold',false);
            if(bolded){
              d.bolded = false;
              return;
            }
            d.bolded = true;
            // if(target.classList.contains('fold')) return;
            // self.pathes.classed('bolded',true);
            that.classed('bold',true);
            if(!!dep)
             [dep,dep+id,id+dep].forEach(function(elm){
              d3.selectAll('#'+elm).classed('bold',true);
             });
            if(!!d.dependencies)
              d.dependencies.forEach(function(dep){
                ['g'+dep,'g'+dep+id].forEach(function(elm){
                  d3.selectAll('#'+elm).classed('bold',true);
                });
              });
          })
          .append("title")
          .text(_Prtg.Lang.common.strings.highlight);



        var nodeUpdate = node.transition()
          .duration(duration)
          .attr("class", function(d) {return "node " + d.type + ' menu'+d.type+ (!!d.broken ? ' Broken':'')  + (!!d.sensorbroken?' SensorBroken':'') + " fold" + (d.fold || 0 )})
          .attr("transform", function(d) {return "translate(" + d.y + "," + d.x +")"; })
          .attr('up', function(d){return d.dependencytype;})
          .attr('down', function(d){return !!d.dependency ? d.dependency.dependencytype:null;})
        nodeUpdate.select("image.fold")
          .attr("class", function(d){return "fold folded" +  (d.fold||0);})
          .attr("xlink:href", function(d){return !d.fold
                                            ?"/css/images/tv-collapse-gray"+(d.fold  === 2?'-2':'')+".png"
                                            :"/css/images/tv-foldout-gray"+(!!d.___children?'-2':'')+".png"})

        node
          .exit()
          .transition()
          .duration(duration)
          .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
          .remove();

        var link = self.pathes.selectAll(".link")
          .data(links,function(d) { return d.source.objid+'-'+d.target.objid; });
        link
          .enter()
          .insert("path","g")
          .attr("marker-start",function(d) { return d.type !== 'Select'?(d.target.dependencytype==='Master' && d.source.children.indexOf(d.target)>-1?'url(#Master)':null):"url(#" + d.type + ")"; })
          .attr("marker-end",function(d) { return d.type === 'Master'?"url(#" + d.type + ")":null; })
          // .attr("marker-end","url(#markerCircle)")
          .attr("class", function(d) {
            return "link " +  (d.type!=='Select'?d.type:(d.target.dependencytype==='Master' && d.source.children.indexOf(d.target)>-1?'Master':d.type)) + (!!d.target.broken ? ' Broken':'')  +(d.target.hidden||'');
          })
          .attr("d", elbow)
          .attr("id", function(d) { return 'g'+d.source.objid+'g'+d.target.objid; });

        link
          .transition()
          .duration(duration)
          .attr("d", elbow);
        link
          .exit()
          .transition()
          .duration(duration)
          .attr("d",elbow)
          .remove();

        function elbow(d, i) {

          var deltax = 20;
              srcwidth = d.source.type !== 'sensor'
                        ?d3.select("#obj-"+d.source.objid).node().getBBox().width
                        :self.node.width
              trgwidth = d.target.depth === 0
                        ?0
                        :d3.select("#obj-"+d.target.objid).node().getBBox().width+18;

          if(d.type==="Parent"
          || d.type==="Master"
          || (d.source.broken && d.target.type !== 'sensor')){
            return "M" + (d.source.y-10) + "," + d.source.x
                 + "H" + (d.target.y+
                      (d.target.x==d.source.x
                        ? trgwidth
                        // ? d.target.name.centerellipsis(15).length*6*(d.target.depth?1:0)
                        : -8
                      )
                    ) + "V" + d.target.x
                 + (d.target.children ? "" : "h" + 10);
          }else{
            var dx = Math.abs(d.source.x - d.target.x)||self.node.height
              , dy = Math.sqrt(dx)*4;
            return "M" + (d.target.y+self.node.width+deltax) + "," + (d.target.x)
                 + "q" + dy + "," + 0 +" "+ dy + "," + (d.source.x < d.target.x?-1:1)*dx/2
                 + "T" + (d.source.y+srcwidth+deltax) + "," + (d.source.x-0);
          }
        }
      }
    }
  };

  _Prtg.Plugins.registerPlugin(pluginName, dependenciesGraph);

})(jQuery, window, document);
