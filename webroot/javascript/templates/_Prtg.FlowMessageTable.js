
<* if(!this.preview) { *>
  <thead class="pagenavigation">
    <tr>
      <th colspan="<*= this.header.names.length + 1 *>">
        <div class="buttons"><ul class="jd_menu"><li><span class="icon ui-icon ui-icon-carat-1-s"></span><span>Select Range</span><ul class="table_daterange_selector"><li><a href="#" class="reloadtablelink " data-reload="[{&quot;name&quot;:&quot;start&quot;,&quot;value&quot;:&quot;0&quot;},{&quot;name&quot;:&quot;filter_dstart&quot;,&quot;value&quot;:&quot;&quot;},{&quot;name&quot;:&quot;filter_dend&quot;,&quot;value&quot;:&quot;&quot;},{&quot;name&quot;:&quot;filter_drel&quot;,&quot;value&quot;:&quot;today&quot;}]">Today</a></li> <li><a href="#" class="reloadtablelink " data-reload="[{&quot;name&quot;:&quot;start&quot;,&quot;value&quot;:&quot;0&quot;},{&quot;name&quot;:&quot;filter_dstart&quot;,&quot;value&quot;:&quot;&quot;},{&quot;name&quot;:&quot;filter_dend&quot;,&quot;value&quot;:&quot;&quot;},{&quot;name&quot;:&quot;filter_drel&quot;,&quot;value&quot;:&quot;yesterday&quot;}]">Yesterday</a></li> <li><a href="#" class="reloadtablelink " data-reload="[{&quot;name&quot;:&quot;start&quot;,&quot;value&quot;:&quot;0&quot;},{&quot;name&quot;:&quot;filter_dstart&quot;,&quot;value&quot;:&quot;&quot;},{&quot;name&quot;:&quot;filter_dend&quot;,&quot;value&quot;:&quot;&quot;},{&quot;name&quot;:&quot;filter_drel&quot;,&quot;value&quot;:&quot;7days&quot;}]">7 days</a></li> <li><a href="#" class="reloadtablelink " data-reload="[{&quot;name&quot;:&quot;start&quot;,&quot;value&quot;:&quot;0&quot;},{&quot;name&quot;:&quot;filter_dstart&quot;,&quot;value&quot;:&quot;&quot;},{&quot;name&quot;:&quot;filter_dend&quot;,&quot;value&quot;:&quot;&quot;},{&quot;name&quot;:&quot;filter_drel&quot;,&quot;value&quot;:&quot;30days&quot;}]">30 days</a></li> <li><a href="#" class="reloadtablelink " data-reload="[{&quot;name&quot;:&quot;start&quot;,&quot;value&quot;:&quot;0&quot;},{&quot;name&quot;:&quot;filter_dstart&quot;,&quot;value&quot;:&quot;&quot;},{&quot;name&quot;:&quot;filter_dend&quot;,&quot;value&quot;:&quot;&quot;},{&quot;name&quot;:&quot;filter_drel&quot;,&quot;value&quot;:&quot;6months&quot;}]">6 months</a></li> <li><a href="#" class="reloadtablelink " data-reload="[{&quot;name&quot;:&quot;start&quot;,&quot;value&quot;:&quot;0&quot;},{&quot;name&quot;:&quot;filter_dstart&quot;,&quot;value&quot;:&quot;&quot;},{&quot;name&quot;:&quot;filter_dend&quot;,&quot;value&quot;:&quot;&quot;},{&quot;name&quot;:&quot;filter_drel&quot;,&quot;value&quot;:&quot;12months&quot;}]">12 Months</a></li> <li><a href="#" class="reloadtablelink " data-reload="[{&quot;name&quot;:&quot;start&quot;,&quot;value&quot;:&quot;0&quot;},{&quot;name&quot;:&quot;filter_dstart&quot;,&quot;value&quot;:&quot;&quot;},{&quot;name&quot;:&quot;filter_dend&quot;,&quot;value&quot;:&quot;&quot;},{&quot;name&quot;:&quot;filter_drel&quot;,&quot;value&quot;:&quot;eternity&quot;}]">Unlimited</a></li> </ul></li></ul>
        </div>
        <div class="buttons">
          <span data-format="dd/mm/yyyy" class="table_datepicker_fromtodate">&nbsp;Date Range:
            <input type="text" name="datepicker_dstart" class="table_datepicker_dstart prtg-plugin" data-plugin="prtg-datetimepicker" data-timepicker="true" value="2015-02-07-11-13-00">
            - <input type="text" name="datepicker_dend" class="table_datepicker_dend  prtg-plugin" data-plugin="prtg-datetimepicker" data-timepicker="true" value="2015-05-18-11-13-00">
          </span>
        </div>
        <a href="#" class="reloadtablelink disabled arrow a_first_off "></a>
        <a href="#" class="reloadtablelink disabled arrow a_left_off "></a>
        <span class="table_fromcount">0</span> to
        <span class="table_tocount">50</span>
        <a href="#" class="reloadtablelink arrow a_right_on " data-reload="[{&quot;name&quot;:&quot;start&quot;,&quot;value&quot;:&quot;0&quot;}]"></a>
        <span class="loading_indicator">Loading</span>
        <span class="percent_loading">0%</span>
        <span class="table_itemcount_selector">
          Items: <a href="#" class="reloadtablelink selected" data-reload="[{&quot;name&quot;:&quot;count&quot;,&quot;value&quot;:&quot;50&quot;}]">50</a>
          <a href="#" class="reloadtablelink " data-reload="[{&quot;name&quot;:&quot;count&quot;,&quot;value&quot;:&quot;100&quot;}]">100</a>
          <a href="#" class="reloadtablelink " data-reload="[{&quot;name&quot;:&quot;count&quot;,&quot;value&quot;:&quot;500&quot;}]">500</a>
          <a href="#" class="reloadtablelink " data-reload="[{&quot;name&quot;:&quot;count&quot;,&quot;value&quot;:&quot;1000&quot;}]">1000</a>
        </span>
      </th>
    </tr>
  </thead>
  <* } *>

  <thead class="headersnolink">
    <tr>
      <* for(d=0;d<this.header.names.length;d++) { *>
      <th><*=this.header.displaynames[d]*></th>
       <* if(this.preview && d==this.previewconf.rows) { break; }*>
      <* } *>
    </tr>
  </thead>

