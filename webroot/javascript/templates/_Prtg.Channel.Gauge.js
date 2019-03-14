<*
var info = this.info.data[0];
var pinclass = this.primary ? 'glyph-pin' : 'glyph-pin glyph-unpinned';
*>
<div class="achannel<*=this.primary*> channeledit" data-channel="<*=info.id*>" id="channelbox<*=info.id*>" title="<*=info.name.replace(/"/g, "&quot;")+this.channelidtxt.replace(/"/g, "&quot;")+this.minimumtxt.replace(/"/g, "&quot;")+this.maximumtxt.replace(/"/g, "&quot;")*>">
	<span class="channelname"><*=info.name*></span>
	<span class="channelgauge" id="channelgauge<*=info.id*>"></span>
	<span class="channelvalue"><*=this.lastvalue*></span>
	<span class="channelsettings <*=_Prtg.Options.userIsReadOnly?' hidden':''*>" data-channel="<*=info.id*>">
		<i title="<*=_Prtg.Lang.objectoverview.strings.editChannel*>" class="glyph-cog editsetting hideforreadonly"></i>
		<i title="<*=_Prtg.Lang.objectoverview.strings.setPrimaryChannel*>" class="setprimarychannel <*=pinclass*> hideforreadonly"></i>
	</span>
</div>
