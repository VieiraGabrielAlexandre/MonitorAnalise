//_Prtg.Toplists.Plugin.js
(function($, window, document, undefined) {
  var pluginName = 'toplists';

  function Plugin(element, data, parent) {
    this.element = $(element);
    this.data = data;
    this.parent = parent;
    this.init(this);
  }

  Plugin.prototype.init = function(me) {
    me.element.on('click', '.toplistsettings.add', function addToplist(e) {
      var data = $(e.target).data();
      _Prtg.Dialogs.defaultDialog("/controls/toplistadd.htm", {
        id: data.id,
        subid: 'new'
      }, {
        buttonText0: _Prtg.Lang.common.strings.save
      }).done(function(result) {
        result = $.extend(true, result, {
          targeturl: ''
        });
        return $.post("editsettings", result).done(function() {
          $('.refresh-on-change', me.parent).each(function() {
            $(this).load($(this).attr('refreshurl'), function() {
              _Prtg.initPlugins($(this));
            });
          });
        });
      }).fail(function() {});
    }).on('click', '.toplistsettings .editsetting', function editToplist(e) {
      var data = $(e.target.parentElement).data();
      _Prtg.Dialogs.defaultDialog("/controls/toplistedit.htm", {
        id: data.id,
        subid: data.subid
      }, {
        buttonText0: _Prtg.Lang.common.strings.save
      }).done(function(result) {
        result = $.extend(true, result, {
          targeturl: ''
        });
        return $.post("editsettings", result).done(function() {
          $('.refresh-on-change', me.parent).each(function() {
            $(this).load($(this).attr('refreshurl'), function() {
              _Prtg.initPlugins($(this));
            });
          });
        }).fail(function() {});
      }).fail(function() {});
    }).on('click', '.toplistsettings .delete', function deleteToplist(e) {
      var data = $(e.target.parentElement).data();
      _Prtg.Dialogs.defaultDialog("/controls/toplistdelete.htm", {
        id: data.id,
        subid: data.subid
      }, {
        width: 300,
        buttonText0: _Prtg.Lang.common.strings['delete']
      }).done(function(result) {
        return $.post("/api/toplistdelete.htm", result).done(function() {
          if (document.location.href.indexOf('subid=' + data.subid) > -1) _Prtg.Hjax.loadLink(document.location.href.replace(/&subid=\d+|subid=\d+&/gi, ""), "linkloader.prtg", me.element, true);
          else $('.refresh-on-change', me.parent).each(function() {
            $(this).load($(this).attr('refreshurl'), function() {
              _Prtg.initPlugins($(this));
            });
          });
        });
      }).fail(function() {});
    }).on('click', '.toplistitem,.showtoplist', {
      namespace: "linkloader.prtg",
      container: me.element
    }, _Prtg.Hjax.linkClickHandler);
  };
  $.fn[pluginName] = function(options, parent) {
    return this.each(function() {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" + pluginName, new Plugin(this, options, parent));
      }
    });
  };
})(jQuery, window, document);
