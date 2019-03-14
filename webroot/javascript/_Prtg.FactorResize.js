// prtg.factorResize.js
(function($, window, document, undefined) {
  var pluginName = "prtg-factorResize";

  function factorResize(element, data, parent) {
    this.data = data;
    this.el = (!(element instanceof jQuery)) ? element : element[0];
    this.$el = (!(element instanceof jQuery)) ? $(element) : element;
    this.factor = this.data.factor;
    this.initEvents();
  }

  factorResize.prototype.initEvents = function() {
    var self = this;
    self.$el.on('destroyed.factorResize', {
      "self": self
    }, self.destroy);

    $(window).on('resize.factorResize', {'self': self}, self.checkAndResize).trigger('resize.factorResize');
  };

  factorResize.prototype.checkAndResize = function(event) {
    var self = event.data.self;
    self.$el.css("width", "100%");
    var currentwidth = parseInt(self.$el.width(), 10);
    if((currentwidth / self.factor) !== 0) {
      self.$el.width(currentwidth - (currentwidth % self.factor));
    }
  };

  factorResize.prototype.destroy = function(event) {
    var self = event.data.self;
    $(window).off('.factorResize');
    $(document).off('.factorResize');
  };

  _Prtg.Plugins.registerPlugin(pluginName, factorResize);

})(jQuery, window, document);
