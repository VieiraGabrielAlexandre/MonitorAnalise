//_Prtg.SensorTree.js
(function sensortree($) {
  $.extend(true, window._Prtg,{Plugins:{'groupviewsize': {init:function(){}}}});

    var regSimulated = /simulated/
      , regPaused = /paused/
      , regAutodisco = /autodisco/
      , regCopy = /copy/
      , regFixed = /fixed/
      , regDisconnected = /disconnected/
      , regUnapproved = /unapproved/;

    _Prtg.ObjectTree={printErrors: function prinErrors(group, res, objid, errors, librarymenu){
      var result = res.sensorxref
        , $sensors = $("sensor.replace"+objid)
        , push = false;
        if(!group.errors){
          group.errors = [];
          push = true;
        }
      for(var x=0, m=result.length; x < m && errors > 0; ++x){
        if(result[x].probegroupdevice.indexOf(objid) > -1){
          var sensor = result[x]
            , simulated = (regSimulated.test(sensor.info) === true)
            , paused = ($.inArray(sensor.status, [7,8,9,11,12]) !== -1) || simulated
            , pausedbyparent = paused && (regPaused.test(sensor.info) === false)
            , classes = [];

            push && group.errors.push(sensor);

            if(!sensor.access) classes.push('noContextMenu');
            if(librarymenu) classes.push('librarymenu');
            classes.push((regFixed.test(sensor.info) === true ? 'fixed' : ''));
            classes.push((paused ? (pausedbyparent && !simulated ? 'ispausedbyparent' : 'ispaused') : 'isnotpaused'));
            classes.push((sensor.favorite === ''?'isnotfavorite':'isfavorite'));
            classes.push(($.inArray(sensor.status, [5,13,14]) > -1?'sensorred':''));

          var c = (sensor.access
                ?'<icon popup="333"></icon><name popup="3333">'+sensor.name+"</name>"
                :"<icon></icon><name>"+sensor.name+"</name>")
                +"<value>"+(sensor.lastvalue==='-'?'':sensor.lastvalue)+"</value>"
                +"<favorit><span class='" + (sensor.favorite?'objectisfavorite':'objectisnotfavorite icon-gray') +" ui-icon ui-icon-flag' onclick='_Prtg.objectTools.faveObject.call(this,"+sensor.objid+",\"toggle\");return false;'></span></favorit>";
            $sensors.eq(--errors).replaceWith($('<sensor/>',{
              'idx':x,
              'objid':sensor.objid,
              'type':"sensor",
              'class':classes.join(' ').trim() + ' group status'+sensor.status,
              'title':(''+sensor.name).replace('"',' ')+' (' + (sensor.lastvalue === '-' ? '?' : sensor.lastvalue) +')',
              'goto':"true"}).html(c));
          $s = null;
        }
      }
      $sensors = null;
    }
  };
  var Layouts = {},
      _Layouts = {
          'sensortreesmall': {
              layout: 'tiny', action: 1,
              sensheight: {
                  'overview': [{'default': 20, 'probe': 20, 'group': 20, 'device': 15, 'library': 20, 'node': 20, 'margin': 10}, //expanded
                              {'default': 15, 'probe': 15, 'group': 15, 'device': 17, 'library': 15, 'node': 15, 'margin': 10}]  //collapsed
              }
          },
          'sensortreenormal': {
              layout: 'small', action: 2,
              sensheight: {
                  'overview': [{'default': 24, 'probe': 24, 'group': 24, 'device': 30, 'library': 35, 'node': 24, 'margin': 24}, //expanded
                              {'default': 20, 'probe': 20, 'group': 20, 'device': 20, 'library': 20, 'node': 20, 'margin': 28}], //collapsed
                  'managed': [{'default': 20, 'probe': 20, 'group': 20, 'device': 32, 'library': 26, 'node': 26, 'margin': 16},
                              {'default': 15, 'probe': 15, 'group': 15, 'device': 17, 'library': 15, 'node': 15, 'margin': 10}]
              }
          },
          'sensortreel': {
              layout: 'medium', action: 3,
              sensheight: {
                  'overview': [{'default': 24, 'probe': 24, 'group': 24, 'device': 59, 'library': 33, 'node': 33, 'margin': 26},
                              {'default': 26, 'probe': 26, 'group': 26, 'device': 26, 'library': 26, 'node': 26, 'margin': 23}]
              }
          },
          'sensortreexl': {
              layout: 'large', action: 4,
              sensheight: {
                  'overview': [{'default': 24, 'probe': 24, 'group': 24, 'device': 31, 'library': 31, 'node': 31, 'margin': 0},  //expanded
                                {'default': 0, 'probe': 0, 'group': 0, 'device': 0, 'library': 0, 'node': 0, 'margin': 46}]  //collapsed
              }
          },
      'treemap': { layout: 'treemap', action: 5, 'update': null},
      'sunburst': { layout: 'sunburst', action: 7, 'update': null}
    },
    Views = {},
    dataViews = function dataViews(view, opts) {
      if (Views[view] === undefined)
        Views[view] = new Slick.Data.RemoteModel(opts);
      return Views[view];
    },
    calcSensorColumns = null,
    postDataLoadRequest = null,
    postDataLoadTimer = null,
    setStyle = function setStyle($style, rules) {
      if ($style[0].styleSheet) { // IE
        $style[0].styleSheet.cssText = rules.join(' ');
      }
      else {
        $style[0].appendChild(document.createTextNode(rules.join(' ')));
      }
    },
    removeStyles = function removeStyles($style) {
      if (!!$style) {
        $style.remove();
      } else {
        for (var i = 0; i < document.styleSheets.length; ++i)
          if (document.styleSheets[i].title === 'sensortree')
            if (document.styleSheets[i].ownerNode)
              document.styleSheets[i].ownerNode.parentNode.removeChild(document.styleSheets[i].ownerNode);
      }
    },
    methods = {
      init: function init(options, junk, sensors) {
        var defaults = {
          layout: 'sensortreenormal',
          enableEditMode: true,
          editMode: false,
          dragMode: false,
          url: '/url/must/override',
          data: {},
          dataModel: 'RemoteModel',
          cached: false,
          hideControls: false,
          controlsParent: null,
          levelIndentCssWidth: '19px',
          loadDataOnRefresh: false,
          gridOptions: {
            fullHeight: false,
            editable: false,
            enableAddRow: false,
            enableCellNavigation: false,
            enableAsyncPostRender: true,
            multiSelect: false,
            asyncPostRenderDelay: 0
          },
          adornerOffsetX: 1,
          adornerOffsetY: 1,
          ___: 'defaults'
        };

        return this.each(function () {
          var $this = $(this)
            , $blocker
            , grid = null
            , data = $this.data('sensortree')
            , loadingIndicator = null
            , id = 'Prtg-ST-' + $.now()
            , lastFrom = -1
            , dataView = null
            , sensWidth = 0
            , collapsedSensWidth = 0
            , dragging = false
            , popupTimer = null
            , currentCursor = 'cursor-notallowed'
            , opts = null
            , $style = $("<style type='text/css' rel='stylesheet' />").appendTo($("head"))
            , $searchStyle = null
            , indent = 0
            , units = 'px'
            , rules = []
            , $controlsParent= $(this)
            , update = null
            , fixedColumnsToatalWidth = 0;

          Layouts[id] = $.extend(true,{},_Layouts);
          removeStyles();
          $this.on("destroyed",function(){
            if (!!$searchStyle && $searchStyle.length)
              removeStyles($searchStyle);
          });
          opts = $.extend(true, {}, defaults, options || {});
          $controlsParent = opts.controlsParent ? $(opts.controlsParent) : $controlsParent;
          opts.dragMode = opts.editMode || opts.dragMode;
          jQuery.event.special.drag.defaults.distance = _Prtg.Core.objects.dndSensitivity;
          //load filters
          try { if(!opts.filters) opts.filters = window.sessionStorage.getItem('sensorfilter').split(',');}catch(e){}
          //setting up the dataview
          if (!!opts.cached)
            dataView = dataViews(opts.url + '?' + jQuery.param(opts.data), opts);
          else
            dataView = dataViews(id, opts);
          opts.layout = opts.layout.toLowerCase();
          dataView.sensorHeights(!Layouts[id][opts.layout].sensheight || Layouts[id][opts.layout].sensheight[!!opts.displayMode ? opts.displayMode : 'overview']);
          opts.layout = Layouts[id][opts.layout].layout;
          $this.attr('id', id).addClass(opts.layout);
          $style.title = id;
          indent = parseFloat(opts.levelIndentCssWidth);
          units = opts.levelIndentCssWidth.slice(-2);
          if (/px|em|ex|pt|cm|in/.test(units) === false)
            units = 'px';
          rules.push('#' + id + ' level, #' + id + ' toggler{width:' + indent + units + ';}');
          for (var i = 1; i < 100; ++i) {
            rules.push('#' + id + ' .level' + i + ' {left:' + (indent * (i-1)) + units + ';}');
          }

          if(!!opts.filters)
            $this.addClass('hide'+ opts.filters.join(' hide'));
          // rules.push(("#" + id + " .treeItem>level:first-child *{ width:0px; }"));
          // rules.push(("#" + id + " .treeItem>level:first-child{ width:0px; }"));
          setStyle($style, rules);
          // Subscribe to Data View Events
          var onDataLoaded = function onDataLoaded(e, args, callback) {
            var self = this;
            if (!args.update) {
              $.when(self.initializeHeights(null, null, true)).done(function () {
                self.getData().collapse.call(self.getData(), args.from, args.to, self, true);
                self.updateCanvasHeight();
              });
            }
            $.when(self.initializeHeights(null, null, true)).done(function () {
              self.getData().refreshLeafs.call(self.getData(), self).always(function () {
                if (!!dragging && !!dragEvent && !!dragData) {
                  $.event.special.drop.reinit.apply(self);
                }
              });
            });
            if (!args.update) {
              self.invalidate();
              !!callback && callback();
            }
            $this.triggerHandler('dataloaded',self.getData().getItem(0));
            !!$this.data('sensortree') && !!$this.data('sensortree').dataview.update && $this.data('sensortree').dataview.update(true);
          };
          var onRowCountChanged = function onRowCountChanged(e, args) {
            var self = this;
            $.when(self.initializeHeights(args.from, args.to, true)).done(function () {
              self.invalidate();
            });

          };
          dataView.onRowCountChanged.subscribe(onRowCountChanged);
          dataView.onDataLoaded.subscribe(onDataLoaded);
          var initResizer=false;
          if (opts.columns.length > 1 && opts.columns[opts.columns.length - 1].width === "*") {
            var fillColumnWidth = -1
              , initColumns = function initColumns(treedepth, minWidth) {
                  opts.columns[0].width = minWidth + indent * treedepth;
                  for (var i = 0; i < opts.columns.length; ++i) {
                    if (opts.columns[i].width !== '*') {
                      fixedColumnsToatalWidth += opts.columns[i].width;
                    } else {
                      fillColumnWidth = i;
                    }
                  }
                  if(fillColumnWidth > -1)
                    opts.columns[fillColumnWidth].width = $this.width() - fixedColumnsToatalWidth -5; //padding

                  grid.setColumns(grid.getColumns());
                };
            function doResize(e) {
              var canvas = $(grid.getCanvasNode());
              if(!canvas.length || (!opts.gridOptions.fullHeight && e.namespace==='')) return '++';
              if(canvas.parent().length)
                grid.getColumns()[fillColumnWidth].width = canvas.width() - fixedColumnsToatalWidth ;
              calcSensorColumns($this, grid, $this.data('sensortree').dataview);
              $.when(grid.initializeHeights(null, null, true)).done(function () {
                $.when(grid.setColumns(grid.getColumns())).done(function(){
                  grid.getData().refreshLeafs.call(grid.getData(), grid);
                });
              });
              !!$this.data('sensortree') && !!$this.data('sensortree').dataview.update && $this.data('sensortree').dataview.update();
            }
          }

          grid = new Slick.Grid(this, [], opts.columns, opts.gridOptions);
          grid.registerPlugin(new Slick.DynamicRowHeight(grid));
          var $elm = $(grid.getCanvasNode()),
          $parent = $elm.parent();
          $elm.detach();

          //if we have a dynColumn we do some calculation on resize
          if (grid.getColumns().length > 1 && !!grid.getColumns()[1].asyncPostRender) {
            $this.addClass('slickTree');
            if(!opts.gridOptions.fullHeight)
              $this.find('.slick-viewport').css({ 'overflow-y': 'auto','overflow-x': 'hidden', "height": "100%" });

            calcSensorColumns = function calculateSensorColumns($context, grid, dataview, opts) {
              var leafCol = $context.outerWidth(),
                  id = 'sensordefault' + $.now();

              if(((opts||{}).layout||'') === 'tiny' || ((opts||{}).displayMode||'') === 'managed') {
                  leafCol = leafCol - 246;
              }
              $context.append("<sensor id='sensor" + id + "' status='Down' style='opacity:0' />");
              $sensor = $context.find('#sensor' + id);
              sensWidth = $sensor.outerWidth(true);
              $context.addClass('collapsed');
              collapsedSensWidth = $sensor.outerWidth(true);
                $sensor.remove();
                $context.removeClass('collapsed');
              (dataview || grid.getData()).sensPerLine( Math.floor(leafCol / sensWidth));
              (dataview || grid.getData()).collapsedSensPerLine( Math.floor(leafCol / collapsedSensWidth));
            };
          }
          dataView.layout(opts.layout);

          grid._positions = dataView.dynPositions;
          grid._rows = dataView.visibleRows;
          //grid.onRefreshLeafs = new Slick.Event();
          dataView.onPostDataLoaded.subscribe(function (e, args) {
            this.asyncPostProcessRange(args);
            if(!initResizer && !$('body').is('.mapshow')){
              initResizer = true;
              $this.on('resize.objecttree',doResize);
            }
          });

          !data && $this.data('sensortree', {id: id, grid: grid, dataview: dataView, options: opts, eventEditModeOnly: {} });
          data = $this.data('sensortree');
          // grid default events
          //handle scrolling and data loading
          grid.onViewportChanged.subscribe(function onViewportChanged(e) {
            var self = this;
            self.getData().refreshLeafs.call(self.getData(), self).always(function () {
              if (!!dragging && !!dragEvent && !!dragData) {
                $.event.special.drop.reinit.apply(self);
              }
            });
          });

          // drag and drop binding
          if (opts.dragMode) {
            var scrollTimer = null
              , dragEvent = null
              , dragData = null
              , loadDataOnRefresh;
            grid.onDragInit.subscribe(function dragInit(e, dd) {
              _Prtg.Tip.killPopups();
              dragEvent = null;
              dragData = null;
              if (!!popupTimer)
                clearTimeout(popupTimer);
              popupTimer = null;
              //e.preventDefault();
            });
            grid.onDragStart.subscribe(function dragStart(e, dd) {
              loadDataOnRefresh = opts.loadDataOnRefresh;
              opts.loadDataOnRefresh = false;
              var row = $(e.target).closest('*[row]').first().attr('row')
                , $target = $(e.target).andSelf().closest('.dragable,.nondragable,.selected');
              if ($target.is('.nondragable') || (!row && !$target.is('.dragable')))
                return false;
              if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.cancelCurrentEdit())
                return false;

              dd.selection = $target.is('.dragable') ? $target : $(e.target).closest('[objid]');
              dd.type = (dd.selection.find('probe,group,device,library')[0] || dd.selection[0] || { localname: undefined }).localName;
              if (!dd.type || row === 0 || ($this.is('.libTree') && dd.type !== 'library')) {
                opts.loadDataOnRefresh = true;
                return false;
              }
              if (dd.type === 'sensor') {
                var sensorIdx = dd.selection.attr('idx');
                if (!!sensorIdx)
                  dd.sensorIdx = parseInt(sensorIdx,10);
                dd.sensors = dd.selection.addClass('selected').closest('*[row]').andSelf().find('sensor.selected');
              // }
              }else{
                dd.selection =  dd.selection.addClass('selected').closest('.grid-canvas').find('row .selected');
              }
              dd.data = grid.getDataItem(row);
              dd.row = dd.data._idx;
              dd.dataView = dataView;
              dragEvent = e;
              dragData = dd;
              dd.now = $.now();
              var $proxy = $('<div />');
              $proxy.append(dd.selection.clone().children('div').css('height', 'auto').end());
              $proxy = $('<div/>', {
                id: "dragAdorner",
                type: dd.type,
                css: {
                  'top': e.pageY + opts.adornerOffsetY,
                  'left': e.pageX + opts.adornerOffsetX
                }
              }).append($proxy);
              $proxy.appendTo("body");
              dd.adorner = $proxy;
              dd.feedback = false;
              $this.addClass('cursor-notallowed dragging');
              $('body').addClass('cursor-notallowed');
              dragging = true;
              return $proxy;
            });
            grid.onDrag.subscribe(function drag(e, dd) {
              var $this = $(e.target).closest('.slickTree,#dropTarget').addBack('#dropTarget')
                , data = $this.data('sensortree');
              if (!!scrollTimer) {
                clearInterval(scrollTimer);
                scrollTimer = null;
              }
              if (!!dd.adorner)
                dd.adorner.css({
                  'top': e.pageY + opts.adornerOffsetY,
                  'left': e.pageX + opts.adornerOffsetX
                });
              var cursor =
                !!dd.feedback
                ? dd.feedback === 'copy'
                  ? 'cursor-copy'
                  : ((e.ctrlKey||e.metaKey) === regCopy.test(dd.feedback) && !e.shiftKey)
                    ? 'cursor-copy'
                    : 'cursor-none'
                : 'cursor-notallowed';
              if (cursor !== currentCursor) {
                $this.removeClass(currentCursor);
                currentCursor = cursor;
                $this.addClass(currentCursor);
              }
              if (!!data && data.options.editMode) {
                var scrollwindow = data.options.gridOptions.fullHeight,
                $viewport = scrollwindow ? $(window) : $this.find('.slick-viewport'),
                scrolltop = $viewport.scrollTop(),
                top = scrollwindow
                  ? 0//$('#breadcrumbs').offset().top + $('#breadcrumbs').height() + 10
                  : $viewport.offset().top,
                delta = top - e.pageY,
                scrollstop = scrollwindow
                  ? $(document).height() - $viewport.height()
                  : $this.find('.grid-canvas').height() - $viewport.height()
                scroll = parseInt($viewport.height() / 10);
                if (delta < 0 && delta >= -10) {
                  scrollTimer = setInterval(function () {
                    scrolltop -= scroll;
                    if (scrolltop < 0)
                      scrolltop = 0;
                    $viewport.scrollTop(scrolltop);
                    $.event.special.drop.reinit();
                  }, 100);
                }
                delta = scrollwindow
                ? $viewport.height() + scrolltop - e.pageY
                : delta + $viewport.height();
                if (delta > 0 && delta < 10) {
                  scrollTimer = setInterval(function () {
                    scrolltop += scroll;
                    if (scrolltop > scrollstop)
                      scrolltop = scrollstop;
                    $viewport.scrollTop(scrolltop);
                    $.event.special.drop.reinit();
                  }, 100);
                }
              }
            });
            grid.onDragEnd.subscribe(function dragend(e, dd) {
              opts.loadDataOnRefresh = loadDataOnRefresh;

              if (!!scrollTimer) {
                clearInterval(scrollTimer);
                scrollTimer = null;
              }
              dragging = dd.dragging = false;
              dragEvent = null;
              dragData = null;

              $('#dragAdorner').remove();

              $('.slickTree, .libTree, #dropTarget')
              .removeClass('cursor-none cursor-copy cursor-notallowed dragging')
              .removeClass(currentCursor);
              $('body').removeClass('cursor-notallowed');
              $('#treeAdorner, #sensorAdorner').removeClass().remove();

            });
            grid.onScroll.subscribe(function () {
              if (!!popupTimer)
                clearTimeout(popupTimer);
              popupTimer = null;
            });
          }

          var $blocker = $('<div id="treeblocker"></div>').prependTo($this).hide();
          if (!opts.hideControls) {
            if($controlsParent.length){
              $this.on('dataloaded', function(e,junk){
                if(!!junk)
                  $.each({
                    'totalsens': 'span.totalsens',
                    'downsens': 'span.sensr',
                    'partialdownsens': 'span.sensq',
                    'downacksens': 'span.senso',
                    'warnsens':'span.sensy',
                    'upsens': 'span.sensg',
                    'pausedsens':'span.sensb',
                    'unusualsens': 'span.sensp',
                    'undefinedsens':'span.sensx'
                  }, function(i,v){
                      var val = '0'
                        , filter = i.replace('sens','');
                      if(junk.hasOwnProperty(i))
                        val = junk[i]===''?'0':junk[i]
                      $controlsParent.find(v).text(val)
                        .closest('div[sensorstateswitch]')
                        .removeAttr('class')
                        .addClass('iszero'+val);
                  });
                  dataView.Filters().forEach(function(val){
                    $controlsParent.find('#content'+val).prop('checked', false);
                  });
              });
            }

            $('#treesearch', $controlsParent).on({
              focus: function () {
                var self = $(this);
                if (self.val() === self.attr('defaultvalue'))
                  self.val('');
                $(this).removeData();
                if (!!$searchStyle && $searchStyle.length)
                  if (!!$searchStyle && $searchStyle.length)
                    removeStyles($searchStyle);
                $('.treesearchbox label', $controlsParent).removeClass('working ui-icon-close');
              },
              blur: function () {
                var self = $(this);
                if (self.val() === '')
                  self.val(self.attr('defaultvalue'));
              },
              select: function (e) {
                $(this).data('textIsSelected',true);
              },
              keydown: function (e) {
                if ($.inArray(e.which, [8, 46]) !== -1 || $(this).data('textIsSelected')) {
                  $(this).removeData();
                  if (!!$searchStyle && $searchStyle.length)
                    removeStyles($searchStyle);
                  $('.treesearchbox label', $controlsParent).removeClass('working ui-icon-close');
                }
                 $(this).data('textIsSelected',false);
              },
              keyup: function (e) {
                var $this = $(this);
                next = $this.data('next'),
                found = $this.data('found'),
                rules = [];
                if ($.inArray(e.which, [13, 114]) !== -1 && e.target.value.length > 0) {
                  if (!found) {
                    if (!!$searchStyle && $searchStyle.length)
                      removeStyles($searchStyle);
                    $searchStyle = $("<style type='text/css' rel='stylesheet' title='sensortree' />").appendTo($("head"));
                    setStyle($searchStyle, ['probe, group, device, library, sensor, path, div.cell, span.sensor { opacity:0.3!important; }']);

                    $('.treesearchbox label', $controlsParent).addClass('working');

                    dataView.find(e.target.value)
                    .always(function (d) {
                      found = d['multiobj'];
                      for (var i = 0; i < found.length; ) {
                        var f = found[i];
                        //if($.inArray(opts.data.id, f.probegroupdevice) > -1){
                          if (f.basetype === 'sensor') {
                            f['objid'] = f.probegroupdevice.pop();
                            f['parentid'] = f.probegroupdevice[f.probegroupdevice.length - 1];
                          } else {
                            f['parentid'] = f['objid'] = f.probegroupdevice[f.probegroupdevice.length - 1];
                          }
                          f['path'] = f.probegroupdevice.join('-');
                          f['idx'] = dataView.getPositionById(f.path);
                          ++i;
                        // }else{
                        //  found.splice(i,1);
                        // }
                      }
                      found = found.sort(function (a, b) {
                        return (a['idx'] - b['idx']);
                      });
                      $this.data('found', found);
                      $('.treesearchbox label', $controlsParent).removeClass('working').addClass('ui-icon-close');
                      if (found.length > 0) {
                        if(opts.layout === "sunburst"){
                          setStyle($searchStyle, $.map(found, function (f) {
                              return 'path[objid="' + f.parentid + '"] {opacity:1!important;}';
                          }));
                        }else if(opts.layout === "treemap"){
                          setStyle($searchStyle, $.map(found, function (f) {
                              return 'div.cell[objid="' + f.parentid + '"] {opacity:1!important;}';
                          }));
                        }else{
                          setStyle($searchStyle, $.map(found, function (f) {
                            if (f.basetype === 'sensor')
                              return 'sensor[objid="' + f.objid + '"] {opacity:1!important;}';
                            else
                              return 'row div[objid="' + f.objid + '"] *{opacity:1!important;}';
                          }));
                          $.each(found, function (i, f) {
                            dataView.ensureVisible(f.idx, grid);
                          });
                          eventFunctions['search'].apply($this, [found, 0, 1]);
                        }
                      } else if (!!$searchStyle && $searchStyle.length)
                        removeStyles($searchStyle);

                    });
                  } else {
                    if (found.length > 0)
                      eventFunctions['search'].apply($this, [found, next, 2]);
                    else if (!!$searchStyle && $searchStyle.length)
                      removeStyles($searchStyle);
                  }
                }
              }
            });
          }

          //row and header item delegates
          var eventFunctions = {
            'goto': function($elm, ctrlKey) {
              var type = $elm.attr('type');
              type = type + (type === 'probe' ? 'node' : '');
              clearTimeout(popupTimer);
              popupTimer = null;

              var e = $.Event('click.hjax', {
                data: {'namespace': 'linkloader.prtg', 'container': (!!window.winGUI?'#mainstuff':'#container')},
                ctrlKey: ctrlKey
              });
              if (ctrlKey)
                window.open(($elm.attr('altType') || type) + '.htm?id=' + $elm.attr('objid')+($elm.attr('filter')||''),'_blank');
              else
                $('<a style="display:none;" href="' + ($elm.attr('altType') || type) + '.htm?id=' + $elm.attr('objid') +($elm.attr('filter')||'')+'"></a>')
                  .appendTo((!!window.winGUI?'#mainstuff':'#main'))
                  .trigger('click.hjax', ctrlKey)
              return;
            },
            popup: function ($elm, ctrlKey, position) {
              var type = $elm.attr('type');
              type = type + (type === 'probe' ? 'node' : '');
              var $obj = $('<obj/>',
              {
                id: $elm.attr('objid'),
                'class': $elm.attr('type') + 'menu' + ' ' + $elm.attr('class'),
                href: type + '.htm?id=' + $elm.attr('objid') + ($elm.attr('filter')||''),
                css: {
                  'background-image': $elm.find('icon').css('background-image'),
                  'background-position': $elm.find('icon').css('background-position')
                },
                text: $elm.find('name,title').text()
              });
              $.fn.ptip.show.apply($obj[0], [position]);
              popupTimer = null;
              return false;
            },
            toggle: function(e) {
              e.stopImmediatePropagation();
              var data = $this.data('sensortree'),
              $self = $($(this).parents('*[type]')[0] || $(this).parent().find('*[objid][type]')[0]);
              if ((data.options.layout === 'tiny'
              && $self.attr('type') === 'device')
              || $self.is('.noaccess')
              || $self.is('.notoggle'))
                return false;
              var idx = $($(this).parents('*[row]')[0]).attr('row');
              if(!!opts.ignoreFold || $self.is('.fold-ignore'))
                data.dataview.toggleLocal(idx,grid);
              else
                data.dataview.toggle(idx, grid);
              if (data.options.postDataLoad)
                data.dataview.refreshLeafs(grid);
              return false;
            },
            switchView: function(e) {
              var layout = Layouts[id][e.target.value.toLowerCase()];

              if (!!$searchStyle && $searchStyle.length)
                removeStyles($searchStyle);
              $('.treesearchbox label', $controlsParent).removeClass('working ui-icon-close');

              if (!_Prtg.Options.userIsReadOnly) {
                $this.sensortree('setLayout', e.target.value.toLowerCase());
              } else {
                $this.sensortree('switchLayout', Layouts[id], layout);
              }
            },
            switchFilter: function(e) {
              // e.stopImmediatePropagation();
              $this.toggleClass('hide' + e.target.value);
              dataView.toggleFilter(e.target.value);
              $.when(grid.initializeHeights(0, 0)).done(function () {
                grid.invalidate();
              });
            !!$this.data('sensortree') && !!$this.data('sensortree').dataview.update && $this.data('sensortree').dataview.update();
            },
            search: function (found, next) {
              if(opts.layout === "sunburst" || opts.layout === "treemap")return;
              var row = dataView.ensureVisible(found[next].idx, grid);
              if (data.options.postDataLoad)
                data.dataview.refreshLeafs(grid);

              if (row > -1){
                if (!opts.gridOptions.fullHeight)
                  grid.scrollRowIntoView(row);
                else
                  $(document).scrollTop($('*[idx="' + row + '"]').offset().top);
              }
              ++next;
              if (next < found.length)
                $(this).data('next', next);
              else
                $(this).data('next', (next=0));
            }
          };

          if ((!opts.editMode && !opts.noPopups) || !!opts.clickable) {
            $this
              .delegate('icon[popup], [goto], goto', {
                click: function(e) {
                  if (dragging || $this.is('.cursor-progress')) return false;
                  var $self = $($(this).closest('*[objid][type]')[0] || $(this).find('*[objid][type]')[0]),
                    func = eventFunctions['goto'];
                  if ($self.is('.noaccess') || $self.closest('#objecttreecontainer').hasClass('.treeiseditable'))
                    return false;
                  if (!!popupTimer) {
                    clearTimeout(popupTimer);
                    popupTimer = null;
                  }
                  if ($(this).is('.goto'))
                    func = eventFunctions['popup'];
                  func.apply($self[0], [$self, (e.ctrlKey||e.metaKey)]);
                  return false;
                }
              });
          }
          if (!opts.editMode && !opts.noPopups) {
            $this
              .delegate('[popup]', {
                mouseenter: function(e) {
                  if (dragging || $this.is('.cursor-progress')) return false;
                  var $self = $($(this).closest('[objid][type]')[0] || $(this).find('[objid][type]')[0]),
                    func = eventFunctions['popup'],
                    mouse = { left: e.pageX - 5, top: e.pageY - 5, width: 0, height: 0 };
                  if ($self.is('.noaccess'))
                    return false;
                  if (!!popupTimer) {
                    clearTimeout(popupTimer);
                    popupTimer = null;
                  }
                  if (!$("#jqContextMenu").is(":visible") && !dragging) {
                    popupTimer = setTimeout(function () { func.call($self[0], $self, false, mouse) }, parseInt($(this).attr('popup')));
                    $this.unbind('mousemove.slickTree').bind('mousemove.slickTree', function (e) {
                      mouse = { left: e.pageX - 5, top: e.pageY - 5, width: 0, height: 0 };
                    });
                  }
                  // return false;
                },
                mouseleave: function() {
                  clearTimeout(popupTimer);
                  popupTimer = null;
                  $this.unbind('mousemove.slickTree');
                  //return false
                }
              })
              .on({
                mouseenter: function() {
                  var $self = $(this)
                    h = $self.closest('.indent').css('height','auto').height();
                    $self.closest('.indent').css('height','');
                    if(h>$self.closest('row').height())
                      $self
                        .closest('row').height(h)
                        .children().height(h);
                },
                mouseleave: function() {
                  var $self = $(this);
                    $self
                      .closest('row').css('height','')
                      .children().css('height','');
                }
              }, 'probe, probe name, probe condition, probe message, group, group name, group condition, group message, group favorit, device, device name, device condition, device message,device favorit');
          }

          $this.on('click tap','toggler',eventFunctions['toggle']);
          $controlsParent
            .delegate('.sensorstateswitches input', {
              change: eventFunctions['switchFilter']
            })
            .delegate('.treesizeswitches input', {
              change: eventFunctions['switchView']
            })
            .delegate('.treesizeswitches label', {
              click: function(e){
                $(this).prev('input').trigger('click');
              }
            });

          //context menu
          //HINT: have a look at slickgrid.selectionmodel in handleClick e.stopImmediatePropagation() line at the bottom hase to be commented

          $(document).on('contextmenu.sensortree', '.treeItem,.sensorItem,probe,group,device,sensor,library,name,condition,favorit,status,message,icon,level,g[popup]', function treeContextMenu(e) {
              var $elm = $($(e.target).closest('*[objid][type][type!="probenode"]').not('.noContextMenu')[0])
                , objid = 0;
              if (!!popupTimer) {
                clearTimeout(popupTimer);
                popupTimer = null;
              }
              if ($elm.length === 1) {
                objid = $elm.attr('objid');
                e.target = $('<a/>', {
                  id: objid,
                  expandurl: '&targeturl=' + encodeURI(document.location),
                  callerid: id,
                  row: $elm.closest('div[row]').attr('row'),
                  target: !!$elm.attr('path') ? '[path="' + $elm.attr('path') + '"] level icon' : '[path="' + $elm.closest('[path]').attr('path') + '"] *[objid="' + $elm.attr('objid') + '"] icon',
                  'class': [(objid==="0" ? 'rootgroup':$elm.attr('type')) + 'menu'].join(' ') + ' ' + $elm.attr('class'),
                  href: $elm.attr('type') + '.htm?id=' + objid,
                  css: { 'background-image': $elm.find('icon').css('background-image') },
                  text: $elm.text()
                })[0];
              }
          });

          //start loading data
          var loaded = {
            change: false,
            from: 0,
            rowcountchange: false,
            to: 0,
            update: false,
            treeDepth: 0
          };
          if (!dataView.hasOwnProperty('isinitialized')) {
            loaded = dataView.initializeData(0, junk, false);
            dataView['isinitialized'] = true;
          } else {
            loaded.treeDepth = dataView.treeDepth();
            loaded.to = dataView.getSize();
          }
          $parent.append($elm);
          if(opts.columns.length > 0 ){
            !!initColumns && initColumns(loaded.treeDepth,_Prtg.Core.objects.nameColumnWidth);
            data.grid.getColumns()[grid.getColumnIndex('leafs')]['layout'] = opts.layout !== 'tiny';
            if($(grid.getCanvasNode()).length)
              calcSensorColumns($(grid.getCanvasNode()), grid, dataView, opts);
          }
          grid.setData(dataView);

          if (!!sensors) {
            dataView.setLeafs(sensors.sensorxref);
          } else {
            onDataLoaded.call(grid, null, loaded, function () {
              if (opts.gridOptions.fullHeight)
                grid.fullHeight();
            });
          }

          Layouts[id].treeElement = $this.find('.grid-canvas');
          if (!!Layouts[id][opts.layout] && Layouts[id][opts.layout].sensheight === undefined) {
            var newlayout = opts.layout;
            data.options.layout = "sensortreenormal";
            $this.sensortree('switchLayout', Layouts[id], Layouts[id][newlayout]);

            // if(!data.dataview.getItem(0)._collapsed && !$('body').is('.mapshow')) data.dataview.toggleLocal(0,data.grid);
            // fullSize = opts.gridOptions.setFullsize();

            // var viewPlugin = $this[opts.layout]($this.data('sensortree'),null)[0];
            // Layouts[id][opts.layout].element = viewPlugin.element();
            // $this.data('sensortree').dataview.update =  $.proxy(viewPlugin.update, viewPlugin);
          }
          var refreshTree = function sensortreeRefresh(e,invalidate){
              this.dataview.refresh.call(this, this.grid, invalidate);
          };
          if (!opts.editMode && !!opts.timer){
            opts.timer.subscribe('refresh.events.prtg', $.proxy(refreshTree, data));
            opts.timer.subscribeOnce('navigate.prtg', $.proxy(function(){
              opts.timer.unsubscribe('refresh.events.prtg', $.proxy(refreshTree, data));
            },data));
          }

        });
      },
      destroy: function () {
        return this.each(function () {
          var $this = $(this);
          data = $this.data('sensortree');
          $(window).unbind('.sensortree');
        })

      },
      renderNode: function (row, cell, value, columnDef, dataContext) {
        var dx = dataContext;
        return $.jqote(_Prtg.Core.getObject(dx.basetype.toLowerCase()).template, dx);
      },
      switchLayout: function (Layouts, layout) {
        var $self = $(this)
          , data = $self.data('sensortree')
          , opts = data.options
          , fullSize = false
          , currentLayout = data.options.layout.toLowerCase();

        if (!layout.hasOwnProperty('sensheight')) {
          if(!data.dataview.getItem(0)._collapsed) data.dataview.toggleLocal(0,data.grid);
          fullSize = opts.gridOptions.setFullsize(false);
          if(!!Layouts[currentLayout] && !!Layouts[currentLayout].element){
            Layouts[currentLayout].element.detach();
          }else{
            Layouts.treeElement.detach();
          }
          var myPlugin = $self[layout.layout](data,null)[0];
          layout.element = myPlugin.element();
          data.dataview.update = $.proxy(myPlugin.update, myPlugin);
          $self.find('.slick-viewport')
            .append(layout.element);
          $('.size-by-switch, .size-switch', opts.controlsParent).addClass('show');
          data.dataview.update();
        } else {
          if(data.dataview.getItem(0)._collapsed) data.dataview.toggleLocal(0,data.grid);
          fullSize = opts.gridOptions.setFullsize();
          if(!!Layouts[currentLayout] && !!Layouts[currentLayout].element){
            Layouts[currentLayout].element.detach();
          }
          $self.find('.slick-viewport')
            .append(Layouts.treeElement);
          data.dataview.sensorHeights(layout.sensheight[!!opts.displayMode ? opts.displayMode : 'overview']);
          $('.size-by-switch, .size-switch', opts.controlsParent).removeClass('show');
          data.dataview.update = null;
        }
        data.dataview.layout(layout.layout);
        data.grid.getColumns()[data.grid.getColumnIndex('leafs')]['layout'] = layout.layout !== 'tiny';
        $self.removeClass(data.options.layout).addClass(layout.layout);
        data.options.layout = layout.layout;
        calcSensorColumns($(data.grid.getCanvasNode()), data.grid);
        $.when(data.grid.initializeHeights(null, null, true)).done(function () {
          if (fullSize) {
            data.grid.fullHeight();
            data.grid.invalidate();
            $('#treeblocker').hide();
          } else {
            data.dataview.refreshLeafs(data.grid).done(function () {
              data.grid.invalidate();
              $('#treeblocker').hide(); });
          }
        });

      },
      setLayout: function (name) {
        var $self = $(this)
          , layouts = Layouts[$self.attr('id')]
          , layout = layouts[name.toLowerCase()]
          , action = layout.action;
        $('#treeblocker').show();
        if (!_Prtg.Options.userIsReadOnly) {
          $.ajax({
            url: "/api/setviewsize.htm?action=" + action,
            success: function () {
              $self.sensortree('switchLayout', layouts, layout);
            }
          });
        } else {
          $self.sensortree('switchLayout', layouts, layout, action);
        }
      },
      update: function (idx, data, objid) { dataview.updateData(idx, data, objid); },
      refresh: function (invalidate) {
        var data = $(this).data('sensortree');
        data.dataview.refresh.call(data.dataview, data.grid, invalidate);
      },
      reload: function (from, to) {
        var data = $(this).data('sensortree');
        data.dataview.reloadData.call(data.dataview, from, to);
      },
      subscribe: function (event, callback) {
        var grid = $(this).data('sensortree').grid;
        grid[event].subscribe(callback);
      },
      registerDropTarget: function (target) {
        $(target).on.apply($([].shift.call(arguments)), arguments);
      },
      unregisterDropTarget: function (target) {
        $(target).on.apply($([].shift.call(arguments)), arguments);
      },
      treeMap: function () { //dummy
        treemap();
      },
      ___: 'end methods'
    };


  if (!_Prtg.Core.objects.sensorTree.hasOwnProperty('columns')) {
    $.extend(true,
      _Prtg.Core.objects.sensorTree,
      {
        treetype: 'sensorxref',
        gridOptions: {
          headerHeight: 0,
          showTopPanel: true,
          topPanelHeight: 31,
          showHeaderRow: false,
          multiSelect: false,
          headerRowHeight: 18
        },

        columns: [
          {
            id: 'tree',
            name: _Prtg.Lang.sensorTree.strings.ColumnHeaderObjects,
            formatter: function (row, cell, value, columnDef, dataContext) {
              return $.jqote(_Prtg.Core.getObject(dataContext.basetype.toLowerCase()).template, dataContext);
            },
            width: _Prtg.Core.objects.nameColumnWidth,
            minWidth: _Prtg.Core.objects.nameColumnWidth,
            cssClass: function(d){return (!!d && regUnapproved.test(d.info) ? 'treeColumn unapproved' : 'treeColumn');}
          },
          {
            id: 'leafs',
            name: _Prtg.Lang.sensorTree.strings.ColumnHeaderSensors,
            formatter: function formatter(row, cell, value, colDef, data) {
              var l = '';
              if (data.basetype === 'device') {
                if (data.totalsens === 0) {
                  l =
                    (_Prtg.Options.userIsReadOnly
                      || !data._access
                      || regAutodisco.test(data.info)===true
                      || regDisconnected.test(data.info)===true
                    ) ?
                    '' :
                    '<a class="treeminilink actionbutton" href="addsensor.htm?id=' + data.objid + '">' + _Prtg.Lang.sensorTree.strings.AddSensor + '</a>'+
                    (!!data.smallprobe ? '' : '<a class="treeminilink actionbutton autodiscovery" href="#" onclick="$(this).parent().remove();_Prtg.objectTools.discoverObjectNow.call(this,'+data.objid+' );return false;">' + _Prtg.Lang.sensorTree.strings.RunAutoDiscovery + '</a>');
                } else {
                  if (data._collapsed || !colDef.layout)
                    return $.jqote(_Prtg.Core.getObject('sensor').deviceCollapsed.template, data);
                  else
                    return $.jqote(_Prtg.Core.getObject('sensor').template, data);
                }
              } else {
                return $.jqote(_Prtg.Core.getObject('sensor').groupCollapsed.template, data);
              }
              return '<div class="sensorItem cell-inner c1 level-'+data._level +' ' + data._classes.join(' ').trim() + '"' + ' type="' + data.basetype + '" objid="' + data.objid + '" idx="' + data._idx + '" path="' + data._id + '"><div></div><span class="sensor">' + l + '</span></div>';
            },
            asyncPostRender: function asyncPostRender(cellNode, row, dx, colDef) {
              var content = "";
              if (!!dx) {
                if (dx.basetype === 'device' && !!dx.leafs && dx.leafs.length > 0) {
                  if (dx._collapsed || !colDef.layout)
                    content = $.jqote(_Prtg.Core.getObject('sensor').deviceCollapsed.template, dx);
                  else
                    content = $.jqote(_Prtg.Core.getObject('sensor').template, dx);
                } else if (dx.basetype !== 'device' && dx._collapsed) {
                  content = $.jqote(_Prtg.Core.getObject('sensor').groupCollapsed.template, dx);
                }
              }
              return content;
            },
            rerenderOnResize: true,
            width: '*',
            minWidth: 0,
            cssClass: 'valueColumn'
          }
        ],
        postDataLoad: function (grid, from, to, dataContext, rows, idxByObjId, eventHelper, direction) {
          var loaderrors = false
            , self = this
            , opts = $.extend(true, {}, _Prtg.Core.objects['sensor'])
            , preload = _Prtg.Core.objects.deviceCache
            , dfd = $.Deferred()
            , ready = {}
            , load = []
            , prevload = []
            , settings = {
                async: true,
                type: opts.type || 'GET',
                dataType: opts.dataType || 'text json',
                url: opts.url,
                data: opts.data,
                traditional: opts.traditional || false,
                cache: opts.cache || false,
                beforeSend: function(jqXHR){
                  jqXHR.peNumber = 'PE1235';
                  jqXHR.parents = opts.parents;
                },
                success: function sensorLoadSuccess(ret) {
                  var d = ret[opts.data.content],
                    to = d.length,
                    node = null,
                    i = 0, l = 0,
                    pid = 0,
                    rowid;
                  postDataLoadRequest = null;
                  for (i = 0; i < to; i++) {
                    node = d[i].probegroupdevice.slice(0);
                    node.pop();
                    node = dataContext[idxByObjId[node.join('-')]];
                    if (!!node._updateLeafs) {
                      node.leafs = [];
                      node._updateLeafs = false;
                    }
                    !!node && !!node.leafs && node.leafs.push(d[i]);
                  }
                  eventHelper.notify(ready, null, grid);
                  dfd.resolve();
                },
                error: function sensorLoadError(jqXHR, textStatus, errorThrown) {
                  postDataLoadRequest = null;
                  dfd.reject();
                }
              };

          clearTimeout(postDataLoadTimer);
          if (!!postDataLoadRequest && postDataLoadRequest.readyState < 4) {
          	prevload = postDataLoadRequest.parents
	        }

          if(direction !== undefined) {
              if (direction < 0){
                  from = from - preload > 0 ? from - preload : 0;
              } else {
                  from = from - 5 > 0 ? from - 5 : 0;
                  to = to + preload < rows.length ? to + preload : rows.length - 1;
              }
          }

          for (var i = from; i <= to; ++i) {
            var item = dataContext[rows[i]];
            if (!!item) {
              if (item._updateLeafs && !!prevload && prevload.indexOf(item.objid)===-1) {
                load.push(item.objid);
                ready[item.objid] = i;
              }else if(!!item && !!item._loaderrors)
                loaderrors = true;
            }
          }
          if (load.length > 0) {
          	settings.parents = load;
            if (load.length > 1)
              settings.data.filter_parentid = '['+load.join(',')+']';
            else
              settings.data.filter_parentid = load;
            postDataLoadTimer = setTimeout(function () {
            		postDataLoadTimer = null;
             		postDataLoadRequest = $.ajax(settings)
           	}, 100);
          } else {
            eventHelper.notify(ready, null, grid);
            dfd.resolve();
          }
          if(!!_Prtg.Events && loaderrors){
            loaderrors = $.extend(true, {}, _Prtg.Core.objects['sensor']);
            loaderrors.data.filter_status='[5,13,14]';
            loaderrors.data.count = '*';
            loaderrors.data.id= _Prtg.Util.getUrlVars()['id'];
            dfd.promise().then(function(){
              $.ajax({
                type: 'POST',
                dataType: 'text json',
                url: loaderrors.url,
                data: loaderrors.data,
                traditional: loaderrors.traditional || false,
                cache: loaderrors.cache || false
              }).done(function(res){
                if(!!res && !!res.treesize){
                  var result = res.sensorxref;
                  for(var x=0, m=result.length; x < m; ++x){
                    result[x]._probegroupdevice = result[x].probegroupdevice.slice(0);
                    result[x]._probegroupdevice.pop();
                    result[x]._probegroupdevice.pop();
                    result[x]._probegroupdevice = result[x]._probegroupdevice.join('-');
                  }
                  _Prtg.Events.publish('leafs.refreshed.prtg',res);
                  res = null;
                }
              });
            });
          }
          return dfd.promise();
        }
      }
    );
  }
  /**
   * [sensortree description]
   * @param  {[type]} method [description]
   * @return {[type]}
   *
   */
  $.fn.sensortree = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.sensortree');
    }
  };
})(jQuery);

