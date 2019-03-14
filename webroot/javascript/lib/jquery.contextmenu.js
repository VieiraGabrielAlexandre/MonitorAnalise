/*
 * PRTG's Context Menu
 *
 * December 2007: V2.0 by Dirk Paessler
 *
 * based on:
 *
 * ContextMenu - jQuery plugin for right-click context menus
 *
 * Author: Chris Domigan
 * Contributors: Dan G. Switzer, II
 * Parts of this plugin are inspired by Joern Zaefferer's Tooltip plugin
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Version: r2
 * Date: 16 July 2007
 *
 * For documentation visit http://www.trendskitchens.co.nz/jquery/contextmenu/
 *
 */

(function ($) {

	var menu, trigger, content, hash, currentborder;
	var defaults = {
    menuStyle: {
			bindToEvent: "contextmenu"
		},
		itemStyle: {},
		itemHoverStyle: {},
		eventPosX: 'pageX',
		eventPosY: 'pageY',
		onContextMenu: null,
		onShowMenu: null
	};

	$.fn.contextMenu = function (id, options) {
		if (!menu) {                                      // Create singleton menu
			menu = $('<div/>', {
				'id': id,
        		'class': 'jqContextMenu',
				'style': 'position:absolute',
			})
      .hide()
      .appendTo('body')
      .on('click', function (e) {
        e.stopPropagation();
      });
		}
		hash = hash || [];
		hash.push({
			id: id,
			contextMenus: options.contextMenus,
			menuStyle: $.extend({}, defaults.menuStyle, options.menuStyle || {}),
			itemStyle: $.extend({}, defaults.itemStyle, options.itemStyle || {}),
			itemHoverStyle: $.extend({}, defaults.itemHoverStyle, options.itemHoverStyle || {}),
			bindings: options.bindings || {},
			onContextMenu: options.onContextMenu || defaults.onContextMenu,
			onShowMenu: options.onShowMenu || defaults.onShowMenu,
			eventPosX: options.eventPosX || defaults.eventPosX,
			eventPosY: options.eventPosY || defaults.eventPosY
		});

		var index = hash.length - 1;

		if (!options.menuStyle.bindToEvent) { options.menuStyle.bindToEvent = "contextmenu"; }

		$(this).on(options.menuStyle.bindToEvent, function (e) {
      //unter Windows kommt hier immer die Info, dass CTRL gedrueckt wird im Safari. Chrome geht aber
			//if ((_Prtg.Options.browser == 'chrome') || (_Prtg.Options.browser == 'safari')) {
				if (e.ctrlKey||e.metaKey) return true; //if someone presses CTRL with a right click he will see the usual browser context menu
			//}
			if ($(e.target).is("img")) return true; //if someone right-clicks an image (chart), show usual context menu
			if ($(e.target).is("input")) return true; //if someone right-clicks an image (chart), show usual context menu
			if ($(e.target).is("textarea")) return true; //if someone right-clicks an image (chart), show usual context menu
			if ($(e.target).is(".enablebrowsercontextmenu")) return true; //if someone right-clicks an image (chart), show usual context menu
			// Check if onContextMenu() defined
			var bShowContext = (!!hash[index].onContextMenu) ? hash[index].onContextMenu(e) : true;
			if (bShowContext) display(index, this, e, options);
			return false;
		});
		return menu;
	};

	function display(index, trigger, e, options) {
		var cur = hash[index]
			, timer = 0;
		content = cur.contextMenus.clone(true);
		content.css(cur.menuStyle).find('li').css(cur.itemStyle).hover(
      function () {
        $(this).css(cur.itemHoverStyle);
      },
      function () {
        $(this).css(cur.itemStyle);
      }
    ).find('img').css({ verticalAlign: 'middle', paddingRight: '2px' });

		menu.html(content);
		_Prtg.Tip.kill();

		var myobject = $(e.target);
		// if (!myobject.is('[id],[data-id]')) {
		// 	myobject = myobject.find('[id]').eq(0);
		// }
		// if(myobject.length === 0 && $(e.target).closest('[contextmenu]').length > 0){
		// 	myobject = $(e.target).closest('[contextmenu]').eq(0);
		// }
		if (!!cur.onShowMenu) cur.onShowMenu.apply(myobject[0],[e, menu]);

		menu.hover(function () { myobject.addClass("hover"); myobject.parent().addClass("hover"); }, function () { myobject.removeClass("hover"); myobject.parent().removeClass("hover"); });

		$.each(cur.bindings, function (id, func) {
			$('#' + id + ':not(.disabled)', menu).bind('click.contextmenu', function (e) {
				e.preventDefault();
				hide();
				$(this).data('element', myobject);
				func.call(this, myobject, e);
			});
		});
		menu
		.removeClass('flyoutleft')
		.fadeIn(100)
		.css(setPosition({left: e.pageX-10, top: e.pageY-10}))
		.on('mouseleave', function(){
			var $self = $(this);
			timer = setTimeout(function(){$self.hide();}, 666);
		})
		.on('mouseenter', function(){
			if(timer) timer = clearTimeout(timer);
		});
		$(document).one('click', hide);
  }

  function setPosition(position) {
		var $viewport = $(window)
			, viewportOffset = $viewport.offset() || {top:0,left:0}
			, borderLB = 20
			, borderBB = 120
			, width = menu.children().first().outerWidth()
			, height = menu.children().first().outerHeight();

		viewportOffset.top += $viewport.scrollTop();
		viewportOffset.left += $viewport.scrollLeft();

		if((position.left + width + borderLB > viewportOffset.left + $viewport.width() && !!menu.addClass('flyoutleft'))
		|| position.left < viewportOffset.left){
			position.left =  viewportOffset.left + $viewport.width() - width - + borderLB;
			position.left = position.left  < viewportOffset.left ? viewportOffset.left : position.left;
		}
		if(position.top + height + borderLB > viewportOffset.top + $viewport.outerHeight()
		|| position.top < viewportOffset.top)
		{
			position.top = viewportOffset.top + $viewport.outerHeight() - height - + borderBB;
			position.top = position.top < viewportOffset.top ? viewportOffset.top : position.top;
		}
		return position;
	};

	function hide() {
		menu.hide();
		menu.children().unbind();
		menu.unbind();
	};

	// Apply defaults
	$.contextMenu = {
		defaults: function (userDefaults) {
			$.each(userDefaults, function (i, val) {
				if (typeof val == 'object' && defaults[i]) {
					$.extend(defaults[i], val);
				}
				else defaults[i] = val;
			});
		}
	};
})(jQuery);
