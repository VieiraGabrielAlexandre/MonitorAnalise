<*
var info = this.info.data[0];
var pinclass = this.primary ? 'icon-pin-s' : 'icon-pin-w setprimarychannel';
*>
<div class="margin">
<div class="achannel<*=this.primary*> status<*=info.status*> sensormenu" contextmenu data-id="<*=this.objid*>" id="channelbox<*=info.id*>" title="<*=info.name.replace(/"/g, "&quot;")+this.channelidtxt.replace(/"/g, "&quot;")+this.minimumtxt+this.maximumtxt*>">
  <a href="/sensor.htm?id=<*=this.objid*>">
		<span class="channelname"><*=this.sensor*></span>
		<span class="channelsubname"><*=info.name*></span>
		<span class='channelmessage'><*=this.message*></span>
		<span class="channelgauge" id="channelgauge<*=info.id*>"></span>
		<span class="channelvalue"><*=info.lastvalue||this.lastvalue*></span>
		<div class='sensoricon'></div>
  </a>
</div>
</div>
