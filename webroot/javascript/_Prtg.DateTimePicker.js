/* _Prtg.DateTimePicker.js */
(function($, window, document, undefined) {
  var pluginName = "prtg-datetimepicker";


  function Plugin(element, data, parent) {
    this.el = (!(element instanceof jQuery)) ? element : element[0];
    this.$el = (!(element instanceof jQuery)) ? $(element) : element;
    this.resetable = this.$el.closest('.resetable');
    this.$picker = this.$el.clone();
    this.$picker.data('plugin_prtgDatetimepicker', this);
    this.$el.addClass("orginal_input");
    this.$picker.attr("name", this.$picker.attr("name") + "_picker").attr("id", "").addClass("initilizing").toggleClass('prtg-plugin');
    this.$parent = (!(parent instanceof jQuery)) ? $(parent) : parent;
    this.prtgdateFormat = "yy-mm-dd";
    this.timepicker = data.timepicker || false;
    this.formatStrings = this.splitDateTimeFormat(data.datetimeformat || _Prtg.Options.userDateTimeFormat ||"yy-mm-dd HH:mm");
    this.currentDateText = "";
    this.inline = data.inline;
    this.oldSelected = "";
    this.endpicker = data.endpicker;

    var self = this;

    if(self.endpicker !== "") {
      _Prtg.Events.subscribe('datetimpicker.initialized', function(e, plugin) {
        if(plugin.$el.is(self.endpicker)) {
          self.endpicker = plugin;
          self.setMinDate();
        }
      });
    }

    this.settings = {
      dateFormat: self.formatStrings['date'],
      timeFormat: self.formatStrings['time'],
      showOn: "both",
      minDate: data.mindate || "-10y",
      buttonImage: "",
      buttonImageOnly: false,
      buttonText:_Prtg.Lang.common.strings['choose'],
      firstDay: 1,
      onSelect: function(dateText, inst) {
        self.dateToOwnFormat(dateText);
        self.currentDateText = dateText;
      },
      onClose: function(dateText, inst) {
        self.dateToOwnFormat(dateText);
        if(self.oldSelected != self.$el.val()) _Prtg.Events.publish('datetimpicker.change', self);
        _Prtg.Events.resume();
        self.setMinDate();
      },
      beforeShow: function(elm, inst) {
        self.oldSelected = self.$el.val();
        _Prtg.Events.pause();
      },
      onChangeMonthYear: function(){
        $('body div.tooltip').remove();
      }
    };
    this.init();
  }

  Plugin.prototype.init = function() {
    var self = this;
    var initialValue = self.$picker.val();
    var initial;

    self.$el.after(self.$picker).hide();


    if (initialValue !== "") {
      var timeArr = initialValue.split(",");
      if(timeArr.length > 3 && self.timepicker) {
        initial = new Date(timeArr[0], timeArr[1]-1, timeArr[2], timeArr[3], timeArr[4]);
        initialValue = $.datepicker.formatDate(self.formatStrings['date'], initial);
        initialValue = initialValue + ' ' + $.datepicker.formatTime(self.formatStrings['time'], {hour: timeArr[3], minute: timeArr[4]});
      } else if(timeArr.length > 2) {
        initial = new Date(timeArr[0], timeArr[1]-1, timeArr[2]);
        initialValue = $.datepicker.formatDate(self.formatStrings['date'], initial);
      } else {
        initial = new Date(Date.now());
        initialValue = $.datepicker.formatDate(self.formatStrings['date'], initial);
      }

      self.$picker.val(initialValue);
    }

    if (self.timepicker) {
      self.$picker.datetimepicker(self.settings);
    } else {
      self.$picker.datepicker(self.settings);
    }

    if (initial instanceof Date) {
      self.settings.defaultDate = initial;
      self.dateToOwnFormat();
    }

    self.currentDateText = self.$picker.val();
    self.$picker.removeClass("initilizing");
    _Prtg.Events.publish('datetimpicker.initialized', self);

    if(!!self.resetable.length) {
      if(!self.resetable.data('picker'))
        self.resetable.data('picker', []);

      self.resetable
        .off('click.datepickerclose')
        .on('click.datepickerclose','i.icon-close',function(){
            var pickers = self.resetable.data('picker')
              , target = $(this).data().target;
            pickers.forEach(function(picker) {
              if(!!target) {
                (target.indexOf(picker.$el.attr('id'))>-1) && (picker.clear.call(picker), _Prtg.Events.publish('datetimpicker.change', [picker,'reset']));
              } else {
                picker.clear.call(picker);
              }
            });
            if(!target)
              _Prtg.Events.publish('datetimpicker.change', [self,'reset']);
          })
        .data().picker.push(self);
      }
  };

  Plugin.prototype.dateToOwnFormat = function() {

    var self = this;
    var dateText = self.$picker.val();
    var selectedDate = $.datepicker.formatDate(this.prtgdateFormat, $.datepicker.parseDate(this.formatStrings['date'], dateText.split(" ")[0]));
    var selectedTime;
    if(dateText.split(" ")[1]) {
      dateText = dateText.split(" ");
      dateText.shift();
      dateText = dateText.join(" ");
      selectedTime = $.datepicker.formatTime("HH-mm-ss", $.datepicker.parseTime(this.formatStrings['time'], dateText));
    } else {
      selectedTime = "00-00-00";
    }
    this.$el.val(selectedDate + '-' + selectedTime).attr("value", selectedDate + '-' + selectedTime);
  };

  Plugin.prototype.clear = function() {
    this.$picker.val('');
    this.$picker.text('');
    this.$el.val('');
  };

  Plugin.prototype.splitDateTimeFormat = function(dateTimeString) {
    var formatString = {};

    dateTimeString = dateTimeString.split(" ");
    formatString["time"] = dateTimeString[1];
    if(dateTimeString[2]) {
      formatString["time"] = formatString["time"] + ' ' + dateTimeString[2];
    }
    formatString["date"] = dateTimeString[0];
    return formatString;
  };

  Plugin.prototype.setMinDate = function() {
    var self = this;
    if(self.endpicker !== undefined) {
      var currentDate = self.getCurrentSelectedDate();
      if (self.timepicker) {
        currentDate.addMinutes(1);

        self.endpicker.$picker.datepicker("option", "minDate", currentDate);
        self.endpicker.$picker.datetimepicker("option", "minDateTime", currentDate);
      } else {
        currentDate.addDays(1);
        self.endpicker.$picker.datepicker("option", "minDate", currentDate);
      }
    }
  };

  Plugin.prototype.getCurrentSelectedDate = function() {
    if (this.timepicker) {
      return this.$picker.datetimepicker("getDate");
    } else {
      return this.$picker.datepicker("getDate");
    }
  };

  Plugin.prototype.dateToString = function(dateString) {
    if(!dateString) return dateString;
    if(!this.timepicker) {
      return $.datepicker.formatDate(this.prtgdateFormat, dateString) + '-' + "00-00-00";
    } else {
      return $.datepicker.formatDate(this.prtgdateFormat, dateString) + '-' + $.datepicker.formatTime("HH-mm-ss", $.datepicker.parseTime(this.formatStrings['time'], this.currentDateText.split(" ")[1]));
    }
  };

  Plugin.prototype.setCurrentSelectedDate = function(newDate) {
    // TODO: refactor like setCurrentSelectedDateTime!
    this.$el.val($.datepicker.formatDate(this.prtgdateFormat, newDate) + this.$el.val().slice(10));
    this.$picker.val($.datepicker.formatDate(this.settings.dateFormat, newDate) + this.$picker.val().slice(10));
    this.highLight();
  };

  Plugin.prototype.setCurrentSelectedDateTime = function(newDate, noHighLight) {
    var self = this;
    // TODO:  if (base.options.timepicker) {
    this.$picker.datetimepicker("setDate", newDate);
    this.settings.onSelect(self.$picker.val());
    if(noHighLight === false) {
      this.highLight();
    }
    self.setMinDate();
  };

  Plugin.prototype.highLight = function() {
    this.$picker.css("border-color", "#EC0E68");
    this.$picker.stop().animate({
      borderTopColor: '#fff',
      borderLeftColor: '#fff',
      borderRightColor: '#fff',
      borderBottomColor: '#fff'
    }, 1000);
  };

  $.fn[pluginName] = function(data, parent) {
    return this.each(function() {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Plugin(this, data, parent));
      }
    });
  };

})(jQuery, window, document);
