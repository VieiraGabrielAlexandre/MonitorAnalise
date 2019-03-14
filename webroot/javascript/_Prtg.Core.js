// _Prtg.Core.js
(function ($) {
	var prtgTemplates;
	function Helper() {
		return {
			loadjstemplates: function() {
				var templates = <#system type="loadjstemplates">;
				for(var tmplname in templates) {
					templates[tmplname] = $.jqotec(templates[tmplname].replace(/&apos;/g,"'").replace(/\\"/g,"'"), '*');
				}
				return templates;
			},
			compileJsTemplates: function(currentObject, propertyName) {
				var propname = propertyName || 'template';
				var obj = currentObject || this;
				var tmpl = "";

				for (var prop in obj) {
					if (typeof obj[prop] === 'object') {
						_Prtg.Helper.compileJsTemplates.call(obj[prop], obj[prop], propname);
					} else if (prop === propname ) {
						tmpl = obj[prop].toLowerCase();
						obj[propname] = prtgTemplates[tmpl];
					}
				}
			},
			___: '_Prtg.Helper' // end
		};
	}
	$.extend(true, window, { _Prtg: { Helper: Helper()} });

	function Core() {

		this.objects = {
        flowlist: {
          data: {
            template: '_Prtg.FlowMessageTable.js'
          },
          header: {
            template: '_Prtg.FlowMessageTableHeader.js'
          }
        },
				sensorTree: {
					type: 'GET',
					url: '/api/table.json',
					data: {
						count: '*',
						content: 'sensorxref',
						noraw: 1,
						subcheck: 1,
						filter_basetype: ['probe', 'group', 'device'],
						sortby: 'probegroupdevice',
						columns: 'objid,name,access=treejson,probegroupdevice=treejson,basetype,icon=treejson,favorite,fold,devicenum=textraw,groupnum=textraw,totalsens=textraw,upsens=textraw,downsens=textraw,partialdownsens=textraw,warnsens=textraw,pausedsens=textraw,unusualsens=textraw,undefinedsens=textraw,downacksens=textraw,condition,status=textraw,message=textraw,info,priority'
					},
					dataType: 'json',
					cached: false,
					traditional: true,
					levelIndentCssWidth: '19px',
					template: '_Prtg.Core.group.js',
					buttons: {
						template: '_Prtg.SensorTree.Buttons.js'
					},
					treemap: {
					 	template: '_Prtg.SensorTree.Buttons.TreeMap.js'
						//sunburst:  '_Prtg.SensorTree.Buttons.Sunburst.js'
					},
					sunburst: {
					 	template: '_Prtg.SensorTree.Buttons.Sunburst.js'
					}
				},
				libraries: {
					type: 'GET',
					url: '/api/table.json',
					data: {
						content: 'library',
						noraw: 1,
						subcheck: 1,
						filter_basetype:['@ntxt(sensor)'],
						sortby:'probegroupdevice',
						columns:'objid,name,access=treejson,probegroupdevice=treejson,basetype,icon=treejson,favorite,fold,devicenum=textraw,groupnum=textraw,totalsens=textraw,upsens=textraw,downsens=textraw,partialdownsens=textraw,warnsens=textraw,pausedsens=textraw,unusualsens=textraw,undefinedsens=textraw,downacksens=textraw,condition,status=textraw,message=textraw,info,priority,libkind,liblinkedid'
					},
					dataType: 'json'
				},
				library: {
					type: 'GET',
					url: '/api/table.json',
					data: {
						content: 'library',
						count: '*',
						noraw: 1,
						subcheck: 1,
						filter_basetype:['@ntxt(sensor)'],
						sortby:'probegroupdevice',
						columns:'objid,name,access=treejson,probegroupdevice=treejson,basetype,icon=treejson,favorite,fold,devicenum=textraw,groupnum=textraw,totalsens=textraw,upsens=textraw,downsens=textraw,partialdownsens=textraw,warnsens=textraw,pausedsens=textraw,unusualsens=textraw,undefinedsens=textraw,downacksens=textraw,condition,status=textraw,message=textraw,info,priority,libkind,liblinkedid'
					},
					dataType: 'json',
					cached: false,
					traditional: true,
					levelIndentCssWidth: '19px',
					template: '_Prtg.Core.library.js',
					treemap: {
						libObjects: { template: '_Prtg.Core.TreeMap.device.js' },
						filter: { template: '_Prtg.Core.TreeMap.device.js' },
						linked: { template: '_Prtg.Core.TreeMap.device.js' },
						node: { template: '_Prtg.Core.TreeMap.group.js' }
					}
				},
				probe: {
					template: '_Prtg.Core.probe.js',
					treemap: {
						template: '_Prtg.Core.TreeMap.group.js'
					}
				},
				group: {
					template: '_Prtg.Core.group.js',
					treemap: {
						template: '_Prtg.Core.TreeMap.group.js'
					},
					sensorTypes:['down','partialdown','downack','warn','unusual','up','paused','undefined'],
					sensorTypeNames:['down','partialdown','warn','downack','unusual','up','paused','undefined','total'],
					sensorTypesValues: {
						'down': [5],
						'downack': [13],
						'partialdown': [14],
						'warn': [4],
						'up': [3,2],
						'paused': [7, 8, 9, 11, 12],
						'unusual': [10],
						'undefined': [1,6,0],
						'total': 0
					}
				},
				device: {
					template: '_Prtg.Core.device.js',
					treemap: {
						template: '_Prtg.Core.TreeMap.device.js'
					},
					channelTemplates: {
						gauge: {
							data: {
								noraw:1,
								content:'sensors',
								sortby:'-position',
								count:'100',
								filter_priority:[4,5],
								columns:'objid,position=treejson,sensor=textraw,info=treejson,minimum,maximum,lastvalue,status=textraw,priority=raw,message=textraw'
							},
							template: '_Prtg.Device.Gauge.js'
						}
					}
				},
				sensor: {
					collapseSensorsCount: {
						downs: 10
					},
					type: 'POST',
					url: '/api/table.json',
					data: {
						count: '*',
						content: 'sensorxref',
						noraw: 1,
						filter_basetype: ['sensor'],
						sortby: 'probegroupdevice',
						columns: 'objid,name,access=treejson,probegroupdevice=treejson,status=textraw,lastvalue,favorite=treejson,info'
					},
					fullSize: false,
					dataType: 'json',
					cached: false,
					traditional: true,
					template: '_Prtg.Core.sensor.js',
					deviceCollapsed: {
						template: '_Prtg.Core.sensor.device.collapsed.js'
					},
					groupCollapsed: {
						template: '_Prtg.Core.sensor.group.collapsed.js'
					},
					channelTemplates: {
						gauge: {
							data: {
								noraw:1,
								content:'channels',
								sortby:'name',
								columns:'name=textraw,info=treejson,minimum,maximum,condition,lastvalue'
							},
							template: '_Prtg.Channel.Gauge.js'
						}
					},
					sensorTypesValues: {
						'down': [5],
						'downack': [13],
						'partialdown': [14],
						'warn': [4],
						'up': [3,2],
						'paused': [7, 8, 9, 11, 12],
						'unusual': [10],
						'undefined': [1,6,0]
					},
					sensorTypesValuesCollapsed: {
						'downs': {
							'down': [5],
							'downack': [13],
							'partialdown': [14]
						},
						'warn': [4],
						'up': [3,2],
						'paused': [7, 8, 9, 11, 12],
						'unusual': [10],
						'undefined': [1,6,0]
					}
				},
				libObjects: {
					type: 'GET',
					url: '/api/table.json',
					dataType: 'text json',
					timeout: 60000,
					data: {
						count: '*',
						content: 'libobjects',
						noraw: 1,
						subcheck: 1,
						sortby:'probegroupdevice',
						columns: 'objid,name,access=treejson,probegroupdevice=treejson,status=textraw,lastvalue,favorite=treejson,basetype,info'
					},
					cached: false,
					traditional: true
				},
				channelLisItems: {
					url: '/api/table.json',
					data: {
						tableid: 'reportchanneltable',
						content: 'reportnodes',
						noraw: 1,
						sortby: 'reportminussensor',
						columns: 'reportminussensor=treejson,objid,basetype,probegroupdevice=htmllong,name=htmllong,reportconfigchannels=treejson,status=textraw'
					},
					template: '_Prtg.Reports.ChannelListItem.js'
				},
				objectSelector: {
					template:'_Prtg.ObjectSelector.Objects.js'
				},
				toplistTimeline: {
					url: '/api/table.json',
					data: {
			      content:"topidx",
			      output:"json",
			      columns:"datetime=treejson",
			      count:"*",
			      noraw:"1" ,
			      sortby:"-datetime"
			    },
					template: "_Prtg.ToplistTimeline.js"
				},
				icons: {
					icon: function(d) {
						var ret =
							d.icon!==''
							? d.icon
							: _Prtg.Core.objects.icons.defaults[
								!d.libkind
								? (d.basetype||d.type)
								: (d.libkind.toLowerCase() +
									(!!d.leafs
							 		? d.leafs.length === 1 && d.libkind !== 'filter'
					  				? 'sensor'
					  				: 'sensors'
					 				: d.leafs===null
					 					? 'sensors'
					 					:''
					 					)
					 				)
								];
						return ret;
					},
					defaults: {
						query: '/images/ajax-loader-small.gif',
						probe: '/icons/probe.png?svg',
						probeoffline: '/icons/probeoffline.png?svg',
						group: '/icons/group.png?svg',
						device: '/icons/device.png?svg',
						node: '/icons/library.png?svg',
						nodesensors: '/icons/library.png?svg',
						linked: '/icons/libraryobject.png?svg',
						linkedsensor: '/icons/libraryobject_sensor.png?svg',
						linkedsensors: '/icons/libraryobject.png?svg',
						filter: '/images/ajax-loader-small.gif',
						filtersensor: '/icons/libraryobject_sensor.png?svg',
						filtersensors: '/icons/libraryobject_sensors.png?svg'
					}
				},
				nodeStateMap: {
					'0':  'undefined',
					'1':  'undefined',
					'2': 	'undefined',
					'3':  'up',
					'4':  'warn',
					'5':  'down',
					'6':  'undefined',
					'7':  'paused',
					'8':  'paused',
					'9':  'paused',
					'10': 'unusual',
					'11': 'paused',
					'12': 'paused',
					'13': 'downack',
					'14': 'partialdown'
				},
				nodeStates: {
					None: 0,
					Unknown: 1,
					Collecting: 2,
					Up: 3,
					Warning: 4,
					Down: 5,
					NoProbe: 6,
					PausedUser: 7,
					PausedDependency: 8,
					PausedSchedule: 9,
					Unusual: 10,
					PausedLicense: 11,
					PausedUntil: 12,
					DownAck: 13,
					PartialDown: 14
				},
				maxSensorFullSize:1,
				nameColumnWidth: 150,
				dndSensitivity: 2,
				deviceCache: 40,
				geomapMaxZoomLevel: 15,
				geomapIconSize:24,
				sunburstZoomDeviceCount:100,
				dataTableBigMode: 100,
				___: '_Prtg.Core' // end
			};
	};
	// Core.prototype.objects = function() {return this._objects};
	Core.prototype.getObject=function (oType) {
		var ob;
		if (typeof oType !== 'string') throw new Error('This is not valid object type name');
		if (this.objects[oType] !== undefined) ob = this.objects[oType];
		else ob = this.objects['_default'];
		return ob;
	};

	$.extend(true, window, { _Prtg: { Core: new Core()} });

	prtgTemplates = _Prtg.Helper.loadjstemplates();
	_Prtg.Helper.compileJsTemplates(_Prtg.Core.objects);

	$(function measureScrollbar() {
		_Prtg.scrollbarDimensions = (function measureScrollbar() {
			var $c = $("<div style='position:absolute; top:-10000px; left:-10000px; width:100px; height:100px; overflow:scroll;'></div>").appendTo("body");
			var dim = { width: $c.width() - $c[0].clientWidth, height: $c.height() - $c[0].clientHeight };
			$c.remove();
			return dim;
		})();
	});

})(jQuery);

