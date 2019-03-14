(function($, window, document, undefined) {
//  var pluginName = "prtg-datetimepicker";
//  function Plugin(element, data, parent) {}

  $.widget("prtg.datedialog", $.ui.dialog, {
    options: {
      url: '',
      closeOnEscape: true,
      draggable: false,
      resizable: false,
      modal: true,
      minWidth: 550,
      minHeight: 100,
      maxHeight: parseInt($(window).height() * 0.95, 10),
      maxWidth: (window.winGUI && 600) || 800,
      width: _Prtg.Util.calcLimit($(window).width(), 550, (window.winGUI && 600) || 800, 0.75),
      zIndex: 89,
      position: 'center'
    },

    getSelectedStartDate: function() {
      return this.element.find('.datetimepicker.dt_start').datetimepicker('getDate');
    },
    getSelectedEndDate: function() {
      return this.element.find('.datetimepicker.dt_end').datetimepicker('getDate');
    },

    _create: function() {
      if(this.options['url'] !== '') {
        this._ajaxLoadContent(this.options['url']);
      }
      _Prtg.Events.publish('create.dialog.prtg', this.element);
      this._super();
    },

    _ajaxLoadContent: function(url) {
      var self = this;
      this.options.title = _Prtg.Lang.Dialogs.strings["loading"] + '...';
      this.element.html("<div class='loading' style='height:100px;'><div class='loadspinner'></div></div>");
      $.ajax({
        url: url,
        dataType: 'html',
        type: "GET"
      }).done(function(response) {
        self._ajaxdone.call(self, response);
      });
    },

    _ajaxdone: function(response) {
      var self = this;
      self.element.html(response);
      setTimeout($.proxy(self._setOptions, self, {'position': 'center'}), 1);

      self._setOptions({'title': _Prtg.Lang.Dialogs.strings["selectdaterange"] });

      self._setOptions({'buttons': [{
        html: _Prtg.Lang.Dialogs.strings.ok,
        'class': 'actionbutton',
        click: function(ev, data) {
          self.close();
          self.destroy();
          self.element.remove();
        }
      }, {
        html: _Prtg.Lang.Dialogs.strings.cancel,
        'class': 'button btngrey',
        click: function(ev) {
          self.destroy();
          self.element.remove();
        }
      }]});

      _Prtg.initPlugins(self.element);
      self.element.find('.datetimepicker').datetimepicker({
        showButtonPanel: false,
        maxDate: 0,
        onSelect: function(dateText, obj) {
          var input = $(this).attr('for');
          $('#' + input).val(dateText);
        },
      });
      self.element.on('keyup.daterangedialog', '.datetimepickerinput', function() {
        var datepicker = $(this).attr("id");
        self.element.find('.datetimepicker[for="'+datepicker+'"]').datetimepicker('setDate', $(this).val());
      });
    },
    close: function() {
      this._super();
      this._destroy();
      this.element.remove();
    },
    _destroy: function() {
      $('.tooltip, .popover').remove();
      this.element.off('.daterangedialog');
      this.element.find('.datetimepicker').datetimepicker('destroy');
      this._super();
    },

    _setOptions: function(options) {
      this._superApply( arguments );
    }
  });

})(jQuery, window, document);
