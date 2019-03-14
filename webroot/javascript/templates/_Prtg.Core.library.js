<div class="treeItem cell-inner <*=this.libkind==='filter'?'device':'group'*>Item  <*=this._classes.join(' ').trim()*>" idx="<*=this._idx*>" level="<*=this._level*>" objid="<*=this.objid*>" type="<*=this.libkind.toLowerCase()*>" path="<*=this._id*>" template="_Prtg.Core.library.js">
	<*
	var level, chain = this._siblings.chain(),
	editmode = $('.libTree').parents('#dropTarget').hasClass('treeiseditable');
	for(var k=1; k < this._level; ++k){
		level = chain.shift() <= this._idx;
	*>
		<level last="<*=level*>"></level>
	<*}
	level = chain.shift();	
	*>
	<level lastX="<*=level<= this._idx*>">
		<level class="library">
		 <toggler></toggler>
		</level>
	</level>
	<div class="indent level<*=this._level*><*=this._level>1?' library-'+this.libkind:''*><*=this._isroot ? ' libraryroot': ''*>" type="<*=(this.libkind === 'node'? 'library' :'libraryobject')*>" objid="<*=this.objid*>">
		<level class="library" goto="true" last="<*=this._children.length===0*>">
			<icon style="background-image:url(<*=_Prtg.Core.objects.icons.icon(this)*>)"></icon>
			
		</level>
		<library libkind="<*=this.libkind*>">
			<* if(!!this._access) { *>
				<name goto="true"><*=this.name*></name>
			<* } else { *>
				<name><*=this.name*></name>
			<* } 
				if(editmode){
				 	if(this.libkind === 'node') { *>
						<div class="droptarget"><i class="icon-dark icon-lightbulb"></i><*= _Prtg.Lang.common.strings.DropTarget*></div>
			<* }}else{
						if(this.libkind === 'node' && this._children.length === 0 && !_Prtg.Options.userIsReadOnly && this._access){ *>
			<span class="approve">
				<a class="treeminilink actionbutton" href="#" onclick="_Prtg.objectTools.addObject('new','library', {targetid:<*=this.objid*>,addid:<*=this.objid*>});return false;"><*=_Prtg.Lang.sensorTree.strings.AddLibraynode*></a>
				<a class="treeminilink actionbutton" href="#" onclick="var lib = $('.libTree').data('sensortree');lib.dataview.addLibrary(lib.grid,<*=this.objid*>,-1);return false;"><*=_Prtg.Lang.sensorTree.strings.AddGroup*></a>
			</span>
			<* }} *>

		</library>
	</div>
</div>