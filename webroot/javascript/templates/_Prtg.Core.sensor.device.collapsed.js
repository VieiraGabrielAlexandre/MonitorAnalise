<div class="sensorItem cell-inner c1 drop level-<*=this._level*> <*=this._classes.join(' ').trim()*>" idx="<*=this._idx*>" objid="<*=this.objid*>" type="<*=this.basetype.toLowerCase()*>"  path="<*=this._id*>" template="_Prtg.Core.sensor.device.collapsed.js">
<*
	var self = this
		, librarymenu = (jQuery.inArray('librarymenu',this._classes) > -1)
		, regexName=/"/g;

	(function($,device){

	function printSensor(idx, objid, status, type, classes, name, title, value, favorite, access, alttype, filter){
*>
		<sensor
			<*=idx>-1?' idx="'+idx+'"':' '*>
			objid="<*=objid*>" 
			type="<*=type*>" 
			<*=!alttype?'':'altType="'+alttype+'"'*>
			<*=!filter?'':'filter="'+filter+'"'*>
			class="<*=classes*> status<*=status*>"
			title="<*=title*>"
			<*=!access?'':'goto="true"'*>>
				<icon <*=!access?'':'popup="333"'*> ></icon>
				<name <*=!access?'':'popup="3333"'*> ><*=name*></name>
				<value><*=value*></value>
				<favorit><span class="<*=favorite*> ui-icon ui-icon-flag" onclick="var e = arguments[0] || window.event; e.stopPropagation(); _Prtg.objectTools.faveObject.call(this,<*=objid*>,'toggle');return false;"></span></favorit>
		</sensor>
<*
	}

	function findSensors(kind){
		var sensors = [];
		$.each(device.leafs, function(i, sensor){
			if($.inArray(sensor.status, kind) !== -1)
				sensors.push({'idx':i,'sensor':sensor});
		});
		return sensors;
	}

	function processSensors(count, kind, key){
		switch(count){
			case -1:
				printSensor(
					-1,
					device.objid, 
					kind[0],
					self.basetype==='library'?self.libkind:'device',
					'noContextMenu',
					'',
					'',
					'',
					'hidden',
					false
				);
				break;
			case 0:
				break;
			case 1:
				var sensors = findSensors(kind);
				$.each(sensors, function(i,s){
					var sensor = s.sensor,
						simulated = (/simulated/.test(sensor.info) === true),
						paused = (jQuery.inArray(sensor.status, [7,8,9,11,12]) !== -1) || simulated,
						pausedbyparent = paused && (/paused/.test(sensor.info) === false),
						classes = [];
					if(!sensor.access) classes.push('noContextMenu');
					if(librarymenu) classes.push('librarymenu');

					classes.push((/fixed/.test(sensor.info) === true ? 'dragable fixed' : 'dragable'));
					classes.push((jQuery.inArray(sensor.status, [5,13,14]) > -1?'sensorred':''));
					classes.push((paused ? (pausedbyparent && !simulated ? 'ispausedbyparent' : 'ispaused') : 'isnotpaused'));
					classes.push((sensor.favorite ?'isfavorite':'isnotfavorite'));

					printSensor(
						s.idx,
						sensor.objid, 
						kind[0],
						'sensor',
						classes.join(' ').trim(),
						sensor.name,
						'',
						sensor.lastvalue,
						('object' +(sensor.favorite ?'isfavorite':'isnotfavorite icon-gray')),
						sensor.access
					);
				});
				break;
			default:
				printSensor(
					-1,
					device.objid, 
					kind[0],
					self.basetype==='library'?self.libkind:'device',
					'noContextMenu',
					Math.abs(count) + ' '+ _Prtg.Lang.sensorTree.strings.ColumnHeaderSensors,
					'',
					'',
					'hidden',
					true,
					self.basetype==='library' && self.libkind==='filter'?self.libkind:'sensors',
					'&filter_status='+kind.slice(0).sort().join('&filter_status=')
				);
				break;
		}
	}
	var leafsloaded = device.leafs && device.leafs.length === device.totalsens ? 1 : -1;
	$.each(_Prtg.Core.objects.sensor.sensorTypesValuesCollapsed, function(key,val){
			var sum=0;
			if($.isPlainObject(val)){
				$.each(val, function(k,v){
					sum += device[k+'sens']; 
				});
			}else{
				sum = device[key+'sens'];
			}
			if($.isPlainObject(val)){
				if(sum > 0){
					if(sum <=  _Prtg.Core.objects.sensor.collapseSensorsCount[key]){
						if(leafsloaded === -1){
							for(var l=0,m=sum; l < m; ++l)
								processSensors(leafsloaded, val['down']);
						}else{
							$.each(val, function(k,v){
								device[k+'sens'] > 0 && processSensors(1, v);
							});		
						}			
					}else{
						$.each(val,function(k,v){
							processSensors(leafsloaded * device[k+'sens'],v);
						});										
					}
				}
			}else{
				processSensors(leafsloaded*sum, val);
			}
		});
	})(jQuery, this);

*>
</div>