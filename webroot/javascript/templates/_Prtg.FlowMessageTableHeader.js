
      <colgroup>
      <* for(d=0;d<this.header.names.length;d++) { *>
        <col class="col-<*=this.header.names[d]*>">
      <* } *>
      </colgroup>
      <thead class="headersnolink">
        <tr class="udpfilterheader">
        <th colspan="2"></th>
        <* for(d=0;d<this.header.names.length;d++) { *>
          <* if((this.header.names[d] == 'FromDate') || (this.header.names[d] == 'ToDate')) { *>
            continue;
          <* } else { *>
          <th><*=this.header.displaynames[d]*></th>
          <* } *>
        <* } *>
        </tr>
        <tr class="udpadvancedfilterheader">
          <th colspan="<*= this.header.names.length + 1 *>">Advanced Filter</th>
        </tr>
      </thead>
      <tbody>
        <tr class="filters">
          <* for(d=0;d<this.header.names.length;d++) { *>
            <* if(this.header.names[d] == 'FromDate') { *>
              <td class="filterinput" filtertype="">
                <span class="udpmessages-morefilter" title="" data-original-title="Click for advanced filter settings">Filter<i class="icon-gray icon-hovertodark ui-icon ui-icon-gear"></i></span>
              </td>
            <* } else if(this.header.names[d] == 'ToDate') { *>
               <td class="filterinput" filtertype=""></td>
            <* } else { *>
              <td class="filterinput" filtertype="<*=this.header.names[d]*>" data-original-title="">
                <input class="udpmessages-filter-<*=this.header.names[d]*> udpmessages-filterfield" filtername="<*=this.header.names[d]*>" id="udpmessages-filter-<*=this.header.names[d]*>">
              </td>
            <* } *>
          <* } *>
        </tr>
        <tr class="advancedfilterinputrow" style="display: none;"><td colspan="<*= this.header.names.length + 1 *>" class="advancedfilterinputcolumn"><i class="icon-dark float-right icon-close icon-hovertored"></i></td></tr>
      </tbody>
