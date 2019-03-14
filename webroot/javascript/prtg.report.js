var _Prtg = _Prtg || {};

_Prtg.Plugins = {
  'registerPlugin': function(name, obj) {
    _Prtg.Plugins[name] = {
      'init': function(data, parent) {
        return _Prtg.Plugins[name]['plugin'] = (new obj( this, data, parent ));
      }
    };
  }
};
<#comment Javascript Prototype overwrites usw.>
<#javascriptinclude file="javascript\javascript.js">;

<#include file="javascript\_Prtg.Api.js">;
<#javascriptinclude file="javascript\_Prtg.Util.js">;


<#javascriptinclude file="javascript\lib\d3.min.js">
<#javascriptinclude file="javascript\lib\d3.gauge.js">
<#javascriptinclude file="javascript\lib\d3.legend.js">
<#javascriptinclude file="javascript\lib\d3.topojson.min.js">

// Module: Toplists
<#javascriptinclude file="javascript\_Prtg.Toplistgraph.Control.js">
<#javascriptinclude file="javascript\_Prtg.Toplistgraph.Plugin.js">
<#javascriptinclude file="javascript\_Prtg.Toplists.Plugin.js">
<#include file="javascript\_Prtg.Colors.js">;
<#include file="javascript\_Prtg.Common.lang.js">;


$(function(){
    var parent = document.getElementsByTagName('body');
      $('.prtg-plugin').toggleClass('prtg-plugin prtg-plugin-initializing').each(function initPlugin() {
      var self = this
      , $self = $(this)
      , data = $self.data()
      , plugins = data.plugin
      , comment = $self.contents().filter(function(){return this.nodeType===8;});
      if(!!plugins) {
        plugins = plugins.split(' ');
        $.each(plugins, function(i, plugin){
          try {
            if(comment.length) {
              $.extend(true, data, JSON.parse(comment.get(0).nodeValue));
              // comment.remove();
            }
            if ( !!_Prtg.Plugins[plugin]) _Prtg.Plugins[plugin].init.apply(self, [data, parent]);
            else $self[plugin](data, parent);
          } catch(e) {
            if(console && console.error) console.error('Error in plugin: %s', plugin, e.stack);
            _Prtg.api.logError("Error in plugin: " + plugin + ' - Error-Msg: ' + e.message, {global:false});
          }
        });
      }
      data = null;
      comment =null;
    }).toggleClass('prtg-plugin-initialized prtg-plugin-initializing');

})
