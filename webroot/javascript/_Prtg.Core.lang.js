// _Prtg.Core.lang.js
<#isadmin var="isadmin">
_Prtg.Lang = _Prtg.Lang || { ___: '_Prtg.Lang' };
$.extend(true, _Prtg.Lang, {
	common: {
		strings: {
			"OK":	'<#langjs key="common.strings.ok" default="OK">',
			"ZoomGraph": '<#langjs key="html.global.zoomgraph" default="Zoom graph in new window">',
			"Groups": '<#langjs key="common.strings.groups" default="Groups">',
			"Other": '<#langjs key="common.strings.other" default="Other">'
		},
    roots:{
      root: {
        name: '<#objectproperty name="name" id="0">',
        basetype: 'group',
        objid: 0,
        icon: '/icons/group.png?svg'
      },
      libraries: {
        name: '<#langjs key="html.libs.title" default="Libraries">',
        basetype: 'libraries',
        objid: -6,
        icon: '/icons/library.png?svg'
      },
      maps: {
        name: '<#langjs key="html.maps.title" default="Maps">',
        basetype: 'maps',
        objid: -5,
        icon: '/icons/map.png?svg'
      },
      notifications: {
        name: '<#langjs key="html.notifications.help.title" default="Notification Templates">',
        basetype: 'notifications',
        objid: -3,
        icon: '/css/images/Glocke_003596_14x14.png'
      },
      reports: {
        name: '<#langjs key="html.reports.title" default="Reports">',
        basetype: 'reports',
        objid: -4,
        icon: '/icons/report.png?svg'
      },
      schedules: {
        name: '<#langjs key="html.schedules.help.title" default="Schedules">',
        basetype: 'schedules',
        objid: -7,
        icon: '/icons/schedule.png?svg'
      },
      usergroups: {
        name: '<#langjs key="html.usergroups.help.title" default="User Groups">',
        basetype: '<#if value="@isadmin" then="usergroups" else="" varexpand="value">',
        objid: -2,
        icon: '/icons/usergroup.png?svg'
      },
      users: {
        name: '<#langjs key="html.global.users" default="Users">',
        basetype: '<#if value="@isadmin" then="user" else="" varexpand="value">',
        objid: -1,
        icon: '/icons/useraccount.png?svg'
      }
    }
	}
});
