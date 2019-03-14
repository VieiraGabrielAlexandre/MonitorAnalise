(function($) {
  function Sparkline() {
				function render($elm, data){
//				async function render($elm, data){
			    if ($elm.length > 0) {
				    if (data.graph && data.graph.length) {
//			        await $elm.sparkline(data.graph, {
			        $elm.sparkline(data.graph, {
			          type: 'line',
				        width: '110px',
				        height: '18px',
			          lineColor: '#aaaaaa',
			          fillColor: '#dddddd',
			          spotRadius: 0,
				        chartRangeMin: 0,
			          disableInteraction: true,
			          disableHiddenCheck: false
			        });
			      }
			    }
			    return null;
				}

    return {
      init: function(data, parent) {
  			render($(this), data);
      },

      ___: '_Prtg.Sparklines',
    };
  }

  function renderd3(elm) {
    counter++;
    var myobject = $(elm);
    var pxwidth = $(elm).parent().width() - 1;
    var pxheight = $(elm).parent().height();
    var data = myobject.data();
    var graph = d3.select(elm).append('svg:svg')
    	.attr({
    		'width': pxwidth + 'px',
    		'height': pxheight + 'px'
    	});
    var maxd = d3.max(data.graph);
    var maxe = d3.max(data.error);
    var xd = d3.scale.linear().domain([0, data.graph.length - 1]).range([0, pxwidth - 1]);
    var yd = d3.scale.linear().domain([0, Math.max(maxd, maxe)]).rangeRound([pxheight - 1, 0]);
    var xe = d3.scale.linear().domain([0, data.error.length - 1]).range([0, pxwidth - 1]);
    var ye = d3.scale.linear().domain([0, Math.max(maxd, maxe)]).rangeRound([pxheight - 1, 0]);
    var dataarea = d3.svg.area()
      .x(function(d, i) {
        return xd(i);
      })
      .y0(pxheight)
      .y1(function(d) {
        return yd(d);
      }).interpolate('linear');

    var errorline = d3.svg.line()
      .x(function(d, i) {
        return xe(i);
      })
      .y(function(d) {
        return ye(d);
      }).interpolate('linear');

    graph.append('svg:path').attr('class', 'error').attr('d', errorline(data.error));
    graph.append('svg:path').attr('class', 'data').attr('d', dataarea(data.graph));
    counter--;
    elm = null;
  }

  $.extend(true, window, {
    _Prtg: {
      Plugins: {
        Sparkline: Sparkline(),
      },
    },
  });
})(jQuery);
