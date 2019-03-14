<*
	var librarymenu = (this._classes.indexOf('librarymenu') > -1)
		, simulatedRegex = /simulated/
		, disconnectedRegex = /disconnected/
		, pausedRegex = /paused/
		, fixedRegex = /fixed/
		, fixName = /"/g
		, smallprobe = (this._classes.indexOf('smallprobe') > -1);
*>
<div class="sensorItem cell-inner c1 drop level-<*=this._level*> <*=this._classes.join(' ').trim()*>" idx="<*=this._idx*>" objid="<*=this.objid*>" type="<*=this.basetype.toLowerCase()*>" path="<*=this._id*>" template="_Prtg.Core.sensor.js">
<div>
	<*
	if(!!this.leafs && this.leafs.length > 0){
		for(var x=0,l=this.leafs.length; x < l; ++x){
			var sensor = this.leafs[x],
				simulated = (simulatedRegex.test(sensor.info) === true),
				paused = (jQuery.inArray(sensor.status, [7,8,9,11,12]) !== -1) || simulated,
				pausedbyparent = paused && (pausedRegex.test(sensor.info) === false),
				classes = [];
				if(!sensor.access) classes.push('noContextMenu');
				if(librarymenu) classes.push('librarymenu');
				if(smallprobe) classes.push('smallprobe');
				if(jQuery.inArray("clusterprobedevice", this._classes ) != -1) classes.push("clusterprobedevice");

				classes.push((fixedRegex.test(sensor.info) === true ? 'dragable fixed' : 'dragable'));
				classes.push((jQuery.inArray(sensor.status, [5,13,14]) > -1?'sensorred':''));
				classes.push((paused ? (pausedbyparent && !simulated ? 'ispausedbyparent' : 'ispaused') : 'isnotpaused'));
				classes.push((sensor.favorite ? 'isfavorite':'isnotfavorite'));
		*>
				<sensor 
					idx="<*=x*>"
					objid="<*=sensor.objid*>" 
					type="sensor" 
					class="sensor <*=classes.join(' ').trim()*> status<*=sensor.status*>" 
					title="<*=(''+sensor.name).replace(fixName,'&quot;')+' (' + (sensor.lastvalue === '-' ? '?' : sensor.lastvalue) +')'*>">
						<icon <*=sensor.access ? 'popup="333"' : ''*> goto="true"></icon>
						<name <*=sensor.access ? 'popup="3333"' : ''*> goto="true"><*=sensor.name*></name>
						<value goto="true"><*=sensor.lastvalue==='-'?'':sensor.lastvalue*></value>
						<favorit><span class="objectis<*=sensor.favorite?'':'not'*>favorite <*=sensor.favorite?'':'icon-gray'*> ui-icon ui-icon-flag" onclick="_Prtg.objectTools.faveObject.call(this,<*=sensor.objid*>,'toggle');return false;"></span></favorit>
				</sensor>
	<*	} *>
		<sensor class="sensor addSensorButton hideforreadonly" title="<*=_Prtg.Lang.sensorTree.strings.AddSensor*>">
            <a href="/addsensor.htm?id=<*=this.objid*>">
				<icon></icon>
				<name class="text"><*=_Prtg.Lang.sensorTree.strings.AddSensor*></span>
        	</a>
		</sensor>
    <* }else{
	var device = this;
	$.each(_Prtg.Core.objects.sensor.sensorTypesValues, function(key,kind){
		for(var x=0,l= device._collapsed ? device[key+'sens'] >0 ? 1 : 0 : device[key+'sens']; x < l; ++x){
	*>
		<sensor class='status<*=kind[0]*>'><icon></icon></sensor>
	<*	}});
	}*>
</div>
</div>
