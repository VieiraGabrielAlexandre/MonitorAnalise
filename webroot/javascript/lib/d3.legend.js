// d3.legend.js 
// (C) 2012 ziggy.jonsson.nyc@gmail.com
// MIT licence
// http://bl.ocks.org/ZJONSSON/3918369
// pimped by Stefan Messner

(function() {
d3.legend = function(g) {
  g.each(function() {
    var g= d3.select(this),
        items = {},
        svg = d3.select(g.property("nearestViewportElement")),
        legendPadding = g.attr("data-style-padding") || 5,
        li = g.selectAll(".legend-items").data([true]);

    li.enter().append("g").classed("legend-items",true);

    svg.selectAll("[data-legend]").each(function() {
        var self = d3.select(this);
        items[self.attr("data-legend")] = {
          color : self.attr("data-legend-color") != undefined 
            ? self.attr("data-legend-color") 
            : self.attr("fill") != 'none' 
                ? self.attr("fill") 
                : self.attr("stroke") 
        };
      });

    items = d3.entries(items).sort(function(a,b) { return a.value.pos-b.value.pos});

    li.selectAll("text")
        .data(items,function(d) { return d.key})
        .call(function(d) { d.enter().append("text")})
        .call(function(d) { d.exit().remove()})
        .attr("y",function(d,i) { return i*2+0.4+"em"})
        .attr("x","1em")
        .text(function(d) {return d.key});
    
    li.selectAll("circle")
        .data(items,function(d) { return d.key})
        .call(function(d) { d.enter().append("circle")})
        .call(function(d) { d.exit().remove()})
        .attr("cy",function(d,i) { return i*1.5+"em"})
        .attr("cx",0)
        .attr("r","0.5em")
        .style("fill",function(d) {return d.value.color});
  })
  return g;
}
})();