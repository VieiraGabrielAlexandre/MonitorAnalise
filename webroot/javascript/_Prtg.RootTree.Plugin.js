/*
/   _Prtg.RootTree.RootTree.js
*/
(function ( $, window, document, undefined ) {
	var pluginName = "roottree"
		, BasePlugin = null;

	function RootTree( element, data, parent ) {
		this.element = element;
		this.options = data;
		this.data = data;
		this.parent = parent;

		this.$sensorTree = $(element)
		this.$parent = this.$sensorTree.parent();
		this.grid = null;
		this.$treeblocker = this.$sensorTree.find('#treeblocker');
		this.$editSettings = $('.editsettings');
		this.$dropTreeAdorner = $('<div id="treeAdorner" />');
		this.editable = this.$sensorTree.parent().is('.treeiseditable');
		this.fullSize = !(this.data.noFullSize || this.options.objects['sensorxref'][0].totalsens > _Prtg.Core.objects.maxSensorFullSize);
		this.layout = null;
		this.selectorArray = [];

		this.$sensorTree.attr('data-objects',null);

		this.isNotRefreshable = false || this.data.isNotRefreshable
		this.dragging = false;

		this.init(this);

	};

	RootTree.prototype.refresh = function refreshObjectTree(){
		if(this.isNotRefreshable
		|| this.$sensorTree.find('.selected').length
		|| this.dragging)
			return;
		this.$sensorTree.sensortree('refresh');
	};

	RootTree.prototype.resize =  function (setHeight, offsetTop, footer, buttons){
    footer = !!footer && footer.length > 0 ? footer[0] : false;
    if(setHeight)
      this.$sensorTree.height(
        (window.innerHeight
          - offsetTop
          - (footer ? footer.offsetHeight : 0)
          - (buttons ? buttons.offsetHeight : 0)
          -23
        )
      );
    else
      this.$sensorTree.height('auto');
    this.$sensorTree.trigger('resize.objecttree');
  };

	RootTree.prototype.init = function(me){
		var self = me
			, postDataLoadRequestLib = null
			, postDataLoadTimerLib = null
			, $layouts = !!me.data.layout ? $(me.data.layout) : me.$sensorTree.closest("#layout")
			, rootopts = $.extend(true,{}, _Prtg.Core.objects['library'], {
				treetype: 'sensorxref',
				gridOptions: {
						headerHeight: 0,
						showTopPanel: true,
						topPanelHeight: 31,
						showHeaderRow: false,
						headerRowHeight: 18
				},
				columns: [
					{
						id: 'content',
						name: _Prtg.Lang.sensorTree.strings.ColumnHeaderLibrary,
						formatter: function (row, cell, value, columnDef, dataContext) {
							if(!!dataContext.basetype)
								return $.jqote(_Prtg.Core.getObject(dataContext.basetype.toLowerCase()).template, dataContext);
							else
								return $.jqote(_Prtg.Core.getObject('library').template, dataContext);

						},
						width: 300,
						minWidth: 150,
						cssClass: 'treeColumn'
					},
					{
						id: 'leafs',
						name: _Prtg.Lang.sensorTree.strings.ColumnHeaderSensors,
							formatter: function (row, cell, value, colDef, data) {
								var content = '<div class="sensorItem cell-inner c1 ' + data._classes.join(' ').trim() + '"' + ' type="' + data.basetype + '" objid="' + data.objid + '" idx="' + data._idx + '" path="' + data._id + '"><span></span></div>';
								if(/device/.test(data.basetype) === true && data.totalsens > 0){
									if (data._collapsed || !colDef.layout)
										content = $.jqote(_Prtg.Core.getObject('sensor').deviceCollapsed.template, data);
									else
										content = $.jqote(_Prtg.Core.getObject('sensor').template, data);
								} else { //if(/filter|node|library/.test(data.basetype) === true){
									if(data._collapsed)// && /sensorTree|node/.test(data.libkind) === true)
										content = $.jqote(_Prtg.Core.getObject('sensor').groupCollapsed.template, data);
									else
										content = $.jqote(_Prtg.Core.getObject('sensor').template, data);
								}
								return content;
						},
						asyncPostRender: function (cellNode, row, dx, colDef) {
							var content="";
								if (!!dx) {
									if (!!dx.leafs) {
										if (dx._collapsed || !colDef.layout)
											content = $.jqote(_Prtg.Core.getObject('sensor').deviceCollapsed.template, dx);
										else
											content = $.jqote(_Prtg.Core.getObject('sensor').template, dx);
									} else if (dx._collapsed || !colDef.layout){
											content = $.jqote(_Prtg.Core.getObject('sensor').groupCollapsed.template, dx);
									}
								}
								return content;
						},
						rerenderOnResize: true,
						width: '*',
						minWidth: 370,
						cssClass: 'valueColumn'
					}
				],
				postDataLoad: function postDataLoadLibrary(grid, from, to, dataContext, rows, idxByObjId, eventHelper, direction) {
					var loaderrors=false,
            opts = $.extend(true,{},_Prtg.Core.objects['sensor']),
						preload =_Prtg.Core.objects.deviceCache,
						dfd = $.Deferred(),
						transpose = {},
						ready = {},
						load = [],
						settings = {
							type: opts.type || 'GET',
							dataType: opts.dataType || 'text json',
							url: opts.url,
							data: opts.data,
							traditional: opts.traditional || false,
							cache: opts.cache || false,
							success: function libSensorLoadSuccess(ret) {
								var d = ret[opts.data.content],
									to = d.length,
									node = null,
									i=0,l=0,
									pid=0,
									idx,
									now = $.now();
								postDataLoadRequestLib = null;
								for (i = 0; i < to; i++) {
									node = d[i].probegroupdevice.slice(0);
									node.pop();
									node = node.pop();
									$.each(transpose[node],function(j,node){
										if (!!node){
											if(!!node._updateLeafs) {
												node.leafs = [];
												node._updateLeafs = false;
											}
											!!node.leafs && node.leafs.push(d[i]);
										}
									});
								}
								eventHelper.notify(ready, null, grid);
								dfd.resolve();
							},
							error: function libSensorloadError(jqXHR, textStatus, errorThrown) {
								postDataLoadRequestLib = null;
								dfd.reject();
							}
						};
					if(!!postDataLoadTimerLib){
						clearTimeout(postDataLoadTimerLib);
						postDataLoadTimerLib = null;
					}

					if(!!postDataLoadRequestLib && postDataLoadRequestLib.readyState < 4){
						postDataLoadRequestLib.abort();
						postDataLoadRequestLib = null;
					}

                    if(direction !== undefined) {
                        if (direction < 0){
                            from = from - preload > 0 ? from - preload : 0;
                        } else {
                            from = from - 5 > 0 ? from - 5 : 0;
                            to = to + preload < rows.length ? to + preload : rows.length - 1;
                        }
                    }

					for(var i=from; i <= to; ++i){
						var item = dataContext[rows[i]];
						if(!!item && item._updateLeafs){
							load.push(item.objid);
							if(!transpose.hasOwnProperty(item.objid))
								transpose[item.objid] = [];
							transpose[item.objid].push(item);
							ready[[item.objid,'-',i].join('')] = i;
						}else if(!!item && !!item._loaderrors)
                loaderrors = true;
					}
					if(load.length > 0){
						settings.data.filter_parentid = load;
						postDataLoadTimerLib = setTimeout(function(){
							postDataLoadTimerLib = null;
							postDataLoadRequestLib = $.ajax(settings)
						},10);
					} else {
						//eventHelper.notify(ready, null, grid);
						dfd.resolve();
					}
          if(!!_Prtg.Events && loaderrors){
            loaderrors = $.extend(true, {}, _Prtg.Core.objects['sensor']);
            loaderrors.data.filter_status=[5,13,14];
            loaderrors.data.count = '*';
            loaderrors.data.id=0;
						dfd.promise().then(function(){
	            $.ajax({
	              type: 'POST',
	              dataType: 'text json',
	              url: loaderrors.url,
	              data: loaderrors.data,
	              traditional: loaderrors.traditional || false,
	              cache: loaderrors.cache || false
	            }).done(function(res){
	              if(!!res && !!res.treesize){
	                var result = res.sensorxref;
	                for(var x=0, m=result.length; x < m; ++x){
	                  result[x]._probegroupdevice = result[x].probegroupdevice.slice(0);
	                  result[x]._probegroupdevice.pop();
	                  result[x]._probegroupdevice.pop();
	                  result[x]._probegroupdevice = result[x]._probegroupdevice.join('-');
	                }
	                !!_Prtg.Events && _Prtg.Events.publish('leafs.refreshed.prtg',res);
	                res = null;
	              }
	            });
            });
          }
					return dfd.promise();
				}
				})
			, dndPlugin = $(me.data.dndTarget).find(me.data.dndPlugin);

		if(!me.isNotRefreshable){
			me.$parent.Events().subscribe('refresh.events.prtg', $.proxy(me.refresh, me));
			me.$sensorTree.on('destroyed', function(){
				me.$parent.Events().unsubscribe('refresh.events.prtg', $.proxy(me.refresh, me));
				me.$parent.closest('.tab-container').css('height','');
			});
		}

    _Prtg.Events.subscribe('prtg.resize.layout',$.proxy(
      me.resize,
      me,
      !me.fullSize,
      me.$sensorTree.offset().top,
      document.getElementsByTagName('footer'),
      document.getElementById('sensortreelinks')
    ));
    if(!me.fullSize){
        me.resize(
          !me.fullSize,
          me.$sensorTree.offset().top,
          document.getElementsByTagName('footer'),
          document.getElementById('sensortreelinks')
        );
    }

		$.event.special.drop.targets=[];
		$.drop({ mode: 'mouse'});

		if(dndPlugin.length > 0){
			// dndPlugin.on('changed', function(e,d){me.updateData(d.data)});
			dndPlugin = dndPlugin.data();
		} else
			dndPlugin = null;

		if(!!dndPlugin)
			dndPlugin = dndPlugin['plugin_'+ dndPlugin.plugin.camelCase()];
		else
			dndPlugin = null;
		$(me.data.dndTarget).on({
			'drop': function dropItem(e, d) {
				if(d.feedback !== false && !!dndPlugin){
					if(dndPlugin.drop){
						dndPlugin.drop.apply(dndPlugin,[e,d]);
					}else
						dndPlugin
							.add(d.hasOwnProperty('sensorIdx') ? d.data.leafs[d.sensorIdx].objid : d.data.objid,e,d)
							// .always(function(data){
							// 	if(data)
							// 		me.updateData.call(data);
							// });
				}
        me.$sensorTree.data('sensortree').grid.onDragEnd.notify(d,e);
			},
			'dropstart': function dropStartItem(e, d) {
				me.$dropTreeAdorner.removeClass().remove();
				if(!!dndPlugin && dndPlugin.dropstart)
						return dndPlugin.dropstart.apply(dndPlugin,[e,d]);
				else {
					d.feedback = 'copy';
					return true;
				}
			},
			'dropend ': function dropEndItem(e, d) {
				if(!!dndPlugin && !!dndPlugin.dropend)
					dndPlugin.dropend.apply(dndPlugin,[e,d]);
				me.$sensorTree.find('.selected').removeClass('selected');
				$(me.data.dndTarget).removeClass('cursor-copy cursor-move cursor-progress cursor-notallowed cursor-none')
        this.dragging = false;
        return true;
			}
		}, me.data.dndElements,me);

		if(!!me.data.libs){
			me.libraryData = _Prtg.Plugins['libdata'].init.apply(me.element,[me.options, me.parent]);
			me.data.libs.library.unshift ({
				access: ""
				,basetype: "group"
				,condition: ""
				,devicenum: 0
				,downacksens: 0
				,downsens: 0
				,favorite: ""
				,fold: true
				,groupnum: 0
				,icon: ""
				,info: ""
				,libkind: "libraries-root"
				,liblinkedid: 0
				,message: ""
				,name: "Libraries"
				,objid: -6
				,partialdownsens: 0
				,pausedsens: 0
				,priority: 3
				,probegroupdevice: [-6]
				,status: 0
				,totalsens: 0
				,undefinedsens: 0
				,unusualsens: 0
				,upsens: 0
				,warnsens: 0
			});
			me.libraryData.initLibraryData(me.data.libs.library, false);
			// me.data.libs.library[0].libkind =  "libraries";
			me.$sensorTree.removeAttr('data-libs');
			me.data.objects.sensorxref = me.data.objects.sensorxref.concat(me.data.libs.library);
		}

		$.when(
			me.$sensorTree.sensortree($.extend(true, rootopts, {
				initLibraryData: function(junk, name){return me.libraryData.initLibraryData(junk)},
				layout: me.data.viewType,
				data: {
					id: me.data.rootId,
					content: 'sensorxref'
				},
				editMode: false,
				gridOptions: {
					fullHeight: me.fullSize,
					showTopPanel: me.data.showTopPanel,
					borderBottomWidth: (!!me.data.borderBottomWidth ? me.data.borderBottomWidth:0)
				},
				timer: $(me.parent).Events(),
				displayMode: 'managed',//me.data.displayMode,
				controlsParent: me.data.controlsParent || '#loadedcontent',
				hideControls: !!me.data.hideControls,
				dragMode: true,
				noPopups: true,
				ignorFold: true
			}), me.data.objects)
			.parents('.loading')
			.removeClass('loading')
		).then(function(){
			// !!dndPlugin && me.updateData(dndPlugin.getData());
		});

		me.$sensorTree.sensortree('subscribe', 'onDragStart', function dragend(e, d) {
			me.dragging = true;
			e.stopImmediatePropagation();
		});
		me.$sensorTree.sensortree('subscribe', 'onDragEnd', function dragend(e, d) {
			me.$sensorTree.find('.selected').removeClass('selected');
			me.dragging = false;
			e.stopImmediatePropagation();
		});

		/* disabling DnD of already selected objects */
		// me.$sensorTree.data('sensortree').grid.onRefreshLeafs.subscribe(function(){
		// 	$.each(me.selectorArray, function(i,e){
		// 		me.$sensorTree.find(e).closest('.slick-row,sensor').removeClass('dragable').addClass('nondragable');
		// 	});
		// });
		// me.$sensorTree.data('sensortree').grid.onPostRender.subscribe(function(){
		// 	$.each(me.selectorArray, function(i,e){
		// 		me.$sensorTree.find(e).closest('.slick-row,sensor').removeClass('dragable').addClass('nondragable');
		// 	});
		// });

	};

	// RootTree.prototype.updateData = function updateData(data){
	// 	var me = this;
	// 	if(!data) return;
	// 	this.selectorArray = [];
	// 	data= $.map(data, function(e){
	// 		var selector = 'row '+ {
	// 			probe: 'div[path*="-'+e.objid+'-"], div[path*="-'+e.objid+'-"] sensor,div',
	// 			group: 'div[path*="-'+e.objid+'-"], div[path*="-'+e.objid+'-"] sensor,div' ,
	// 			device: 'div[objid="'+e.objid+'"]  sensor,div',
	// 			sensor: 'sensor'}[e.basetype]
	// 			+ '[objid="'+e.objid+'"]';
	// 			if(e.hasOwnProperty('purge')){
	// 				me.$sensorTree.find(selector).closest('.slick-row,sensor').addClass('dragable').removeClass('nondragable');
	// 				return null;
	// 			} else {
	// 				me.selectorArray.push(selector);
	// 				me.$sensorTree.find(selector).closest('.slick-row,sensor').addClass('nondragable').removeClass('dragable');
	// 				return e;
	// 			}
	// 	});
	// }


	$.fn[pluginName] = function ( options, parent ) {
		var me = this
			, elm = this;
		if(!!options){
			if(!!options.pluginTarget)
				me = $(options.pluginTarget);
			if(!!options.pluginFunction){
				return me.each(function(){
					$.data(this, "plugin_" + pluginName )[options.pluginFunction](elm, options);
				});
			}
		}
		return me.each(function () {
			if ( !$.data(this, "plugin_" + pluginName )) {
				$.data( this, "plugin_" + pluginName, new RootTree( this, options, parent ));
			}
		});
	};
})( jQuery, window, document );
