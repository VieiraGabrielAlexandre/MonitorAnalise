/*
/   _Prtg.LibTree.Plugin.js
*/
(function ( $, window, document, undefined ) {
	var pluginName = "libtree";

	function LibTree( element, options, parent ) {
		this.element = element;
		this.options = options;
		this.parent = parent;

		this.$sensorTree = $(element);
        this.$parent = this.$sensorTree.parent();
		this.$sensorTree.attr('data-objects',null);
		this.grid = null;
		this.resizeTimer = null;
		this.$treeblocker = this.$sensorTree.find('#treeblocker');
		this.$editSettings = $('.editsettings');
		this.$dropTreeAdorner = $('<div id="treeAdorner" />');
		this.$dragSensor = null;
		this.$draggedSensor = null;
		this.unpinned = false;
		this.fullSize = false; //|| this.$sensorTree.parent().is('.treeiseditable');
		this.$positioncontainer = $('div#main');
		this.editable = this.$sensorTree.parents('#dropTarget').is('.treeiseditable');
		this.junk =this.options.objects;
		this.libName = this.options.libName;
		this.objectid = this.options.objectid;

		this.isNotRefreshable = this.options.isNotRefreshable || false;
		this.dragging = false;

		this.init(this, this.junk);
	};

	LibTree.prototype.refresh = function refreshObjectTree(){
		if(this.isNotRefreshable
		|| this.$sensorTree.find('.selected').length
		|| this.dragging)
			return;
		this.$sensorTree.sensortree('refresh');
	};

	LibTree.prototype.setFullsize =  function (val){
		this.fullSize = val === undefined ? this.fullSize : val;
		return this.fullSize;
	};

	LibTree.prototype.resize =  function (offsetTop, footer, buttons){
    footer = !!footer && footer.length > 0 ? footer[0] : false;
		this.$sensorTree.height(
			(window.innerHeight
				- offsetTop
				- (footer ? footer.offsetHeight : 0)
				- (buttons ? buttons.offsetHeight : 0)
				-50
			)
		).trigger('resize.objecttree');
	};

	LibTree.prototype.init = function init (me, junk) {
		var postDataLoadRequestLib = null
			, postDataLoadTimerLib = null
			, $layouts = $(me.parent).find("#layout")
			, libopts = $.extend(true,{}, _Prtg.Core.objects['library'], {
						treetype: 'library',
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
										if(!dataContext.libkind)
											return $.jqote(_Prtg.Core.getObject(dataContext.basetype.toLowerCase()).template, dataContext);
										else
											return $.jqote(_Prtg.Core.getObject('library').template, dataContext);

									},
		              width: _Prtg.Core.objects.nameColumnWidth,
		              minWidth: _Prtg.Core.objects.nameColumnWidth,
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
											} else {
												if(data._collapsed || !colDef.layout)
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
										beforeSend: function(jqXHR){
											jqXHR.peNumber = 'PE1236'
										},
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
									if(!!item && !item.libkind && item._updateLeafs){
										load.push(!!item.libkind? item.liblinkedid:item.objid);
										if(!transpose.hasOwnProperty(item.objid))
											transpose[item.objid] = [];
										transpose[item.objid].push(item);
										ready[[item.objid,'-',i].join('')] = i;
									}else if(!!item && !!item._loaderrors)
										loaderrors = true;
								}
								if(load.length > 0){
									if(load.length>1)
										settings.data.filter_parentid = '['+load.join(',')+']';
									else
										settings.data.filter_parentid = load;
									postDataLoadTimerLib = setTimeout(function(){
										postDataLoadTimerLib = null;
										postDataLoadRequestLib = $.ajax(settings)
									},10);
								} else {
									eventHelper.notify(ready, null, grid);
									dfd.resolve();
								}
		            if(!!_Prtg.Events && loaderrors){
		              loaderrors = $.extend(true, {}, _Prtg.Core.objects['sensor']);
		              loaderrors.data.filter_status='[5,13,14]';
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
			, objids = {};

		me.libraryData = _Prtg.Plugins['libdata'].init.apply(me.element,[me.options, me.parent]);

		// if(junk.treesize > 1 ){
		// 	$('.centeredHint').remove();
		// }else{
		// 	$('.centeredHint').show().delay(5000).fadeOut(2000).remove();
		// }

		if(!me.fullSize){
			_Prtg.Events.subscribe('prtg.resize.layout',$.proxy(
				me.resize,
				me,
				me.$sensorTree.offset().top,
				document.getElementsByTagName('footer'),
				document.getElementById('sensortreelinks')
			));

				me.resize(
					me.$sensorTree.offset().top,
					document.getElementsByTagName('footer'),
					document.getElementById('sensortreelinks')
				);
		}
		$.when.apply($,me.libraryData.initLibraryData(junk['library']))
		.then( function(){
			var tree = me.$sensorTree.sensortree($.extend(true, {},
				libopts, {
					treetype: 'library',
					layout: (me.editable ? 'sensortreenormal': me.options.viewType),
					data: {
						id: me.options.objectid
					},
					initLibraryData: function(junk, name){return me.libraryData.initLibraryData(junk, name)},
					editMode: me.editable,
					dragMode: me.editable,
          hideControls: !!me.options.hideControls,
					controlsParent: me.options.controlsParent || '#loadedcontent,#mainstuff',
					displayMode: (me.options.displayMode || 'overview'),
					gridOptions: {
						fullHeight: me.fullSize,
						showTopPanel: !me.editable,
						setFullsize: function(){me.setFullsize();}
					},
					timer: $(me.parent).Events()
			}), junk);

			if(!me.isNotRefreshable){
				$(me.parent).Events().subscribe('refresh.events.prtg', $.proxy(me.refresh, me));
				me.$sensorTree.on('destroyed', function(){
					$(me.parent).Events().unsubscribe('refresh.events.prtg', $.proxy(me.refresh, me));
				});
			}
			me.$sensorTree.sensortree('subscribe', 'onDragStart', function dragend(e, d) {
				me.dragging = true;
				e.stopImmediatePropagation();
			});
			me.$sensorTree.sensortree('subscribe', 'onDragEnd', function dragend(e, d) {
				me.$sensorTree.find('.selected').removeClass('selected');
				me.dragging = false;
				e.stopImmediatePropagation();
			});

			tree
				.appendTo(me.$parent)
				.parents()
				.removeClass('loading');
			if(junk.treesize > 1 ){
				$('.centeredHint').remove();
			}else{
				$('.centeredHint').css('position','relative').show().delay(8000).fadeOut(2000);
			}
		});

		$(document)
			.off('click.contextmenu','li#libaddlib, a.libaddlib')
			.on('click.contextmenu' ,'li#libaddlib, a.libaddlib',function(e){
				var data = me.$sensorTree.data('sensortree')
					, context = $(this).data('element').context;
				$(this).removeData('element');
				if(!!context){
					me.$treeblocker.show();
					me.$sensorTree.removeClass('cursor-none cursor-copy').addClass('cursor-progress');
					data.dataview.addLibrary(data.grid, parseInt($(context).attr('id'), 10), -1, parseInt($(context).attr('row'), 10), me.libraryData.initLibraryData).always(function(){
						me.$treeblocker.hide();
						me.$sensorTree.removeClass('cursor-progress');
					});
				}
				return false;
			});
	};

	LibTree.prototype.drop= function drop(e, d) {
		var $target = $(e.target).closest('.slick-row').find('.treeItem[type="filter"],.treeItem[type="node"],.treeItem[type="linked"]').first()
			, isnode = $target.has('[objid]')
			, row = parseInt(($target.attr('idx') || -1))
			, dataview = this.$sensorTree.data('sensortree').dataview
			, objid = (d.hasOwnProperty('sensorIdx') ? d.data.leafs[d.sensorIdx].objid : d.data.objid)
			, libid =  isnode ? parseInt($target.attr('objid')) : me.objectid
			, me = this;
		this.dragging = false;
		if(d.feedback !== false){
			me.$treeblocker.show();
			me.$sensorTree.removeClass('cursor-none cursor-copy').addClass('cursor-progress');
			if (d.type !== 'library') {
				dataview.addLibrary(me.$sensorTree.data('sensortree').grid, libid, objid, row, me.initLibraryData)
					.always(function(){
						me.$sensorTree.removeClass('cursor-progress');
						me.$treeblocker.hide();
						me.$sensorTree.sensortree('refresh');
					});
			} else if(d.feedback === 'move'){
				d.dataView.moveNode(me.$sensorTree.data('sensortree').grid, d.row, row, me.initLibraryData)
					.always(function(){
						me.$sensorTree.removeClass('cursor-progress');
						me.$treeblocker.hide();
						me.$sensorTree.sensortree('refresh');
					});
			}
		}
		me.$sensorTree.data('sensortree').grid.onDragEnd.notify(d,e);
		e.stopImmediatePropagation();
	};

	LibTree.prototype.dropend = function dropend(e, d) {
		this.dragging = false;
	};
	LibTree.prototype.dropstart= function dropstart(e, d) {
		var $target = $(e.target).closest('.slick-row').first().find('[idx]')
			, row = parseInt(($target.attr('idx') || -1))
			, dstType = ($target.find('library')[0] || $target).localName
			, isnode = $target.attr('type') === 'node'
			, me = this;
		me.dragging = true;
		d.target = this;
		d.feedback = false;
		me.$dropTreeAdorner.removeAttr('class').remove();
		me.$sensorTree.find('.indent').removeClass('hovered');
		if (/library/.test(dstType)){
				var classes = 'ui-icon-play level0 ';
				if (d.type !== 'library'){
					d.feedback = 'copy';
					if(isnode)
						classes += 'dropOnClosed';
					else
						d.feedback = false;
				} else {
					d.feedback = 'move';
					if(row === d.row
					|| me.$sensorTree.data('sensortree').dataview.isChild(d.row,row))
						d.feedback = false;
					else if(isnode)
						classes += 'dropOnClosed';
					else if(row < d.row && row > 0)
						classes += 'dropBefore';
					else{
						var nextSibling = me.$sensorTree.data('sensortree').dataview.Data()[row]._nextSibling;
						if(!!nextSibling){
							$target = me.$sensorTree.find('[path="'+ nextSibling._id + '"]');
							classes += 'dropBefore';
						} else {
							$target = me.$sensorTree.find('.slick-row row').last();
							classes += 'dropAfter';
						}
					}
				}
				$target = $target.first().closest('.slick-row');
				if(d.feedback && $target.length){
					me.$dropTreeAdorner.addClass(classes);
					$target.prepend(me.$dropTreeAdorner);
					if(d.feedback === 'copy')
						$target.find('.indent').addClass('hovered');
					return true;
				} else
					d.feedback = false;
			return false;
		}
	};

	LibTree.prototype.add = function(objid,e,d){
		var self = this
			, dfd = $.Deferred();
				dfd.resolve(null);
		return dfd.promise();
	}

	LibTree.prototype.getData = function(){
		return null;//this.currentData;
	};


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
				$.data( this, "plugin_" + pluginName, new LibTree( this, options, parent ));
			}
		});
	};

})( jQuery, window, document );
