(function($, window, document, undefined) {
  var pluginName = "sensorlistselect";
  function sensorlistselect(element, data, parent) {
    this.element = element;
    this.$element = $(element);
    this.$input = null;
    this.inputid = pluginName + $.now();
    this.data = data;
    this.init(this,pluginName + $.now());
  };

  sensorlistselect.prototype.init = function(me,inputid){
    me.$element.before('<input type="hidden" name="'+(me.data.inputname||'deselectedsensors')+'" id="'+inputid+'">');
    me.$input = $('#'+inputid);
    me.$element
      .on('click','a',function(e){
        e.preventDefault();
      })
      .on('click selected unselected',function(e){
        me.$input.val($.makeArray(me.$element.find('input[sensorid]:checked').map(function(){return $(this).attr('sensorid')})).join(','));
      });
  }

  _Prtg.Plugins.registerPlugin(pluginName, sensorlistselect);
})(jQuery, window, document);
