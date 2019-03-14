// _Prtg.Template.Plugin.js
(function($, window, document, undefined) {

  function template(element, data, parent) {
		this.data = data;
		this.$element = $(element);
		this.$parent = $(parent);
		this.timer = this.$parent.Events();
		this.init(this);
	}

	template.prototype.init = function(me) {
    if(me.data.update.data.id===0)
      me.data.classes = me.data.classes.replace('groupmenu','rootgroupmenu');
    me.refresh();
    me.timer.subscribe('refresh.events.prtg',$.proxy(me.refresh, me));
    me.timer.subscribeOnce('navigate.prtg', $.proxy(function(e) {
      me.timer.unsubscribe('refresh.events.prtg',$.proxy(me.refresh, me));
    }, me));
  };

  template.prototype.refresh = function() {
    var me = this;
    if(this.data.update) {
      $.ajax(this.data.update)
      .done(function(data) {
        me.$element.html($.jqote(_Prtg.Util.GetPropertyByString(me.data.template), $.extend(true, me.data,data)));
      });
    }
  };

  _Prtg.Plugins.registerPlugin("template", template);

})(jQuery, window, document);
