(function($) {
    var $ptip = null,
        hoveredA = null,
        activeA = null,
        showTimer = 0,
        loadurl = "",
        animating = false,
        position = null,
        settings = null,
        defaultSettings = {
            "delayShow": 333,
            "timeAnimation": 250,
            "width": 700,
            "height": 550,
            "parent": window
        },
        customSettings;

    $(document).keyup(function(e) {
        if (e.which == 27)
            $.fn.ptip.kill();
    });
    var self;
    if (!$.fn.ptip) {
        self = $.fn.ptip = {
            install: function() {
                settings = $.extend(true, {}, defaultSettings, customSettings || {});
                $ptip = $('<div id="ptip"><div class="body"></div></div>');
                $ptip
                    .hide()
                    .mouseleave(this.hide)
                    .appendTo($('body'))
                    .on('click', '.buttonbox a', self.onToolbarClick);

                $('body')
                    .on({
                        "mouseenter": self.onEnterA,
                        "mouseleave": self.onLeaveA
                    }, "a.sensormenu:not('.nopopup'),a.locationlist,a.devicemenu:not('.nopopup'),a.groupmenu:not('.nopopup'),a.rootgroupmenu:not('.nopopup'),a.probemenu:not('.nopopup')")
                    .on('navigate.prtg', function() { self.kill(); });
            },
            onEnterA: function(e) {
                if (animating || (!!_Prtg.Contextmenu.menu && _Prtg.Contextmenu.menu.children().first().is(':visible'))) // || $(this).is(".menuleft"))
                    return false;
                else
                    self.stopShowTimer();
                position = { left: e.pageX - 10, top: e.pageY - 10, width: 0, height: 0 };
                hoveredA = this;
                $(hoveredA).on('mousemove.ptip', function(e) {
                    position = { left: e.pageX - 10, top: e.pageY - 10, width: 0, height: 0 };
                });
                showTimer = setTimeout(function() {
                    $(hoveredA).off('.ptip');
                    self.show.apply(hoveredA, [position]);
                }, settings.delayShow * ((e.offsetX || e.originalEvent.layerX) > 16 ? 10 : 1));
            },
            onLeaveA: function() {
                // if (showTimer)
                self.stopShowTimer();
                $(hoveredA).off('mousemove.ptip');
            },
            onToolbarClick: function(e) {
                e.preventDefault();
                $ptip.hide();
                _Prtg.Contextmenu.bindings[$(this).attr("href")].call(activeA, activeA);
            },
            onScaleComplete: function() {
                animating = false;
                $('body').off('mousemove.ptip');
            },
            stopShowTimer: function() {
                clearTimeout(showTimer);
                showTimer = 0;
            },
            setPosition: function(position) {
                var $viewport = $(settings.parent),
                    viewportOffset = $viewport.offset() || { top: -10, left: -10 };

                viewportOffset.top += $viewport.scrollTop();
                viewportOffset.left += $viewport.scrollLeft();

                if(position.left + settings.width > viewportOffset.left + $viewport.outerWidth()
				|| position.left < viewportOffset.left){
					position.left =  viewportOffset.left + $viewport.outerWidth() - settings.width;
					position.left = position.left  < viewportOffset.left ? viewportOffset.left : position.left;
				}
				if(position.top + settings.height > viewportOffset.top + $viewport.outerHeight()
				|| position.top < viewportOffset.top)
				{
					position.top = viewportOffset.top + $viewport.outerHeight() - settings.height;
					position.top = position.top < viewportOffset.top ? viewportOffset.top : position.top;
				}
            },
            getBody: function($object) {
                var myurl = "";
                var type = 0;
                var myid = $object.attr('id') || $object.attr('objid') || $object.attr('data-id');
                var graph = '';
                var title = '';
                var fixed = $object.is(".fixed") || '';
                var html;
                var tooltipContext;

                if ($object.is(".sensormenu")) {
                    type = 1;
                    cmdPrefix = 'sensor';
                    myurl = '/controls/sensortooltip.htm?id=' + myid;
                    tooltipContext = 'sensor';
                } else if ($object.is(".locationlist")) {
                    type = 0;
                    cmdPrefix = '';
                    myurl = $object.attr('href').replace(/device/g, 'geomapdevice');
                    title = $object.parent().attr('data-title') || $object.parent().attr('title');
                    tooltipContext = 'locationlist';
                } else if ($object.is(".devicemenu")) {
                    type = 2;
                    cmdPrefix = 'device';
                    myurl = '/controls/devicetooltip.htm?id=' + myid;
                    tooltipContext = 'device';
                } else if ($object.is(".sensorsmenu")) {
                    type = 0;
                    cmdPrefix = '';
                    myurl = '/controls/devicestooltip.htm?id=' + myid;
                    tooltipContext = 'sensor';
                } else if ($object.is(".filtermenu")) {
                    type = 0;
                    cmdPrefix = '';
                    myurl = $object.attr('href').replace(/filter.htm/g, '/controls/libraryfiltertooltip.htm');
                    tooltipContext = 'filtermenu';
                } else if ($object.is(".groupmenu")) {
                    type = 3;
                    cmdPrefix = 'group';
                    myurl = '/controls/grouptooltip.htm?id=' + myid;
                    tooltipContext = 'group';
                } else if ($object.is(".probemenu")) {
                    type = 4;
                    cmdPrefix = 'probe';
                    myurl = '/controls/grouptooltip.htm?id=' + myid;
                    tooltipContext = 'probe';
                } else if ($object.is(".rootgroupmenu")) {
                    type = 4;
                    cmdPrefix = 'rootgroup';
                    myurl = '/controls/groupdata.htm?id=' + myid;
                    tooltipContext = 'root-group';
                }
                var toolbar = "<div class='ptip-toolbar'><a class='tab'>" + title + "</a><div class='buttonbox'>";

                if (type > 0) {
                    if (!_Prtg.Options.userIsReadOnly) {
                        var ids = [cmdPrefix + "detail", cmdPrefix + "edit", cmdPrefix + "notifications", cmdPrefix + "rename", "pausenowcomment", "resumenow", fixed + "dodelete", "check", "addfavorite", "removefavorite"];
                        for (var i = 0; i < ids.length; i++) {
                            var itm = _Prtg.Contextmenu.menuCommands[ids[i]];
                            if (!!itm)
                                toolbar += "<a href='" + itm.id + "' class='" + itm.id + "' title='" + itm.caption + "'><i class='icon-dark " + itm.ui + "'/></a>";
                        }
                    }
                }
                toolbar += "</div></div>";
                html = toolbar + '<div class="content"><div class="ptip-loaded-content loading ' + (tooltipContext ? tooltipContext + '-context' : '') + '" loadurl="' + myurl + '"><div class="loadspinner"></div></div></div>';
                loadurl = myurl;
                return html;
            },
            hide: function() {
                !!$ptip && $ptip.hide();
            },
            show: function(position) {
                var a = $(this),
                    x = position.left,
                    y = position.top;

                self.stopShowTimer();
                hoveredA = null;
                if (a.parents("#ptip").length > 0 || _Prtg.Options.connectionLost) return;
                $ptip
                    .css("opacity", 0)
                    .attr("class", a.attr("class"))
                    .children()
                    .first()
                    .html(self.getBody(a))
                    .end()
                    .find(".tab")
                    .attr("href", a.attr("href"))
                    .html(a.text() || undefined)
                    .css('cssText',
                        "background-image:" + a.css("background-image") + ";"
                    )
                    .addClass('newtree');
                if ($ptip.find(".tab").css("background-position").indexOf('%') > -1)
                    $ptip.find(".tab").css("background-position", "");
                $ptip.find('.loading').load(loadurl, { _hjax: true },
                    function() {
                        $(this).removeClass('loading');
                        _Prtg.initPlugins($ptip);
                    });
                self.setPosition(position);

                $('body').on('mousemove.ptip', function(e) {
                    if (e.pageX < position.left ||
                        e.pageY < position.top)
                        self.kill();
                });

                animating = true;
                $ptip
                    .show()
                    .css("top", y)
                    .css("left", x)
                    .animate({
                            top: position.top,
                            left: position.left,
                            opacity: 1
                        },
                        settings.timeAnimation,
                        self.onScaleComplete);
                activeA = a;
            },
            kill: function() {
                self.hide();
                self.stopShowTimer();
                $(hoveredA).off('.ptip');
                $('body').off('.ptip');
                hoveredA = null;
            },
            killPopups: function() {
                $.fn.ptip.kill();
                $('body .tooltip, body .popover').remove();
                $('#jqContextMenu').hide();
            },
            setCustomOptions: function(options) {
                customSettings = options || {};
            }
        };
    }
    _Prtg.Tip = self;
})(jQuery);
//TODO: bind only when window has focus?