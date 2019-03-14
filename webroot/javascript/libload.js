// libload.js
/* Create the _Prtg object and his aliases. */
var _Prtg = _Prtg || {supportsTouch: ('ontouchstart' in window || navigator.msMaxTouchPoints)};
_Prtg.serverTime= (new Date());

_Prtg.Plugins = {
  'registerPlugin': function(name, plugin) {
    _Prtg.Plugins[name] = {
      'init': function(data, parent) {
        obj = (new plugin( this, data, parent ));
        $(this).data(name, obj);
        return _Prtg.Plugins[name]['plugin'] = obj;
      }
    };
  }
};

/* Various semi global options. */
_Prtg.Options = {
  ajaxTimeout: 30000,
  connectionLost: false,
  refreshInterval: parseInt('<#system type="autorefreshinterval">', 10) || 30,
  refreshType: '<#system type="autorefreshtype">',
  recommender: <#system type="recommender" insertifyes="true" insertifno="false">,
  userIsReadOnly: true,
  userTicketSystem:false,
  allowAcknowledge: false,
  playAlarmSound: parseInt("<#system type="playsound">", 10),
  geomapprovider: '',
  geomaptype: '',
  geomapapikey: '',
  geomapZoomLevels: 18,
  pageIsDashboard: false, // TODO: must be set correctly
  connectionCheck: new Date(),
  userTimezone: {
                offset: '<#system type="userTimezoneOffset">',
                name: '<#system type="timezone">'
              },
  version: '<#system type="version">',
  language: '<#system type="language">',
  cachebreaker: 'version=<#system type="version">&language=<#system type="language">',
  currentUserId: <#userid>,
  userDateTimeFormat: '<#system type="datetimepickerformatstring">',
  googlemapstype: '<#selectionlist content="googlemapstype">',
  googlemapsapikey: '<#selectionlist content="googlemapsapikey">',
  dependencygraph: {
    gravity: 0.3,
    friction:0.8,
    charge: -800,
    linkStrength: function(link){return {"Parent":0.5,"Extern":1,"Select":1,"Master":1}[link.type]},
    linkDistance: function(link){return link.type === "Select" || link.type === "Extern"?30:5;}
  },
  sitename: "<#system type="sitename">",
  dnsname: "<#system type="dnsname">",
  logoutAfterInactivity: <#system type="logoutAfterInactivity">*60,
  browser: '<#system type="browsertype">',
  lastpurgedate: '<#system type="purgedate">'
};
_Prtg.Options.sitename = $('<div>'+_Prtg.Options.sitename+'</div>').text();
_Prtg.lastStats = <#include file="/api/status.json" id="-1">;

<#system type="usertype" contentreadonly="_Prtg.Options.userIsReadOnly=true;" contentnotreadonly="_Prtg.Options.userIsReadOnly=false;">
<#system type="usertype" contentallowack="_Prtg.Options.userIsReadOnly=true;_Prtg.Options.allowAcknowledge=true;">
<#system type="ticketmode" ticketsystem="_Prtg.Options.userTicketSystem=true;" noticketsystem="_Prtg.Options.userTicketSystem=false;">

if (!window.location.origin) {
  window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
}
