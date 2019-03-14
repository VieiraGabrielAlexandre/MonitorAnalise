/* _Prtg.SimplDonut.js */
(function PrtgSimpleDonutPlugin($, window, document, undefined) {
  var pluginName = 'prtg-simpledonut';

  function PrtgSimpleDonut(element, data, parent) {
    this.el = (!(element instanceof jQuery)) ? element : element[0];
    this.$el = (!(element instanceof jQuery)) ? $(element) : element;
    this.$parent = (!(parent instanceof jQuery)) ? $(parent) : parent;

    this.datasetcolor = [];
    this.dataset = [];
    this.basisColor = data.basisColor || '#808282';
    this.innerText = data.innertext || '';

    if (data.hasOwnProperty('remaining')) {
      this.remaining = data.remaining.split(':');
      if (data.hasOwnProperty('warninglimit')) {
        this.remaining[0] = this.getColor(data.warninglimit, this.remaining[1], this.remaining[0]);
      }

      if (data.hasOwnProperty('errorlimit')) {
        this.remaining[0] = this.getColor(data.errorlimit, this.remaining[1], this.remaining[0]);
      }
      this.total = this.remaining[1];

      this.datasetcolor.push(this.remaining[0]);
      this.dataset.push(this.remaining[1]);
      this.basis = data.total - this.remaining[1];
    } else if (data.hasOwnProperty('used')) {
      this.used = data.used.split(':');

      if(this.used[1] > data.total) {
        this.used[1] = data.total;
      }

      if (this.used[1] < 0) {
        this.used[1] = data.total - Math.abs(this.used[1]);
      }

      if (data.hasOwnProperty('warninglimit')) {
        this.used[0] = this.getColor(data.warninglimit, data.total - this.used[1], this.used[0]);
      }

      if (data.hasOwnProperty('errorlimit')) {
        this.used[0] = this.getColor(data.errorlimit, data.total - this.used[1], this.used[0]);
      }

      this.datasetcolor.push(this.used[0]);
      this.dataset = [data.total - this.used[1]];
      this.basis = data.total - (data.total - this.used[1]);
      this.total = data.total - this.used[1];
    } else {
      this.dataset = data.dataset.split(',');
      this.datasetcolor = [];

      var temp;
      for (var i = 0; i <= this.dataset.length - 1; i++) {
        temp = this.dataset[i].split(':');
        this.datasetcolor.push(temp[0]);
        this.dataset[i] = temp[1];
      }

      this.total = this.dataset.reduce(function(a, b) { return parseInt(a, 10) + parseInt(b, 10); });

      this.basis = data.basis || 0;
      if (this.total === 0) {
        this.dataset = [1];
        this.datasetcolor = ['#b4cc38'];
      }
    }

    if (this.basis !== 0) {
      this.dataset.unshift(this.basis);
      this.datasetcolor.unshift(this.basisColor);
    }

    this.width = data.width || this.$el.width();
    this.height = data.height || this.$el.height();
    this.radius = Math.min(this.width, this.height) / 2;
    this.innerRadiusRatio = parseInt(data.innerratio, 10) || 30;
    this.innerRadius = this.radius - ((this.radius / 100) * this.innerRadiusRatio);


    this.init();
  }

  PrtgSimpleDonut.prototype.init = function init() {
    var _this = this;

    d3.scale.category20();
    var pie = d3.layout.pie().sort(null);
    var dy = (_this.innerText === '' ? '+12px' : '-2px');
    var arc = d3.svg.arc()
      .innerRadius(_this.innerRadius)
      .outerRadius(_this.radius);
    var svg = d3.select(this.el).append('svg')
      .attr('width', _this.width)
      .attr('height', _this.height)
      .append('g')
      .attr('transform', 'translate(' + _this.width / 2 + ',' + _this.height / 2 + ')');

    svg.selectAll('path')
      .data(pie(_this.dataset))
      .enter()
      .append('path')
      .attr('fill', function(d, i) { return _this.datasetcolor[i]; })
      .attr('d', arc);

    svg.append('text')
      .attr('dy', dy)
      .attr('class', 'donutext')
      .text(function() { return _this.total; });

    if (_this.innerText !== ''){
      var padding=(this.width-100)/2;
      this.$el
      	.append($('<div class="donutlabel">'+_this.innerText+'</div>')
      	.css({
      			'padding-left': padding,
      			'padding-right':padding,
      			'height': this.height/2,
      			'margin-top':this.height/2
      		}));
    }
  };

  PrtgSimpleDonut.prototype.getColor = function getColor(limitData, value, defaultColor) {
    var limit = limitData.split(':');
    var color = defaultColor;
    if (parseInt(value, 10) <= parseInt(limit[1], 10)) {
      color = limit[0];
    }
    return color;
  };

  _Prtg.Plugins.registerPlugin(pluginName, PrtgSimpleDonut);
})(jQuery, window, document);

/* _Prtg.sparklineextend.js */
(function SparklineExtendPlugin($, window, document, undefined) {
  var pluginName = 'prtg-sparklineextend';

  function SparklineExtend(element, data, parent) {
    this.el = (!(element instanceof jQuery)) ? element : element[0];
    this.$el = (!(element instanceof jQuery)) ? $(element) : element;
    this.$parent = (!(parent instanceof jQuery)) ? $(parent) : parent;

    this.values = data.values;
    this.dates = data.dates;
    this.init();
  }

  SparklineExtend.prototype.init = function init() {
    var _this = this;
    this.$el.sparkline(_this.values, {
      type: 'line',
      lineColor: '#aaaaaa',
      fillColor: '#dddddd',
      defaultPixelsPerValue: 1,
      chartRangeMin: 0,
      spotRadius: 0,
      tooltipFormat: '<span>{{offset:offset}} ({{y}})</span>',
      tooltipValueLookups: {
        offset: _this.dates
      }
    });
  };

  _Prtg.Plugins.registerPlugin(pluginName, SparklineExtend);
})(jQuery, window, document);
