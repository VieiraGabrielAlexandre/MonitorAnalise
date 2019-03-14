/* "gauges using javascript d3.js" 
 * 
 * Originally taken October 2012 from http://bl.ocks.org/1499279
 * author allows commercial usage, see https://gist.github.com/1499279
 *    rubenfilteris commented 4 months ago: "Would you mind if I use these in a commercial project?"
 *    tomerd commented (gist owner) 4 months ago: Be my guest.
 *    
 *  adapted 2012 for PRTG by Dirk Paessler
 *  
 *  */
(function($, window, document, undefined) {
  _Prtg.Graphixs = _Prtg.Graphixs || { "___": '_Prtg.Graphixs' };
  $.extend(true, _Prtg.Graphixs, {
    Gauge: function Gauge(placeholderName, configuration){
    	this.placeholderName = placeholderName;
      this.pointer = [
        {"x":0,"y":-0.8},
        {"x":0.04,"y":0.05},
        {"x":0.03,"y":0.1},
        {"x":-0.03,"y":0.1},
        {"x":-0.04,"y":0.05},
        {"x":0,"y":-0.8}
      ];

    	var self = this; // some internal d3 functions do not "like" the "this" keyword, hence setting a local variable

    	this.configure = function(configuration)
    	{
    		this.config = configuration;

    		this.config.size = this.config.size * 0.9;

    		this.config.radius = this.config.size * 0.97 / 2;
    		this.config.cx = this.config.size / 2;
    		this.config.cy = this.config.size / 2;

    		this.config.min = configuration.min || 0; 
    		this.config.max = configuration.max || 100; 
    		this.config.range = this.config.max - this.config.min;

    		this.config.majorTicks = configuration.majorTicks || 2;
    		this.config.minorTicks = configuration.minorTicks || 1;

    		this.config.greenColor 	= "status3";
    		this.config.yellowColor = "status4";
    		this.config.redColor 	= "status5";
    		this.config.grayColor 	= "status0";
    		this.config.hidePointer = false;
    		this.config.maxtext='';
    		this.config.mintext='';
    	}

    	this.render = function(value)
    	{
    		this.body = d3.select(this.placeholderName)
    							.append("svg:svg")
    	   						.attr("class", "gauge")
    	   						.attr("width", this.config.size)
    	   						.attr("height", this.config.size*0.9+20);

    		for (var index in this.config.grayZones)
    		{
    			this.drawBand(this.config.grayZones[index].from, this.config.grayZones[index].to, self.config.grayColor);
    		}
    		
    		for (var index in this.config.greenZones)
    		{
    			this.drawBand(this.config.greenZones[index].from, this.config.greenZones[index].to, self.config.greenColor);
    		}

    		for (var index in this.config.yellowZones)
    		{
    			this.drawBand(this.config.yellowZones[index].from, this.config.yellowZones[index].to, self.config.yellowColor);
    		}

    		for (var index in this.config.redZones)
    		{
    			this.drawBand(this.config.redZones[index].from, this.config.redZones[index].to, self.config.redColor);
    		}
    		this.body.append("svg:circle")
    					.attr("cx", this.config.cx-this.config.size*0.05)						
    					.attr("cy", this.config.cy+this.config.size*0.05)								
    					.attr("r", this.config.radius*0.6)
    					.attr("class", "backgroundfill")
    					// .style("stroke","red")
    					// .style("stroke-width","3px")

    		var fontSize = 12;	
    		
    		if (this.config.size > 90) {
    			var major = this.config.min; // Scale Min value
    			var point = this.valueToPoint(major, 0.63);
    			var mytext = major;
    			if (this.config.mintext != "") {
    				mytext = $("<div>"+this.config.mintext+"</div>").text();
    			}
    			if (mytext.length > 14) {
    				mytext = mytext.substring(0, 13) + '...'
    			}
    			var mysize = fontSize;
    			this.body.append("svg:text").attr("x", point.x - this.config.size * 0.05).attr("y", point.y + this.config.size * 0.15+12).attr("dy", fontSize / 3).attr("text-anchor", "middle").text(mytext).style("font-family",'"Segoe UI", Tahoma, Arial, Helvetica, Verdana, sans-serif').style("font-size", mysize + "px").style("fill", "#333").style("stroke-width", "0px");
    			
    			major = this.config.max; // Scale Max value
    			point = this.valueToPoint(major, 0.63);
    			mytext = major;
    			if (this.config.maxtext != "") {
    				mytext = $("<div>"+this.config.maxtext+"</div>").text();
    			}
    			if (mytext.length > 14) {
    				mytext = mytext.substring(0, 13) + '...'
    			}
    			mysize = fontSize;
    			this.body.append("svg:text").attr("x", point.x + this.config.size * 0.05).attr("y", point.y + this.config.size * 0.15+12).attr("dy", fontSize / 3).attr("text-anchor", "middle").text(mytext).style("font-family",'"Segoe UI", Tahoma, Arial, Helvetica, Verdana, sans-serif').style("font-size", mysize + "px").style("fill", "#333").style("stroke-width", "0px");
    		}

    		var avgContainer = this.body.append("svg:g").attr("class", "avgContainer");		
    		var pointerContainer = this.body.append("svg:g").attr("class", "pointerContainer");		
    		this.drawAvg(this.config.avg);
    		if(value >= 0)
    			this.redraw(value)
    	}

    	this.drawBand = function(start, end, color)
    	{
    		if (0 >= end - start) return;

    		this.body.append("svg:path")
						.attr("class", color)
    					.attr("d", d3.svg.arc()
    						.startAngle(this.valueToRadians(start))
    						.endAngle(this.valueToRadians(end))
    						.innerRadius(0 * this.config.radius)
    						.outerRadius(0.85 * this.config.radius))
    					.attr("transform", "translate(" + self.config.cx + ", " + self.config.cy + ") rotate(270)");
    	}

    	this.redraw = function(value)
    	{
    		var angle = this.valueToDegrees(value);
          	this.drawPointer(
            this.body.append("svg:g")
              .attr("class", "pointerContainer")
              .attr("transform","translate(" + self.config.cx + "," + self.config.cy + ") rotate("+ (angle+270) +")")
              ,self.config.radius*1.1);
    	}


    	this.drawPointer = function(value,radius)
    	{
        value.selectAll("path")
          .data([self.pointer])
    	      .enter()
            .append("svg:path")
			.attr("class", "needle")
              .attr("d", d3.svg.line()
                  .x(function(d) { return d.x*radius })
                  .y(function(d) { return d.y*radius })
                  .interpolate("basis")
               );


    	}
    	this.drawAvg = function(value)
    	{
    		if (!value) return;
    		var delta = this.config.range / 45;
    		
    		var head = this.valueToPoint(value, 0.75+0.02);
    		var head3 = this.valueToPoint(value - delta, 0.80+0.1);
    		var head4 = this.valueToPoint(value + delta, 0.80+0.1);
    		var data = [head, head3, head4, head];

    		var line = d3.svg.line()
    							.x(function(d) { return d.x })
    							.y(function(d) { return d.y })
    							;
    		var avgContainer = this.body.select(".avgContainer");	

    		var pointer = avgContainer.selectAll("path").data([data])										

    		pointer.enter()
    				.append("svg:path")
    					.attr("d", line)
    					.style("class", "backgroundfill")
    					.style("fill-opacity", 0.9)
    					.style("opacity", 0.9)
            .append('svg:title').text(this.config.avgtxt);


    		var point = this.valueToPoint(value, 0.85+0.1);
          this.body.append("svg:text").attr("x", point.x ).attr("y", point.y )
          .attr("dy", this.config.size / 48)
          .attr("text-anchor", "middle")
          .text("x")
          .style("font-family",'"Segoe UI", Tahoma, Arial, Helvetica, Verdana, sans-serif')
          .style("font-size", this.config.size / 20+ "px")
          .style("fill", "#999").style("stroke-width", "0px");
          this.body.append("svg:text").attr("x", point.x -1).attr("y", point.y-this.config.size / 28 )
          .attr("dy", this.config.size / 48)
          .attr("text-anchor", "middle")
          .text("_")
          .style("font-family",'"Segoe UI", Tahoma, Arial, Helvetica, Verdana, sans-serif')
          .style("font-size", this.config.size / 20+ "px")
          .style("fill", "#999").style("stroke-width", "0px");
    	}

    	this.valueToDegrees = function(value)
    	{
    		return value / this.config.range * 270 - 45;
    	}

    	this.valueToRadians = function(value)
    	{
    		return this.valueToDegrees(value) * Math.PI / 180;
    	}

    	this.valueToPoint = function(value, factor)
    	{
    		var point = 
    		{
    			x: this.config.cx - this.config.radius * factor * Math.cos(this.valueToRadians(value)),
    			y: this.config.cy - this.config.radius * factor * Math.sin(this.valueToRadians(value))
    		}

    		return point;
    	}

    	// initialization
    	this.configure(configuration);	
    }
  })
})(jQuery,window,document);