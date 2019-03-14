<div class="channelItem ui-widget-content"
	status="<*=this.status*>" 
	objid="<*=this.objid*>"
	data-node-idx="<*=j*>"  
	data-report-node-id='<*=this.reportminussensor*>'
	data-basetype='<*=this.basetype*>'
	data-objid='<*=this.objid*>'>
<div class="container">
<div class="col1">
  <*=this.name*>
	<*=this.probegroupdevice*>
</div>
<div class="col2">
	<*
		var id='', checked='',channel=null;
		for(var ii=0, l=this.reportconfigchannels.length; ii < l; ++ii){
			channel = this.reportconfigchannels[ii];
			if(typeof(channel) === 'object'){
				id = this.reportminussensor+'-'+channel.channelid+'-'+ii;
				checked = channel.selected ? ' checked="checked" ' : '';
	*>
		<div class="checkbox-control" title="<*=channel.name*>">
			<input 
				type="checkbox" 
				<*=checked*> 
				class="checkbox hidden" 
				id="<*=id*>"
				data-channel-id ="<*=channel.channelid*>"
				data-report-node-id ="<*=this.reportminussensor*>">
			<label for="<*=id*>" class="checkbox-control-label"><i class="icon-dark prtg-checkbox"></i><*=channel.name*></label>
		</div>
	<*}else{*>
			<*=channel*>
	<* }} *>
</div>
</div>
	<div class="actions">
<span class="reorder" title="<*=_Prtg.Lang.reportchannels.strings.reorder*>"><i class="icon-white icon-shuffle"/></span>
<span class="deleteItem prtg-icon icon-dark icon-trash" title="<*=_Prtg.Lang.common.strings.delete*>"></span>
    </div>
	</div>
