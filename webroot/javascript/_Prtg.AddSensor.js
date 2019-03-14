(function($) {
  var AddSensor = function() {
      var Families = [],
        SensorTypes, objId, searchInProgress = false,
        ObjStatus, SensorTemplate, FilterTemplate, SensorlistTemplate, Categories = [], isSmallProbe = false;

      var init = function(SensorsObj, deviceId, deviceStatus) {
          objId = deviceId;
          if(SensorsObj["smallprobe"]) isSmallProbe = true;
          Families = SensorsObj["familys"] || [];
          SensorTypes = SensorsObj["sensortypes"] || [];
          SensorTemplate = $.jqotec('#addsensor_listview', '*');
          FilterTemplate = $.jqotec('#addsensor_filterview', '*');
          SensorlistTemplate = $.jqotec('#addsensor_sublist', '*');
          ObjStatus = deviceStatus;
          Categories = [{
            "type": "istop10",
            "text": "<h2>"+_Prtg.Lang.addSensor.strings.cat_top10+"</h2>"
          }, {
            "type": "normal",
            "text": "<h2>"+_Prtg.Lang.addSensor.strings.cat_normal+"</h2>"
          }, {
            "type": "probeconn",
            "text": "<h2>"+_Prtg.Lang.addSensor.strings.cat_probeconn+"</h2>"+_Prtg.Lang.addSensor.strings.cat_probeconn2
          }, {
            "type": "probedevice",
            "text": "<h2>"+_Prtg.Lang.addSensor.strings.cat_probedevice+"</h2>"+_Prtg.Lang.addSensor.strings.cat_probedevice2
          }, {
            "type": "clusternode",
            "text": "<h2>"+_Prtg.Lang.addSensor.strings.cat_clusternode+"</h2>"+_Prtg.Lang.addSensor.strings.cat_clusternode
          }, {
            "type": "validvm",
            "text": "<h2>"+_Prtg.Lang.addSensor.strings.cat_validvm+"</h2>"+_Prtg.Lang.addSensor.strings.cat_validvm2
          }, {
            "type": "validwindows",
            "text": "<h2>"+_Prtg.Lang.addSensor.strings.cat_validwindows+"</h2>"+_Prtg.Lang.addSensor.strings.cat_validwindows2
          }, {
            "type": "validlinux",
            "text": "<h2>"+_Prtg.Lang.addSensor.strings.cat_validlinux+"</h2>"+_Prtg.Lang.addSensor.strings.cat_validlinux2
          }, {
            "type": "dotnetversion",
            "text": "<h2>"+_Prtg.Lang.addSensor.strings.cat_dotnetversion+"</h2>"+_Prtg.Lang.addSensor.strings.cat_dotnetversion2
          }, {
            "type": "isv6host",
            "text": "<h2>"+_Prtg.Lang.addSensor.strings.cat_isv6host+"</h2>"
          }, {
            "type": "islinux",
            "text": "<h2>"+_Prtg.Lang.addSensor.strings.cat_islinux+"</h2>"+_Prtg.Lang.addSensor.strings.cat_islinux2
          }, {
            "type": "needslocalprobe",
            "text": "<h2>"+_Prtg.Lang.addSensor.strings.cat_needslocalprobe+"</h2>"+_Prtg.Lang.addSensor.strings.cat_needslocalprobe2
          }, {
            "type": "notonpod",
            "text": "<h2>"+_Prtg.Lang.addSensor.strings.cat_notonpod+"</h2>"+_Prtg.Lang.addSensor.strings.cat_notonpod2
          }];

          prepareDataAndElements();
          initEvents();
          $("#addsensor_searchinput").focus();
        };

      var top10Visible = function() {
        return $('#addsensor_list_istop10').find('.addsensor_sensorcontainer.addsensor:visible').length;
      };

      var prepareDataAndElements = function() {
          var i;
          var content = "";
          for (i = 0; i < Categories.length; i++) {
              content = content + $.jqote(SensorlistTemplate, Categories[i]);
          }
          $("#addsensor_list").html('').html(content);
          for (i = 0; i < SensorTypes.length; i++) {
            SensorTypes[i]["index"] = i;
            SensorTypes[i]["show"] = true;
            SensorTypes[i]["disabled"] = false;
            SensorTypes[i]["searchresult"] = false;
            SensorTypes[i]["description"] = SensorTypes[i]["description"].replace(/\\'/g, "");
            if (SensorTypes[i]["help"] === '') {
              SensorTypes[i]["help"] = _Prtg.Lang.addSensor.strings.noHelpText;
            } else {
              SensorTypes[i]["help"] = SensorTypes[i]["help"].replace(/\\/g, "");
            }
            findCategorie(SensorTypes[i]);

            SensorTypes[i]["$elm"] = $($.jqote(SensorTemplate, SensorTypes[i]));
            SensorTypes[i]["$elm"].data("id", i);
            $("#addsensor_list_" + SensorTypes[i]["categorie"]).append(SensorTypes[i]["$elm"]);
            if ($("#addsensor_list_" + SensorTypes[i]["categorie"]).parent().hasClass("addsensor_sensorcategoriehide")) {
              $("#addsensor_list_" + SensorTypes[i]["categorie"]).parent().removeClass("addsensor_sensorcategoriehide").addClass("addsensor_sensorcategorieshow");
            }
          }
          if(!isSmallProbe) $("#addsensor_sensorfilter").append($.jqote(FilterTemplate, Families));
          $("#addsensor_resultcount").text((SensorTypes.length - top10Visible()));
        };

      var findCategorie = function(sensorType) {
          if (!ObjStatus["probeconn"] && sensorType["needsprobe"]) {
            sensorType["categorie"] = Categories[2]["type"];
          } else if(ObjStatus["onpodlocalprobe"] && sensorType["notonpod"]) {
            sensorType["categorie"] = Categories[12]["type"];
          } else if (!ObjStatus["probedevice"] && sensorType["needsprobedevice"]) {
            sensorType["categorie"] = Categories[3]["type"];
          } else if (ObjStatus["clusternode"] && sensorType["notincluster"]) {
            sensorType["categorie"] = Categories[4]["type"];
          } else if (!ObjStatus["validvm"] && sensorType["needsvm"]) {
            sensorType["categorie"] = Categories[5]["type"];
          } else if (!ObjStatus["validlinux"] && sensorType["needslinux"]) {
            sensorType["categorie"] = Categories[7]["type"];
          } else if (!ObjStatus["validwindows"] && sensorType["needswindows"]) {
            sensorType["categorie"] = Categories[6]["type"];
          } else if ((sensorType["dotnetversion"] != -1) && (ObjStatus["dotnetversion"] < sensorType["dotnetversion"])) {
            sensorType["categorie"] = Categories[8]["type"];
          } else if (ObjStatus["isv6host"] && !sensorType["ipv6"]) {
            sensorType["categorie"] = Categories[9]["type"];
          } else if (ObjStatus["islinux"] && !sensorType["linux"]) {
            sensorType["categorie"] = Categories[10]["type"];
          } else if(!ObjStatus["localprobe"] && sensorType["needslocalprobe"]) {
            sensorType["categorie"] = Categories[11]["type"];
          } else if(sensorType["top10"]) {
            sensorType["categorie"] = Categories[0]["type"];
          } else {
            sensorType["categorie"] = Categories[1]["type"];
          }

          if ((sensorType["top10"]) && sensorType["categorie"] !== "istop10")
            sensorType["categorie"] = "hide";
        };

      var hideEmptyCate = function() {
          $("#addsensor_list").find(".addsensor_sensorcategorieshow:hidden").show();
          $("#addsensor_list").find(".addsensor_sensorcategorieshow").each(function(index, elm) {
            var oneVisib = false;
            if (index !== 1 ) {
              $("div", this).find("div:visible").each(function() {
                oneVisib = true;
              });
              if (!oneVisib) {
                $(this).hide();
              }
            }
          });
        };

      var initEvents = function() {
          $("#addsensor_sensorfilter").on('click', '.addsensor_filterbutton', function() {
            var $this = $(this);
            if ($this.hasClass("addsensor_filterselected")) {
              $this.removeClass("addsensor_filterselected");
            } else {
              $this.parent().find(".addsensor_filterselected").removeClass("addsensor_filterselected");
              $this.addClass("addsensor_filterselected");
            }
            filterSensors();
          });
          $("#addsensor_list").on('click', '.addsensor', function(e) {
            var $target = $(e.target);
            if (!$target.hasClass("addsensor_sensorhelplink")) {
              var Sensor = SensorTypes[$(this).attr("sensorindex")];
              if (Sensor["preselection"]) {
                $("#addsensor_preselection").append(_Prtg.Util.urlDecodeString(Sensor["preselectionlist"]));
                preselection(Sensor["id"]);
              } else {
                addSensor(Sensor["id"]);
              }
            }
          });
          $("#addsensor_view").on('keyup', '#addsensor_searchinput', _Prtg.debounce(function() {
            search($(this).val());
          },500));
          if($('#addsensor_searchinput').val() !== '')
            search($('#addsensor_searchinput').val());
        };
      var selectedFamily = [];
      var filterSensors = function() {
          var results = 0,
            notVisible = [],
            clickedFilter;
          selectedFamily = [],

          $(".addsensor_filterselected", "#addsensor_sensorfilter").each(function() {
            clickedFilter = $(this).attr("filter");
            selectedFamily.push(clickedFilter); // TODO, nicht jedesmal die ganze liste aufbauen!
          });

          if (selectedFamily.length !== 0) {
            $("#addsensor_headerfiltertext").text(" - " + _Prtg.Lang.addSensor.strings.filtertext + ": " + selectedFamily.join(", "));
          } else {
            $("#addsensor_headerfiltertext").text("");
          }
          for (var i = 0; i < SensorTypes.length; i++) {
            SensorTypes[i]["show"] = true;
            if (selectedFamily.length > 0) {
              for (var j = 0; j < selectedFamily.length; j++) {
                if ($.inArray(selectedFamily[j], SensorTypes[i]["family"]) === -1) {
                  SensorTypes[i]["show"] = false;
                }
              }
              if (SensorTypes[i]["show"]) {
                SensorTypes[i]["$elm"].show();
                results = results + 1;
              } else {
                notVisible.push(SensorTypes[i]["name"]);
                SensorTypes[i]["$elm"].hide();
              }
            } else {
              SensorTypes[i]["$elm"].show();
            }
          }
          if (selectedFamily.length !== 0) {
            $("#addsensor_resultcount").text(results - top10Visible());
          } else {
            $("#addsensor_resultcount").text((SensorTypes.length - top10Visible()));
          }
          if (searchInProgress) {
            search($("#addsensor_searchinput").val());
          }else{
          !!window.__ga && window.__ga("send", "event", "sensorsearch" , "filter", (selectedFamily.join(",")).substring(0,500), $(".addsensor_sensorcontainer:visible").not(".addsensor_disabledsensors").length);

          }
          hideEmptyCate();
        };

      var search = function(text) {
          var i, splitStr, stext=text;
          text = $.trim(text);
          if (text.length < 1) {
            $("#addsensor_headersearchtext").text("");
            $("#addsensor_resultcount").text(SensorTypes.length - top10Visible());
            for (i = 0; i < SensorTypes.length; i++) {
              if (SensorTypes[i]["show"]) {
                SensorTypes[i]["searchresult"] = false;
                SensorTypes[i]["$elm"].show();
              }
            }
            searchInProgress = false;
            filterSensors();
            return;
          }
          var results = 0;
          searchInProgress = true;

          splitStr = text.split(' ');
          text = '';
          for (i = splitStr.length - 1; i >= 0; i--) {
            text = text +'(?=.*?' + splitStr[i] + ')';
          }
          text = text + '^.*$';

          var searchStr = new RegExp(text, "ig");
          if (text.length > 0) {
            $("#addsensor_headersearchtext").text(" - Search: " + text);
          } else {
            $("#addsensor_headersearchtext").text("");
          }
          for (i = 0; i < SensorTypes.length; i++) {
            if (SensorTypes[i]["show"]) {
              if ((SensorTypes[i]["name"] + ' ' + SensorTypes[i]["description"] + ' ' + SensorTypes[i]["help"]).search(searchStr) > -1) {
                SensorTypes[i]["searchresult"] = true;
                SensorTypes[i]["$elm"].show();
                results = results + 1;
              } else {
                SensorTypes[i]["searchresult"] = false;
                SensorTypes[i]["$elm"].hide();
              }
            }
          }
          $("#addsensor_resultcount").text(results - top10Visible());
          hideEmptyCate();

          !!window.__ga && window.__ga("send", "event", "sensorsearch" , "text" + (selectedFamily.length > 0 ? "-filter" : "") , (stext + (selectedFamily.length > 0 ? '-' + selectedFamily.join(",") : "")).substring(0,500), $(".addsensor_sensorcontainer:visible").not(".addsensor_disabledsensors").length);

        };

      var preselection = function(id) {
          if ($('#preselection_' + id).find("option").eq(0).val() === '') {
            $('#preselection_' + id).find("option").eq(0).remove();
          }
          $('#preselection_' + id).attr("size", 10).css("width", "450px").dialog({
          	closeText: "",
            closeOnEscape: false,
            draggable: false,
            resizable: false,
            height: 370,
            modal: true,
            title: _Prtg.Lang.common.strings.selectalibraryfile,
            width: 550,
            zIndex: 8999,
            buttons: [{
              text: _Prtg.Lang.common.strings.ok,
              'class': "actionbutton",
              click: function() {
                $(this).dialog("destroy").hide();
                addSensor(id, true);
              }
            }, {
              text: _Prtg.Lang.common.strings.cancel,
              'class': "button btngrey",
              click: function() {
                $(this).dialog("destroy");
                $(this).remove();
              }
            }]
          });
          $('#preselection_' + id).css("width", "100%");
        };

      var addSensor = function(sensortype, preselection) {
          var urlData = {},
            progressDialog,
            progressInterval,
            addsensorxhr;
          urlData.id = objId;
          urlData.sensortype = sensortype;
          if (preselection !== undefined) {
            urlData["preselection_" + sensortype + "_nolist"] = $("#preselection_" + sensortype).val();
            urlData.sensortype = urlData.sensortype + "_nolist";
          }

          progressDialog = $('<div id="working" class="inline"><p class="loading"><span class="loadspinner"></span></p></div>').dialog({
            closeText: "",
            draggable: false,
            resizable: false,
            width: 350,
            modal: true,
            zIndex: 8999,
            title: $("<div/>").html(_Prtg.Lang.Dialogs.strings.working).text(),
            buttons: [{
              text: _Prtg.Lang.common.strings.cancel,
              'class': "button btngrey",
              'click': function() {
                clearInterval(progressInterval);
                if(addsensorxhr != undefined) addsensorxhr.abort();
                $(this).dialog('close');
                $(this).dialog("destroy");
                $(this).remove();
              }
            }]
          });

          var showprogressbar = function(response) {
            $('#working').html(response);
            progressDialog.dialog('option', 'width', 350);
            progressDialog.dialog('option', 'buttons',
              [{
              	closeText: "",
                text: _Prtg.Lang.common.strings.cancel,
                'class': "button btngrey",
                'click': function() {
                  clearInterval(progressInterval);
                  if(addsensorxhr != undefined) addsensorxhr.abort();
                  $(this).dialog('close');
                  $(this).dialog("destroy");
                  $(this).remove();
                }
              }]
            );
            if ($("#newprogressbar").length > 0) {
              $("#newprogressbar").progressbar({
                value: 0
              });
              progressInterval = setInterval(function() {
                $.ajax({
                  global: false,
                  dataType: "json",
                  url: "/api/getaddsensorprogress.htm?id=" + objId + "&tmpid=" + $('#tempid').val()
                }).done(function(json) {
                  $("#newprogressbar").progressbar({
                    value: json.progress
                  });
                  if (json.progress >= 100) {
                    _Prtg.Events.resume();
                    clearInterval(progressInterval);
                    if(window.winGUI) {
                      window.location.href = 'wingui.htm?action=' + encodeURIComponent(json.targeturl);
                    } else {
				              $('#working').dialog('destroy').remove();
                    	$('#container').addClass('loading').html('<div class="loadspinner"></div>')
                    	_Prtg.Hjax.loadLink(json.targeturl);
                      // window.location.href = json.targeturl;
                    }
                  }
                });
              }, 1000);
            }
          };

          addsensorxhr = $.ajax({
            url: "/controls/addsensor2.htm",
            data: urlData,
            type: "GET",
            success: function(response) {
              $('#working').html(response);
              _Prtg.Events.pause();
              if($('#working').find('form').length > 0) {

                $('#working').on('keypress', function (event) {
                  if (event.keyCode == 13) {
                    $(this).parent().find("button.submit").trigger("click");
                    return false;
                  }
                });

                progressDialog.dialog('option', 'width', 800);
                progressDialog.dialog('option', 'buttons',
                [{
                	closeText: "",
                  text: _Prtg.Lang.Dialogs.strings["ok"],
                  'class': 'actionbutton',
                  click: function (event) {
                    var $form = $('#working').find('form');
                    $form.each(function() {
                      valid = $(this).valid();
                    });
                    if(!valid) { return; }
                    $.ajax({
                      url: $form.attr('action'),
                      data: $form.serializeArray(),
                      type: "POST"
                    }).done(function(response) {
                      showprogressbar(response);
                    });
                  }
                },
                {
                  text: _Prtg.Lang.common.strings.cancel,
                  'class': "button btngrey",
                  'click': function() {
                  clearInterval(progressInterval);
                  if(addsensorxhr !== undefined) addsensorxhr.abort();
                  $(this).dialog('close');
                  $(this).dialog("destroy");
                  $(this).remove();
                }
                }]);
                _Prtg.initPlugins($('#working'));
              } else {
                showprogressbar(response);
              }
            }
          });
        };

      return {
        init: function(data, parent) {
          var sensobj, devstat;
          $.when(
          $.getJSON("/api/sensortypes.json?id=" + data.devid, function(resp) {
            sensobj = resp;
          }), $.getJSON("/api/typesstatus.json?id=" + data.devid, function(resp) {
            devstat = resp;
          })).then(function() {
            init(sensobj, data.devid, devstat);
          });
        },
        ___: "_Prtg.AddSensor"
      };
    };
  $.extend(true, window, {
    _Prtg: {
      Plugins: {
        AddSensor: AddSensor()
      }
    }
  });
})(jQuery);
