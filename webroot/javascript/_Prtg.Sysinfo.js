/* _Prtg.Sysinfo.js */

(function SysinfoIffe($, window, document, undefined) {
  var pluginName = 'prtg-sysinfo';

  function prtgSysinfo(element, init_data, parent) {

    // DOM depending
    this.$el = (!(element instanceof jQuery)) ? $(element) : element;
    this.timer = $(parent).Events();
    this.prtgTable = this.$el.find('.prtg-table');
    this.$error = this.$el.find('error');

    // data depending
    this.data = init_data;
    this.kind = init_data.kind;
    this.data_structure = {kind:null,receivetime:null,userreceivetime:null,timeago:null,error:null,message:null};

    if ('sysinfoinit' in init_data && init_data.kind in init_data.sysinfoinit) var sysinfoinit = init_data.sysinfoinit[init_data.kind];
    else var sysinfoinit = this.data_structure;

    for (var key in this.data_structure)
      this.data[key] = (key in sysinfoinit) ? sysinfoinit[key] : null;

    // syinfo logic
    this.checkAlways = !!~['services', 'loggedonusers', 'processes'].indexOf(this.data.kind);
    this.userHasRights = !!~['Full', 'Write'].indexOf(this.data.accessright);

    this.xhrRequest = null;
    this.timeout = null;

    this.checkRunning = false;
    this.runningTime = 0;

    this.REFRESH_RATE = 2000;
    this.REFRESH_TIMEOUT = 180000;

    this.init();
  }

  prtgSysinfo.prototype.init = function init() {

    // Refresh all Sysinfo squares on tab-click if they had any "error"
    if (!this.$el.find('error').hasClass('hidden') || this.checkAlways) this.refresh.call(this, true);

    this.initEvents();
  };

  prtgSysinfo.prototype.initEvents = function initEvents() {

    // Bind refresh on global 30sec refresh
    _Prtg.Events.subscribe('refresh.events.prtg', this.refresh.bind(this, false));

    if (this.userHasRights) {
      // Bind refresh function to all not disabled refresh buttons of each square
      this.$el.on('click.checknow', 'a.checknow:not(.no_probe)', this.refresh.bind(this, true));
      this.$el.find('a.checknow.no_probe').attr('title', $('#hidden_no_probe_text').html());
    }else {
      this.$el.find('a.checknow').hide();
    }

    // Destructor
    this.$el.on('destroyed', { self: this }, this.destroy);
  };

  prtgSysinfo.prototype.refresh = function refresh(scanNow) {
    var _this = this;

    // if(_this.checkRunning) console.log(_this.data.kind,"blocked - already running");
    // if(scanNow) console.log(_this.data.kind, 'scanNow');

    if (_this.checkRunning) return;
    _this.checkRunning = true;

    _this.hideRefreshLink();
    _this.showLoadingOverlay();

    var getUpdate = function() {
      _this.getUpdate(function(data, isNew) {
        if (isNew) {
          if (data.error * 1) {
            _this.updateErrorMessage(data.message);
            _this.$error.removeClass('hidden');
            _this.prtgTable.addClass('hidden');
          } else {
            _this.refreshTable();
            _this.$error.addClass('hidden');
            _this.prtgTable.removeClass('hidden');
          }
        }

        _this.showRefreshLink();
        _this.hideLoadingOverlay();

        _this.checkRunning = false;

      }, scanNow && _this.userHasRights);
    };

    if (scanNow && _this.userHasRights) _this.scanNow(getUpdate);
    else getUpdate();

    return false;
  };

  prtgSysinfo.prototype.getUpdate = function getUpdate(callback,doUntilNew,selfCall) {

    var _this = this;

    if (_this.runningTime >= _this.REFRESH_TIMEOUT) {
      // console.log(_this.data.kind,"timeout");
      _this.runningTime = 0;
      _this.checkRunning = 0;
      _this.showRefreshLink();
      _this.hideLoadingOverlay();
      return;
    }

    // console.log(_this.data.kind,"getUpdate")
    if (selfCall) _this.runningTime += _this.REFRESH_RATE;

    $.getJSON('api/sysinfo.json', { id: _this.data.objid, kind: _this.kind }, function(r) {
      var resp = null,
          sameDate = true;

      // Head
      if (!$.isEmptyObject(r) && Object.keys(resp = r[_this.kind]).join() == Object.keys(_this.data_structure).join()) {
        if ('timeago' in resp) _this.updateReceiveTimeInHeader(resp.timeago);
        if ('receivetime' in resp) sameDate = (_this.data.receivetime == resp.receivetime);
      }

      // console.log(_this.data.receivetime+" == "+resp.receivetime,_this.data.receivetime == resp.receivetime)
      // console.log(_this.kind,sameDate?'old data':'new data',doUntilNew);

      // Old state, refresh
      if (resp == null || (doUntilNew && sameDate)) {
        _this.timeout = setTimeout(function() {_this.getUpdate(callback, doUntilNew, true);}, _this.REFRESH_RATE);
        return;
      }

      // console.log(_this.data.kind,"callback")

      // New state, callback
      _this.data.receivetime = resp.receivetime;
      _this.checkRunning = false;
      _this.runningTime = 0;
      callback(resp, !sameDate);
    });

  }

  prtgSysinfo.prototype.scanNow = function scanNow(callback) {
    var _this = this;
    $.get('api/sysinfochecknow.json', { id: _this.data.objid, kind: _this.kind }, callback);
  };

  prtgSysinfo.prototype.hideRefreshLink = function hideRefreshLink(link) {
    this.$el.find('.checknow').addClass('invisible');
  };

  prtgSysinfo.prototype.showRefreshLink = function showRefreshLink(link) {
    this.$el.find('.checknow').removeClass('invisible');
  };

  prtgSysinfo.prototype.showLoadingOverlay = function toggleLoadingOverlay() {
    this.$el.find('.loading-overlay').removeClass('invisible');
  };

  prtgSysinfo.prototype.hideLoadingOverlay = function toggleLoadingOverlay() {
    this.$el.find('.loading-overlay').addClass('invisible');
  };

  prtgSysinfo.prototype.updateErrorMessage = function updateErrorMessage(message) {
    this.$el.find('message').html(message != 'OK' ? '<ul><li>Error: ' + message.split('<br>').join('</li><li>Error: ') + '</li></ul>' : message);
  };

  prtgSysinfo.prototype.refreshTable = function refreshTable() {
    var $object = this.prtgTable.data('prtg-table');
    $object.refresh({ data: $object }, true);
  };

  prtgSysinfo.prototype.updateReceiveTimeInHeader = function updateReceiveTimeInHeader(time) {
    this.$el.find('small').html(time);
  };

  prtgSysinfo.prototype.killXhr = function killXhr() {
    if (this.xhrRequest !== null) {
      this.xhrRequest = this.xhrRequest.abort();
    }
  };

  prtgSysinfo.prototype.clearTimeout = function clearTimeout() {
    if (this.timeout !== null) {
      this.timeout = window.clearTimeout(this.timeout);
    }
  };

  prtgSysinfo.prototype.destroy = function destroy(event) {
    var _this = event.data.self;
    _this.killXhr();
    _this.clearTimeout();
    _this.timer.unsubscribe('refresh.events.prtg', _this.refresh.bind(this));
  };

  _Prtg.Plugins.registerPlugin(pluginName, prtgSysinfo);
})(jQuery, window, document);
