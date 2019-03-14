<div class="triggeritem cell-inner" idx="<*=this._idx*>" level="<*=this._level*>">
<div class="cell-main">
	<*for(var i=1; i < this._level; ++i){*>
		<level></level>
	<*}*>
	<level level="<*=this._level*>"><level type="item"><toggler level="<*=this._level-1*>" expand="true"></toggler></level></level>
	<group id="<*=this.objid*>"><*=this.name*></group>
</div>
</div>