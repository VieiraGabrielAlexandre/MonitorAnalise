<#comment use #javascriptinclude to include stuff without parsing>
<#comment use #include to have the included text parsed for placeholders>

<#comment Javascript Prototype overwrites usw.>
<#javascriptinclude file="javascript\javascript.js">;

// History plugin (Pushstate with hash fallback)
<#javascriptinclude file="javascript\lib\jquery.history.js">;
var History = window.History;

<#javascriptinclude file="javascript\lib\jquery.contextmenu.js">;
<#javascriptinclude file="javascript\lib\jqbrowser-compressed.js">;
<#javascriptinclude file="javascript\lib\jquery.sparkline.min.js">;
<#javascriptinclude file="javascript\lib\slick.min.js">;
<#javascriptinclude file="javascript\lib\jquery.floatThead.min.js">;

<#include file="javascript\lib\jquery.validate.min.js">;
<#include file="javascript\_Prtg.ValidateRules.js">;
<#include file="javascript\lib\moment.js">;

<#javascriptinclude file="javascript\lib\jquery.debounce.js">;
<#javascriptinclude file="javascript\lib\jquery.farbtastic-1.3.js">;
<#javascriptinclude file="javascript\lib\jquery-ui-timepicker-addon.js">;
<#javascriptinclude file="javascript\lib\jquery.jqote2.min.js">;
<#javascriptinclude file="javascript\lib\json2.js">;
<#javascriptinclude file="javascript\lib\tinycon.min.js">;
<#javascriptinclude file="javascript\lib\bootstrap-tooltip.js">;
<#javascriptinclude file="javascript\lib\jquery.jstree.js">;
<#javascriptinclude file="javascript\lib\datatables.min.js">;
<#javascriptinclude file="javascript\lib\jquery.scrollTo.min.js">;
<#javascriptinclude file="javascript\lib\jquery.mousewheel.min.js">;
<#javascriptinclude file="javascript\lib\jquery.ui.touch-punch.min.js">;
<#javascriptinclude file="javascript\lib\jquery.event.destroy.js">;
<#javascriptinclude file="javascript\lib\jquery.placeholder.min.js">;
<#javascriptinclude file="javascript\lib\jquery.qrcode.min.js">;

<#include file="javascript\_Prtg.Api.js">;
<#javascriptinclude file="javascript\_Prtg.ObjectTools.js">;
<#javascriptinclude file="javascript\_Prtg.Util.js">;
<#javascriptinclude file="javascript\_Prtg.Events.js">;
<#javascriptinclude file="javascript\_Prtg.Refreshable.Plugin.js">;
<#javascriptinclude file="javascript\_Prtg.Hjax.js">
<#javascriptinclude file="javascript\_Prtg.Tabs.js">
<#javascriptinclude file="javascript\_Prtg.Growls.js">
<#javascriptinclude file="javascript\_Prtg.Tip.js">;
<#javascriptinclude file="javascript\_Prtg.Forms.Schedule.Plugin.js">;
<#javascriptinclude file="javascript\_Prtg.Forms.js">;
<#javascriptinclude file="javascript\_Prtg.TableFilterToggle.Plugin.js">;
<#javascriptinclude file="javascript\_Prtg.Tables.js">;
<#javascriptinclude file="javascript\_Prtg.Sortable.Plugin.js">;
<#javascriptinclude file="javascript\_Prtg.Inputs.js">;
<#javascriptinclude file="javascript\_Prtg.QRCode.Plugin.js">;
<#javascriptinclude file="javascript\_Prtg.Feedbackform.Plugin.js">;
<#javascriptinclude file="javascript\_Prtg.Audiblealarm.js">;
<#javascriptinclude file="javascript\_Prtg.UserAndGroups.js">;

<#include file="javascript\_Prtg.Core.js">;
<#include file="javascript\_Prtg.Core.Lang.js">;
<#include file="javascript\_Prtg.Colors.js">;
<#include file="javascript\_Prtg.Common.lang.js">;
<#include file="javascript\_Prtg.ContextMenus.js">;
<#include file="javascript\_Prtg.ContextHelp.js">;

