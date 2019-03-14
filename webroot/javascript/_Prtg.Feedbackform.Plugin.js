//_Prtg.Feedbackform.Plugin.js
(function($, window, document, undefined) {
		var pluginName = 'feedback';

		function Plugin(element, data, parent) {
			this.element = $(element);
			this.data = data;
			this.parent = parent;
			// this.element['prtg-form'](data,parent);
			this.init(this);
		}

		Plugin.prototype.init = function(me) {
      var screenshot = $('#screenshot',me.element)
        , buttons = null;
      me.element
      .on('click','#includescreenshot',function(){
          if (screenshot.find('.loadspinner').length == 0){
              screenshot.append('<div class="loadspinner"></div>')
          }
        screenshot.addClass('loading');
    		if(!!window.winGUI)
    			alert('includescreenshot');
    		else
          $.ajax({
            url: '/controls/screenshot.htm',
      		  timeout: 60000,
            data:{
              what: encodeURI(document.location.href),
              width: $(document).outerWidth(),
              height: $(document).outerWidth()
            },
            beforeSend: function(jqXHR){
              jqXHR.ignoreManager = true;
              buttons = me.element.closest('#feedbackform').parent().find('button');
              buttons.button("disable");
            }
          }).always(function(){
            buttons.button("enable");
          }).done(function(data){
            screenshot.html(data).removeClass('loading');
          })
      })
      .on('click','#includescreenshot',function(){
  			screenshot.show();
      })
      .on('click','#donotincludescreenshot',function(){
	   		screenshot.hide();
      })
      .find('#textarea2').each(function(){
        $(this).val($('<div>' + $(this).val() + '</div>').text());
      });

    };

		$.fn[pluginName] = function(options, parent) {
			return this.each(function() {
				if (!$.data(this, "plugin_" + pluginName)) {
					$.data(this, "plugin_" + pluginName, new Plugin(this, options, parent));
				}
			});
		};
})(jQuery, window, document);
