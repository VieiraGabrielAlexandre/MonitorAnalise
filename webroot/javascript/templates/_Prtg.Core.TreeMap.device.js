<*
	var status = 'none'
		, device = this;
	jQuery.each(_Prtg.Core.objects.group.sensorTypes, function (i,key) {
		if (device[key + 'sens'] > 0) {
			status = key;
			return false;
		}
	});
*>
<div <*=!!this._access ? 'goto="true"' : ''*> class="treeItem deviceItem cell-inner level-<*=this._level*> <*=this._classes.join(' ').trim()*>"idx="<*=this._idx*>"  objid="<*=this.objid*>" type="<*=this.basetype.toLowerCase()*>" path="<*=this._id*>">
	<device  status="<*=status*>">
		<icon <*=!!this._access ? 'popup="1000" goto="true"' : ''*> style="background-image:url(<*=_Prtg.Core.objects.icons.icon(this)*>)"></icon>
		<name  title="<*=this.name*>" <*=!!this._access ? 'popup="1000" goto="true"' : ''*>><*=this.name*></name>
		<favorit title="<*=this.name*>"><*=this.favorite*></favorit>
	</device>
</div>