// PRTG Jquery Plugins
<#include file="javascript\_Prtg.Graphs.lang.js">;
<#javascriptinclude file="javascript\_Prtg.Graphs.js">;
<#javascriptinclude file="javascript\_Prtg.Breadcrumbs.js">;
<#javascriptinclude file="javascript\_Prtg.Jquery.Tagsinput.js">;
<#javascriptinclude file="javascript\_Prtg.Jquery.Favstarsinput.js">;
<#javascriptinclude file="javascript\_Prtg.Jquery.SortElements.js">;
<#include file="javascript\_Prtg.DesktopNotification.lang.js">;
<#javascriptinclude file="javascript\_Prtg.DesktopNotification.js">;
<#javascriptinclude file="javascript\_Prtg.ObjectSelector.js">;
<#javascriptinclude file="javascript\_Prtg.DateTimePicker.js">;
<#javascriptinclude file="javascript\_Prtg.MultiEdit.Plugin.js">;
<#javascriptinclude file="javascript\_Prtg.Channels.Plugin.js">;
<#javascriptinclude file="javascript\_Prtg.DateTimeQuickrange.js">;
<#javascriptinclude file="javascript\_Prtg.AutodiscoveryForm.Plugin.js">;
<#javascriptinclude file="javascript\_Prtg.ObjectLookup.Plugin.js">;
<#javascriptinclude file="javascript\_Prtg.Comparison.Plugin.js">;
<#javascriptinclude file="javascript\_Prtg.RootTree.Plugin.js">;
<#javascriptinclude file="javascript\_Prtg.SensorListSelect.Plugin.js">;
<#javascriptinclude file="javascript\_Prtg.ContentList.Plugin.js">;
<#include file="javascript\_Prtg.AutoUpdate.Plugin.js">;
<#javascriptinclude file="javascript\_Prtg.ChannelGauges.Plugin.js">;
<#include file="javascript\_Prtg.ChannelGauges.Plugin.Lang.js">;
<#javascriptinclude file="javascript\_Prtg.ClusterMap.Plugin.js">;
<#include file="javascript\_Prtg.ClusterMap.Plugin.lang.js">;
<#include file="javascript\_Prtg.Status.Plugin.js">;
<#include file="javascript\_Prtg.BusinessProcessChannels.Plugin.js">;
<#include file="javascript\_Prtg.QuickSearch.Plugin.js">;
<#include file="javascript\_Prtg.TCT.Plugin.js">;
<#include file="javascript\_Prtg.FileHandler.Plugin.js">;
<#include file="javascript\_Prtg.FileHandler.Plugin.Lang.js">;
<#javascriptinclude file="javascript\_Prtg.MainMenuHandlers.Plugin.js">;

// Module: report select sensors manually
<#include file="javascript\_Prtg.ReportsChannelList.lang.js">;
<#javascriptinclude file="javascript\_Prtg.ReportsChannelList.Plugin.js">;

// Module: crumbler
<#include file="javascript\_Prtg.CrumblerSensorStats.lang.js">
<#include file="javascript\_Prtg.CrumblerSensorStats.js">

// Module: Maps
<#include file="javascript\_Prtg.Maps.Lang.js">;
<#javascriptinclude file="javascript\_Prtg.Maps.js">;

// Module: Dialogs
<#include file="javascript\_Prtg.Dialogs.lang.js">;
<#javascriptinclude file="javascript\_Prtg.Dialogs.js">;

// Module: Triggeredit
<#include file="javascript\_Prtg.TriggerEdit.lang.js">;
<#javascriptinclude file="javascript\_Prtg.TriggerEdit.js">;

// Module: AddSensor
<#include file="javascript\_Prtg.AddSensor.lang.js">;
<#javascriptinclude file="javascript\_Prtg.AddSensor.js">;

<#javascriptinclude file="javascript\_Prtg.Sparklines.Plugin.js">;
// Module: objecttree
<#include file="javascript\_Prtg.SensorTree.lang.js">
<#javascriptinclude file="javascript\lib\jquery.event.drag-2.2.js">;
<#javascriptinclude file="javascript\lib\jquery.event.drag.live-2.2.js">;
<#javascriptinclude file="javascript\lib\jquery.event.drop-2.2.js">;
<#javascriptinclude file="javascript\lib\jquery.event.drop.live-2.2.custome.js">;

// Module: UDPMessages
<#javascriptinclude file="javascript\_Prtg.UDPMessages.js">

