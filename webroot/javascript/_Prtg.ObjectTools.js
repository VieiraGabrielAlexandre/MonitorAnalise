var loadingicon = '<div class="loadspinner"></div>';
_Prtg.objectTools = {
  update: function update(elm) {
    var $elm = $(elm || this);
    var plugin = ($elm.attr('callerid') !== undefined
      ? $('#' + $elm.attr('callerid'))
      : ($elm = $elm.parents('.refreshable-initialized, .prtg-plugin-initialized').first(),
        $elm.parents('.refreshable-initialized, .prtg-plugin-initialized, .prtg-events-container')));

    _Prtg.Tip.killPopups();
    plugin = $.makeArray(plugin);
    if (!!$elm.length) plugin.unshift($elm[0]);
    if (plugin.length > 0) {
      $.each(plugin, function(i, e) {
        var self = $(e);
        var data = self.data();
        var ret = true;
        (function() {
          var plugins = Array.apply(null, arguments);
          var data = this;
          $.each(plugins, function(i, e) {
            var plugin = data['plugin_' + e.camelCase()];
            if (plugin && plugin['refresh']) {
              plugin.refresh($elm, {lastRefresh:0, refreshInterval:0});
              ret = false;
            }
          });
        }).apply(data, ((data.plugin && data.plugin.split(' ')) || ['refreshable']));
        return ret;
      });
    }
  },
  reloadMainMenu: function reloadMainMenu() {
    //if ($('#main_menu').length) $('#main_menu').parent().load('/controls/menu.htm');
  },
  refreshLater: function refreshLater($disp, wait, effect, options) {
    var self = this;
    var me = $disp.length ? $disp : $(this);
    me.effect(effect || 'pulsate', {times:1}, options || (wait || 3000), function() {_Prtg.objectTools.update.call(self);});
  },
  editSettingsDialog: function editSettingsDialog(dialogurl, data, options) {
    return _Prtg.Dialogs.defaultDialog(dialogurl, data, options || {}).then(function(result, action) {
      if (Object.keys(result).length) {
        var loader = _Prtg.Dialogs.loader(_Prtg.Lang.Dialogs.strings.multieditdialogtitle);
        $.ajax({
          url: "/editsettings",
          data: result,
          type: "POST",
          dataType: "html"
        }).always(function() {
            loader.dialog('destroy').remove();
          }).done(function() {
          _Prtg.Events.publish('refresh.events.prtg', [true]);
          _Prtg.objectTools.reloadMainMenu();
        });
      }
    });
  },
  channelEditDialog: function channelEditDialog(id, channel) {
    _Prtg.objectTools.editSettingsDialog("/controls/channeledit.htm",
      {'id': id, 'channel': channel},
      {
        width: 430,
        buttons: [{
          text: _Prtg.Lang.common.strings['apply'],
          'class': 'actionbutton noentersubmit',
          click: function() {
            var $form = $(this).find('form.prtg-form');
            $form.addClass('dialogform').trigger('submit');
            if (!$form.valid()) return;
          }
        }, {
          text: _Prtg.Lang.common.strings['ok'],
          'class': 'actionbutton',
          click: function() {
            var $form = $(this).find('form.prtg-form');
            $form.addClass('dialogform').trigger('submit');
            if (!$form.valid()) return;
            $(this).dialog("close");
          }
        }, {
          text: _Prtg.Lang.Dialogs.strings['cancel'],
          'class': 'button btngrey',
          click: function() {
            var $form = $(this).find('form.prtg-form');
            var self = $(this);
            if ($form.hasClass('formchanged')) {
              _Prtg.Dialogs.confirmDialog(_Prtg.Lang.Dialogs.strings['savewarningtitle'], _Prtg.Lang.Dialogs.strings['savewarning'], _Prtg.Lang.common.strings['save'], _Prtg.Lang.common.strings['discardchanges']).done(function() {
                  $form.addClass('dialogform').trigger('submit');
                  self.dialog("close");
                }).fail(function() {
                  self.dialog("close");
                });
            } else {
              self.dialog("close");
            }
          }
        }
      ]}
    );
  },
  createTemplate: function createTemplate(objectid) {
    if (!_Prtg.Options.userIsReadOnly)
      return _Prtg.Dialogs.defaultDialog('createtemplate.htm', objectid, {maxWidth:895})
        .then(function(result, action) {
          var loader = _Prtg.Dialogs.loader();
          return $.ajax({
            url:  action,
            data: result,
            type: "POST",
            dataType: 'json'
          }).always(function() {
            loader.dialog('destroy').remove();
          }).done(function(result){
            var list = '';
            if(!!result.templatesensors){
              result.templatesensors.forEach(function(sensor){
                  list += '<li>' + sensor +  '</li>';
              });
              list = '<ul>' + list + '</ul>';
            }
            _Prtg.Dialogs.alert($('<div class="message">' + _Prtg.Lang.Dialogs.strings.createTemplateMessage + list + '</div>'), _Prtg.Lang.Dialogs.strings.createTemplateResults);
          }).fail(function(XMLHttpRequest, textStatus, errorThrown) {
            _Prtg.Dialogs.alert($('<div class="message">' + $(XMLHttpRequest.responseText).find("error").text() + '</div>'), _Prtg.Lang.Dialogs.strings.createTemplateResults);
          });
        });
    else return $.when({});
  },
  addRemoteProbe: function addRemoteProbe(id, dialogurl, step) {
    var splitter = String.fromCharCode(10);
    var waitforconnect = false;
    var currentstep = 0;
    var rpconnect = function($dlg){
    if(!waitforconnect){
      waitforconnect = true;
      var intervalId = window.setInterval(function(){
        $.ajax({
          type: 'GET',
          url: '/api/table.json',
          data: {
            count: '*',
            content: 'sensorxref',
            noraw: 1,
            subcheck: 1,
            filter_basetype: ['probe'],
            sortby: 'probegroupdevice',
            columns: 'objid,name=treejson,message=textraw,info,priority'
          }
          }).done(function(data) {
            var returnedData = JSON.parse(data);
            $.each(returnedData.sensorxref, function(index, element) {
              if(/unapproved/.test(element.info) === true ){
                $('.approvediscover').attr('objid', element.objid);
                $('.approvesimple').attr('objid', element.objid);
                $('.approvediscover, .approvesimple').show();
                $dlg.find('.probeconnwait, .probeconnsuccess').toggle();
                $dlg.find('#loadcircle').hide();
                $dlg.find("#rpconnectsuccess").css("display", "block");
                clearInterval(intervalId);
                if(currentstep == 1){
                  $('.next').trigger('click');
                }
                waitforconnect = false;
                return true;
              }
          });
        });
      }, 3000);
    }
    };
    var callbacks = {
        1: function(steps){
          var $dlg = this
            , allowedips = $dlg.find('#probeallowips').contents()
            , allowips = []
          ;
          currentstep = 1;
          allowedips
            .filter(function() {
              return this.nodeType === 3;
            })
            .each(function(){
              allowips.push($.trim($(this).text()));
            });
          if(allowips.indexOf('any') === -1){
            allowips.push('any');
            $.ajax({
              url: "/editsettings",
              type: "POST",
              data: {
                "id": 810,
                "allowips_": $.trim(allowips.join(splitter))
              }
            });
          }

          $('<iframe id="download">').hide().prop("src", "/public/PRTG_Remote_Probe_Installer.exe?filetype=.exe&"+_Prtg.Options.cachebreaker+"&_="+Date.now()).appendTo($dlg);

          if($('isremote').text().toLowerCase() === "false"){
            $dlg.find('.installrpi').hide();
            $dlg.find('.portchecksuccess').hide();
            $dlg.find('.coremachine').show();
          }

          rpconnect($dlg);

          return true;
        },
        2: function(steps){
          var $dlg = this;
          currentstep = 2;
          $('.next').hide();
          rpconnect($dlg);
          return true;
        }
    };

    return _Prtg.Dialogs.wizardDialog(dialogurl, id, step, callbacks,{
        open: function(){
          var probeip = $.trim(this.find('#probebindings').html()).split(splitter)[0];
          var txt1 = this.find('.portchecksuccess');

          if(probeip === '0.0.0.0:23560'){
            probeip = location.host + ':23560';
          }

          if(probeip.indexOf('127.0.0.1') > -1){
            $(this).find('.prepconnrp').hide();
            $(this).parent().parent().find("button.next").hide();
            $(this).find('.remoteprobedisabled').show();

          }

          txt1.html(txt1.html().replace(/\@dnsname/,probeip.split(':')[0]));

          if(!(navigator.platform.toLowerCase().indexOf('win')>=0)){
            $('.winsystem').css("display", "block");
            $('.destpc').css("display", "none");
          }

          if(typeof InstallTrigger !== 'undefined'){
            $("#downloadbrowser").attr("src","/images/download_ff.png");
          }

          var isIE = false || !!document.documentMode;
          if(!isIE && !!window.StyleMedia){
            $("#downloadbrowser").attr("src","/images/download_edge.png");
          }
        },
        buttons: [{
          text: _Prtg.Lang.Dialogs.strings.approvediscover,
          class: 'actionbutton approvediscover',
          style: 'display: none;',
          click: function () {
            $dlg = this;
            var objid = $('.approvediscover').attr('objid');
            _Prtg.objectTools.setProbeState(objid,'allowanddiscover', true);
            destroyDialog();
            dfd.reject(null);
            return dfd.promise();
          }
        },{
          text: _Prtg.Lang.Dialogs.strings.approve,
          class: 'button btngrey approvesimple',
          style: 'display: none;',
          click: function () {
            $dlg = this;
            var objid = $('.approvesimple').attr('objid');
            _Prtg.objectTools.setProbeState(objid,'allow', true);
            destroyDialog();
            dfd.reject(null);
            return dfd.promise();
          }
        }]
      })
      .then(function(result, action) {
      // TODO
    });
  },
  addNotificationContact: function addNotificationContact(id, contacttype) {
    return _Prtg.Dialogs.defaultDialog('/controls/addcontact.htm', {id: id, contacttype: contacttype})
    .then(function(result, action) {
      var loader = _Prtg.Dialogs.loader();
      $.ajax({
          url:  action,
          data: result,
          type: "POST"
        }).always(function() {
          loader.dialog('destroy').remove();
        }).done(function(repsone) {
          _Prtg.Events.publish('refresh.events.prtg', [true]);
        });
    });
  },
  editNotificationContact: function editNotificationContact(id, subid) {
    //onclick events müssen weg, tablebuttonbox buttons mit delegates = besser.
    return _Prtg.Dialogs.defaultDialog('/controls/editcontact.htm', {id: id, subid: subid})
    .then(function(result, action) {
      var loader = _Prtg.Dialogs.loader();
      $.ajax({
          url:  action,
          data: result,
          type: "POST"
        }).always(function() {
          loader.dialog('destroy').remove();
        }).done(function(repsone) {
          _Prtg.Events.publish('refresh.events.prtg', [true]);
        });
    }, function() {
      _Prtg.Events.publish('refresh.events.prtg', [true]); //duck tape.
    });
  },
  setNotificationContactStatus: function setNotificationContactStatus(id, subid, value) {
    var loader = _Prtg.Dialogs.loader();
    $.ajax({
      url: '/api/setobjectproperty.htm',
      data: {
        'id': id,
        'subid': subid,
        'value': value,
        'name': 'status'
      },
      type: 'GET'
    }).always(function() {
      loader.dialog('destroy').remove();
    }).done(function(repsone) {
      _Prtg.Events.publish('refresh.events.prtg', [true]);
    });
  },
  deleteSubObject: function deleteSubObject(id, subid) {
    _Prtg.Dialogs.confirmDialog(_Prtg.Lang.Dialogs.strings['deleteobjecttitle'],
                                _Prtg.Lang.Dialogs.strings['deleteobjecttext'],
                                _Prtg.Lang.Dialogs.strings['deleteObject'],
                                _Prtg.Lang.Dialogs.strings['cancelDeleteObject'])
    .done(function() {
      var loader = _Prtg.Dialogs.loader();
      _Prtg.api.deleteSubObj(id, subid)
      .always(function() {
        loader.dialog('destroy').remove();
      }).done(function(url) {
        _Prtg.Events.publish('refresh.events.prtg', [true]);
      });
    });
  },
  sortSubObjects: function sortSubObjects(objectid) {
    var me = this;
    return $.when(_Prtg.api.sort(objectid)).done(function(html) {
      _Prtg.Events.publish('refresh.events.prtg', [true]);
      _Prtg.objectTools.reloadMainMenu();
    });
  },
  checkObjectNow: function checkObjectNow(objectid) {
    var me = this;
    var disp = $($(me).attr('target') || '.refreshlink');
    return $.when(_Prtg.api.checkNow(objectid)).done(function(html) {
      _Prtg.Events.publish('refresh.events.prtg', [true]);
    });
  },
  simulateObject: function simulateObject(objectid, action) {
    var me = this;
    return $.when(_Prtg.api.simulateError(objectid, action)).done(function(html) {
      setTimeout(function() {
        _Prtg.objectTools.checkObjectNow.call(me, objectid);
      }, 5000);
    });
  },
  faveObject: function faveObject(objectid, action) {
    var me = this;
    if (!_Prtg.Options.userIsReadOnly)
      return $.when(_Prtg.api.favorite(objectid, action)).done(function(html) {
        _Prtg.Events.publish('refresh.events.prtg', [true]);
        _Prtg.objectTools.reloadMainMenu();
      });
    else return $.when({});
  },
  primaryChannel: function primaryChannel(objectid, channelid) {
    var me = this;
    if (!_Prtg.Options.userIsReadOnly)
      return $.when(_Prtg.api.primaryChannel(objectid, channelid)).always(function(html) {
        _Prtg.Events.publish('refresh.events.prtg', [true]);
      });
    else return $.when({});
  },
  testNotification: function testNotification(objectid) {
    var me = this;
    return $.when(_Prtg.api.testNotification(objectid)).done(function(html) {
      var $html = $(html);
      if ($(html).text() === 'OK')
        $html = $('<div>' + _Prtg.Lang.Dialogs.strings.nonotifytestmessage + '</div>');
      else
        $html = $('<div><form class="prtg-form prtg-plugin" data-plugin="prtg-form"><div class="oskhelpbox">' + _Prtg.Lang.Dialogs.strings.notifytestmessage + '</div><div>' + html + '</div></form></div>');
      $(me).find('.ajax-loader-small').remove();
      _Prtg.Dialogs.alert($html, _Prtg.Lang.Dialogs.strings.notifytesttitle);
    });
  },
  loadLookups: function loadLookups() {
    var me = $(this);
    var txt = me.html();
    $(me).addClass('atwork').html(loadingicon + _Prtg.Lang.common.strings.working);
    return $.when(_Prtg.api.loadLookUp()).done(function(response) {
      setTimeout(function() {$(me).removeClass('atwork').html(txt);}, 3000);
    });
  },
  createDatabaseSnapshot: function createDatabaseSnapshot() {
    var me = this;
    var txt = $(me).html();
    $(me).addClass('atwork').html(loadingicon + _Prtg.Lang.common.strings.working);
    $(me).after('<br><span class="deletemeafterwards">' + _Prtg.Lang.common.strings.snapshotworking + '</span>');
    return $.when(_Prtg.api.createDatabaseSnapshot()).done(function(html) {
        $(me).removeClass('atwork').html(txt);
        $(".deletemeafterwards").remove();
    });
  },
  writeCoreStatus: function writeCoreStatus() {
    var me = this;
    var txt = $(me).html();
    $(me).addClass('atwork').html(loadingicon + _Prtg.Lang.common.strings.working);
    return $.when(_Prtg.api.writeCoreStatus()).done(function(html) {
      setTimeout(function() {$(me).removeClass('atwork').html(txt);}, 3000);
    });
  },
  writeProbeStatus: function writeProbeStatus() {
    var me = this;
    var txt = $(me).html();
    $(me).addClass('atwork').html(loadingicon + _Prtg.Lang.common.strings.working);
    return $.when(_Prtg.api.writeProbeState()).done(function(html) {
      setTimeout(function() {$(me).removeClass('atwork').html(txt);}, 3000);
    });
  },
  clearCaches: function clearCaches() {
    var me = this;
    var txt = $(me).html();
    $(me).addClass('atwork').html(loadingicon + _Prtg.Lang.common.strings.working);
    return $.when(_Prtg.api.clearCaches()).done(function(html) {
      setTimeout(function() {$(me).removeClass('atwork').html(txt);}, 3000);
    });
  },
  setProbeState: function setProbeState(objectid, action, skipConfirm) {
    var me = this;
    var txt = $(me).html();
    if (!_Prtg.Options.userIsReadOnly) {
      if ($('#' + objectid + '.prtg_growl').length)
        $('#' + objectid + '.prtg_growl').fadeOut(700, function() {$(this).remove();});
      var loader = _Prtg.Dialogs.loader(action === 'deny' ? _Prtg.Lang.Dialogs.strings.denying : _Prtg.Lang.Dialogs.strings.approving, {
        resizable: true,
        width: '200px',
        buttons:[{
          html: _Prtg.Lang.Dialogs.strings.hidethiswindow,
          'class': "actionbutton",
          click: function() {
            loader.dialog('destroy').remove();
            loader = null;
            _Prtg.Events.publish('refresh.events.prtg', [true]);
            return false;
          }
        }]});
      return $.when(_Prtg.api.setProbeState(objectid, action))
        .always(function() {
          $(me).removeClass('atwork').html(txt);
          if (!!loader && action === 'allow')
            loader.dialog('destroy').remove();
        })
        .done(function(html) {
          _Prtg.objectTools.reloadMainMenu();
          if (action === 'allow' || skipConfirm) {
            location.href = "/probenode.htm?id=" + objectid;
          }
          else {
            loader.html(html).dialog({position:'center', width:350}).next().find('.ui-button-text').text(_Prtg.Lang.Dialogs.strings.ok);
          }

        });
    } else return $.when({});
  },
  reloadFileLists: function reloadFileLists() {
    var me = this;
    var txt = $(me).html();
    $(me).addClass('atwork').html(loadingicon + _Prtg.Lang.common.strings.working);
    return $.when(_Prtg.api.reloadFileLists()).done(function(html) {
      setTimeout(function() {$(me).removeClass('atwork').html(txt);}, 3000);
    });
  },
  restartProbe: function restartProbe(objectid) {
    var me = this;
    var txt = $(me).html();
    $(me).addClass('atwork').html(loadingicon + _Prtg.Lang.common.strings.working);
    return $.when(_Prtg.api.restartProbes(objectid)).done(function(html) {
      setTimeout(function() {$(me).removeClass('atwork').html(txt);}, 3000);
    });
  },
  restartProbes: function restartProbes() {
    var me = this;
    var txt = $(me).html();
    $(me).addClass('atwork').html(loadingicon + _Prtg.Lang.common.strings.working);
    return $.when(_Prtg.api.restartProbes()).done(function(html) {
      setTimeout(function() {$(me).removeClass('atwork').html(txt);}, 3000);
    });
  },
  restartServer: function restartServer() {
    var loader = _Prtg.Dialogs.loader(_Prtg.Lang.Dialogs.strings.serverrestarting)
    return $.when(_Prtg.api.restartServer()).always(function(html) {
      loader.dialog('destroy').remove()
      location.replace("/start.htm");
    });
  
  },
  recalcCache: function recalcCache(objectid) {
    var me = this;
    var txt = $(me).html();
    _Prtg.Dialogs.serverRestartNeededDialog().done(function() {
      $.when(_Prtg.api.recalcCache()).done(function(html) {
        _Prtg.objectTools.restartServer();
      });
    });
  },
  reconfigureLogging: function reconfigureLogging() {
    var me = this;
    var txt = $(me).html();
    $(me).addClass('atwork').html(loadingicon + _Prtg.Lang.common.strings.working);
    return $.when(_Prtg.api.reconfigureLogging()).done(function(html) {
      setTimeout(function() {$(me).removeClass('atwork').html(txt);}, 3000);
    });
  },
  acknowledgeToDo: function acknowledgeToDo(objectid) {
    var me = this;
    if (!_Prtg.Options.userIsReadOnly || _Prtg.Options.allowAcknowledge) {
      $(this).text(_Prtg.Lang.common.strings["working"] + '...');
      return _Prtg.api.acknowledgeToDo(objectid).done(function() {
        _Prtg.Events.publish('refresh.events.prtg', [true]);
      });
    } else return $.when({});
  },
  acknowledgeAllTodos: function acknowledgeAllTodos() {
    var me = this;
    if (!_Prtg.Options.userIsReadOnly || _Prtg.Options.allowAcknowledge) {
      return _Prtg.Dialogs.defaultDialog("/controls/acknowledgealltodosdialog.htm", '', {
        buttonText0: _Prtg.Lang.common.strings.ok,
        buttonText1: _Prtg.Lang.common.strings.cancel
      }).pipe(function(result) {
        var loader = _Prtg.Dialogs.loader();
        return _Prtg.api.acknowledgeToDo().done(function() {
          _Prtg.Events.publish('refresh.events.prtg', [true]);
        }).always(function() {
          loader.dialog('destroy').remove();
        });
      });
    } else return $.when({});
  },
  acknowledgeErrorUntil: function acknowledgeErrorUntil(objectid, action) {
    var me = this;
    objectid = (objectid instanceof Array ? objectid.join(',') : objectid);
    if (!_Prtg.Options.userIsReadOnly || _Prtg.Options.allowAcknowledge)
      return _Prtg.Dialogs.defaultDialog("/controls/acknowledgealarmuntil.htm", objectid, {
        buttonText0: _Prtg.Lang.common.strings.ok,
        buttonText1: _Prtg.Lang.common.strings.cancel
      }).pipe(function(result) {
        var sds = result.untiltime.split('-');
        var duration = (new Date(sds[0], sds[1] - 1, sds[2], sds[3], sds[4], sds[5])).getTime() - (new Date()). getTime();
        duration = (duration / 1000) / 60;
        duration = duration.toFixed();
        if (duration > 0) {
          var loader = _Prtg.Dialogs.loader();
          return _Prtg.api.acknowledgeAlarm(objectid, result.message, duration).done(function() {
            _Prtg.Events.publish('refresh.events.prtg', [true]);
          }).always(function() {
            loader.dialog('destroy').remove();
          });
        } else {
          var df = $.Deferred();
          df.reject();
          return df.promise();
        }
      });
    else return $.when({});
  },

  acknowledgeError: function acknowledgeError(objectid, duration, elm) {
    var me = this;
    var parm = $(elm || me).contents().eq(1).text();

    if (parm.length) parm = '?title=%20(' + parm + ')';

    if (objectid instanceof Array)
      objectid = objectid.join(",");

    if (!_Prtg.Options.userIsReadOnly || _Prtg.Options.allowAcknowledge) {
      return _Prtg.Dialogs.defaultDialog("/controls/acknowledgealarm.htm" + parm, objectid, {maxWidth:550}
      ).pipe(function(result) {
        var loader = _Prtg.Dialogs.loader();
        return _Prtg.api.acknowledgeAlarm.apply(this, [objectid, result.message, duration]).done(function(html) {
          _Prtg.Events.publish('refresh.events.prtg', [true]);
        }).always(function() {
          loader.dialog('destroy').remove();
        });
      });
    } else return $.when({});
  },
  setClusterNodeState: function setClusterNodeState(clid, state) {
    var me = this;
    $(this).replaceWith(_Prtg.Lang.common.strings.working);
    return _Prtg.api.setClusterNodeState(clid, state);
  },
  pauseUntil: function pauseUntil(objectid, action) {
    var me = this;
    objectid = (objectid instanceof Array ? objectid.join(',') : objectid);

    if (!_Prtg.Options.userIsReadOnly)
      return _Prtg.Dialogs.defaultDialog("/controls/pauseuntil.htm", objectid, {
        buttonText0: _Prtg.Lang.common.strings.ok,
        buttonText1: _Prtg.Lang.common.strings.cancel
      }).pipe(function(result) {
        var sds = result.untiltime.split('-');
        var duration = (new Date(sds[0], sds[1] - 1, sds[2], sds[3], sds[4], sds[5])).getTime() - (new Date()). getTime();
        duration = (duration / 1000) / 60;
        duration = duration.toFixed();
        if (duration > 0) {
          var loader = _Prtg.Dialogs.loader();
          return _Prtg.api.pausefor(objectid, duration, result.message).done(function() {
            _Prtg.Events.publish('refresh.events.prtg', [true]);
          }).always(function() {
            loader.dialog('destroy').remove();
          });
        } else {
          var df = $.Deferred();
          df.reject();
          return df.promise();
        }
      });
    else return $.when({});
  },
  setMaintenanceWindow: function setMaintenanceWindow(objectid) {
    var me = this;
    objectid = (objectid instanceof Array ? objectid.join(',') : objectid);

    if (!_Prtg.Options.userIsReadOnly)
      return _Prtg.Dialogs.defaultDialog("/controls/maintenance.htm", objectid, {
        buttonText0: _Prtg.Lang.common.strings.ok,
        buttonText1: _Prtg.Lang.common.strings.cancel
      }).done(function(result) {
        var loader = _Prtg.Dialogs.loader();
        return _Prtg.api.maintenanceWindow(objectid, result.maintstart_, result.maintend_).done(function() {
            _Prtg.Events.publish('refresh.events.prtg', [true]);
          }).always(function() {
            loader.dialog('destroy').remove();
          });
      });
    else return $.when({});
  },
  pauseObject: function pauseObject(objectid, action) {
    var me = this;
    if (objectid instanceof Array) {
      objectid = objectid.join(",");
    }

    if (!_Prtg.Options.userIsReadOnly)
      return $.when(_Prtg.api.pause(objectid, action)).done(function(html) {
        _Prtg.Events.publish('refresh.events.prtg', [true]);
        _Prtg.objectTools.checkObjectNow.call(me, objectid);
        // setTimeout(function() {
          // _Prtg.objectTools.checkObjectNow.call(me, objectid);
        // }, 1000);
      });
    else return $.when({});
  },
  pauseWithComment: function pauseWithComment(objectid, pausefor, elm) {
    var me = this;
    var parm = $(elm || me).contents().eq(1).text();
    var apicall = !!pausefor ? 'pausefor' : 'pause';
    if (parm.length) parm = '?title=%20(' + parm + ')';
    if (objectid instanceof Array) {
      objectid = objectid.join(",");
    }

    if (!_Prtg.Options.userIsReadOnly)
      return _Prtg.Dialogs.defaultDialog("/controls/pausewithcomment.htm" + parm, objectid, {maxWidth:550}).pipe(function(result) {
        var loader = _Prtg.Dialogs.loader();
        return _Prtg.api[apicall](objectid, pausefor, result.message).done(function(html) {
          _Prtg.Events.publish('refresh.events.prtg', [true]);
        }).always(function() {
          loader.dialog('destroy').remove();
        });
      });
    else return $.when({});
  },
  setObjectPosition: function setObjectPosition(objectid, pos) {
    var me = this;
    if (!_Prtg.Options.userIsReadOnly)
      return $.when(_Prtg.api.position(objectid, pos)).done(function(html) {
        _Prtg.objectTools.reloadMainMenu();
        _Prtg.Events.publish('refresh.events.prtg', [true]);
      });
    else return $.when({});
  },
  setObjectCollapse: function setObjectCollapse(objectid, fold) {
    var me = this;
    if (!_Prtg.Options.userIsReadOnly)
      return $.when(_Prtg.api.fold(objectid, fold)).done(function(html) {
        _Prtg.objectTools.update.call(me);
      });
    else return $.when({});
  },
  setObjectPriority: function setObjectPriority(objectid, prio) {
    var me = this;
    if (objectid instanceof Array) {
      objectid = objectid.join(",");
    }

    if (!_Prtg.Options.userIsReadOnly) {
      $(me).parents('.priority').html('&nbsp;&nbsp').addClass('ajax-loader-very-small');
      return $.when(_Prtg.api.priority(objectid, prio)).done(function(html) {
        _Prtg.objectTools.reloadMainMenu();
        _Prtg.Events.publish('refresh.events.prtg', [true]);
      });
    } else {
      return $.when({});
    }
  },
  discoverObjectNow: function discoverObjectNow(objectid) {
    var me = this;
    objectid = objectid || $("input[name='id']").val()

    return $.when(_Prtg.api.discover(objectid)).done(function(html) {
      _Prtg.Events.publish('refresh.events.prtg', [true]);
    });
  },

  discoverObjectTemplate: function discoverObjectTemplate(objectid) {
    if (!_Prtg.Options.userIsReadOnly) {
        var multi = '';
        if (objectid instanceof Array) {
          if (objectid.length > 1) multi = 'multi';
          objectid = objectid.join(",");
        }

        return _Prtg.Dialogs.defaultDialog("/autodiscoverytemplate"+multi+".htm?objid="+objectid, objectid, {}).done(function (result, action) {
          var templates = $.isArray(result.devicetemplate__check) ? result.devicetemplate__check : [result.devicetemplate__check];
          var loader = _Prtg.Dialogs.loader();
          var objectid = result.id || objectid;

          _Prtg.api.discover(objectid, templates.map(function (e) {
            if (e) {
              return '"' + e.split('|')[0] + '"';
            } else {
              return '';
            }
          }).join(',')).done(function () {
            _Prtg.Events.publish('refresh.events.prtg', [true]);
            loader.dialog('destroy').remove();
          });
        });
    }
    else return $.when({});
  },

  disableGeoMaps: function disableGeoMaps() {
    return $.ajax({
      url: "/editsettings",
      data: {
        'geomapserviceprovider_': 'disabled',
        'id': 800
      },
      type: "POST",
      dataType: "html"
    }).always(function() {
      location.reload();
    });
  },
  copyClipBoard: function copyClipBoard($form, text) {
    var txt =  text || '{\n\'' + $form.serialize().replace(/=/g, '\':\'').replace(/&/g, '\',\n\'') + '\'\n}';
    txt = $("<div id='formcopyresults' title='" + _Prtg.Lang.common.strings.copy + "'=><textarea style='width:100%;height:340px' id='formcopytext'>" + txt + "</textarea></div>");
    _Prtg.Dialogs.alert(txt, "", {open:function(dlg) {$('#formcopytext').focus().select();}});
  },
  quickeditObject: function quickeditObject(objectid, type) {
    var me = this;
    var dialogurl = (parseInt(type, 10) === 2) ? "/controls/quickeditdevice.htm" : "/controls/quickedit.htm";

    if (!_Prtg.Options.userIsReadOnly)
      return _Prtg.objectTools.editSettingsDialog.call(me, dialogurl, objectid);
    else return $.when({});
  },
  deleteObject: function deleteObject(objectid, refresh) {
    var me = this;
    var multi = '';
    if (objectid instanceof Array) {
      if (objectid.length > 1) multi = 's';
      objectid = objectid.join(",");
    }

    if (!_Prtg.Options.userIsReadOnly) {
      return _Prtg.Dialogs.defaultDialog('/deleteobject' + multi + ".htm", objectid, {
        buttonText0: _Prtg.Lang.Dialogs.strings['deleteObject' + multi],
        buttonText1: _Prtg.Lang.Dialogs.strings['cancelDeleteObject' + multi]
      }).then(function(result, action) {
        var loader = _Prtg.Dialogs.loader();
        return _Prtg.api.deleteObj(objectid)
          .always(function() {
            loader.dialog('destroy').remove();
          }).done(function(url) {
            if ((!refresh || document.location.search.indexOf('id=' + objectid) > -1) && !!url) {
              _Prtg.Hjax.loadLink(url);
            } else {
              _Prtg.Events.publish('refresh.events.prtg', [true]);
            }
            _Prtg.objectTools.reloadMainMenu();
          });
      });
    } else return $.when({});
  },
  usedbyObject: function usedbyObject(objectid) {
    return _Prtg.Dialogs.loadAlert('/objectusedby.htm', {id:objectid}, {width:parseInt($(window).width() * 0.75, 10)});
  },
  duplicateObject: function duplicateObject(objectid) {
    if (!_Prtg.Options.userIsReadOnly)
      return _Prtg.api.duplicateObj(objectid).done(function() {
        _Prtg.Events.publish('refresh.events.prtg', [true]);
      });
    else return $.when({});
  },
  findDuplicates: function findDuplicates(objectid) {
    if (!_Prtg.Options.userIsReadOnly) {
      var loader = _Prtg.Dialogs.loader(_Prtg.Lang.common.strings.working);
      return _Prtg.api.findDuplicates(objectid, {timeout: 10 * _Prtg.Options.ajaxTimeout}).done(function(resp) {
        loader.dialog("destroy").remove();
        var div = $('<div class="findduplicatesdialog"></div>').append(resp);
        _Prtg.Dialogs.alert(div, _Prtg.Lang.common.strings.findduplicatesresult);
      });
    } else {
      return $.when({});
    }
  },
  cloneObject: function cloneObject(objectid, objecttype, gotoobject) {
    var me = this;
    var data = {
          id: objectid
        };
    if (!_Prtg.Options.userIsReadOnly) {
      return _Prtg.Dialogs.defaultDialog("/duplicate" + objecttype + ".htm", objectid, {
        maxWidth: 600,
        buttonText0: _Prtg.Lang.Dialogs.strings["continue"]
      }).done(function(result, action) {
        data = $.extend(data, result);
        return $.ajax({
          url: action,
          type: "POST",
          data: data
        }).done(function(url) {
          if (!!gotoobject && !!url)
            _Prtg.Hjax.loadLink(url);
          else
        _Prtg.Events.publish('refresh.events.prtg', [true]);
          _Prtg.objectTools.reloadMainMenu();
        });
      });
    } else {
      return $.when({});
    }
  },
  moveObject: function moveObject(objectid) {
    var me = this;
    var data = {
          id: objectid
        };
    if (!_Prtg.Options.userIsReadOnly) {
      return _Prtg.Dialogs.defaultDialog("/moveobject.htm", objectid, {
      }).done(function(result, action) {
        data = $.extend(data, result);
        return $.ajax({
          url: action,
          type: "POST",
          data: data
        }).done(function(html) {
          _Prtg.Events.publish('refresh.events.prtg', [true]);
          _Prtg.objectTools.reloadMainMenu();
        });
      });
    } else return $.when({});
  },
  'addObject0': function addObject0(objecttype, data, init) {
    var self = this;

    if(!!data && data.preselect === 0){
      data.preselect = 1;
    }
    if(objecttype === "autodiscovery" && _Prtg.lastStats.EditionType[0] === "P"){
    		data =  {preselect: null, disabled: 1};
    }
    if (!_Prtg.Options.userIsReadOnly) {
      _Prtg.Dialogs.defaultDialog("/add" + objecttype + "0.htm", data || {preselect:1}).done(function(result, action) {
        _Prtg.objectTools.addObject.apply(self, [result.id, objecttype, {}]);
      });
    }
  },

  addObject: function addObject(objectid, objecttype, extra) {
    var me = this;
    var data = {
          id: objectid
        };
    if (!_Prtg.Options.userIsReadOnly) {
      return _Prtg.Dialogs.defaultDialog("/add" + objecttype + ".htm", $.extend(true, data, extra), {
      }).done(function(result, action) {
        data = $.extend(data, result);
        return $.ajax({
          url: action,
          type: "POST",
          dataType: 'text',
          data: data
        }).done(function(ret) {
          var objid = ret.indexOf(':') > 0 ? parseInt(ret.split(': "')[1], 10) : parseInt(ret, 10);
          if (!!extra && !!extra.redirect && !!objid) {
            var sep = extra.redirect.indexOf('?') > 0 ? '&' : '?';
            _Prtg.Hjax.loadLink(extra.redirect + sep + 'id=' + objid);
          } else
            _Prtg.Events.publish('refresh.events.prtg', [true]);
          _Prtg.objectTools.reloadMainMenu();
        });
      });

    } else {
      return $.when({});
    }
  },
  addRecommendedSensors: function addRecommendedSensors(objectid, data) {
    var me = $(this);
    if (!_Prtg.Options.userIsReadOnly && data.length > 0) {
      var loader = _Prtg.Dialogs.loader(_Prtg.Lang.Dialogs.strings.addingsensors);
      return _Prtg.api.addRecommendedSensors(objectid, data.join(','))
        .always(function(html) {
          loader.dialog('destroy').remove();
        })
        .fail(function(html) {
          _Prtg.Dialogs.alert($('<div>' + html + '</div>'));
        })
        .done(function() {
          _Prtg.Dialogs.alert($('<div>' + _Prtg.Lang.Dialogs.strings.recommedermessage + '</div>'), _Prtg.Lang.Dialogs.strings.recommedermessagetitle);
          _Prtg.Events.publish('refresh.events.prtg', [true]);
        });
    }else return $.when({});
  },
  recommendNow: function recommendNow(objectid) {
    var me = $(this);
    if (!_Prtg.Options.userIsReadOnly && objectid) {
      var loader = _Prtg.Dialogs.loader(_Prtg.Lang.Dialogs.strings.recommederservice);
      _Prtg.api.recommendNow(objectid).done(function(txt) {
        loader.dialog('destroy').remove();
        _Prtg.Dialogs.alert($('<div>' + (txt || _Prtg.Lang.Dialogs.strings.recommedenowmessage) + '</div>'), _Prtg.Lang.Dialogs.strings.recommedermessagetitle)
          .done(function() {
            _Prtg.Events.publish('refresh.events.prtg', [true]);
          });
      });
    }else return $.when({});
  },
  startActivation: function startActivation(button) {
    $(button).fadeTo("slow", 0, function() {
      $(button).parent().parent().addClass(_Prtg.Lang.common.strings.working);
      $('.EMailActivation').removeClass('InitialDisplayNone');
      $('.EMailActivationNode').hide();
    });
    return _Prtg.api.startActivation()
      .done(function() {
        _Prtg.Events.publish('refresh.events.prtg', [true]);
      });
  },
  hideFollowButton: function hideFollowButton() {
    $(".hidefollowbutton").hide();
    return $.ajax({
      type: "POST",
      url: "/editsettings",
      data: "showfollowlinks_=0&id=810"
    }).done(function(response) {
      $("#followprtg").remove();
    });
  },
  openReleaseDialog: function openReleaseDialog($element, options) {
      var dialogHtml = $element,
          dialogWidth = $( window ).width() * 0.6,
          dialogHeight = $( window ).height() * 0.75,
          minHeightSlides = dialogHtml.find('.js-adjustToHeight'),
          slider = dialogHtml.find('.js-slider');

      var dialogOptions= {
          width: dialogWidth,
          height: dialogHeight,
          open: function(){
              slider.slick({
                  dots: true,
                  infinite: false,
                  speed: 300,
                  adaptiveHeight: false
              });

              minHeightSlides.css('height', slider.height() );
          },
          close: function (e, ui) {
              dfd.resolve();
              $(this).dialog('destroy').remove();
          }
      };
      dialogOptions = $.extend( dialogOptions, options );

      var dfd = _Prtg.Dialogs.alert(dialogHtml, dialogHtml.data('dialogTitle'), dialogOptions);

      return dfd;
  },
  sendFeedback: function sendFeedback(url, data) {
    return _Prtg.Dialogs.defaultDialog(url, {})
      .done(function(result, action) {
        var loader = _Prtg.Dialogs.loader(_Prtg.Lang.Dialogs.strings.sendFeedback, {
          resizable: true,
          width: '200px',
          buttons:[{
            html: _Prtg.Lang.Dialogs.strings.hidethiswindow,
            'class': "actionbutton",
            click: function() {
              loader.dialog('destroy').remove();
              loader = null;
              return false;
            }
        }]});

        result._hjax = true;
        result.subject = data.subject;

        $.ajax({
          url: action,
          data: result,
          type: "POST",
          timeout: 100000,
          dataType: "html",
          beforeSend: function(jqXHR) {
            jqXHR.ignoreManager = true;
          }
        }).fail(function() {
        }).done(function(htm) {
          if (!!loader)
            loader.html($(htm).find('.controls-info').html()).dialog({position:'center', width:500}).next().find('.ui-button-text').text(_Prtg.Lang.Dialogs.strings.ok);
        });
      }).fail(function(){});
  },
  hidechanneltabtip: function hidechanneltabtip() {
    $.ajax({
      url: "/api/hidechanneltabtip.htm",
      type: "GET",
      dataType: "html"
    }).fail(function(XMLHttpRequest, textStatus, errorThrown) {
      _Prtg.Growls.add('growlalarms', _Prtg.Lang.common.strings['channeltabtiperror1'], '', 10000, '', '');
      return false;
    }).done(function(response, status, xmlHttpRequest) {
      _Prtg.Growls.add('growlalarms', _Prtg.Lang.common.strings['channeltabtiperror2'], '', 10000, '', '');
      $("#channeltab").hide();
      _Prtg.Plugins['prtg-tabs'].plugin.activateTab(1, true);
    });
  },
  'ticketAdd0': function ticketAdd0(data, init){
     var self = this;
    if (!_Prtg.Options.userIsReadOnly) {
      _Prtg.Dialogs.defaultDialog("/addticket0.htm", data || {preselect:0}).done(function(result, action) {
        _Prtg.objectTools.ticketAdd.apply(self, ['new', result.objectid]);
      });
    }
  },
  ticketAdd: function ticketAdd(id, objid) {
    if (!_Prtg.Options.userIsReadOnly) {
      return _Prtg.Dialogs.defaultDialog('/addticket.htm', {
        id: id,
        objectid: objid
      }).then(function(result, action) {
        var loader = _Prtg.Dialogs.loader();
        return _Prtg.api.ticketAdd('new', {data: result})
          .always(function() {
            loader.dialog('destroy').remove();
          }).done(function(url) {
            _Prtg.Events.publish('refresh.events.prtg');
          });
      });
    } else return $.when({});
  },
  ticketEdit: function ticketEdit(ids) {
    var me = this;
    var ignore = [];
    ids = typeof (ids) === "object" ? $.map(ids, function(ids) {return ids.status < "3" ? ids.objid : (ignore.push(ids.objid), null);}) : [ids];
    if (!_Prtg.Options.userIsReadOnly && ids.length) {
      return _Prtg.Dialogs.defaultDialog('/editticket.htm',
        {
          id: ids.join(','),
          ignore: ignore.join(',')
        }
      ).then(function(result, action) {
        ids.forEach(function(el, ix, ar) {
          ar[ix] = _Prtg.api.ticketEdit(el, result.content, result.subject, result.assigned, result.priority);
        });
        var loader = _Prtg.Dialogs.loader();
        $.when.apply($, ids)
        .always(function() {
          loader.dialog('destroy').remove();
        })
        .done(function() {
          _Prtg.Events.publish('refresh.events.prtg', [true]);
        });
      }, function() {_Prtg.Events.publish('refresh.events.prtg', [true]);});
    } else return $.when({});
  },
  ticketAssign: function ticketAssign(ids, assignedto) {
    var me = this;
    var ignore = [];
    ids = typeof (ids) === "object" ? $.map(ids, function(ids) {return ids.status < "3" ? ids.objid : (ignore.push(ids.objid), null);}) : [ids];
    if (!_Prtg.Options.userIsReadOnly) {
      return _Prtg.Dialogs.defaultDialog(
        '/controls/ticket_assign.htm?action=assign',
        {
          id: ids.join(','),
          assignedto: assignedto || 100,
          ignore: ignore.join(',')
        }
      ).done(function(result, action) {
        var timeout = _Prtg.Options.ajaxTimeout * ids.length;
        ids.forEach(function(el, ix, ar) {
          ar[ix] = _Prtg.api.ticketAssign(el, result.assigned, result.content, {timeout: timeout});
        });
        var loader = _Prtg.Dialogs.loader(_Prtg.Lang.Dialogs.strings['ticketassigning']);
        $.when.apply($, ids)
          .always(function() {
            loader.dialog('destroy').remove();
          })
          .done(function() {
            _Prtg.Events.publish('refresh.events.prtg', [true]);
          });
      });
    } else return $.when({});

  },
  ticketResolve: function ticketResolve(ids) {
    var me = this;
    var ignore = [];
    ids = typeof (ids) === "object" ? $.map(ids, function(ids) {return ids.status < "2" ? ids.objid : (ignore.push(ids.objid), null);}) : [ids];
    if (!_Prtg.Options.userIsReadOnly) {
      return _Prtg.Dialogs.defaultDialog(
        '/controls/ticket_change.htm?action=resolve',
        {
          id:ids.join(','),
          ignore: ignore.join(',')
        }
      ).done(function(result, action) {
        var timeout = _Prtg.Options.ajaxTimeout * ids.length;
        ids.forEach(function(el, ix, ar) {
          ar[ix] = _Prtg.api.ticketResolve(el, result.content, {timeout: timeout});
        });
        var loader = _Prtg.Dialogs.loader(_Prtg.Lang.Dialogs.strings['ticketresolving']);
        $.when.apply($, ids)
          .always(function() {
            loader.dialog('destroy').remove();
          })
          .done(function() {
            _Prtg.Events.publish('refresh.events.prtg', [true]);
          });
      });
    }else return $.when({});
  },
  ticketClose: function ticketClose(ids) {
    var me = this;
    var ignore = [];
    ids = typeof (ids) === "object" ? $.map(ids, function(ids) {return ids.status < "3" ? ids.objid : (ignore.push(ids.objid), null);}) : [ids];
    if (!_Prtg.Options.userIsReadOnly) {
      return _Prtg.Dialogs.defaultDialog(
        '/controls/ticket_change.htm?action=close',
        {
          id:ids.join(','),
          ignore: ignore.join(',')
        }
      ).done(function(result, action) {
        var timeout = _Prtg.Options.ajaxTimeout * ids.length;
        ids.forEach(function(el, ix, ar) {
          ar[ix] = _Prtg.api.ticketClose(el, result.content, {timeout: timeout});
        });
        var loader = _Prtg.Dialogs.loader(_Prtg.Lang.Dialogs.strings['ticketclosing']);
        $.when.apply($, ids)
          .always(function() {
            loader.dialog('destroy').remove();
          })
          .done(function() {
            _Prtg.Events.publish('refresh.events.prtg', [true]);
          });
      });
    }else return $.when({});
  },
  ticketReopen: function ticketReopen(ids) {
    var me = this;
    var ignore = [];
    ids = typeof (ids) === "object" ? $.map(ids, function(ids) {return ids.status >= "2" ? ids.objid : (ignore.push(ids.objid), null);}) : [ids];
    if (!_Prtg.Options.userIsReadOnly) {
      return _Prtg.Dialogs.defaultDialog(
        '/controls/ticket_assign.htm?action=' + _Prtg.Lang.Dialogs.strings['ticketreopen'],
        {
          id:ids.join(','),
          ignore: ignore.join(',')
        }
      ).done(function(result, action) {
        var timeout = _Prtg.Options.ajaxTimeout * ids.length;
        ids.forEach(function(el, ix, ar) {
          ar[ix] = _Prtg.api.ticketReopen(el, result.assigned, result.content, {timeout: timeout});
        });
        var loader = _Prtg.Dialogs.loader(_Prtg.Lang.Dialogs.strings['onemoment']);
        $.when.apply($, ids)
          .always(function() {
            loader.dialog('destroy').remove();
          })
          .done(function() {
            _Prtg.Events.publish('refresh.events.prtg', [true]);
          });
      });
    } else return $.when({});
  },
  ticketPriority: function ticketPriority(ids, prio) {
    var me = this
      , timeout = _Prtg.Options.ajaxTimeout;

    ids = typeof (ids) === "object" ? $.map(ids, function(ids) {return ids.objid;}) : [ids];
    if (!_Prtg.Options.userIsReadOnly) {
      timeout = _Prtg.Options.ajaxTimeout * ids.length;
      ids.forEach(function(el, ix, ar) {
        ar[ix] = _Prtg.api.ticketPriority(el, prio, {timeout: timeout});
      });
      var loader = _Prtg.Dialogs.loader(_Prtg.Lang.Dialogs.strings['onemoment']);
      return $.when.apply($, ids)
        .always(function() {
          loader.dialog('destroy').remove();
        })
        .done(function() {
          _Prtg.Events.publish('refresh.events.prtg', [true]);
        });
    } else return $.when({});
  },
  windows: {
    openWindow: function openWindow(objectid, action) {
      var mywin = window.open("/openwindow.htm?id=" + objectid + "&action=" + action, "PRTG_Window_" + objectid + action, "width=600,height=500,resizable=yes,status=yes,menubar=yes,scrollbars=yes");
      mywin.focus();
    },
    openServiceURLWindow: function openServiceURLWindow(objectid) {
      var serviceUrl;
      var mywin;

      _Prtg.api.getObjectProperty(objectid, 'serviceurl').done(function(response) {
        serviceUrl = $($.parseXML(response)).find('result').text();
        if (serviceUrl !== '') {
          openServiceUrl();
        }
        else {
          _Prtg.Dialogs.defaultDialog('/controls/editserviceurl.htm', {id:objectid}).done(function(response) {
            _Prtg.api.setObjectProperty(objectid, 'serviceurl', response.content).done(function() {
              openServiceUrl();
            });
          });
        }

        function openServiceUrl() {
          mywin = window.open("/gotoserviceurl.htm?id=" + objectid, "PRTG_Window_" + objectid, "width=600,height=500,resizable=yes,status=yes,menubar=yes,scrollbars=yes");
          mywin.focus();
        }
      });
    },
    traceRoute: function traceRoute(objectid, ip) {
      var mywin = window.open("/traceroute.htm?" + (!!ip ? "id=1&ip=" + ip : 'id=' + objectid), "PRTG_Window_trace_route", "width=600,height=500,resizable=yes,status=yes,menubar=yes,scrollbars=yes");
      mywin.focus();
    },
    openRDPWindow: function openRDPWindow(objectid, action) {
      window.top.location.href = "/remotedesktop.rdp?id=" + objectid;
    }
  },
  licenseDeactivation: function licenseDeactivation(){
    if (!_Prtg.Options.userIsReadOnly) {
      _Prtg.Dialogs.confirmDialog(
        _Prtg.Lang.Dialogs.strings.deactivatinglicensetitle,
        _Prtg.Lang.Dialogs.strings.deactivatinglicensequestion)
      .done(function(){
        var loader = _Prtg.Dialogs.loader(_Prtg.Lang.Dialogs.strings.deactivatinglicense, {
          resizable: true,
          width: '200px',
          buttons:[{
            html: _Prtg.Lang.Dialogs.strings.ok,
            'class': "actionbutton hidden",
            click: function() {
              loader.dialog('destroy').remove();
              loader = null;
              document.location.reload();
              return false;
            }
          }]});
        return $.ajax({
          url: '/editlicense',
          data: {
            licenseaction: 'deactivate',
            _hjax: true
          },
          type: "POST",
          timeout: 100000,
          dataType: "text",
          beforeSend: function(jqXHR) {
            jqXHR.ignoreManager = true;
          }
        })
        .always(function(txt) {
          loader.html('<div class="errormessage">'+txt+'</div>').dialog({position:'center', width:500}).next().find('button.actionbutton').removeClass('hidden');
        });
      });
    } else return $.when({});  },
  sslSwitchTo: function sslSwitchTo(){
    $('<div style="text-align: left;" id="switchtossldialog" title="Loading..." style="display: none"><div class="loadspinner"></div></div>')
    .dialog({
    	closeText: "",
      draggable: false,
      resizable: false,
      modal: true,
      width: 500,
      height: 'auto',
      open: function () {
        $("#switchtossldialog").load("controls/switchtossl.htm", function () {
          switch (_Prtg.Options.browser) {
            case "chrome":
              $("#sslnagscreen_sslwarnimg").attr("src", "images/sslwarn_chrome.png");
              $("#sslnagscreen_sslwarnhelplink").attr("href", "/help/ssl_certificate_warning.htm#chrome");
              break;
            case "firefox":
              $("#sslnagscreen_sslwarnimg").attr("src", "images/sslwarn_firefox.png");
              $("#sslnagscreen_sslwarnhelplink").attr("href", "/help/ssl_certificate_warning.htm#firefox");
              break;
            case "msie":
              $("#sslnagscreen_sslwarnimg").attr("src", "images/sslwarn_ie.png");
              $("#sslnagscreen_sslwarnhelplink").attr("href", "/help/ssl_certificate_warning.htm#ie");
              break;
            default:
              $("#sslnagscreen_sslwarnimg").attr("src", "images/sslwarn_ie.png");
              $("#sslnagscreen_sslwarnhelplink").attr("href", "/help/ssl_certificate_warning.htm#chrome");
              break;
          }
          $(this)
          .dialog('option', 'title', _Prtg.Lang.Dialogs.strings.sslTitle)
          .dialog('option', 'buttons', [{
            text: _Prtg.Lang.Dialogs.strings.sslButton,
            class: "actionbutton",
            click: function () {
              $(this).dialog('option', 'buttons', {}).dialog('option', 'title', _Prtg.Lang.Dialogs.strings.sslRestart);
              if(window.location.port === undefined ||  window.location.port === "80" || window.location.port === 80 || window.location.port === "") {
                $("#switchtossldialog").html('<center><div class="loading"><div class="loadspinner small"></div></div></center><br/>' + _Prtg.Lang.Dialogs.strings.sslMessageA + '<br/>');
              } else {
                $("#switchtossldialog").html('<center><div class="loading"><div class="loadspinner small"></div></div></center><br/>'+_Prtg.Lang.Dialogs.strings.sslMessageB+'<a href="' + 'https://' + window.location.hostname + '">'+'https://' + window.location.hostname +'<a><br/>');
              }
              $(this).dialog('option', 'height', 210);
              if(_Prtg) if(_Prtg.Events) _Prtg.Events.stop();
              $.ajax({
                url: "api/switchtossl.htm",
                type: "GET",
                timeout: 10000,
                success: function () {
                  connectionTestRequestSent = true;
                  $(document).off("ajaxError");
                  if(window.location.port === undefined ||  window.location.port === "80" || window.location.port === 80 || window.location.port === "") {
                    setTimeout(checkConnection, 30000);
                  }
                },
                error: function () {
                  $("#switchtossldialog")
                  .html('Error')
                  .dialog('option', 'buttons', [{
                    text: _Prtg.Lang.Dialogs.strings.cancel,
                    click: function () {
                      $(this).dialog("close");
                      $("#switchtossldialog").remove();
                    }
                  }
                  ]);
                }
              });

              var reconnectTrys = 0;
              var checkConnection = function () {
                $.ajax({
                  url: "http://" + window.location.hostname + "/checkrunning",
                  dataType: "html",
                  success: function () {
                    if (reconnectTrys < 5) {
                      setTimeout(checkConnection, 1000);
                    } else {
                      $("#switchtossldialog").dialog("close");
                      window.location.href = "https://" + window.location.hostname
                    }
                  },
                  error: function (xhr, text, error) {
                    $("#switchtossldialog").append(".");
                    setTimeout(checkConnection, 2000);
                  },
                  complete: function (xhr, text) {
                    reconnectTrys = reconnectTrys + 1;
                  }
                });
              }
            }
          },
          {
            text: _Prtg.Lang.Dialogs.strings.cancel,
            class: "button btngrey",
            click: function () {
              $(this).dialog("close").remove();
            }
          }]);
        });
      },
      close: function () {
        $(this).remove();
      }
    });
  },
  sslHideNagscreen: function sslHideNagscreen(){
    $.ajax({
      url: "/api/hidesslnagscreen.htm",
      type: "GET",
      dataType: "html",
      error: function error(XMLHttpRequest, textStatus, errorThrown) {
        _Prtg.Growls.add('growlalarms',_Prtg.Lang.Dialogs.strings.sslGrowlA,'',10000,'','');
        return false;
      },
      success: function success(response, status, xmlHttpRequest) {
        _Prtg.Growls.add('growlalarms',_Prtg.Lang.Dialogs.strings.sslGrowlB,'',10000,'','');
      }
    });
  }
};
