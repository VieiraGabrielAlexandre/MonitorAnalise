//_Prtg.Initialisation.js
(function($, window, undefined) {
  var $feedback, watcher,$body;

  //executed when document ready
  function setup() {
    $body = $('#mainbody');


    if($body.length && !$body.is('.mapshow')) {
      _Prtg.Events = $body.Events(_Prtg.Options);

      $body.refreshable($('#mainbody')[0]); //dummy clock keeper

      <#system type="browserdependent" browsertype="MSIE" aboveversion="1" browsercontent="/*">
      Tinycon.setOptions({
        width: 7,
        height: 10,
        font: '9px arial',
        colour: '#ffffff',
        background: '#D21925',
        fallback: true
      });
      Tinycon.setImage('/favicon.ico').setBubble(0);
      <#system type="browserdependent" browsertype="MSIE" aboveversion="1" browsercontent="*/">
    } else {
      _Prtg.Events = {
        publish: function(){},
        subscribe: function(){},
        unsubscribe: function(){},
        subscribeOnce: function(){}
      };
    }

		_Prtg.desktopNotification.requestPermission();
    _Prtg.Plugins["TCT"] && _Prtg.Plugins["TCT"].init.apply(null); 

    //keep help popover open if hovered
    var originalLeave = $.fn.popover.Constructor.prototype.leave;
    $.fn.popover.Constructor.prototype.leave = function(obj){
      var self = obj instanceof this.constructor ?
        obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)
      var container, timeout;
      originalLeave.call(this, obj);
      if(obj.currentTarget) {
        container = $('body .popover')
        timeout = self.timeout;
        container.one('mouseenter', function(){
          clearTimeout(timeout);
          container.one('mouseleave', function(){
            $.fn.popover.Constructor.prototype.leave.call(self, self);
          });
        })
      }
    };

    _Prtg.Events.subscribe('refresh.events.prtg', function() {
      $('.tooltip, .popover').remove();
    });

    $('body').tooltip({
      "animation": false,
      "selector": "[title]:not([data-helptext]),[data-original-title]:not([data-helptext])",
      "trigger": ' hover',
      "container": 'body',
      "placement": function(tooltip, elm) {
        $('.tooltip').remove();
        return elm.hasAttribute('data-placement') 
          ? elm.getAttribute('data-placement') 
          : $(elm).closest('.tableflyout').length > 0 
            ? "left" 
            : "bottom";
      },
      "delay": { show: 333, hide: 0 },
      "html": true
    });

    $('body').popover({
      "animation": false,
      "selector": '[data-helptext]',
      "trigger": 'hover focus',
      "container": 'body',
      "placement": function(tooltip, elm) {
        $('.popover').remove();
        return elm.hasAttribute('data-placement') ? elm.getAttribute('data-placement') : "bottom";
      },
      "title": _Prtg.Lang.common.strings['help'],
      "content": function() {
        return $(this).data('helptext');
      },
      "delay": { show: 400, hide: 400 },
      "html": true
    });

    if($('body.publicmapshow').length === 0) {
      $.fn.ptip.install();
    }

    $.ajaxSetup({
      global: true,
      cache: false,
      timeout: _Prtg.Options.ajaxTimeout,
      traditional: true
    });

    _Prtg.xhrManager = {
      pool: [],
      xhrabort: function() {
        $.each(_Prtg.xhrManager.pool, function(idx, jqXHR) {
          jqXHR.abort();
        });
      }
    };

    var connectionLostTimer;
    $(document)
      .on("ajaxSend", function(e, jqXHR, options){
        if(jqXHR.ignoreManager === undefined) {
          jqXHR.ignoreManager = false;
        }
        if(jqXHR.ignoreManager !== true) {
          _Prtg.xhrManager.pool.push(jqXHR);
        }
      })
      .on("ajaxComplete", function(e, jqXHR, options) {
        if(!!connectionLostTimer) {
          connectionLostTimer = clearTimeout(connectionLostTimer);
        }
        _Prtg.xhrManager.pool = $.grep(_Prtg.xhrManager.pool, function(x){return x!=jqXHR;});
      })
      .on("ajaxError", function(event, jqXHR, ajaxSettings, thrownError) {
        if(jqXHR.ignoreError) return;
        if(thrownError === 'abort'
        || (typeof(thrownError) === 'object' && !!thrownError.message)
        || jqXHR.status === 556)
          return;
        if(!!console && !!console.log) console.log(arguments);

        if((jqXHR.status === 401 || jqXHR.status === 400) && jqXHR.getResponseHeader('LoginAgain') === 'true') {
          var self = this;
          _Prtg.Dialogs.defaultDialog('controls/loginform_small.htm').done(function(result) {
            var loadingDialog = _Prtg.Dialogs.loader(_Prtg.Lang.Dialogs.strings.multieditworking);
            $.post('/public/checklogin.htm', result).done(function(result) {
      				if(ajaxSettings.wingui) {
      					loadingDialog.dialog('destroy').remove();
      					window.prtgLoadContent("wingui.htm?action="+encodeURIComponent(ajaxSettings.url));
      				} else {
      					$.ajax(ajaxSettings).always(function() {
      						if(loadingDialog.hasClass('ui-dialog-content')) {
      						loadingDialog.dialog('destroy').remove();
      						}
      					});
      				}
            });
          }).fail(function() {
            document.location.reload();
          });
        } else if(jqXHR.status === 401 || jqXHR.status === 503) {
          document.location.reload()
        } else if((jqXHR.status % 199 > 0) && jqXHR.readyState === 4 && jqXHR.responseText.length > 0) {
          var error;
          var version;
          var errorContent = "";
          try {
            error = $($.parseXML(jqXHR.responseText));
            errorContent = error.find('error').text();
            version = '<b>Version</b>: ' + error.find('version').text() + '<br>';
          } catch(e) {
            errorContent = $(jqXHR.responseText).text();
          }


          _Prtg.Dialogs.alert(
            $('<div id="errordialog"><div class="ajaxerror">' + errorContent +
                ' <span style="cursor: pointer; text-decoration: underline;" onclick="$(\'.advancederrorinfo\').toggleClass(\'hide\');">' + _Prtg.Lang.common.strings.advancedinfo + '</a></div><p class="small wordwrap advancederrorinfo hide">' +
                  version +
                  '<b>'+_Prtg.Lang.common.strings.server + "</b>: " + location.host +'<br>' +
                  '<b>'+_Prtg.Lang.common.strings.url + '</b>: ' + ajaxSettings.url + (!!ajaxSettings.data ? '?' + decodeURIComponent(ajaxSettings.data) : '') +'<br>' +
                  '<b>Time</b>: ' + _Prtg.Util.getTimeString() +
                '</p>' +
              '</div>'),
            _Prtg.Lang.common.strings['error'] + (thrownError && ' ('+thrownError+') ') || '',
            jqXHR.status === 555 || !!jqXHR.ignoreHome ? {} : {
              buttons:[{
                html: _Prtg.Lang.Dialogs.strings.ok,
                'class': "actionbutton",
                click: function () {
                  if(jqXHR.gotoAfterError === false) {
                    $(this).dialog('destroy').remove();
                  } else {
                    document.location.href = jqXHR.gotoAfterError || "/home";
                  }
                }
              }]
            }
          );
        } else if(!connectionLostTimer && jqXHR.readyState === 0 && thrownError === "" && !_Prtg.Options.connectionLost) {
          connectionLostTimer = setTimeout(function() {
            _Prtg.Dialogs.connectionLost(ajaxSettings.url + ' ('+ (jqXHR.peNumber||thrownError||jqXHR.statusText) +')');
          }, 1000);
          return;
        }
        _Prtg.Growls.add({
          id: 'ajaxErrorGrowl',
          type: "info",
          title: _Prtg.Lang.common.strings.ajaxerror,
          message: _Prtg.Lang.common.strings.ajaxerror + ' ' + (jqXHR.peNumber ||'') + ":<br>" + thrownError,
          time: 4
        });
        _Prtg.api.logError(_Prtg.Lang.common.strings.ajaxerror.replace(' ','') + ": " + thrownError + ' - PE:' + (jqXHR.peNumber ||'none') + ' - ajaxSettings: ' + JSON.stringify(ajaxSettings).substring(0,250), {global:false});
      });

    $(window).on('unload', function() {
      _Prtg.xhrManager.xhrabort();
    });

    $('#helpcontainer').contexthelp();
  }

  // Stuff todo after new page loaded via ajax!
  function setupPage(parent) {
  	$('body').removeClass('page-initialized').addClass('page-initializing');
    if(!parent) {
      setupPage($('#container, #mainstuff'));
      return;
    }
    var $parent = !parent ? $('body') : (!(parent instanceof jQuery)) ? $(parent) : parent;
    if($parent.length) {
      !$body.is('.mapshow') && $parent.addClass('prtg-events-container').Events({});
      initPlugins($parent[0]);
    }

    decorateWitchPageIdentifier(document.location.pathname, $body, 'body');
    registerAddMenuEvents($parent);
  	$('body').removeClass('page-initializing').addClass('page-initialized');
  }

  function registerAddMenuEvents($container) {
  	var	showClass = "add-menu-open",
        eventDomain = 'click.' + showClass;

    $container.on('click mouseenter','.add-menu-badge', function(event){
	    var badge = $(this),
          addMenu = badge.parent().parent().find('.add-menu-wrapper .add-menu');

	    if (!addMenu.length) return;
      event.stopImmediatePropagation();
      addMenu.addClass(showClass)

    }).parent().on(eventDomain, function(){
			$(this).find('.add-menu-wrapper .add-menu').removeClass(showClass);
    });
	}
	
  function removePageIdentifiers($element, classSuffix) {
    var oldClasses = [],
        uniqueSuffix = '-' + classSuffix;
    if($element.length) {
      $.each($element.attr('class').split(/\s+/), function(i, className) {
        if(className.indexOf(uniqueSuffix)>-1) {
          oldClasses.push(className)
        }
      });
    }
    $.each(oldClasses, function(i, className) {
        $element.removeClass(className);
    });
  };

  function decorateWitchPageIdentifier(pathSource, $element, classSuffix) {
    if(!(pathSource && $element && $element instanceof jQuery && classSuffix))
        return;

    var lastSlash = pathSource.lastIndexOf('/'),
        lastDot = pathSource.lastIndexOf('.'),
        elementsWithOldIdentifiers = $("[class*='-" + classSuffix + "']");

    var pageNameStart = lastSlash === -1 ? 0 : lastSlash + 1,
        pageNameEnd = lastDot === -1 ? pathSource.length : lastDot,
        newPageClass = pathSource.substring(pageNameStart ,pageNameEnd) + '-' + classSuffix;

    removePageIdentifiers($element, classSuffix);
    $.each(elementsWithOldIdentifiers, function(i, $element) {
        removePageIdentifiers($element, classSuffix);
    });
    $element.addClass(newPageClass);
  }

  function initPlugins(parent) {
    // plugin must look like
    // <div class="prtg-plugin" data-plugin="PLUGINNAME" data-OPTIONALDATANAME="ANY OPTIONAL DATAVALUE EVEN JSON"></div>
    var $parent = !parent ? $('body') : (!(parent instanceof jQuery)) ? $(parent) : parent;

    $parent.find('.refreshable>.prtg-plugin').parent().removeClass('refreshable');
    $parent.find('.refreshable').toggleClass('refreshable refreshable-initialized clock-keeper-'+$parent.attr('id')).refreshable(parent);

    $parent.find('.prtg-plugin').toggleClass('prtg-plugin prtg-plugin-initializing').each(function initPlugin() {
      var self = this;
      var $self = $(this);
      var data = $self.data();
      var plugins = !!data && !!data.plugin && data.plugin.trim();
      var comment = $self.contents().filter(function(){return this.nodeType===8;});
      if(!!plugins) {
        plugins = plugins.split(' ');
        $.each(plugins, function(i, plugin){
          try {
            if(comment.length) {
              $.extend(true, data, JSON.parse(comment.get(0).nodeValue));
              comment.remove();
            }
            if ( !!_Prtg.Plugins[plugin]) $self[plugin] = _Prtg.Plugins[plugin].init.apply(self, [data, parent]);
            else $self[plugin](data, parent);
          } catch(e) {
            if(console && console.error) console.error('Error in plugin:', plugin, e.stack);
            _Prtg.api.logError("Error in plugin: " + plugin + ' - Error-Msg: ' + e.message + ' ' + e + " - Plugin-Data: " + JSON.stringify(data), {global:false});
          }
        });
      }
      data = null;
      comment =null;
    }).toggleClass('prtg-plugin-initialized prtg-plugin-initializing');

    if(_Prtg.Options.userIsReadOnly){
      $parent.find(".hideforreadonlyuser").remove();
    }
    loadlater($parent);
  }

  function loadOneLater(object, attribute, secondtry) {
    var $obj = $(object);
      if( $obj.find('.loadspinner').length == 0){
          $obj.append('<div class="loadspinner"></div>')
      }
    $obj.addClass("loading");
    $.ajax({
        url: encodeURI($obj.attr(attribute)),
        data:"",
        type: "POST",
        timeout: _Prtg.Options.ajaxTimeout*5,
        beforeSend: function(jqXHR){
          jqXHR.peNumber = 'PE1115';
        }
      }).done(function(html){
        $obj.addClass('prtg-events-container').Events({});
        $obj.removeClass("loading").html(html);
        initPlugins($obj);
      }).fail(function(){
        !secondtry && setTimeout(function(){loadOneLater(object, attribute, true);}, 500);
      });
  }
  function loadlater($elm){
    $elm.find(".loadlaterfirst").each(function () {
      loadOneLater(this, "loadurl");
    }).removeClass("loadlaterfirst");

    $elm.find(".loadlater").each(function(index) {
      if(index > 4) {
        setTimeout(function(){loadlater($elm);},500); //let's do the rest later to avoid overload!
        return false;
      } else {
        $(this).removeClass("loadlater");
        loadOneLater(this, "loadurl");
      }
    });
  }

  function addStyleSheet(rules){
  	$style = $("<style type='text/css' rel='stylesheet' name='_Prtg.Ininitialisation.js'/>").appendTo($("head"));
		if ($style[0].styleSheet) { // IE
			$style[0].styleSheet.cssText = rules.join(" ");
		}
		else {
			$style[0].appendChild(document.createTextNode(rules.join(" ")));
		}
  }
  $.extend(true, _Prtg, {
    Setup: setup,
    SetupPage: setupPage,
    initPlugins: initPlugins,
    decorateWitchPageIdentifier: decorateWitchPageIdentifier,
    removePageIdentifiers: removePageIdentifiers
  });
})(jQuery, window);
