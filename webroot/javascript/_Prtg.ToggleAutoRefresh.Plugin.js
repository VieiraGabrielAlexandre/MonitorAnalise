/* _Prtg.toggleAutoRefresh.js */
(function prtgToggleAutoRefreshPlugin($, window, document, undefined) {
  var pluginName = 'prtg-toggle-autorefresh';

  function prtgToggleAutoRefresh(element, data, parent) {
    this.data = data;
    this.el = (!(element instanceof jQuery)) ? element : element[0];
    this.$el = (!(element instanceof jQuery)) ? $(element) : element;
    if(_Prtg.Options.refreshType !== 'none')
      this.init();
  }

  prtgToggleAutoRefresh.prototype.init = function init() {
    this.$el.find('i').removeClass('icon-play').addClass('icon-pause');
    this.initEvents();
  };

  prtgToggleAutoRefresh.prototype.initEvents = function initEvents() {
    var _this = this;

    _this.$el.on('click.toggleAutoRefresh', _this, _this.toggleAutoRefresh);
    _this.$el.parents('body').on('keyup.toggleAutoRefresh', _this, $.proxy(_this.keyUpHandler, _this));
    _this.$el.on('destroyed', _this, $.proxy(_this.destroy, _this));
    _Prtg.Events.subscribe('start.events.prtg', $.proxy(_this.reset, _this));
  };

  prtgToggleAutoRefresh.prototype.keyUpHandler = function keyUpHandler(event) {
    var _this = (event !== undefined && event.data !== undefined ? event.data : this);

    if (event.altKey && event.ctrlKey && event.which === 80) {
      _this.toggleAutoRefresh(event);
    }
  };

  prtgToggleAutoRefresh.prototype.reset = function reset(event) {
    var _this = (event !== undefined && event.data !== undefined ? event.data : this);

    _this.$el.find('i').removeClass('icon-play').addClass('icon-pause');
  };

  prtgToggleAutoRefresh.prototype.toggleAutoRefresh = function toggleAutoRefresh(event) {
    var _this = (event !== undefined && event.data !== undefined ? event.data : this);

    _Prtg.Events.running ? _Prtg.Events.pause() : _Prtg.Events.resume();
    _this.$el.find('i').toggleClass('icon-pause').toggleClass('icon-play');
    return false;
  };

  prtgToggleAutoRefresh.prototype.destroy = function destroyEvent(event) {
    var _this = this;

    _this.$el.off('.toggleAutoRefresh');
    _this.$el.parents('body').off('.toggleAutoRefresh');

    _Prtg.Events.unsubscribe('start.events.prtg', $.proxy(_this.reset, _this));
  };

  _Prtg.Plugins.registerPlugin(pluginName, prtgToggleAutoRefresh);
})(jQuery, window, document);
