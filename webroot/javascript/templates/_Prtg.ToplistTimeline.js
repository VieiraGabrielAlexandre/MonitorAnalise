<*
  if(!!j && data[j-1].datetime.date !== this.datetime.date){
*>
    </ul>
<*
  }
  if(j===0 || data[j-1].datetime.date !== this.datetime.date){
*>
    <ul data-unix=<*=this.datetime.unix*>><*=this.datetime.date*>
<*}*>

<li id="topnumber_<*=this.datetime.topnumber*>" query="<*='id='+this.datetime.objid+'&topnumber='+this.datetime.topnumber*>"><*=this.datetime.start*>&nbsp;&minus;&nbsp;<*=this.datetime.stop*></li>