<tbody class="data">
<* for(d=0;d<this.data.length;d++) { *>
  <tr class="even">
    <* for(i=0;i<this.header.names.length;i++) { *>
    <td class="col-<*=this.header.names[i]*>"><*=this.data[d][i]*></td>
      <* if(this.preview && i==this.previewconf.rows) { break; }*>
    <* } *>
  </tr>
  <* if(this.preview && d==this.previewconf.columns) { break; }*>
<* } *>
</tbody>

<* if(!this.preview) { *>
  <tfoot class="pagenavigation"><tr><th colspan="<*= this.header.names.length + 1 *>"><a href="#" class="reloadtablelink disabled arrow a_first_off "></a> <a href="#" class="reloadtablelink disabled arrow a_left_off "></a> <span class="table_fromcount">0</span> to <span class="table_tocount">50</span><a href="#" class="reloadtablelink arrow a_right_on " data-reload="[{&quot;name&quot;:&quot;start&quot;,&quot;value&quot;:&quot;0&quot;}]"></a> <span class="loading_indicator">Loading</span> <span class="percent_loading">0%</span><span class="table_itemcount_selector">Items: <a href="#" class="reloadtablelink selected" data-reload="[{&quot;name&quot;:&quot;count&quot;,&quot;value&quot;:&quot;50&quot;}]">50</a><a href="#" class="reloadtablelink " data-reload="[{&quot;name&quot;:&quot;count&quot;,&quot;value&quot;:&quot;100&quot;}]">100</a><a href="#" class="reloadtablelink " data-reload="[{&quot;name&quot;:&quot;count&quot;,&quot;value&quot;:&quot;500&quot;}]">500</a><a href="#" class="reloadtablelink " data-reload="[{&quot;name&quot;:&quot;count&quot;,&quot;value&quot;:&quot;1000&quot;}]">1000</a></span>
  </th></tr></tfoot>
<* } *>

  </table>
</form>
