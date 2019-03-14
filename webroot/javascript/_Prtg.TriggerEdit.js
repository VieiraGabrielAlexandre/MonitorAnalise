(function($, window, document, undefined) {
    var pluginName = 'triggeredit',
        viewContext;

    function triggerEdit(element, data, parent) {
        viewContext = data.nodetype;
        var self = this;
        this.element = element;
        this.$element = $(element);

        this.data = data;
        this.parent = parent;

        this.objId = data.objid;
        this.nodetype = data.nodetype;
        this.nodename = data.nodename;
        this.mode = "view";

        this.templates = {
            "state": $.jqotec('#statetriggertemplate', '*'),
            "speed": $.jqotec('#speedtriggertemplate', '*'),
            "volume": $.jqotec('#volumetriggertemplate', '*'),
            "threshold": $.jqotec('#thresholdtriggertemplate', '*'),
            "change": $.jqotec('#changetriggertemplate', '*')
        };

        this.addTriggerTemplateData = [];


        if (this.nodetype !== "library" && this.nodename !== 'Root') {
            data.inherited = this.loadDataFromHtmlComment('triggerinherited');
            this.renderInheritedTemplates(data.inherited, 'trigger', '#inheritedtriggertabledata');

            if (this.nodetype === "sensor") {
                data.libinherited = this.loadDataFromHtmlComment('triggerlibinherited');
                this.renderInheritedTemplates(data.libinherited, 'libtrigger', '#inheritedlibtriggertabledata');
            } else {
                $("#inheritedlibtriggertable, .inheritedlibtriggertable").hide();
            }
        } else {
            $(".inheritedtriggertable, .inheritedlibtriggertable").hide();
        }

        data.dataobj = this.loadDataFromHtmlComment('triggerdataobj');

        self.renderTemplates(data.dataobj);

        if (typeOf(data.dataobj.data) === "Array") {
            for (var i = 0; i < data.dataobj.data.length; i++) {
                data.dataobj.data[i] = self.prepareTemplateData(data.dataobj.data[i]);
                $("#triggertabledata").append($.jqote(self.templates[data.dataobj.data[i].type], data.dataobj.data[i]));
            }
            if (data.dataobj.readonly) $("#triggertable .editcolumn").remove();

        } else {
            self.checkForEmptyTrigger("#triggertabledata");
        }

        // TODO: Look over it
        $("#triggertabledata tr").each(function() {
            self.checkForNoNotification($(this));
        });
        $("#inheritedtriggertabledata tr").each(function() {
            self.checkForNoNotification($(this));
        });

        self.checkForEmptyTrigger('#inheritedtriggertabledata');
        self.checkForEmptyTrigger('#inheritedlibtriggertabledata');


        $(".savetriggerbutton, .canceltriggersavebutton, .triggers_thresholdedithelp").hide();

        self.initEvents();

    }

    triggerEdit.prototype.loadDataFromHtmlComment = function(commentid) {
        var $comment = $('#' + commentid);
        var comment = $.trim($comment.html());
        var commentLength = comment.length;
        var dataBegin = comment.indexOf('{');
        var data;
        data = JSON.parse(comment.substr(dataBegin, commentLength - 3 - dataBegin));
        $comment.remove();
        return data;
    };

    triggerEdit.prototype.initEvents = function() {
        var self = this;
        this.$element
            .on("change", 'input[name="inherittriggers_"]', { self: this }, this.eventHandler.inheritanceChange)
            .on("click", "#addbuttons button", { self: this }, this.eventHandler.addTriggerButtonHandler)
            .on("click", ".modificationbutton", { self: this }, this.eventHandler.editButtonsHandler)
            .on("change", '.statetrigger .combo:first-child', function(event) {
                var $this = $(this);
                $this.parents('form').find('.selected_status').text($this.children(':selected').text());
            })
            .on("click", "th", { self: this }, function(event) {
                var $this = $(this);
                var self = event.data.self;
                if ($this.attr("sort") !== "") {
                    self.sortColumn($this.attr("sort"), $this.attr("sortorder"), $this.parent().parent().parent().attr("id") + "data");
                    $this.attr("sortorder", ($this.attr("sortorder") === "asc" ? "desc" : "asc"));
                    $("img", $this).toggleClass("ui-icon-triangle-1-s").toggleClass("ui-icon-triangle-1-n");
                }
                return false;
            })
            .on("keypress", 'form input', function(e) {
                // Save changes with enter submit in an input
                if (e.which == 13) {
                    $(this).parents('tr').find('.savetriggerbutton').click();
                    return false;
                }
            }).on("click", '.notificationlink', { self: this }, function(e) {
                if (self.mode == "edit") { return; }
                e.preventDefault();
                _Prtg.objectTools.editSettingsDialog.call(this,'/controls/editnotification.htm?id=' + $(this).data("id")).then(function(result, action) {
                    $('.tab-active').click();
                });
                    
                return false;
            });
    };

    triggerEdit.prototype.eventHandler = {
        "addTriggerButtonHandler": function(event) {
            var self = event.data.self;
            var addType = $(this).attr("triggertype");

            $("#triggertabledata").append($.jqote(self.templates[addType], self.addTriggerTemplateData[addType]));
            self.checkForEmptyTrigger.call(self, "#triggertabledata");

            var elm = self.$element.find('.statetrigger[subid="new"]');
            elm.find('.selected_status').text(elm.find("form #nodest_new").children(':selected').text());

            //$(".actionbutton").button();
            self.editColumn.call(self, $('tr[subid="new"]', '#triggertable'));
            $(".addtriggerbuttons").hide();
        },
        "editButtonsHandler": function(event) {
            var self = event.data.self;
            var $this = $(this);
            event.preventDefault();

            if ($this.hasClass("savetriggerbutton")) {
                self.saveColumn.call(self, $(this).parent().parent().parent(), $this);
            } else if ($this.hasClass("canceltriggersavebutton")) {
                self.cancelEditColumn.call(self, $(this).parent().parent().parent(), $this);
            } else if ($this.hasClass("edittriggerbutton")) {
                self.editColumn.call(self, $(this).parent().parent().parent(), $this);
            } else if ($this.hasClass("deletetriggerbutton")) {
                var delSubId = $(this).attr("subid");
                var $column = $(this).parent().parent().parent();
                $("#dialog-del-confirm").dialog({
                		closeText: "",
                    resizable: false,
                    height: 171,
                    modal: true,
                    buttons: [{
                        text: _Prtg.Lang.common.strings['delete'],
                        'class': "actionbutton",
                        click: function() {
                            $(this).dialog("close");
                            self.toggleAjaxIndicator($column, true);
                            self.deleteTrigger(delSubId);
                        }
                    }, {
                        text: _Prtg.Lang.common.strings.cancel,
                        'class': "button btngrey",
                        click: function() {
                            $(this).dialog("close");
                        }
                    }]
                });
            }
        },
        "inheritanceChange": function(event) {
            // TODO: Disable input while ajaxing
            var self = event.data.self;
            $('label[for="inherittriggers_"]').append('<span class="saveindicator loading"><span class="loadspinner"></span></span>');
            $.ajax({
                url: "editsettings?",
                type: "POST",
                data: {
                    "inherittriggers_": $(this).attr("value"),
                    "id": self.objId
                }
            }).done(function(response) {
                var responseJson;
                try {
                    responseJson = jQuery.parseJSON(response);
                    setTimeout(function() {
                        $(".saveindicator").remove();
                    }, 500);
                } catch (err) {
                    window.location.href = "editsettings?inherittriggers_=" + value + "&id=" + self.objId;
                }
            });
        }
    };

    triggerEdit.prototype.renderInheritedTemplates = function(data, root, selector) {
        if (data === undefined) return;
        var inheriTriggerdata = [];
        var i;

        // Data preperation
        for (i = 0; i < data.treesize; i++) {
            inheriTriggerdata.push(data[root][i]["content"]);
        }

        for (i = 0; i < inheriTriggerdata.length; i++) {
            for (var prob in inheriTriggerdata[i]) {
                if (prob === "offnotificationid" || prob === "onnotificationid" || prob === "escnotificationid") {
                    if (inheriTriggerdata[i][prob].split("|")[0] === "-1") {
                        inheriTriggerdata[i][prob] = _Prtg.Lang.triggerEdit.strings.nonotifi;
                        inheriTriggerdata[i][prob] = '<span class="readtrigger" data-id="new" href="/editnotification.htm?id=new">' +_Prtg.Lang.triggerEdit.strings.nonotifi + '</span>';              
                    } else {
                        var splitData = inheriTriggerdata[i][prob].split("|");
                        inheriTriggerdata[i][prob] = '<span title="' + _Prtg.Lang.triggerEdit.strings.editnotificationtemplate + '" class="readtrigger notificationlink" data-id="' + splitData[0] + '" href="/editnotification.htm?id=' + splitData[0] + '">' + splitData[1] + '<i class="glyph-edit"></i></span>';
                    }
                } else {
                    if (prob == "nodest") inheriTriggerdata[i][prob + '_original'] = inheriTriggerdata[i][prob];
                    if (prob !== "type" && prob !== "objectlink" && prob !== "typename") {
                        inheriTriggerdata[i][prob] = '<span class="readtrigger">' + inheriTriggerdata[i][prob] + '</span>';
                    }
                }
            }
            inheriTriggerdata[i]["objectlink"] = _Prtg.Util.urlDecodeString(inheriTriggerdata[i]["objectlink"]);
        }

        // Actual template rendering
        for (i = 0; i < inheriTriggerdata.length; i++) {
            $(selector).jqoteapp(this.templates[inheriTriggerdata[i].type], inheriTriggerdata[i]);
        }
    };

    triggerEdit.prototype.fetchTemplateData = function(triggertype) {
        var self = this;
        $.ajax({
            url: "/api/newtrigger.json",
            type: "GET",
            dataType: "JSON",
            data: {
                "class": triggertype,
                "parid": self.objId
            }
        }).done(function(response) {
            self.addTriggerTemplateData[triggertype] = self.prepareTemplateData(response);
        });
    };

    triggerEdit.prototype.prepareTemplateData = function(dataNew) {
        var data = dataNew;
        data.viewContext = viewContext;
        for (var prob in data) {
            if (!_Prtg.Util.endsWithSuffix(prob, "_input") && data[prob + "_input"]) {
                if (prob === "offnotificationid" || prob === "onnotificationid" || prob === "escnotificationid") {
                    if (data[prob].split("|")[0] === "-1") {
                        data[prob] = _Prtg.Lang.triggerEdit.strings.nonotifi;
                        data[prob] = '<span class="readtrigger" data-id="new" href="/editnotification.htm?id=new">' +_Prtg.Lang.triggerEdit.strings.nonotifi + '</span><span class="edittrigger hide">';
                        
                        var $selectbox = $(data[prob + "_input"]);
                        $selectbox = $('<div>').append($selectbox.clone()).remove().html();
                        data[prob] = data[prob] + $selectbox;
                    } else {
                        var splitData = data[prob].split("|");
                        data[prob] = '<span title="' + _Prtg.Lang.triggerEdit.strings.editnotificationtemplate + '" class="readtrigger notificationlink" data-id="' + splitData[0] + '" href="/editnotification.htm?id=' + splitData[0] + '">' + splitData[1] + '<i class="glyph-edit"></i></span><span class="edittrigger hide">' + (data[prob + "_input"]);
                    }
                } else {
                    if (prob == "nodest") data[prob + '_original'] = data[prob];
                    data[prob] = '<span class="readtrigger">' + data[prob] + '</span><span class="edittrigger hide">' + data[prob + "_input"];
                }
                data[prob] = data[prob] + "</span>";
            }
        }
        return data;
    };

    triggerEdit.prototype.renderTemplates = function(triggerData) {
        if (!triggerData.readonly) {
            $(".addtriggerbuttons").hide();
            for (var i = 0; i < triggerData.supported.length; i++) {
                $("#add" + triggerData.supported[i] + "button").show();
                this.fetchTemplateData(triggerData.supported[i]);

                if(triggerData.supported.length > 0) {
                    $('.js-triggerbutton-trigger').show();
                }
            }
            $(".addtriggerbuttons:hidden").remove();
        } else {
            $(".addtriggerbuttons").remove();
        }
    };

    triggerEdit.prototype.showAfterSaveButtons = function(subid) {
        var $newColumn;
        var self = this;
        if (self.mode !== "view") {
            $newColumn = $('tr[subid="' + subid + '"]');
            $newColumn.find(".edittriggerbutton").hide();
            $newColumn.find(".deletetriggerbutton").hide();
            $newColumn.find(".savetriggerbutton, .canceltriggersavebutton, .triggers_thresholdedithelp").hide();
        } else {
            $newColumn = $('tr[subid="' + subid + '"]');
            $newColumn.find(".savetriggerbutton, .canceltriggersavebutton, .triggers_thresholdedithelp").hide();
        }
        $(".addtriggerbuttons").show();
    };

    triggerEdit.prototype.saveColumn = function($column, $savebutton) {
        this.mode = "view";
        this.$element.find(".notificationlink").removeClass("disabled");
        $column.find(".edittrigger").removeClass("showinline").addClass("hide");
        $column.find(".readtrigger").removeClass("hide");
        $column.find(".canceltriggersavebutton").hide();

        // TODO: $savebutton.hide();
        this.toggleAjaxIndicator($column, true);
        var $allOtherColumns = $('tr[subid!="' + $column.attr("subid") + '"]');
        $allOtherColumns.find(".edittriggerbutton").show();
        $allOtherColumns.find(".deletetriggerbutton").show();

        $column.find(".edittriggerbutton").hide();

        $column.find(".typecolumn, .notificationcolumn, .editcolumn").addClass('highlight');

        if ($savebutton.attr("subid") === "new") {
            this.addTrigger($savebutton.attr("triggertype"));
        } else {
            this.saveTrigger($savebutton.attr("subid"));
        }

        // TODO
        this.checkForEmptyTrigger("#triggertabledata");
    };

    triggerEdit.prototype.cancelEditColumn = function($column) {
        this.mode = "view";
        this.$element.find(".notificationlink").removeClass("disabled");
        if ($column.attr("subid") === "new") {
            $column.remove();
        } else {
            $column.find(".edittrigger").removeClass("showinline").addClass("hide");
            $column.find(".readtrigger").removeClass("hide");
            $column.find(".savetriggerbutton").hide();
            $column.find(".triggers_thresholdedithelp").hide();
            $column.find(".canceltriggersavebutton").hide();
        }

        $(".deletetriggerbutton").show();
        $(".edittriggerbutton").show();

        $column.find(".typecolumn, .notificationcolumn, .editcolumn").removeClass('highlight');
        $(".addtriggerbuttons").show();
        this.checkForEmptyTrigger("#triggertabledata");
    };

    triggerEdit.prototype.editColumn = function($column, $editbutton) {
        this.mode = "edit";
        this.$element.find(".notificationlink").addClass("disabled");
        $column.find(".typecolumn, .notificationcolumn, .editcolumn").addClass('highlight');
        $(".addtriggerbuttons").hide();
        $column.find(".edittrigger").removeClass("hide").addClass("showinline");
        $column.find(".readtrigger").addClass("hide");
        $column.find(".readtrigger").addClass("hide");
        $(".edittriggerbutton").hide();
        $(".deletetriggerbutton").hide();
        $column.find(".savetriggerbutton").show();
        $column.find(".triggers_thresholdedithelp").show();
        $column.find(".canceltriggersavebutton").show();
    };

    triggerEdit.prototype.addTrigger = function(triggerType) {
        this.subid = "new";
        var self = this;
        var data = $("form[subid='" + this.subid + "']", '#triggertable').serialize();
        data = data + "&subid=" + this.subid + "&objecttype=nodetrigger&class=" + triggerType + "&ajaxrequest=1&id=" + this.objId;

        $("tr[subid='" + this.subid + "'] td", '#triggertable').addClass('saving');

        return $.ajax({
            url: "editsettings?" + data,
            type: "POST",
            beforeSend: function(jqXHR) {
                jqXHR.gotoAfterError = window.location.href;
            }
        }).done(function(response, textStatus) {
            var responseJson;
            // try {
            responseJson = jQuery.parseJSON(response);
            $.when(self.loadSingleTrigger(responseJson.subid, true)).then(function() {
                self.checkForNoNotification($('tr[subid="' + responseJson.subid + '"]'));
                self.showAfterSaveButtons.call(self, responseJson.subid);
            });
        });
    };

    triggerEdit.prototype.saveTrigger = function(subid) {
        var self = this;
        var data = $("form[subid='" + subid + "']", '#triggertable').serialize();
        data = data + "&id=" + self.objId + "&subid=" + subid;

        $("tr[subid='" + subid + "'] td", '#triggertable').addClass('saving');

        return $.ajax({
            url: "editsettings?" + data,
            type: "post",
            beforeSend: function(jqXHR) {
                jqXHR.gotoAfterError = window.location.href;
            }
        }).done(function(response, textStatus) {
            var responseJson;
            responseJson = jQuery.parseJSON(response);
            $.when(self.loadSingleTrigger(subid, false)).done(function() {
                self.checkForNoNotification($('tr[subid="' + subid + '"]'));
                self.showAfterSaveButtons.call(self, subid);
            });
        });
    };

    triggerEdit.prototype.deleteTrigger = function(subid) {
        var self = this;
        $("tr[subid='" + subid + "'] td", '#triggertable').addClass('deleting');
        $.ajax({
            url: "deletesub.htm",
            data: {
                "id": self.objId,
                "subid": subid
            },
            type: "GET"
        }).done(function(response) {
            setTimeout(function() {
                $("tr[subid='" + subid + "']", '#triggertable').remove();
                if (self.mode === "view") {
                    $(".deletetriggerbutton").show();
                    $(".edittriggerbutton").show();
                }
                self.checkForEmptyTrigger("#triggertabledata");
            }, 500);
        });
    };

    triggerEdit.prototype.loadSingleTrigger = function(subid, newtrigger) {
        var self = this;
        return $.ajax({
            url: "/api/triggers.json",
            data: {
                "id": self.objId,
                "subid": subid
            },
            dataType: "JSON",
            type: "GET"
        }).done(function(response) {
            response.data[0] = self.prepareTemplateData(response.data[0]);
            if (newtrigger) subid = "new";
            $("tr[subid='" + subid + "']", '#triggertable').replaceWith($.jqote(self.templates[response.data[0].type], response.data[0]));
        });
    };

    triggerEdit.prototype.checkForEmptyTrigger = function(tableselector) {
        if ($("tr", tableselector).length < 1) {
            $(tableselector).append('<tr class="nodata"><td colspan="3">' + _Prtg.Lang.triggerEdit.strings.notriggersdefined + '</td></tr>');
        } else {
            $(".nodata", tableselector).remove();
            if (tableselector === "#inheritedlibtriggertabledata") {
                $(tableselector).parents("table").after('<div>' + _Prtg.Lang.triggerEdit.strings.libtriggerhelp + '</div>');
            }
        }
    };

    triggerEdit.prototype.checkForNoNotification = function($column) {
        $('span[disabled="true"]', $column).each(function() {
            $(this).css("text-decoration", "underline");
        });
    };

    triggerEdit.prototype.toggleAjaxIndicator = function($column, show) {
        if (this.show) {
            $column.find(".editcolumn").html('<span class="saveindicator"><span class="loadspinner"></span></span>');
        } else {
            $column.find(".editcolumn").remove(".saveindicator");
        }
    };

    triggerEdit.prototype.sortColumn = function(columnClass, order, table) {
        order = order || "asc";
        if (order === "asc") {
            $("#" + table + " > tr").sortElements(function(a, b) {
                return $("." + columnClass, a).text() > $("." + columnClass, b).text() ? 1 : -1;
            });
        } else {
            $("#" + table + " > tr").sortElements(function(a, b) {
                return $("." + columnClass, a).text() < $("." + columnClass, b).text() ? 1 : -1;
            });
        }
    };

    _Prtg.Plugins.registerPlugin(pluginName, triggerEdit);

})(jQuery, window, document);
