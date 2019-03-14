_Prtg.Lang = _Prtg.Lang || { ___: '_Prtg.Lang' };
$.extend(true, _Prtg.Lang, {
addSensor:
  {
    strings:
    {
      "cat_normal"        : '<#langjs key="html.addsensor.failure.available" default="Matching sensor types" >',
      "cat_top10"     : '<#langjs key="html.addsensor.failure.top10" default="Most used sensor types" >',
      "cat_probeconn"     : '<#langjs key="html.addsensor.failure.probeconn1" default="Sensor types that require a connected probe" >',
      "cat_probeconn2"     : '<#langjs key="html.addsensor.failure.probeconn2" default="You cannot set up these sensors because the probe is currently disconnected." >',
      "cat_probedevice"   : '<#langjs key="html.addsensor.failure.probedevice1" default="Sensor types that can only be created on a probe device" >',
      "cat_probedevice2"   : '<#langjs key="html.addsensor.failure.probedevice2" default="To add these sensor types please select a probe device." >',
      "cat_clusternode"   : '<#langjs key="html.addsensor.failure.clusternode1" default="Sensor types that cannot be added to a cluster">',
      "cat_clusternode2"   : '<#langjs key="html.addsensor.failure.clusternode2" default="To add these sensor types please choose a device on the local or a remote probe, but not the cluster probe.">',
      "cat_validvm"       : '<#langjs key="html.addsensor.failure.validvm2" default="Sensor types that need valid credentials for VMware/XenServer" >',
      "cat_validvm2"       : '<#langjs key="html.addsensor.failure.validvm1" default="To add these sensor types please enter the VMware/Xen credentials for the parent device or a parent group." >',
      "cat_validwindows"  : '<#langjs key="html.addsensor.failure.validwindow1s" default="Sensor types that need valid credentials for Windows servers" >',
      "cat_validwindows2"  : '<#langjs key="html.addsensor.failure.validwindows2" default="To add these sensor types please enter credentials on the parent device or a parent group." >',
      "cat_validlinux"    : '<#langjs key="html.addsensor.failure.validlinux1" default="Sensor types that need valid credentials for Linux (SSH/WBEM) Systems" >',
      "cat_validlinux2"    : '<#langjs key="html.addsensor.failure.validlinux2" default="To add these sensor types please enter credentials on the parent device or a parent group." >',
      "cat_dotnetversion" : '<#langjs key="html.addsensor.failure.dotnetversion1" default="Sensor types that need specific Microsoft .NET versions" >',
      "cat_dotnetversion2" : '<#langjs key="html.addsensor.failure.dotnetversion2" default="To add these sensor types please see the sensor information and install the appropriate version of .NET on the computer running the PRTG probe." >',
      "cat_isv6host"      : '<#langjs key="html.addsensor.failure.isv6host" default="Sensor types that are not IPv6 compatible" >',
      "cat_islinux"       : '<#langjs key="html.addsensor.failure.islinux1" default="Sensor types that are not compatible with a mini probe" >',
      "cat_islinux2"       : '<#langjs key="html.addsensor.failure.islinux2" default="To add these sensor types please choose a device on the local probe or a Windows remote probe to add these sensor types." >',
      "cat_needslocalprobe": '<#langjs key="html.addsensor.failure.needslocalprobe1" default="Sensor types that can only be created on a local probe or hosted probe device" >',
      "cat_needslocalprobe2": '<#langjs key="html.addsensor.failure.needslocalprobe2" default="Select a local probe or hosted probe device to add these sensor types." >',
      "cat_notonpod": '<#langjs key="html.addsensor.failure.notonpod1" default="Sensor types that can only be created on a remote probe" >',
      "cat_notonpod2": '<#langjs key="html.addsensor.failure.notonpod2" default="Select a device on a remote probe to add these sensor types." >',
      // Ressource Usage strings
      "resourceusage": [
        '<#langjs key="html.addsensor.resource.usage1" default="Very low impact on system performance. Try to stay below 5000 sensors of this performance category per probe." >',
        '<#langjs key="html.addsensor.resource.usage2" default="Low impact on system performance. Try to stay below 2000 sensors of this performance category per probe." >',
        '<#langjs key="html.addsensor.resource.usage3" default="Medium impact on system performance. Try to stay below 500 sensors of this performance category per probe." >',
        '<#langjs key="html.addsensor.resource.usage4" default="High impact on system performance. Try to stay below 200 sensors of this performance category per probe." >',
        '<#langjs key="html.addsensor.resource.usage5" default="Very high impact on system performance. Try to stay below 50 sensors of this performance category per probe." >'
      ],
      "noHelpText"        : '<#langjs key="html.addsensor.nohelptext" default="Click question mark to open help" >',
      "resulttext"        : '<#langjs key="html.addsensor.resulttext" default="Results" >',
      "counttext"         : '<#langjs key="html.addsensor.counttext" default="Count" >',
      "filtertext"        : '<#langjs key="html.addsensor.filtertext" default="Filter" >',
      "searchtext"        : '<#langjs key="html.addsensor.searchtext" default="Search" >',
      "addingSensor"      : '<#langjs key="html.addsensor.addingsensor" default="Adding sensor(s)..." >',
      "addsensorfailed"		: '<#langjs key="html.addsensorfailed.errormessage" default="Sorry, the scan for available monitoring items has failed!">'
    }
  }
});
