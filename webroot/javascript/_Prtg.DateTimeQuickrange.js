/* _Prtg.DateTimeQuickrange.js */
(function ($, window, document, undefined) {
  var pluginName = "prtg-datetimequickrange";

  function Plugin(element, data, parent) {
    this.data = data;
    this.el = (!(element instanceof jQuery)) ? element : element[0];
    this.$el = (!(element instanceof jQuery)) ? $(element) : element;
    this.$parent = (!(parent instanceof jQuery)) ? $(parent) : parent;
    this.init(this);
  }

  Plugin.prototype.init = function (me) {
    me.$el.on("click", "a", {
      self: me
    }, me.quickrangeHandler);
  };
  Plugin.prototype.quickrangeHandler = function (e) {
    e.preventDefault();
    var self = e.data.self,
      $this = $(this),
      range = $(this).attr("range"),
      rangeModifier = range.charAt(range.length - 1),
      startDate = new Date(),
      endDate = new Date(),
      setTime = function (dateObj, hours, minutes, seconds) {
      dateObj.setHours(hours);
      dateObj.setMinutes(minutes);
      dateObj.setSeconds(seconds);
    };

    range = range.substr(0, range.length - 1);

    switch(rangeModifier) {
    case "h":
      startDate.addHours(-range);
      break;
    case "d":
      startDate.addDays(-range);
      break;
    case "m":
      startDate.addMonth(-range);
      break;
    case "a":
      setTime(startDate, 0, 0, 0);
      startDate.addDays(-range);
      setTime(endDate, 0, 0, 0);
      endDate.addDays(-(range-1));
      break;
    case "l":
      startDate.setDate(1);
      setTime(startDate, 0, 0, 0);
      endDate = new Date(startDate.getTime());
      startDate.addMonth(-(parseInt(range, 10)));
      break;
    case "w":
      var weekbegin = parseInt(range, 10) === 0 ? 1 : 0;

      startDate.addDays(-(startDate.getDay() + 1));
      while(startDate.getDay() > weekbegin) {
        startDate.addDays(-1);
      }
      setTime(startDate, 0, 0, 0);
      endDate = new Date(startDate.getTime());
      endDate.addDays(7);
      setTime(endDate, 0, 0, 0);
      break;
    }

    if(self.data.mode != 'inline') {
      var startpicker = $("#" + self.data.sfield).data('plugin_prtgDatetimepicker');
      var endpicker = $("#" + self.data.endfield).data('plugin_prtgDatetimepicker');
      startpicker.setCurrentSelectedDateTime(startDate);
      endpicker.setCurrentSelectedDateTime(endDate);
    } else {
      $('.datetimepicker[for="'+ self.data.sfield +'"]').datetimepicker('setDate', startDate);
      $('.datetimepicker[for="'+ self.data.endfield +'"]').datetimepicker('setDate', endDate);
      $('.ui-datepicker-current-day').click();
    }

    return false;
  };

  _Prtg.Plugins.registerPlugin(pluginName, Plugin);

})(jQuery, window, document);
