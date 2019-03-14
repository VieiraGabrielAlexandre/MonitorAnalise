//_Prtg.CrumblerSensorStats.js
(function ($, window, undefined) {
    var pluginName = 'crumblerSensorStats';

    function Plugin(elements, data, parent) {
        this.elements = elements;
        this.$parent = $(parent);
        this._name = pluginName;
        this.id = null;
        this.confirmedGrowls = {};
        this.stats = $.each({
                'alert': {'value': 'NewAlarms'},
                'message': {'value': 'NewMessages'},
                'newtickets': {'value': 'NewTickets'},
                'downsens': {'value': 'Alarms'},
                'partialdownsens': {'value': 'PartialAlarms'},
                'downacksens': {'value': 'AckAlarms'},
                'warnsens': {'value': 'WarnSens'},
                'upsens': {'value': 'UpSens'},
                'pausedsens': {'value': 'PausedSens'},
                'unusualsens': {'value': 'UnusualSens'},
                'undefinedsens': {'value': 'UnknownSens'}
            },
            function (i, o) {
                o['element'] = $('.statusinfo.' + i, elements);
                o['text'] = o['element'].find('.counter');
                var t = !!o['element'].attr('title') ? 'title' : 'data-original-title';
                t = o['element'].attr(t);
                if (!!t && t.indexOf('x') !== -1)
                    o['title'] = 'x' + t.split('x')[1];
            });
        _Prtg.lastStats = {};
        this.init(this);
    }

    Plugin.prototype.init = function (me) {
        $('#new_message', this.elements).click(function () {
            me.resetnewmessagestimestamp();
            $(this).parent().fadeOut("slow");
            return true;
        });
        $('#new_alarms', this.elements).click(function () {
            me.resetnewmessagestimestamp();
            $(this).parent().fadeOut("slow");
            return true;
        }).effect("pulsate", {times: 10}, 1500);


        if (_Prtg.Options.refreshType === 'none') $('#footerrefresh').css('visibility', 'hidden');


        _Prtg.Events.subscribe('refresh.events.prtg', $.proxy(crumblerSensorStats, this));
        crumblerSensorStats.call(this);
        function crumblerSensorStats() {
            var me = this;
            $.ajax({
                url: '/api/status.json',
                global: false,
                timeout: 30000,
                dataType: 'json',
                data: {
                    asjson: true,
                    id: (window.winguiid || me.id || _Prtg.Util.getUrlVars()['id'] || -1)
                },
            }).done(function (s) {
                var mymsg = "";

                if ((!!_Prtg.lastStats.hasOwnProperty('ClusterType')
                    && _Prtg.lastStats.ClusterType !== s.ClusterType)
                    || (!!_Prtg.lastStats.hasOwnProperty('ReadOnlyUser')
                    && _Prtg.lastStats.ReadOnlyUser !== s.ReadOnlyUser)) {
                    document.location.reload();
                    return;
                }

                _Prtg.serverTime.setTime(s.jsClock * 1000);

                var timeElem = $('footer .js-servertime');
                timeElem.attr('data-original-title',s.Clock + ' ('+timeElem.data('timezone')+')');

                var clock = timeElem.find('.serverclock');
                clock.text(formatTimeString(s.Clock));

                s.Alarms = parseInt(s.Alarms + 0, 10) / 10;
                ///*IE only supports ICO file format */
                <#system type="browserdependent" browsertype="MSIE" browsercontent="/*" >
                if (s.Alarms > 0) {
                    Tinycon.setImage('/icons/favicon_red.png')
                } else {
                    Tinycon.setImage('/favicon.ico')
                }
                Tinycon.setBubble(s.Alarms);
                <#system type="browserdependent" browsertype="MSIE" browsercontent="*/" >

                    $.each(me.stats, function (i, o) {
                        var txt = s[o['value']] + o['title']
                            , attr = (!!o['element'].attr('title') ? 'title' : 'data-original-title');
                        if (!!o['title']) o['element'][0].setAttribute(attr, txt);
                        o['text'].text(s[o['value']]);
                        s[o['value']] = parseInt(0 + s[o['value']], 10);
                        if (s[o['value']] > 0) {
                            o['element'].removeClass('display0').show();
                        } else {
                            o['element'].hide();
                        }
                    });

                if (parseInt(s.NewAlarms + 0, 10) > 0) {
                    _Prtg.desktopNotification.showAlarms(s.NewAlarms);
                }
                if (parseInt(s.BackgroundTasks + 0, 10) > 0) {
                    mymsg += " <a href='/status.htm'>" + s.BackgroundTasks + "x " + _Prtg.Lang.crumbler.strings.CacheCalculation + "</a><br>";
                }
                if (parseInt(s.CorrelationTasks + 0, 10) > 0) {
                    mymsg += " <a href='/status.htm'>" + s.CorrelationTasks + "x " + _Prtg.Lang.crumbler.strings.CorrelationTask + "</a><br>";
                }
                if (parseInt(s.AutoDiscoTasks + 0, 10) > 0) {
                    mymsg += " <a href='/status.htm'>" + s.AutoDiscoTasks + "x " + _Prtg.Lang.crumbler.strings.AutoDiscovery + "</a><br>";
                }
                if (parseInt(s.ReportTasks + 0, 10) > 0) {
                    mymsg += " <a href='/reports.htm'>" + s.ReportTasks + "x " + _Prtg.Lang.crumbler.strings.Reporting + "</a>";
                }
                if (mymsg !== "") {
                    _Prtg.Growls.add({
                        id: 'backroundtask',
                        type: "info",
                        title: _Prtg.Lang.crumbler.strings.BackgroundTask,
                        message: mymsg,
                        time: _Prtg.Options.refreshInterval + 3
                    });
                }
                if (s.LowMem) {
                    _Prtg.Growls.add({
                        id: 'lowmem',
                        type: "warning",
                        title: _Prtg.Lang.crumbler.strings.Warning,
                        message: _Prtg.Lang.crumbler.strings.LowMem,
                        time: _Prtg.Options.refreshInterval + 3
                    });
                }
                if (s.Overloadprotection == true) {
                    _Prtg.Growls.add({
                        id: 'overload',
                        type: "warning",
                        time: _Prtg.Options.refreshInterval * 3,
                        title: _Prtg.Lang.crumbler.strings.Warning,
                        message: '<a href="https://kb.paessler.com/en/topic/25523?utm_source=prtg&utm_medium=referral&utm_campaign=webgui-kb" target="_blank">' + _Prtg.Lang.crumbler.strings.overload + '</a>'
                    });
                }
                if (!!s.ClusterType) {
                    $("#clusterstatus").html(s.ClusterNodeName);
                    if (s.ClusterType === 'clustermaster') $("clustergrowl").hide();
                    if (s.ClusterType === 'failovermaster') {
                        _Prtg.Growls.add({
                            id: 'clustergrowl',
                            type: "warning",
                            title: _Prtg.Lang.crumbler.strings.failovermaster1,
                            message: '<a href="https://kb.paessler.com/en/topic/7663?utm_source=prtg&utm_medium=referral&utm_campaign=webgui-kb" target="_blank">' + _Prtg.Lang.crumbler.strings.failovermaster2 + '</a>',
                            time: _Prtg.Options.refreshInterval * 3
                        });
                    }
                    if (s.ClusterType === 'failovernode') {
                        _Prtg.Growls.add({
                            id: 'clustergrowl',
                            type: "info",
                            title: _Prtg.Lang.crumbler.strings.failovernode1,
                            message: '<a href="https://kb.paessler.com/en/topic/7663?utm_source=prtg&utm_medium=referral&utm_campaign=webgui-kb" target="_blank">' + _Prtg.Lang.crumbler.strings.failovernode2 + '</a>',
                            time: _Prtg.Options.refreshInterval * 3
                        });
                    }
                }
                _Prtg.lastStats = null;
                _Prtg.lastStats = s;

                if (!me.growlIsConfirmed('growltrial')
                    && s.TrialExpiryDays !== '-999999'
                    && $.isNumeric(s.TrialExpiryDays))
                    me.checkExpiryDays(parseInt(s.TrialExpiryDays, 10), false)
                        .off('click.confirm')
                        .on('click.confirm', '#closehelp', $.proxy(me.growlConfirm, me, 'growltrial'));

                if (!me.growlIsConfirmed('growlcommercial')
                    && s.CommercialExpiryDays !== '-999999'
                    && $.isNumeric(s.CommercialExpiryDays))
                    me.checkExpiryDays(parseInt(s.CommercialExpiryDays, 10), true)
                        .off('click.confirm')
                        .on('click.confirm', '#closehelp', $.proxy(me.growlConfirm, me, 'growlcommercial'));


                if (!me.growlIsConfirmed('growlmaint')
                    && $.isNumeric(s.MaintExpiryDays))
                    me.checkMaintExpiryDays(parseInt(s.MaintExpiryDays, 10))
                        .off('click.confirm')
                        .on('click.confirm', '#closehelp', $.proxy(me.growlConfirm, me, 'growlmaint'));

                _Prtg.Events.publish('newstats.prtg', _Prtg.lastStats);

                if (!!s.Warnings) {
                    s.Warnings.forEach(function (elm) {
                        if (!me.growlIsConfirmed(elm.id)) {
                            _Prtg.Growls.add(elm)
                                .off('click.confirm')
                                .on('click.confirm', '#closehelp', $.proxy(me.growlConfirm, me, elm.id));
                        }
                    });
                }

                function formatTimeString(timeStr) {
                    var splitdatetime =  timeStr.split(' ', 2);
                    var splitTime = splitdatetime[1].split(':',2);
                    return splitTime[0]+':'+splitTime[1];
                }

                checkAndPlayAudibleAlarm.call(_Prtg.lastStats);
            });
        }

        _Prtg.Events.subscribe('playalarm.events.prtg', $.proxy(checkAndPlayAudibleAlarm, _Prtg.lastStats));
        function checkAndPlayAudibleAlarm() {
            if (this.NewAlarms > 0) _Prtg.AudibleAlarm.playAlarm();
        }

        me.bindLiveChat();
        me.checkTimezone();
    };

    Plugin.prototype.checkTimezone = function () {
        var storedValue = true;
        if (typeof localStorage !== 'undefined') {
          storedValue = JSON.parse(localStorage.getItem('showTimezoneMismatch'));
        }

        if(storedValue || storedValue === null) {
          var browserdate = new Date();
          var $timezoneWarning = $('.js-timezoneMismatch');
          var $content = $timezoneWarning.find('.js-timezone-textreplace');

          if (browserdate.getTimezoneOffset() != parseInt(_Prtg.Options.userTimezone.offset)) {
              var browserTimezoneName = browserdate.toString().split('(')[1].split(')')[0];
            $content.html($content.html()
              .replace('${user_set_timezone}', _Prtg.Options.userTimezone.name)
              .replace('${browser_set_timezone}', browserTimezoneName)
            );
            $timezoneWarning.css('display', 'block');
          }

          $timezoneWarning.find('.js-timezone-ignore').click(function () {
            localStorage.setItem("showTimezoneMismatch", 'false');
            $timezoneWarning.css('display', 'none');
          });

          localStorage.setItem("showTimezoneMismatch", 'true');
        }
    };

    Plugin.prototype.bindLiveChat = function () {
        var LC_API = window.LC_API || {};
        var button = $('.js-livechat_button');

        LC_API.on_after_load = function() {
            if (LC_API.agents_are_available()) {
                button.click(function(){
                    LC_API.open_chat_window();
                });
                button.show();
            }
            else button.remove();
        };
    };

    Plugin.prototype.growlIsConfirmed = function (id) {
        if (!id) return;
        try {
            this.confirmedGrowls = JSON.parse(window.sessionStorage.getItem('Growls')) || {};
        } catch (e) {
            this.confirmedGrowls = {};
        }
        return this.confirmedGrowls.hasOwnProperty(id) && this.confirmedGrowls[id].isconfirmed;
    }
    Plugin.prototype.growlConfirm = function (id) {
        if (!id) return;
        this.confirmedGrowls[id] = {"isconfirmed": true};
        try {
            window.sessionStorage.setItem('Growls', JSON.stringify(this.confirmedGrowls));
        } catch (e) {
            this.confirmedGrowls = {};
        }
    }
    Plugin.prototype.checkMaintExpiryDays = function (expirydays) {
        var getlic = _Prtg.Lang.crumbler.strings.prolong1a;
        var expireText = [
            _Prtg.Lang.crumbler.strings.prolong2b,
            _Prtg.Lang.crumbler.strings.prolong3b
        ];
        expireText[0] = expireText[0].replace("||days||", expirydays);
        expireText[1] = expireText[1].replace("||days||", -expirydays);

        if ((expirydays < 16) && (expirydays > 0)) {
            return _Prtg.Growls.add({
                id: 'growlmaint',
                type: "warning",
                title: _Prtg.Lang.crumbler.strings.Warning,
                message: expireText[0] +'<a class="actionbutton" target="_blank" href="https://shop.paessler.com/shop/prtg/maintenance/?license_hash=<#system type="licensehash">&utm_source=prtg&utm_medium=referral&utm_campaign=webgui-prolongmaintenance1&utm_content=maintenance">' + getlic + '</a>',
                time: 99999
            });
        }
        if ((expirydays <= 0) && (expirydays > -10)) {
            return _Prtg.Growls.add({
                id: 'growlmaint',
                type: "warning",
                title: _Prtg.Lang.crumbler.strings.Warning,
                message: expireText[1] + '<a class="actionbutton" target="_blank" href="https://shop.paessler.com/shop/prtg/maintenance/?license_hash=<#system type="licensehash">&utm_source=prtg&utm_medium=referral&utm_campaign=webgui-prolongmaintenance2&utm_content=maintenance">' +  getlic + '</a>',
                time: 99999
            });
        }
        return $();
    };

    Plugin.prototype.checkExpiryDays = function (expirydays, iscommercial) {
        if (!expirydays || expirydays == -999999) {
            return $();
        } // freeware/commercial/POD/MSP/expired

        var getlic = !!_Prtg.lastStats && _Prtg.lastStats.EditionType !== "PT" ? _Prtg.Lang.crumbler.strings.POPLicense : _Prtg.Lang.crumbler.strings.PODLicense;
        var expireText = [
            _Prtg.Lang.crumbler.strings.trialwillexpire1a,
            _Prtg.Lang.crumbler.strings.trialwillexpire2a,
            _Prtg.Lang.crumbler.strings.trialwillexpire2ah,
            _Prtg.Lang.crumbler.strings.trialhasexpired,
            _Prtg.Lang.crumbler.strings.commercialwillexpire
        ];

        expireText[0] = expireText[0].replace("||days||", expirydays);
        expireText[1] = expireText[1].replace("||days||", expirydays);
        expireText[2] = expireText[2].replace("||days||", expirydays);
        expireText[3] = expireText[3].replace("||days||", -expirydays);
        expireText[4] = expireText[4].replace("||days||", expirydays);

        if (iscommercial) {
            if ((expirydays < 32) && (expirydays > -1)) {
                return _Prtg.Growls.add({
                    id: 'growlcommercial',
                    type: "warning",
                    title: expireText[4],
                    message: '<a  href="/licensing.htm?tabid=1">' +  _Prtg.Lang.crumbler.strings.clickformoreinfo + '</a>',
                    time: 99999
                });
            }

        } else {
            if (_Prtg.lastStats.EditionType == "PT") {
                if (expirydays < 7) {
                    return addTrialGrowl(expireText[1], ' https://www.my-prtg.com/dashboard?&upgrade=true&subdomain=' + _Prtg.Lang.crumbler.strings.PODSubdomain);
                }
            } else {
                if (expirydays < 0) {
                    if(expirydays > -20) {
                        return addTrialGrowl(expireText[3], "https://www.paessler.com/order?utm_source=prtg&utm_medium=referral&utm_campaign=webgui-trialexpired4");
                    }
                }
                else if (expirydays < 8) {
                    return addTrialGrowl(expireText[2], "https://www.paessler.com/order?utm_source=prtg&utm_medium=referral&utm_campaign=webgui-trialexpired3");
                }
                else if (expirydays < 14) {
                    return addTrialGrowl(expireText[1], "https://www.paessler.com/order?utm_source=prtg&utm_medium=referral&utm_campaign=webgui-trialexpired2");
                }
                else if (expirydays < 20)  {
                    return addTrialGrowl(expireText[0], "https://www.paessler.com/order?utm_source=prtg&utm_medium=referral&utm_campaign=webgui-trialexpired1");
                }
            }
        }
        return $();

        function addTrialGrowl(trialGrowlTitle, trialGrowlHref) {
            return _Prtg.Growls.add({
                id: 'growltrial',
                type: "warning",
                title: trialGrowlTitle,
                message: '<a target="_blank" href="'+trialGrowlHref+'">' + getlic + '</a>',
                time: 99999
            })
        }
    };


    Plugin.prototype.resetnewmessagestimestamp = function () {
        $.ajax({
            url: "/api/resetnewmessagestimestamp.htm",
            dataType: "text",
            type: "GET",
            beforeSend: function (jqXHR) {
                jqXHR.ignoreManager = true;
            },
            success: function () {
                try {
                    window.localStorage.setItem("newalarmcount", 0);
                } catch (err) {
                }
            }
        });
    };
    _Prtg.Plugins.registerPlugin(pluginName, Plugin);

})(jQuery, window, document);
