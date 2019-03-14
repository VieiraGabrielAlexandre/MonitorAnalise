(function(window, document, undefined){
  var page = require('webpage').create()
    , system = require('system')
    , address = system.args[1]
    , resultfile = system.args[2]
    , timeout = system.args[3]
    , waitfor = false
    , paperSizes = {}
    , footer = ""
    , pageFooter={
        height: "0.8cm",
        contents: phantom.callback(function(pageNum, numPages) {
          return '<div style="width:100%;font-family: \'Segoe UI\', Tahoma, Arial, Helvetica, Verdana, sans-serif;font-size:11px;background-color:transparent;"><br/>'
            + footer
            +'<div style="display:inline-block;width:7.5%;text-align:right;">' + pageNum + ' / ' +numPages + '</div>'
            + "</div>";
        })
      }
  ;
  page.settings.userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36';
  page.zoomFactor = 1.0;
  page.settings.loadImages = true;

  QTPaperSize.call(paperSizes);


  if(system.args[6] !== 'none'){
    var ps = paperSizes[(system.args[6] || 'A4').toUpperCase()];
    var ori = (system.args[7] || 'portrait').toLowerCase();
    page.viewportSize = {
      width: 3000,
      height: 3000
    };
    page.paperSize = {
      width: ori === "portrait" ? ps.width : ps.height,
      height: ori === "portrait" ? ps.height : ps.width,
      //format: (system.args[6] || 'A4').toUpperCase(),
      orientation: ori,
      margin: {
          left: '0.8cm',
          top: '0.8cm',
          right: '0.8cm',
          bottom: '0.8cm'
        },
      footer: pageFooter
    };
  }
  page.onConsoleMessage = function(msg, lineNum, sourceId) {
    console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
  };

  page.open(address, function(status) {
    footer = page.evaluate(function(s, page) {
      var footer = document.querySelector(s);
      if(footer)
        return footer.innerHTML;
      else
        return '';
    }, '#printfooter', page);

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

  function QTPaperSize(){
    this.A4 =  PaperSize(210, 297);
    this.B5 =  PaperSize(176, 250);
    this.LETTER =  PaperSize(215.9, 279.4);
    this.LEGAL =  PaperSize(215.9, 355.6);
    this.EXECUTIVE =  PaperSize(190.5, 254);
    this.A0 =  PaperSize(841, 1189);
    this.A1 =  PaperSize(594, 841);
    this.A2 =  PaperSize(420, 594);
    this.A3 =  PaperSize(297, 420);
    this.A5 =  PaperSize(148, 210);
    this.A6 =  PaperSize(105, 148);
    this.A7 =  PaperSize(74, 105);
    this.A8 =  PaperSize(52, 74);
    this.A9 =  PaperSize(37, 52);
    this.B0 =  PaperSize(1000, 1414);
    this.B1 =  PaperSize(707, 1000);
    this.B10 =  PaperSize(31, 44);
    this.B2 =  PaperSize(500, 707);
    this.B3 =  PaperSize(353, 500);
    this.B4 =  PaperSize(250, 353);
    this.B6 =  PaperSize(125, 176);
    this.B7 =  PaperSize(88, 125);
    this.B8 =  PaperSize(62, 88);
    this.B9 =  PaperSize(33, 62);
    this.C5E =  PaperSize(163, 229);
    this.COMM10E =  PaperSize(105, 241);
    this.DLE =  PaperSize(110, 220);
    this.FOLIO =  PaperSize(210, 330);
    this.LEDGER =  PaperSize(431.8, 279.4);
    this.TABLOID =  PaperSize(279.4, 431.8);
  }

  // Helper function
  function PaperSize(x, y){
    return {
      width:  mm2px(x , 96.0),
      height: mm2px(y , 96.0)
    }
  }

  function mm2px(mm, DPI){
    // Dots per mm
    var DPMM = DPI / 2.54 / 10;
    return mm * DPMM;
  }

})(window, document, undefined);
