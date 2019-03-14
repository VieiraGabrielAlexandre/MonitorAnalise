<div class="treeItem cell-inner groupItem <*=this._classes.join(' ')*>" idx="<*=this._idx*>" level="<*=this._level*>" objid="<*=this.objid*>" type="<*=this.basetype.toLowerCase()*>" path="<*=this._id*>">
	<*var level, chain = this._siblings.chain()
		  , offLine = (this.condition !== _Prtg.Lang.sensorTree.strings.Connected)
		  , message = this.message
		  , regexName=/"/g;
	for(var k=1; k < this._level; ++k){
		level = chain.shift() <= this._idx;
	*>
		<level last="<*=level*>"></level>
	<*}
	level = chain.shift();
	*>
	<level lastX="<*=level<= this._idx*>">
		<level class="probe">
			<toggler></toggler>
		</level>
	</level>
	<div class="indent level<*=this._level*>">
	<*
	if(/unapproved/.test(this.info) === false){
	*>
		<level class="probe" last="<*=this._children.length===0*>">
			<icon <*=!!this._access?'popup="333"':''*> style="background-image:url(<*= this.icon.replace('.png', (!!offLine ? 'offline.png?svg' :'.png?svg'))*>)"></icon>
		</level>
		<probe title="<*=!!this._collapsed?_Prtg.Lang.sensorTree.strings.GroupsAndDeviceCount.printf(this).replace(/"/g,'&quot;'):''*>"
				<*=!!offLine?' class="offline"':''*>>
			<* if(!!this._access) { *>
					<name  popup="3333" goto="<*=this.objid*>"><*=this.name*></name>
			<* } else {*>
					<name><*=this.name*> </name>
			<* } *>
			<condition><*= offLine ? this.condition : (message !== _Prtg.Lang.common.strings.OK ? message : '') *></condition>
	<*
	} else {
	*>
		<level class="probe" last="true">
			<icon style="background-image:url(<*=this.icon*>)"></icon>
		</level>
		<probe title="<*=!!this._collapsed?_Prtg.Lang.sensorTree.strings.GroupsAndDeviceCount.printf(this).replace(/"/g,'&quot;'):''*>"
				<*=!!offLine?' class="offline unapproved"':'class="unapproved"'*>>
			<name><*=this.name*> </name>
			<condition><*= offLine ? this.condition : (message !== _Prtg.Lang.common.strings.OK ? message : '') *></condition>
			<* if(!this._collapsed && !_Prtg.Options.userIsReadOnly){ *>
				<span class="approve">
                    <a class="actionbutton approvebutton" onclick="_Prtg.objectTools.setProbeState.call(this,<*=this.objid*>,'allowanddiscover');return false;"><span class="ui-icon ui-icon-check"></span><*=_Prtg.Lang.sensorTree.strings.ApprovenewprobeDisco*></a>
					<a class="actionbutton button btngrey" onclick="_Prtg.objectTools.setProbeState.call(this,<*=this.objid*>,'allow');return false;"><*=_Prtg.Lang.sensorTree.strings.Approvenewprobe*></a>
					<a class="actionbutton button btngrey" onclick="_Prtg.objectTools.setProbeState.call(this,<*=this.objid*>,'deny');return false;"><*=_Prtg.Lang.sensorTree.strings.Denynewprobe*></a>
				</span>
	<*
	}}
	*>
		</probe>
	</div>
</div>
