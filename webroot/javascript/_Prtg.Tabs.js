/* prtg-tabs plugin */
/* Handling of Tabs with Ajax and History support. */

// TODO: Wenn ein tab geklickt wird wärend ein anderer noch lädt, das laden abbrechen!
// TODO: wenn element jquery object, das erkennen und damit umgehen.
(function ($, window, document, undefined) {
  var module_name = Plugin.module_name = 'prtg-tabs';

  function Plugin(element, data, parent) {
    this.$el = (!(element instanceof jQuery)) ? $(element) : element;
    this.data = data;
    this.$tabs = this.$el.find('.nav-tabs').find('li:not(.inline)');
    this.$tabcontainer = (this.$el.find('.tab-container').length <= 0) ? this.createTabContainer() : this.$el.find('.tab-container');
    this.$parent = (!(parent instanceof jQuery)) ? $(parent) : parent;
    this.currentTab = 0;
    this.namespace = module_name + window.location.pathname;
    this.history = !(this.$el.data() || { noHistory:false }).noHistory;
    this.$tabs.find('a').addClass('nohjax'); // inline tabs eg sensor settings dialog
    if (this.$tabs.length > 0)
      if (this.data.noHistory) {
        this.activateTab(1);
        this.initEvents();
      } else {
        this.init();
      }
  }

  Plugin.prototype.init = function () {
    var urlTabid = parseInt(_Prtg.Util.getUrlVars()['tabid'], 10), urlCache = window.location.href;

    if (this.history)_Prtg.Hjax.bind(this.namespace, this.historyHandler, this, { self: this });

    // Wenn die tabid aus der url im dom nicht vorhanden ist oder die tabid fehlt: den ersten laden.
    if ((isNaN(urlTabid) || this.$tabs.filter('[tabid="' + urlTabid + '"]').length < 1)) {
      urlCache = urlCache.replace(/&tabid=[a-zA-Z0-9]+/, '').replace(/tabid=[a-zA-Z0-9]+&/, '').replace(/\?tabid=[a-zA-Z0-9]+$/, '');
      urlCache += (urlCache.indexOf('?') > -1 ? '&' : '?') + 'tabid=' + 1;

      // Ersetzt die falsche tabid in der url und in der History.
      if (window.title === undefined) window.title = document.title;
      History.replaceState({
        tabid: 1,
        namespace: this.namespace
      }, window.title, urlCache.split('#')[0]);
    }

    this.activateTab(urlTabid);
    this.initEvents();
  };

  Plugin.prototype.destroy = function () {
    if (this.history)_Prtg.Hjax.unbind(this.namespace);
  };

  Plugin.prototype.initEvents = function () {
    var self = this;
    this.$tabs
      .off('click', this.tabClick)
      .on('click', { self: this }, this.tabClick);
    this.$el
      .on('destroyed', $.proxy(self.destroy, self));
  };

  Plugin.prototype.historyHandler = function (data, state, e) {
    var self = data.self;
    if (state.data.tabid !== self.currentTab) {
      self.activateTab(state.data.tabid);
    } else if (!self.$el.is(':visible')) {
      _Prtg.Hjax.loadLink(state.cleanUrl, this.namespace);
    }
  };

  // Click event Handler
  Plugin.prototype.tabClick = function tabClick(e) {
    e.stopImmediatePropagation();
    e.preventDefault();

    var $tab = $(e.currentTarget);
    e.data.self.activateTab($(this).attr('tabid'), true);

    return false;
  };

  Plugin.prototype.createTabContainer = function () {
    var tab = $('<div />', {class: 'tab-container loading'});

    return $('<div />', {
      class: 'loadspinner'
    }).appendTo(tab).appendTo(this.$el);
  };

  Plugin.prototype.activateTab = function (tabindex, push) {
    var tab = this.$tabs.filter('[tabid="' + tabindex + '"]'),
        cld = this.$tabcontainer.children();

    if (tab.length <= 0) return;
    this.currentTab = tabindex;

    // PushState - History/Backbutton Handling
    // Nur wenn push true, damit nur bei klicks ein history eintrag erzeugt wird.
    // Verhindert beim laden mit tabid in der url, das tab 1 in die history geschrieben wird.
    if (this.history && push) {
      var argumentsCache = window.location.href;
      if (_Prtg.Util.getUrlParameters(argumentsCache)['tabid'] !== undefined) {
        // TODO: tabid=abc geht nicht wenn in der URl;
        argumentsCache = argumentsCache.replace(/tabid=[a-zA-Z0-9]+/, 'tabid=' + tabindex);
      } else {
        argumentsCache = argumentsCache + (argumentsCache.indexOf('?') > -1 ? '&' : '?') + 'tabid=' + tabindex;
      }

      if (window.title === undefined) window.title = document.title;
      History.pushState({
        namespace: this.namespace,
        tabid: tabindex
      }, window.title, argumentsCache.split('#')[0]);
    }

    this.$tabs.filter('.tab-active').removeClass('tab-active');
    tab.addClass('tab-active');

    // Hier wird der alte tabcontainer geleert. TODO: testen ob empty ausreicht
    if (cld.length) {
      this.$tabcontainer.find('#loadedcontent').Events().publish('navigate.prtg', parseInt(tabindex, 10));
      cld.remove(); //empty();
    }

    if (tab.find('a').attr('href') && tab.find('a').attr('href') !== '') {
      var self = this;
      var loadurl = tab.find('a').attr('href');
      var hash = loadurl.split('#');
      if (hash.length === 2) hash = '#' + hash[1];
      else hash = false;

      if (!!_Prtg.Options.showtiming) {
        loadurl += (loadurl.indexOf('?') > -1 ? '&' : '?')  + 'showtiming=1';
      }

      _Prtg.Tip.killPopups();
      _Prtg.xhrManager.xhrabort(true);
        self.$tabcontainer.append('<div class="loadspinner"></div>');
      self.$tabcontainer.addClass('loading');
      _Prtg.Events.publish('navigate.tab.prtg');
      $.ajax({
        url: loadurl,
        dataType: 'html',
        beforeSend: function (jqXHR) {
          jqXHR.peNumber = 'PE1111';
        },

        success: function (data, textStatus, jqXHR) {
          self.$tabcontainer.removeClass('loading');
          if (!hash) {
            self.$tabcontainer.html('<div id="loadedcontent">' + data + '</div>');
          } else {
            self.$tabcontainer.html('<div id="loadedcontent">' + $(data).find(hash).html() + '</div>');
          }

          _Prtg.SetupPage(self.$tabcontainer.find('#loadedcontent')); // Entkoppeln
          !!window.__ga && window.__ga('send', 'pageview', window.__gaStripOrigin(loadurl));
          _Prtg.Events.publish('tabloaded.events.prtg', self.$tabcontainer);
          var tabName = tab.attr('tab-name');
          if(tabName)
            _Prtg.decorateWitchPageIdentifier(tabName, self.$tabcontainer, 'tab-content');
          else
            _Prtg.removePageIdentifiers(self.$tabcontainer, "tab-content");
        }
      });
    }
  };

  _Prtg.Plugins.registerPlugin(module_name, Plugin);
})(jQuery, window, document);
