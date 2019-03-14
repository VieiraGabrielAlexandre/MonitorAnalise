/* _Prtg.CssHelper.Plugin.js */
(function prtgCssHelperPlugin($, window, document, undefined) {
  var pluginName = 'prtgPluginCssHelper';
  function prtgPluginCssHelper(element, data, parent) {
    this.data = data;
    this.el = (!(element instanceof jQuery)) ? element : element[0];
    this.$el = (!(element instanceof jQuery)) ? $(element) : element;
    this.subject = this.data.subject;
    this.initEvents();
  }

  prtgPluginCssHelper.prototype.initEvents = function(triggered) {
    var _this = this;
    _this.$el.on('destroyed', _this, _this.destroy);
    _this.width=_this.$el.css('width').replace(/[^0-9]/g,'')*1;
    var breakpoint=0;
    $(this.$el.attr('class').split(' ')).each(function(){
      if(!!~this.indexOf('square-breakpoint-')) breakpoint=this.replace(/[^0-9]/g,'')*1;
    });

   
    _this.$el.find('.same-square-height').css('width','').css('height','');
    
    if(_this.width>=breakpoint){
      sameSquareHeight(_this.$el.find('.same-square-height'),_this.$el.hasClass('square-fit-parent'));
    }else{
      sameHeight(_this.$el.find('.same-square-height'));
    }
    
    setTimeout(function(){
      // _this.$el.find('.same-square-height,.square-height,.same-square-width,.square-width').removeClass('cssHelper-moving').css('visibility','visible');
    },300);
    
    if(!triggered){
      $(window).resize(function(){
        // _this.$el.find('.same-square-height,.square-height,.same-square-width,.square-width').addClass('cssHelper-moving');
        clearTimeout(_this.resizeTimeout);
        _this.resizeTimeout= setTimeout(function(){
            _this.initEvents(1);
        },500);
      });
    }
  };
  
  var sameSquareHeight=function(squareHeightElems,fitParent){
    var _this=this;
    var maxHeight=0,maxPadding=0,maxMargin=0;
    squareHeightElems.each(function(){
        var curHeight=$(this).css('height').replace(/[^0-9]/g,'');
        maxHeight=curHeight>maxHeight?curHeight:maxHeight;
        if(fitParent){
          var curPadding=$(this).css('padding').replace(/[^0-9]/g,'');
          maxPadding=curPadding>maxPadding?curPadding:maxPadding;
       
          var curMargin=$(this).css('margin').replace(/[^0-9]/g,'');
          maxMargin=curMargin>maxMargin?curMargin:maxMargin;
        }
    });
    if(maxHeight) squareHeightElems.css('width',maxHeight).css('height',maxHeight);
    if(fitParent){
      var inArow=Math.floor(_this.width/maxHeight);
      _this.parent.css('width',maxHeight*inArow+(((maxPadding+maxMargin)*2)*inArow));
    }
  }
  
  var sameHeight=function(squareHeightElems){
    var _this=this;
    var maxHeight=0;
    squareHeightElems.each(function(){
        var curHeight=$(this).css('height').replace(/[^0-9]/g,'');
        maxHeight=curHeight>maxHeight?curHeight:maxHeight;
    });
    if(maxHeight) squareHeightElems.css('height',maxHeight);
  }

  prtgPluginCssHelper.prototype.destroy = function destroyEvent(event) {
    var _this = event.data;
    $(window).off('.prtgPluginCssHelper');
    $(document).off('.prtgPluginCssHelper');
    _this.$el.off('.prtgPluginCssHelper');
  };

  _Prtg.Plugins.registerPlugin(pluginName, prtgPluginCssHelper);
})(jQuery, window, document);
