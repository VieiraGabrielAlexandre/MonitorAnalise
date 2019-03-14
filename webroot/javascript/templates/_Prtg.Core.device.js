<div class="treeItem deviceItem cell-inner <*=this._classes.join(' ').trim()*>"  idx="<*=this._idx*>" level="<*=this._level*>" objid="<*=this.objid*>" type="<*=this.basetype.toLowerCase()*>" path="<*=this._id*>" template="_Prtg.Core.device.js">
	<*var level, chain = this._siblings.chain(),regexName=/"/g;
	for(var k=1; k < this._level; ++k){
		level = chain.shift() <= this._idx;
	*>
		<level last="<*=level*>"></level>
	<*}
	level = chain.shift() <= this._idx;	
	*>
	<level lastX="<*=level*>">
		<level>
			<toggler></toggler>
		</level>
	</level>
	<div class="indent level<*= this._level*>">
		<level class="device">
			<icon <*=!!this._access ? 'popup="333"' : ''*> style="background-image:url(<*=this.icon*>)"></icon>
		</level>
		<device title="<*=_Prtg.Lang.sensorTree.strings.DeviceTitle.printf(this).replace(/"/g,'&quot;')*>">
			<name  <*=!!this._access ? 'popup="3333" goto="true"' : ''*>><*=this.name*></name>
			<condition><*=this.condition*></condition>
			<favorit><*=this.favorite*></favorit>
			<*
			if(this.message !== _Prtg.Lang.common.strings.OK){*>
				<message><*=this.message*></message>
			<*}else{*>
				<status></status>
			<*}*>
		</device>
	</div>
</div>