//_Prtg.TCT.Plugin.js
(function($, window, document, undefined) {

  var templates = {
        'tour': '<div class="tct" role="tooltip"><div class="arrow"></div><h2 class="tct-title popover-title"></h2><div class="tct-content popover-content"></div><div class="buttonbar"><button class="actionbutton">'+_Prtg.Lang.TCT.gotit+'</button></div></div>',
        'sequence': '<div class="tct" role="tooltip"><div class="arrow"></div><h2 class="tct-title popover-title"></h2><div class="tct-content popover-content"></div><div class="buttonbar"><button class="actionbutton">'+_Prtg.Lang.TCT.gotit+'</button></div></div>',
        'guru': '<div class="tct-content">',
        'inline': '<div class="tct inlined"><h2 class="tct-title"></h2><div class="tct-content "></div><div class="buttonbar"><button class="actionbutton">'+_Prtg.Lang.TCT.gotit+'</button></div</div>',
        'closebutton': '<button class="closebutton" data-placement="left" title="'+_Prtg.Lang.TCT.dontshowagain+'"></button>'
      }
      , debug = false
      , dbgUndo = null
      , dbgStorage = window.sessionStorage
    ;

  function armUndo(undoables){
    if(undoables){
      !!console && !!console.log && console.log('undo is armed');
      $('body').off('.tct.undo').one('click.tct.undo', function(e){
        if(e.shiftKey && e.ctrlKey && e.altKey)
          undo();
      });
    }
  }

  function undoable(index, val){
    if(!!dbgStorage && !!debug){
      if(dbgUndo === null){
        if(!!dbgStorage.getItem('tct.'+debug))
          dbgUndo = JSON.parse(dbgStorage.getItem('tct.'+debug));
        else
          dbgUndo = {};
        armUndo(true);
      }
      if(!dbgUndo[index]){
        dbgUndo[index] = val;
        dbgStorage.setItem('tct.'+debug, JSON.stringify(dbgUndo));
      }
    }
  }

  function undo(dbg, storage){
    var dbgUndo = {};

    debug = dbg || debug;
    dbgStorage = storage || dbgStorage;
    if(!!dbgStorage){
      if(!!dbgStorage.getItem('tct.'+debug))
          dbgUndo = JSON.parse(dbgStorage.getItem('tct.'+debug));
      $.each(dbgUndo, function(key, val) {
        $.ajax({
          url: val,
          beforeSend: function(jqXHR) {
            jqXHR.ignoreManager = true;
            jqXHR.ignoreError = true;
          },
          type: "GET"
        });
      });
      dbgStorage.removeItem('tct.'+debug);
      dbgStorage.removeItem('tct.debug.mode');
      location.reload();
    }
  }
  function debugMode(dbg, storage){
    debug = dbg || true;
    if(typeof(storage) === "object")
      dbgStorage = storage;
    if(!!dbgStorage)
      dbgStorage.setItem('tct.debug.mode', debug);
     return (!!debug ? debug : 'off');
  }

  function TCT() {
    var self = this;

    this.runTCT = $();
    this.undo = undo;
    this.debug = debugMode;
    this.version = _Prtg.Options.version.split('.').slice(0,3).join('.');
    this.interval = Math.round(60*5 / _Prtg.Options.refreshInterval);
    this.intervalCount = 1;

    if(!!dbgStorage && !!dbgStorage.getItem("tct.debug.mode")){
      debug = dbgStorage.getItem("tct.debug.mode");
      !!console && !!console.log && console.log('tct.debug.mode', (!!debug ? debug : 'off'));
      armUndo(true);
    }
    _Prtg.Events.subscribe('document.ready.prtg tabloaded.events.prtg loaded.events.prtg',$.proxy(this.init,this));
    this.init();
    $.ajax({
      url: '/api/sensortypesinuse.json',
      data:{simpleobject:true},
      timeout: 100000,
      dataType: 'json',
      beforeSend: function(jqXHR) {
        jqXHR.ignoreManager = true;
        jqXHR.ignoreError = true;
      }
    }).done(function(sensortypes) {
      _Prtg.sensorTypes = sensortypes;
    });
  }

  TCT.prototype.initElement = function initElement(me, data) {
    var self = this
      , testAB = me.find('test')
      , check = null
      , comment = me.contents().filter(function(){return this.nodeType===8;})
      , action = null
      , funcwrap = "try{{code}}catch(e){!!console && !!console.log && console.log(e)};"
    ;

    if(me.is('.removeme')) {
      me.remove();
      return 0;
    }
    if(comment.length > 0) {
      action = comment.get(0).nodeValue;
      comment.remove();
    } else if(!!data.action) {
      action = data.action;
    } else {
      action = null;
    }
    if(!!action) {
      if(action.trim().split(' ')[0] === 'return') {
          data.code = (new Function('$tct, lastStats, sensorTypes', funcwrap.printf({code:unescape(action)},true)))(me, _Prtg.lastStats, _Prtg.sensorTypes);
          if(data.code.check)
            data.check = data.code.check;
          if(data.code.action)
            data.action = data.code.action;
      }else{
        data.action = new Function('$tct, lastStats, sensorTypes', funcwrap.printf({code:unescape(action)},true));
      }
    }

    if(!!data.check) {
      if(typeof(data.check) === 'string') {
        if(data.check.split(' ')[0].trim() === "return") {
          check = new Function('$tct, lastStats, sensorTypes', unescape(data.check));
          if(!check.call(me, me, _Prtg.lastStats, _Prtg.sensorTypes)) {
            me.remove();
            return 0;
          }
        }
      } else if(typeof(data.check) === 'function') {
        if(!data.check.call(me, me, _Prtg.lastStats, _Prtg.sensorTypes)) {
          me.remove();
          return 0;
        }
      }
    }
    me.children('[data-condition]').each(function(){
      var condition = $(this).data().condition;
      if(condition.split(' ')[0].trim() === "return") {
        condition = new Function('$tct, lastStats, sensorTypes', unescape(condition));
        if(!condition.call(me, me, _Prtg.lastStats, _Prtg.sensorTypes)) {
          $(this).remove();
        }
      }
    });

    data.confirm = this.confirm;

    !!testAB.length && testAB.each(function() {
      var $test = $(this)
        , take = parseInt($test.data().take, 10)
      ;

      if(!$.isNumeric(take))
        take = Math.floor(Math.random() * $test.children().length);
      $test
        .children()
        .eq(take)
        .remove()
        .end()
        .unwrap()
        .one('click.tct',function() {
          self.sendTest($(this).attr('data-key'));
        });
    });
    return me;
  };

  TCT.prototype.randNumber = function randNumber(min, max, last) {
    var ret = last;

    min = min || 0;
    while(ret === last) {
      ret = Math.floor(Math.random() * max) + min;
    }
    return ret;
  };

  TCT.prototype.rotate = function rotate(me, selector, ignoreinterval) {
    var rotate = me.find(selector || '>*')
      , current = rotate.filter(':visible')
      , idx = 0
    ;

    if(typeof me !== 'object') return;

    if(!ignoreinterval && ++this.intervalCount < this.interval) return;

    current.addClass('rotate').hide();

    if(rotate.length > 0) {
      if(rotate.index(current) + 1 < rotate.length)
        idx = rotate.index(current) + 1;
      rotate.eq(idx).removeClass('rotate').show().parent('test').show();
    } else { //empty
      me.remove();
    }
    this.intervalCount = 1;
  };

  TCT.prototype.init = function init(event, element) {
    var self = this;
    $('tct', element)
      .filter('[data-role="action"]:not(.initialized)')
        .each(function(){
          var me = $(this)
            , data = me.data()
          ;
          self.initElement(me, data);
        })
        .eq(0)
          .each(function() {
            var me = $(this)
              , data = me.data()
            ;

            !!data.action && data.action.call(me, _Prtg.lastStats, _Prtg.sensorTypes);
          })
        .end()
        .addClass('initialized')
      .end()
      .filter('[data-role="theater"]:not(.initialized)')
        .parent()
          .each(function(){
            var $tct
              , me = $(this)
            ;
            me.find('.removeme').remove();
            $tct = me.find('tct');
            if($tct.length > 0){
              $tct.addClass('rotate').hide();
              $tct.eq(self.randNumber(0, $tct.length-1)).show().removeClass('rotate');
              _Prtg.Events.subscribe('refresh.events.prtg rotate.events.prtg',$.proxy(self.rotate, self, me, 'tct[data-role="theater"]', false));
            }
          })
        .end()
        .each(function() {
          var me = $(this)
            , data = me.data()
            , elements = self.initElement(me, data)
          ;

          if(!data.hideCloseButton)
            me.children().append(templates.closebutton);
          if(elements.length > 1)
            _Prtg.Events.subscribe('refresh.events.prtg rotate.events.prtg',$.proxy(self.rotate, self, me, nothing, false));
        })
        .on('click.tct','button.closebutton',function(e) {
          var tct = $(this).closest('tct')
            , data = tct.data()
          ;

          e.stopImmediatePropagation();
          self
            .confirm((e.shiftKey & e.ctrlKey), data.role, data.page, 'skipped')
            .done(function(){
              self.rotate(tct.parent(), 'tct[data-role="theater"]', true);
              tct.remove();
            });
          return false;
        })
        .one('click.tct','a.box', function(e) {
          var tct = $(this).closest('tct')
            , data = tct.data()
          ;

          !!tct.data()
          && !!tct.data().page
          && self
              .confirm((e.shiftKey & e.ctrlKey), data.role, data.page, 'done')
              .done(function(){
                self.rotate(tct.parent(), 'tct[data-role="theater"]', true);
                tct.remove();
              });
        })
        .on('destroyed.tct', function() {
          var me = $(this);

          _Prtg.Tip.killPopups();
          $('.tooltip, .popover').remove();
          if(me.parent().find('tct[data-role="theater"]').length === 0){
            _Prtg.Events.unsubscribe('refresh.events.prtg rotate.events.prtg',$.proxy(self.rotate, self, me));
            document.location.reload();
          }
        })
        .addClass('initialized')
      .end()
      .filter('[data-role="guru"]:not(.initialized)')
        .filter(function(i) {
          var me = $(this)
            , data = me.data()
            , elements = self.initElement(me, data)
          ;

          if(elements.length) {
            me.html(
              $(templates['guru']).prepend(me.html())
            );
          }
          return (elements.length > 0);
        })
        .eq(0)
          .each(function() {
            var me = $(this)
              , data = me.data()
            ;

            !!data.action && data.action.call(me, _Prtg.lastStats, _Prtg.sensorTypes);
          })
          .css('display','block')
        .end()
        .one('click.tct','button.skip', function(e) {
          var tct = $(this).closest('tct');
          if(!$(this).hasClass("later"))
            self.confirm(e, 'guru', tct.data().page, 'skipped');
          tct.data('removeDelay', 1).remove();
        })
        .one('click.tct','button.actionbutton', function(e) {
          var tct = $(this).closest('tct');

          !!tct.data() && !!tct.data().page && self.confirm(e, 'guru', tct.data().page, 'done');
        })
        .one('destroyed.tct', function(e) {
          var data = $(this).data()
            , delay = data.removeDelay || 0
            , parent = $(this).parent()
            , $next
          ;
          _Prtg.Tip.killPopups();
          $('.tooltip, .popover').remove();
          if(!$(this).is(':visible')) return;


          $('#tctCursor').remove();
          setTimeout(function() {
            if(data.replaceWith) {
              parent.load(data.replaceWith, {id:_Prtg.Util.getUrlVars()['id']}, function() {
                _Prtg.initPlugins(parent);
                self.init();
              });
            } else {
              $next = $('tct[data-role="guru"].initialized').eq(0);
              if($next.length > 0) {
                if(!!$next.data().action)
                  $next.data().action.call($next, _Prtg.lastStats, _Prtg.sensorTypes);
                $next.css('display','block');
              }
            }
          },delay);
        })
        .addClass('initialized');
  };

  TCT.prototype.confirm = function confirm(event, type, page, action) {
    var index = type
      , msg = ""
      , data = [0, page]
    ;
    index += (!!page ? "."+page : "");
    data[1] = index;

    if(!this.version)
    	this.version = _Prtg.Options.version.split('.').slice(0,3).join('.');
    if(type === 'theater' && action === 'done')
      data.push(
        action,
        this.version,
        page
      );
    else
      data.push(
        type === 'guru' ? 'done' : action,
        this.version,
        index + '.' + action
      );



    if(debug === true)
      return $.when();

    !!window.__ga && window.__ga('send', 'event', type, index + '.' + action);

    if(event && !debug && event.ctrlKey && event.shiftKey && event.altKey){
      msg = debugMode($.now());
      !!console && !!console.log && console.log('tct.debug.mode', msg);
    }

    if(!!debug)
      undoable(index, location.origin+"/api/setshowhelpstatus.htm?action=1&page="+encodeURIComponent(index));

    return _Prtg.api.tctAction.apply(this, data);
  };

  TCT.prototype.sendTest = function sendTest(key) {
    if(debug === true) return;
    console.log('sendTest kissmetrics', {key:key,version:this.version});
  };

  _Prtg.Plugins.registerPlugin("TCT", TCT);

  $.fn.tct = function tct(method) {
    var args = Array.prototype.slice.call(arguments).slice(1)
      , cursor = $('<div id="tctCursor"><info /></div>')
      , methods = {
          run: function run(){
            this.dequeue('tct');
          },
          end: function end(queue, callback,delay){
            this.delay(delay||1, 'tct');
            queue.push(function(next){
              !!callback && callback.call($(this));
              next();
            });
          },
          waitFor: function waitFor(queue, element, event, callback){
            queue.push(function(next){
              $(element).off('.tct').one(event+'.tct', function(){
                !!callback && callback.call($(this));
                next();
              });
            });
          },
          blinkStart: function blinkStart(queue){
            queue.push(function(next){
              $('#tctCursor')
                .removeClass('animate-click')
                .show();
              next();
            });
          },
          blinkEnd: function blinkEnd(queue){
            queue.push(function(next){
               $('#tctCursor')
              	.addClass('animate-click')
              	.hide(1500);
              next();
            });
          },
          mouseMoveStart: function mouseMoveStart(queue, event){
            queue.push(function(next){
              _Prtg.Events.subscribeOnce('navigate.prtg', function(){
                $('#tctCursor').remove();
              });
              $('body').append(cursor);
              cursor
                .css({
                  top: event.pageY,
                  left:event.pageX-cursor.width()-2
                })
                .show();
              next();
            });
          },
          mouseMoveTo: function mouseMoveTo(queue, delay, offset, callback){
            var self = this;

            queue.push(function(next){
              var cursor = $('#tctCursor');
              if(!!callback && !offset)
                offset = callback.call($(this), cursor);
              cursor
                .animate(
                  {
                    top: offset.top,
                    left:offset.left -cursor.width()/2
                  }
                  , delay || 1000
                  ,'swing'
                  , function(){
                      next();
                    }
                );
            });
          },
          mouseMoveEnd: function mouseMoveEnd(queue, delay){
            delay = delay || 500;
            this.delay(delay, 'tct');
            queue.push(function(next){
              $('#tctCursor').remove();
              $(document).off('.catchall');
              document.body.style.cursor = 'auto';
              next();
            });
          },
          mouseInfo: function mouseInfo(queue, text, delay){
            queue.push(function(next){
              var cursor = $('#tctCursor').find('info');
              if(cursor.length)
                cursor.html(text).show(10,next);
            });
            !!delay &&  this.delay(delay, 'tct');
          },
          css: function css(queue, callback){
            queue.push(function(next){
              !!callback && callback.call($(this));
              next();
            });

          },
          click: function click(queue, delay){
            !!delay &&  this.delay(delay, 'tct');
            queue.push(function(next){
              $(this)
                .trigger('click')
              next();
            });
          },
          contextmenu: function contextmenu(queue, event, target, delay, callback){
            var self = this
              , offset = this.offset()
            ;

            !!delay &&  this.delay(delay, 'tct');
            queue.push(function(next){
              $(this).trigger({
                type: 'contextmenu',
                which: 3,
                pageY: offset.top+5,
                pageX: offset.left+5
              });
              !!target && $(target)
                .parentsUntil('#PRTGContextMenu>ul')
                .each(function(){
                  if(this.nodeName === 'UL')
                    $(this).css('display','block');
                });
              next();
            });
          }
      }
    ;

    return this.each(function(){
      var queue = $(this).queue('tct');

      if(queue.length === 0)
        queue = $(this).queue('tct', []);
      args.unshift($(this).queue('tct'));
      methods[method].apply($(this),args);
    });
  };
})(jQuery, window, document);
