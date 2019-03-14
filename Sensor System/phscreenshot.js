(function(window){
  var page = require('webpage').create()
    , system = require('system')
    , timeout = system.args[3]
    , resultfile = system.args[2]
    , address = system.args[1]
    , waitfor = false;
    phantom.outputEncoding = encodings="ascii";
    page.settings.userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36';


  if(!!system.args[4] && !!system.args[5]){
		page.viewportSize = {
		  width: parseInt(system.args[4],10),
		  height: parseInt(system.args[5],10)
		};
  }

  page.open(address, function(status) {
    page.evaluate(function() {
      var style = document.createElement('style'),
          text = document.createTextNode('body { background: #fff; color: #000; min-width: auto; width: '+ page.viewportSize.width +'px;}');
      style.setAttribute('type', 'text/css');
      style.appendChild(text);
      document.head.insertBefore(style, document.head.firstChild);
    });
    if (status !== 'success') {
      console.log('error loading: '+address);
      phantom.exit(2);
    } else {
      try {
         !waitfor && success(timeout);
      } catch (e) {
        console.log(e.toString());
        phantom.exit(1);
      }

    }
  });
  page.onCallback = function(data){
    waitfor = data.waitfor;
    !!data.success && success(0);
  }
  function success(timeout){
    setTimeout(function(){
      if(resultfile)
        page.render(resultfile);
      else
        page.renderBase64('PNG');
      phantom.exit(0);
    },timeout);
  }
})(window);
