/* _Prtg.AdvertLinks.Plugin.js */
(function prtgAdvetLinksPlugin($, window, document, undefined) {
  var pluginName = 'prtgPluginAdvertLinks';
  function prtgPluginAdvertLinks(element, data, parent) {
    this.data = data;
    this.el = (!(element instanceof jQuery)) ? element : element[0];
    this.$el = (!(element instanceof jQuery)) ? $(element) : element;
    this.subject = this.data.subject;
    this.initEvents();
  }

  prtgPluginAdvertLinks.prototype.initEvents = function() {
    var _this = this;
    _this.$el.on('destroyed', _this, _this.destroy);
    this.$el.on('click.adverLinkClickEvent', _this, _this.adverLinkClickEvent);
  };

  prtgPluginAdvertLinks.prototype.adverLinkClickEvent = function adverLinkClickEvent(event) {
    var _this = (event !== undefined && event.data !== undefined ? event.data : this);
    if(event.target.classList.contains('closebutton')) return;
    _Prtg.objectTools.sendFeedback('/sendsalesfeedback.htm', { subject: _this.subject });
  };

  prtgPluginAdvertLinks.prototype.destroy = function destroyEvent(event) {
    var _this = event.data;
    $(window).off('.prtgPluginAdvertLinks');
    $(document).off('.prtgPluginAdvertLinks');
    _this.$el.off('.prtgPluginAdvertLinks');
  };

  _Prtg.Plugins.registerPlugin(pluginName, prtgPluginAdvertLinks);
})(jQuery, window, document);
