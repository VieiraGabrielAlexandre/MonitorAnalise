(function($, window, document, undefined) {
  var pluginName = 'activity';
  var spacing = 0.7;
  var width = $(window).width();
  var height = $(window).height();
  var quader = 0;
  var font = '1.5em';
  var cfont = '2.5em';
  var radius = 0;
  var marginLeft = 0;
  var marginTop = 0;
  /* STANDARD FUNCTIONS */
  function Activity(element, data, parent) {
    this.element = element;
    this.$element = $(element);
    this.data = data;
    this.timer = null;
    this.countdown = null;
    this.delay = setDelay();
    this.proxRefreshClock = $.proxy(this.refreshClock, this);
    this.proxStartClock = $.proxy(this.startClock, this);
    this.resetClock();
    this.initClock(this);
  }
  Activity.prototype.fields = function fields(startTime) {
    var usertime = (_Prtg.Options.logoutAfterInactivity / 60);
    var time = [0, 0];
    if (!!startTime) {
      if (usertime < 60) {
        time[0] = startTime[0];
        time[1] = startTime[1];
      } else {
        time[0] = parseInt(startTime[0] * 60, 10) + parseInt(startTime[1], 10);
        time[1] = startTime[2];
      }
    }
    var seconds = ((time[1] / 60));
    return [{
      index: 2,
      value: seconds,
      positionX: 60,
      color: '#BDD73C'
    } ];
  };
  Activity.prototype.initClock = function initClock(self) { 
    $(document).on('mousedown keydown touchstart', {'self': self}, self.clickToStopEvent);
    $(window).on('resize', {'self': self}, self.clickToStopEvent);
    self.activity = '' + (Date.now());
    !!window.localStorage && window.localStorage.setItem('lastActivity', self.activity);
    self.presvg = d3.select('body').append('div')
      .attr('class', 'ui-widget-overlay ui-front')
      .attr('width', height)
      .attr('height', width)
      .style('visibility', 'hidden');
    var svg = self.presvg.append('svg')
      .attr('class', 'svg')
      .attr('height', quader)
      .attr('width', quader)
      .style('margin-left', marginLeft)
      .style('margin-top', marginTop)
      .append('g')
      .attr('id', 'gunit');
    svg.append('text')
      .attr('dy', '-3.0em')
      .attr('dx', '-3.3em')
      .attr('id', 'txt')
      .style('font-size', font)
      .style('fill', '#00245D')
      .text('You are inactive.');
    svg.append('text')
      .attr('dy', '-1.5em')
      .attr('dx', '-5.3em')
      .attr('id', 'txt')
      .style('font-size', font)
      .style('fill', '#00245D')
      .text('You will be logged out in');
    svg.append('text')
      .attr('dy', '4.0em')
      .attr('dx', '-5.3em')
      .attr('id', 'txt')
      .style('font-size', font)
      .style('fill', '#00245D')
      .text('Unless you click to stop it!');
    self.presvg.append('svg')
      .attr('class', 'settings')
      .attr('height', height)
      .attr('width', (width))
      .style('visibility', 'hidden')
      .on('click', function click() {
        document.location.href = '/systemsetup.htm?tabid=1';
      })
      .on('touchstart', function touchstart() {
        document.location.href = '/systemsetup.htm?tabid=1';
      })
      .append('text')
      .attr('id', 'txt_setting')
      .style('font-size', font)
      .attr('y', (height / 100) * 22)
      .style('fill', '#00245D')
      .text('You can change this behavior in your account settings.');
    self.arc = d3.svg.arc()
      .startAngle(0)
      .endAngle(function(d) {
        return d.value * 2 * Math.PI;
      })
      .innerRadius(function(d) {
        return d.index * radius / 3;
      })
      .outerRadius(function(d) {
        return (d.index + spacing) * radius / 3;
      });
    self.field = svg.selectAll('g')
      .data(this.fields())
      .enter().append('g');
    self.field.append('path');
    self.field.append('text');
    self.field.append('text');
    resizeSVGQuader();
    windowFontClock();
  };
  Activity.prototype.tick = function tick(self, time) {
    var arcTween = function arcTween(d) {
      var i = d3.interpolateNumber(d.previousValue, d.value);
      return function(t) {
        d.value = i(t);
        return self.arc(d);
      };
    };
    if (_Prtg.Options.userIsReadOnly === false) {
      d3.select('.settings').style('visibility', 'initial');
    }
    this.field.style('display', 'block');
    this.presvg.style('visibility', 'initial');
    this.field = this.field
      .each(function(d) {
        this._value = d.value;
      })
      .data(this.fields(time))
      .each(function(d) {
        d.previousValue = this._value;
      });
    this.field.select('path')
      .transition()
      .ease('elastic')
      .attrTween('d', arcTween)
      .style('fill', function(d) {
        return d.color;
      });
    d3.transition();
  };
  Activity.prototype.resetClock = function resetClock() {
    this.activity =
    this.countdown = null;
    this.timer = setTimeout(this.proxStartClock, this.delay);
  };
  Activity.prototype.startClock = function startClock() {
    width = $(window).width();
    height = $(window).height();
    d3.select('.popover.right.in').style('visibility', 'hidden');
    this.timer = null;
    this.countdown = setTimeout(this.proxRefreshClock, 0);
  };
  Activity.prototype.refreshClock = function refreshClock() {
    var now = new Date();
    var s;
    var activity;
    if (this.timer === null) {
      try {
        activity = window.localStorage.getItem('lastActivity');
      } catch (e) {
        this.resetClock();
      }
      s = _Prtg.Options.logoutAfterInactivity - Math.floor((now.getTime() - activity) / 1000);
      if (s <= 0) {
        document.location.href = '/index.htm?logout=1';
      } else {
        now.setTime(s * 1000);
        var time = _Prtg.Util.secondsAsTime(s).split(':');
        this.field.select('text')
          .attr('dy', '0.8em')
          .attr('dx', '-2.15em')
          .style('font-size', cfont)
          .style('fill', '#00245D')
          .text(time[1] + ' seconds');
        this.tick(this, time);
        if (this.countdown && this.activity === activity) {
          this.countdown = setTimeout(this.proxRefreshClock, 1000);
        } else {
          this.resetClock();
          this.activity = activity;
        }
      }
    } else {
      this.resetClock();
    }
  };

  /* D3JS HELPER FUNCTIONS */
  function resizeSVGQuader() {
    width = $(window).width();
    height = $(window).height();
    var heightMarginTop = (height / 4) - 20;
    radius = width / 4;
    d3.select('.settings').attr('height', height)
      .attr('width', width);
    if (width < height) {
      quader = width / 2;
      radius = quader / 2;
      marginLeft = ((width / 2) - (quader / 2));
      marginTop = (((height) / 2) - (quader / 2));
      d3.select('.svg').attr('class', 'svg')
        .attr('height', quader + 'px')
        .attr('width', quader + 'px')
        .style('margin-left', marginLeft + 'px')
        .style('margin-top', marginTop + 'px');
      d3.select('#gunit').attr('transform', 'translate(' + quader / 2 + ',' + quader / 2 + ')');
      d3.select('#txt_setting').attr('y', (heightMarginTop));
    } else {
      quader = (height / 2);
      radius = (quader / 2);
      marginLeft = ((width / 2) - (quader / 2));
      marginTop = (((height) / 2) - (quader / 2));
      d3.select('#gunit').attr('transform', 'translate(' + (quader / 2) + ',' + (quader / 2) + ')');
      d3.select('.svg').attr('class', 'svg')
        .attr('height', quader + 'px')
        .attr('width', quader + 'px')
        .style('margin-left', marginLeft + 'px')
        .style('margin-top', marginTop + 'px');
      d3.select('#txt_setting').attr('y', ((heightMarginTop) - 10) + 'px');
    }
  }
  function windowFontClock() {
    var wiwi = $(window).width();
    var wihe = $(window).height();
    if (wiwi < wihe) {
      if (wiwi <= 750 && wiwi > 650) {
        font = (radius / 100) - 0.3;
      } else if (wiwi <= 650 && wiwi > 450) {
        font = (radius / 100) - 0.3;
      } else if (wiwi <= 450 && wiwi > 350) {
        font = (radius / 100) - 0.3;
      } else if (wiwi <= 350) {
        font = (radius / 100) - 0.3;
      } else {
        font = 1.5;
      }
    } else if (wihe <= 750 && wihe >= 600) {
      font = (radius / 100) - 0.3;
    } else if (wihe < 600 && wihe > 460) {
      font = (radius / 100) - 0.3;
    } else if (wihe <= 460) {
      font = (radius / 100) - 0.3;
    } else {
      font = 1.5;
    }
    d3.selectAll('#txt').style('font-size', font + 'em');
    d3.select('#txt_setting').style('font-size', (font * 1.2) + 'em');
    cfont = (font * 1.5) + 'em';
  }
  function setDelay() {
    var counter = 0;
    if ((_Prtg.Options.logoutAfterInactivity / 60) <= 1) {
      counter = 30000;
    } else {
      counter = 60000 * ((_Prtg.Options.logoutAfterInactivity / 60)) - 59000;
    }
    return counter;
  }

  Activity.prototype.clickToStopEvent = function clickToStopEvent(event) {
    var self = event.data.self;
    resizeSVGQuader();
    windowFontClock();
    d3.select('.popover.right.in').style('visibility', 'initial');
    clearTimeout(self.timer);
    setTimeout(function timer() {
      self.field.style('display', 'none');
      self.presvg.style('visibility', 'hidden');
      d3.select('.settings').style('visibility', 'hidden');
    }, 300);
    if (self.countdown) {
      clearTimeout(self.countdown);
      self.countdown = null;
    }
    self.activity = '' + (new Date()).getTime();
    !!window.localStorage && window.localStorage.setItem('lastActivity', self.activity);
    self.timer = setTimeout(self.proxStartClock, self.delay);
  };


  _Prtg.Plugins.registerPlugin(pluginName, Activity);
})(jQuery, window, document);
