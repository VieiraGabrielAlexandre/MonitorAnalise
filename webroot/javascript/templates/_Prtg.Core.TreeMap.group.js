<*
			var status = this.downsens + this.partialdownsens > 0
						? 'error'
						: this.downacksens + this.warnsens > 0
						? 'warn'
						: 'ok';
*>
<div class="treeItem cell-inner groupItem <*=this._classes.join(' ')*>" title="<*=this.name*>" idx="<*=this._idx*>" level="<*=this._level*>" objid="<*=this.objid*>" type="<*=this.basetype.toLowerCase()*>" path="<*=this._id*>">
	<group class="<*=status*>">
			<icon style="background-image:url(<*=this.icon!==''?this.icon:_Prtg.Core.objects.icons.defaults[this.basetype.toLowerCase()]*>)"></icon>
			<name <*=!!this._access ? 'popup="3333" goto="true"' : ''*>><*=this.name*></name>
	</group>
</div>
