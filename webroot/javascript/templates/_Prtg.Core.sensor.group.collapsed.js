<div class="sensorItem cell-inner c1 level-<*=this._level*> <*=this._classes.join(' ').trim()*>" idx="<*=this._idx*>" objid="<*=this.objid*>" type="<*=this.basetype.toLowerCase()*>"  path="<*=this._id*>" template="_Prtg.Core.sensor.group.collapsed.js">
<*
	(function($,group){
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
		if(!!group.basetype && group.basetype !== 'library' && group.groupnum === 0 && group.devicenum === 0){
			if(/unapproved/.test(group.info) === false){*>
				<span><a class="treeminilink actionbutton" onclick="_Prtg.objectTools.addObject(<*=group.objid*>,'device');return false;" href="#"><*=_Prtg.Lang.sensorTree.strings.AddDevice*></a></span>
		<*} else if(!_Prtg.Options.userIsReadOnly) {*>
				<span class="approve" style="margin-left:3px;margin-top:-4px;">
                    <a class="actionbutton approvebutton" onclick="_Prtg.objectTools.setProbeState.call(this,<*=group.objid*>,'allowanddiscover');return false;"><span class="ui-icon ui-icon-check"></span><*=_Prtg.Lang.sensorTree.strings.ApprovenewprobeDisco*></a>
                    <a class="actionbutton button btngrey" onclick="_Prtg.objectTools.setProbeState.call(this,<*=group.objid*>,'allow');return false;"><span class="ui-icon ui-icon-check"></span><*=_Prtg.Lang.sensorTree.strings.Approvenewprobe*></a>
					<a class="actionbutton button btngrey" onclick="_Prtg.objectTools.setProbeState.call(this,<*=group.objid*>,'deny');return false;"><span class="ui-icon ui-icon-closethick"></span><*=_Prtg.Lang.sensorTree.strings.Denynewprobe*></a>
				</span>
		<*}
		}else{
			var librarymenu = ($.inArray('librarymenu',group._classes) > -1)
        , objid = (!!group.liblinkedid?group.liblinkedid : group.objid)
        , errors = group._loaderrors;

			$.each({
				'downs':{
					'downsens':[5],
					'partialdownsens':[14],
					'downacksens':[13]
				},
				'warnsens':[4],
				'pausedsens':[7,8,9,11,12],
				'upsens':[3,2],
				'unusualsens':[10],
				'undefinedsens':[1,6,0]
				}, function(key,val){
					var sum=0,printed=0;
					if($.isPlainObject(val)){
						$.each(val, function(k,v){
							sum += group[k];
						});
					}else{
						sum = group[key];
					}
					if($.isPlainObject(val)){
						if(sum > 0){
							if(group.basetype != "library" && !!_Prtg.Events && sum <= _Prtg.Core.objects.sensor.collapseSensorsCount[key]){
								$.each(val, function(k,v){
									for(var l=0, m=group[k]; l<m && printed<sum; ++printed, ++l){
						      	if(!!group.errors && group.errors.length){
											var sensor = group.errors[printed],
												simulated = (/simulated/.test(sensor.info) === true),
												paused = (jQuery.inArray(sensor.status, [7,8,9,11,12]) !== -1) || simulated,
												pausedbyparent = paused && (/paused/.test(sensor.info) === false),
												classes = ['group'];
											if(!sensor.access) classes.push('noContextMenu');
											if(librarymenu) classes.push('librarymenu');

											classes.push((/fixed/.test(sensor.info) === true ? 'dragable fixed' : 'dragable'));
											classes.push((jQuery.inArray(sensor.status, [5,13,14]) > -1?'sensorred':''));
											classes.push((paused ? (pausedbyparent && !simulated ? 'ispausedbyparent' : 'ispaused') : 'isnotpaused'));
											classes.push((sensor.favorite ?'isfavorite':'isnotfavorite'));

											printSensor(
												printed,
												sensor.objid,
												sensor.status,
												'sensor',
												classes.join(' ').trim(),
												sensor.name.replace(/"/,'&quot;'),
												'',
												sensor.lastvalue,
												('object' +(sensor.favorite ?'isfavorite':'isnotfavorite icon-gray')),
												sensor.access
											);
						      	}else{
											*>
												<sensor objid="<*=objid*>" class="replace<*=group.objid*> group status<*=v[0]*>" title="">
														<icon></icon>
														<name></name>
														<value></value>
												</sensor>
											<*
									}}
								});
							}else{
								$.each(val,function(k,v){
									if(group[k] > 0){
										*>
											<sensor objid="<*=objid*>" class="group status<*=v[0]*>" type="<*=group.basetype==='libary' && group.libkind==='filter'?'filter':'sensors'*>" filter="&filter_status=<*=v.join('&filter_status=')*>" goto="true" title="">
													<icon popup="333"></icon>
													<name popup="3333"><*=group[k] + ' ' +_Prtg.Lang.sensorTree.strings.ColumnHeaderSensors*></name>
													<value></value>
											</sensor>
										<*
									}
								});
							}
						}
					}else if(sum>0){
						*>
							<sensor objid="<*=objid*>" class="group status<*=val[0]*>" type="<*=group.basetype==='library' && group.libkind==='filter'?'filter':'sensors'*>" filter="&filter_status=<*=val.join('&filter_status=')*>" goto="true" title="">
									<icon popup="333"></icon>
									<name popup="3333"><*=sum + ' ' +_Prtg.Lang.sensorTree.strings.ColumnHeaderSensors*></name>
									<value></value>
							</sensor>
						<*
			    }
	    });
      if(!!errors && !!_Prtg.Events){
		      (function(group, librarymenu, objid, errors){
			      _Prtg.Events.subscribeOnce('leafs.refreshed.prtg', function(e,res){
			      	_Prtg.ObjectTree.printErrors(group, res, objid, errors, librarymenu);
						});
					})(group, librarymenu, objid, errors);
			}
	}
})(jQuery, this);
*>
</div>
