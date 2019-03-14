// _Prtg.Lib.Data.Plugin.js
(function ( $, window, document, undefined ) {
  var pluginName = 'libdata';

	function LibTreeData( element, data, parent ) {

		this.element = element;
		this.data = data;  
		this.parent = parent;

		this.pipe = null;
	};

	LibTreeData.prototype.initNode = function(node){
		node['downsens'] = 0;
		node['downacksens'] = 0;
		node['partialdownsens'] = 0;
		node['warnsens'] = 0;
		node['upsens'] = 0;
		node['pausedsens'] = 0;
		node['unusualsens'] = 0;
		node['undefinedsens'] = 0;
		node['totalsens'] = 0;	
	}
	
	LibTreeData.prototype.loadLibData = function(junk, junki, i, sib){
		var self = this
			, nodeStateMap = _Prtg.Core.objects.nodeStateMap;
		if('filter' === junki.libkind){
			junki.basetype = 'library';
			return $.ajax( 
			  $.extend(true,{
					data: {
						id: junki.objid
					}},
				_Prtg.Core.objects['libObjects'])
			).done(function(d){
				self.initNode(junki);
				junki.leafs = null;
				if(d['treesize'] > 0 && d['libobjects'][0]['basetype'] === 'sensor'){
					junki.leafs = d['libobjects'];
					junki.totalsens = junki.leafs.length;
					for(var i=0, l = junki.leafs.length; i < l; ++i) {
						junki[nodeStateMap[junki.leafs[i].status]+'sens'] += 1;
					}
					var parent = junki._parent;
					while(parent){
						$.each(_Prtg.Core.objects.group.sensorTypeNames, function (key, val) {
								parent[val + 'sens']  += junki[val + 'sens'];
						});
						parent.devicenum += 1;
						parent = parent._parent;
					}
				}
			});
		}else	if('libraries' === junki.libkind){
			return $.ajax( 
			  $.extend(true,{
					data: {
						id: -6
					}},			  	
				_Prtg.Core.objects['libraries'])
			).done(function(d){
				junki.basetype = 'group';
				self.initNode(junki);
				if(d['treesize'] > 0){
					var content = d['library'];
					self.initLibraryData(content, content[0].fold).done(function(){
						content.unshift(i+1,0);
						junk.splice.apply(junk,content);					
					});
				}
			});
		}else	if('node' === junki.libkind){
				junki.basetype = 'library';
		}else if('linked' === junki.libkind){
			var parent = junki;
      if(!!sib && sib.objid === junki.liblinkedid){
        junki.basetype = 'library';
  				while(!!parent){
  					if(parent.hasOwnProperty('libkind')){
  						$.each(['group','device'], function(i, val){
  							parent[val+'num'] += sib[val+'num'];
  						});
  						$.each(_Prtg.Core.objects.group.sensorTypeNames, function (key, val) {
  							parent[val + 'sens']  += sib[val + 'sens'];
  						});
  					}
  					parent = parent._parent;
  				}
      }else{
        junki.basetype = 'device';
        return $.ajax( 
          $.extend(true,{
            data: {
              id: junki.liblinkedid
            }},         
          _Prtg.Core.objects['sensor'])
        ).done(function(d){
          junki._collapsed = true;
          junki.leafs = null;
          if(d['treesize'] > 0){
            junki.leafs = d['sensorxref'];
            junki.totalsens = junki.leafs.length;
            for(var i=0, l = junki.leafs.length; i < l; ++i) {
              junki[nodeStateMap[junki.leafs[i].status]+'sens'] += 1;
              junki.leafs[i].probegroupdevice = junki.probegroupdevice
              // junki.leafs[i].probegroupdevice.push(junki.leafs[i].objid)
            }
            var parent = junki._parent;
            while(parent){
              $.each(_Prtg.Core.objects.group.sensorTypeNames, function (key, val) {
                  parent[val + 'sens']  += junki[val + 'sens'];
              });
              parent.devicenum += 1;
              parent = parent._parent;
            }
          }
        });
		  }
    }
		return null;
	};

	LibTreeData.prototype.initLibraryData = function initLibraryData(junk, fold){
		var self = this
			, objids = {}
			, i = -1
			, l = junk.length;
    
    self.pipe = [];
		if(!self.junk) self.junk = junk;
		junk[0].fold = !!fold;
		while(++i < l){
			var junki = junk[i];
			if(!!junki.libkind){
				objids[junki.objid] = i;
				junki._parent = junki.probegroupdevice.slice(0);
			 	junki._parent.pop();
			 	junki._parent = junk[objids[junki._parent.pop()]];
				(function(junk, junki , i, sib){
          var def = self.loadLibData(junk, junki, i, sib);
          !!def && self.pipe.push(def);
				})(junk, junki, i, (i===l?null:junk[i+1]));
			}
		}
		return self.pipe;
	};
  _Prtg.Plugins.registerPlugin("libdata", LibTreeData);
})( jQuery, window, document );
