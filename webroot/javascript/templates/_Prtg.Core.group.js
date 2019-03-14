<div class="treeItem cell-inner groupItem <*=this._classes.join(' ')*>" idx="<*=this._idx*>" level="<*=this._level*>" objid="<*=this.objid*>" type="<*=this.basetype.toLowerCase()*>" path="<*=this._id*>" template="_Prtg.Core.group.js">
	<*var level
			, chain = this._siblings.chain()
			, regexName=/"/g;
	for(var k=1; k < this._level; ++k){
		level = chain.shift() <= this._idx;
	*>
		<level last="<*=level*>"></level>
	<*}
	level = chain.shift();	
	*>
	<level lastX="<*=level<=this._idx*>">
		<level class="group">
			<toggler></toggler>
		</level>
	</level>
	<div class="indent level<*=this._level*>">
		<level class="group" last="<*=this._children.length===0*>">
			<icon <*=!!this._access ? 'popup="333"' : ''*> style="background-image:url(<*=this.icon*>)"></icon>
		</level>
		<group >
			<name <*=!!this._access ? 'popup="3333" goto="true"' : ''*> title="<*=!!this._collapsed?_Prtg.Lang.sensorTree.strings.GroupsAndDeviceCount.printf(this).replace(/"/g,'&quot;'):''*>"><*=this.name*></name>
			<condition><*=this.condition*></condition>
			<*
			if(this.message !== _Prtg.Lang.common.strings.OK){*>
				<message><*=this.message*></message>
			<*}else{*>
				<message></message>
			<*}*>
		<*if(!this.smallprobe && this._collapsed === false && this.groupnum === 0 && this.devicenum === 0  && !_Prtg.Options.userIsReadOnly && this._access){*>
			<span><a class="treeminilink actionbutton" href="#" onclick="_Prtg.objectTools.addObject(<*=this.objid*>,'device');return false;"><*=_Prtg.Lang.sensorTree.strings.AddDevice*></a></span>
		<*}*>
		</group>
	</div>
</div>
