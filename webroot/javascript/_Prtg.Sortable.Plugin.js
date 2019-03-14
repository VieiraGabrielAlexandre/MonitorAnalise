// _Prtg.prtgSortable.Plugin.js
(function($, window, document, undefined) {
	var pluginName = "prtgsortable";

	function prtgsortable(element, data, parent, noautorefresh) {
		this.data = data;
		this.$el = $(element);
		this.timer = $(parent).Events();
		if(!noautorefresh)
			this.init(this);
	};

	prtgsortable.prototype.init = function(me){
		me.timer.subscribe('refresh.events.prtg', $.proxy(me.refresh, me));
		me.$el.on('destroyed', function(){
			me.timer.unsubscribe('refresh.events.prtg',$.proxy(me.refresh, me));
		});
		me.refresh();
	};

	prtgsortable.prototype.refresh = function(){
		var me = this
			, $dragrow = null
			, oldposition = null
			, newposition = null;
	
		me.$el.find(me.data.sortable).draggable({
			handle: '.sorter',
			cursor: 'move',
			zIndex: 2700,
			cursorAt: { left: 1, top: 1 },
			containment: "parent",
			helper: 'clone',
			opacity: 0.5,
			start: function(event, ui) { 
				$dragrow = $(this);
				oldposition = $dragrow.find(".sorter").data()
			}
		}).droppable({
			accept: me.data.sortable,
			tolerance: 'touch',
			over: function(event, ui) {
				newposition = $(this).find(".sorter").data();
				if(newposition.position > oldposition.position)
					$dragrow.detach().insertAfter($(event.target));
				else if(newposition.position < oldposition.position)
					$dragrow.detach().insertBefore($(event.target));
			},
			drop: function(event, ui) {
				if(!!newposition){
					if(newposition.position > oldposition.position) 
						newposition.position++;
					else
						newposition.position--;
					_Prtg.objectTools.setObjectPosition(oldposition.id,newposition.position);
				}
				$dragrow = null;
				newposition = null;
			}
		});
		return me;
	};

	$.fn[pluginName] = function(data, parent, noautorefresh) {
		return this.map(function() {
			var ret = $.data(this, 'plugin_' + pluginName);
			if (!ret) {
				ret = new prtgsortable(this, data, parent, noautorefresh);
				$.data(this, 'plugin_' + pluginName, ret);
			}
			return ret;
		});
	};

})(jQuery, window, document);
