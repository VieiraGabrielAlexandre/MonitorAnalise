//_Prtg.CrumblerSensorStats.lang.js
_Prtg.Lang = _Prtg.Lang || {
	___: '_Prtg.Lang'
};
$.extend(true, _Prtg.Lang, {
	crumbler: {
		strings: {
			"failovermaster1": '<#langjs key="html.clusterstateforpagetop.head1anew" default="This failover node is current master">',
			"failovermaster2": '<#langjs key="html.clusterstateforpagetop.noteAanew" default="This failover node is your current master node because your primary node is not connected to this cluster. You can modify the monitoring configuration, but as soon as the primary node reconnects to the cluster all your changes will be overwritten by the configuration of the primary node.">',
			"failovernode1": '<#langjs key="html.clusterstateforpagetop.head2new" default="This is a failover node (Read-Only).">',
			"failovernode2": '<#langjs key="html.clusterstateforpagetop.note2" default="You can access monitoring results, but you can not change the configuration.">',
			"AutoDiscovery": '<#langjs key="js.clienttimer.autodiscorunning3z" default="Auto Discovery">',
			"CacheCalculation": '<#langjs key="js.clienttimer.cachecalcrunning3z" default="Cache Calculation">',
			"Reporting": '<#langjs key="js.clienttimer.reportrunning3z" default="Reporting">',
			"BackgroundTask": '<#langjs key="js.clienttimer.background" default="Active Background Tasks">',
			"CorrelationTask": '<#langjs key="js.clienttimer.SimilarityTask" default="Similar Sensors Analysis">',
			"Warning": '<#langjs key="js.growl.warningtitle" default="Warning">',
			"overload": '<#langjs key="js.growl.overload" default="Overload protection is active! Click to learn more.">',
			"activationrequired": '<#langjs key="js.growl.activationrequired" default="Activation Required!">',
			"LowMem": '<#langjs key="html.footer.lowmemalarm2" default="Attention: Core system is low on memory, stability may be affected!">',
			"prolong1a": '<#langjs key="html.prtgjs.various.prolongA1" default="Click here to renew your maintenance!">',
			"prolong2b": '<b><#langjs key="html.prtgjs.various.prolongA2" default="Your software maintenance will expire in ||days|| days." comment="||days|| will be replaced by a number"></b><br>',
			"prolong3b": '<h2><#langjs key="html.prtgjs.various.prolongA3" default="Your maintenance has expired ||days|| days ago." comment="||days|| will be replaced by a number"></h2><p><#langjs key="html.prtgjs.various.prolongA3b" default="Without maintenance you will not be able to download and install new PRTG versions!"></p>',
			"POPLicense": '<#langjs key="html.prtgjs.various.getpermanenlicense1" default="Once the trial has ended, you can continue to use PRTG with 100 sensors for free. If you need more sensors, click here to buy one of our commercial licenses.">',
      		"PODLicense": '<#langjs key="html.prtgjs.various.pod.license" default="Once the trial has ended, your PRTG instance hosted by Paessler and all of your data will be deleted.<br><br>Please consider upgrading to one of our commercial plans to avoid losing your configuration, sensors, and monitoring data.">',
			"PODSubdomain": '<#system type="dnsname" subdomain="true">',
			"trialhasexpired": '<b><#langjs key="html.prtgjs.various.trialhasexpired" default="Your trial license has expired ||days|| days ago!" comment="||days|| will be replaced by a number"></b><br>',
			"trialwillexpire1a": '<b><#langjs key="html.prtgjs.various.trialwillexpire1a" default="Your trial license will expire in ||days|| days!" comment="||days|| will be replaced by a number"></b><br>',
			"trialwillexpire2a": '<b><#langjs key="html.prtgjs.various.trialwillexpire2a" default="Your trial license will expire in ||days|| days!" comment="||days|| will be replaced by a number"></h2>',
			"trialwillexpire2ah": '<h2><#langjs key="html.prtgjs.various.trialwillexpire2a" default="Your trial license will expire in ||days|| days!" comment="||days|| will be replaced by a number"></h2>',
			"commercialwillexpire": '<h2><#langjs key="html.prtgjs.various.commercialwillexpire" default="Your license will expire in ||days|| days!" comment="||days|| will be replaced by a number"></h2><br>',
			"clickformoreinfo": '<#langjs key="html.prtgjs.various.clickformoreinfo" default="Click here for more information!">'
    }
	}
});