// Module: Sysinfo
<#javascriptinclude file="javascript\_Prtg.Sysinfo.js">

<#javascriptinclude file="javascript\lib\slickgrid\slick.core.js">
<#javascriptinclude file="javascript\lib\slickgrid\plugins\slick.rowselectionmodel.js">
<#javascriptinclude file="javascript\lib\slickgrid\slick.grid.js">
// D3.JS related
<#javascriptinclude file="javascript\lib\d3.min.js">
<#javascriptinclude file="javascript\lib\d3.gauge.js">
<#javascriptinclude file="javascript\lib\d3.legend.js">
<#javascriptinclude file="javascript\lib\d3.topojson.min.js">

<#include file="javascript\_Prtg.Globe.Plugin.js">
<#javascriptinclude file="javascript\_Prtg.LookupsDonut.js">
<#javascriptinclude file="javascript\_Prtg.SensorTree.Remotemodel.js">
<#javascriptinclude file="javascript\_Prtg.Slickgrid.DynamicRowHeight.js">
<#javascriptinclude file="javascript\_Prtg.ObjectTree.Sunburst.Plugin.js">
<#javascriptinclude file="javascript\_Prtg.ObjectTree.TreeMap.Plugin.js">
// new geomaps via openlayer
<#javascriptinclude file="javascript\lib\OpenLayers\OpenLayers.js">;
OpenLayers.Events.prototype.BROWSER_EVENTS = ["mouseover", "mouseout", "mousedown", "mouseup", "mousemove", "click", "dblclick", "rightclick", "dblrightclick", "resize", "focus", "blur", "keydown"];
<#include file="javascript\_Prtg.GeoMaps.Lang.js">;
<#javascriptinclude file="javascript\_Prtg.GeoMaps.js">;

<#javascriptinclude file="javascript\_Prtg.SensorTree.js">
<#javascriptinclude file="javascript\_Prtg.ObjectTree.Plugin.js">
// Library tree
<#javascriptinclude file="javascript\_Prtg.Lib.Data.Plugin.js">
<#javascriptinclude file="javascript\_Prtg.LibTree.Plugin.js">

// Module: Toplists
<#javascriptinclude file="javascript\_Prtg.Toplistgraph.Control.js">
<#javascriptinclude file="javascript\_Prtg.Toplistgraph.Plugin.js">
<#javascriptinclude file="javascript\_Prtg.Toplists.Plugin.js">
// Module: Dependencie graph
<#javascriptinclude file="javascript\_Prtg.ui.dialog.js">

// Module: Dependencie graph
<#javascriptinclude file="javascript\_Prtg.DependenciesGraph.js">

<#javascriptinclude file="javascript\_Prtg.Inactivity.Plugin.js">

// Module: FactoResize
<#javascriptinclude file="javascript\_Prtg.FactorResize.js">

<#javascriptinclude file="javascript\_Prtg.SimpleDonut.js">

<#javascriptinclude file="javascript\_Prtg.debug.js">
<#javascriptinclude file="javascript\_Prtg.AdvertLinks.Plugin.js">;
<#javascriptinclude file="javascript\_Prtg.ToggleAutoRefresh.Plugin.js">;
<#javascriptinclude file="javascript\_Prtg.CssHelper.Plugin.js">;

<#include file="javascript\_Prtg.Initialisations.js">

<#include file="javascript\browsercheck.js">

<#include file="javascript\scripts_custom_v2.js">


// The ONE and !!!!!ONLY!!!! document.ready function!!!
    $(function() {
        _Prtg.Setup();
        _Prtg.SetupPage($('body'));
        !!_Prtg.Plugins.TCT && _Prtg.Plugins.TCT.plugin.init(null, document.body);
    });

// IE Handling / Javascriptfile on demand laoder

    if(/MSIE \d|Trident.*rv:/.test(navigator.userAgent)){
        loadScript('/javascript/ieonly.js')
        loadScript('/javascript/lib/jquery-migrate-1.2.1.min.js')
        console.warn('[PRTG] Internet Explorer detected: Compatibility mode initialized')
    }

    function loadScript(filepath){
        var scriptTag = document.createElement("script")
        scriptTag.type = "text/javascript";
        scriptTag.src = filepath
        document.getElementsByTagName("head")[0].appendChild(scriptTag)
    }