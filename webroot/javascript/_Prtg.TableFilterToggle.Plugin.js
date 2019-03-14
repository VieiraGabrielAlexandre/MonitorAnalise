// _Prtg.TableFilterToggle.Plugin.js
(function ($, window, document, undefined) {

  function tableFilterToggle(self, element) {
    var $element = (!(element instanceof jQuery)) ? $(element) : element;
    this.$filterLink = $();
    this.init($element);
  }

  tableFilterToggle.prototype.init = function ($el) {
    this.$filterLink = $el.find('.js-filterToggle');

    if (this.$filterLink.hasClass('js-datepicker-filter')) {
      this.$filterLink.closest('.tableflyout').addClass('filterpanel');
    }

    this.$filterLink.closest('.prtg-plugin-initialized, .prtg-plugin-initializing, .prtg-plugin').hasClass('filteractive') ? this.$filterLink.html(_Prtg.Lang.common.strings.hideFilter + '&nbsp;') : this.$filterLink.html(_Prtg.Lang.common.strings.showFilter + '&nbsp;');
    this.$filterLink.on('click', this.toggleFilters);
  };

  tableFilterToggle.prototype.toggleFilters = function (e) {
    var filterLink = $(e.target),
      filterPanel = filterLink.closest('.prtg-plugin-initialized, .prtg-plugin, .prtg-plugin-initializing');

    filterPanel.toggleClass('filteractive');
    filterPanel.hasClass('filteractive') ? filterLink.html(_Prtg.Lang.common.strings.hideFilter + '&nbsp;') : filterLink.html(_Prtg.Lang.common.strings.showFilter + '&nbsp;');
  };

  tableFilterToggle.prototype.initialyOpenFilters = function (params) {
    if(params['tableid']=='tickettable') this.$filterLink.triggerHandler('click');
  };

  _Prtg.Plugins.registerPlugin("table-filter-toggle", tableFilterToggle);

})(jQuery, window, document);
