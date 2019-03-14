//_Prtg.QuickSearch.Plugin.js
(function($, window, document, undefined) {
  var pluginName = 'quicksearch';
  var templates = {
    element: '<li style="background-image:url({icon})"  data-id="{objid}" data-icon="{icon}" data-name="{name}" data-type="{basetype}">{name}</li>'
  };

  function QuickSearch(element, data, parent){
    var _this = this;
    this.$el = $(element);
    this.$par = $(parent);
    this.data = [];
    this.searchtext = '';
    this.root = [];
    this.autocomplete = false;

    data = data || {};
    // (Object.keys(_Prtg.Lang.common.roots) ||
     (data.root || data.roots || ['root']).forEach(function(key){
      if(_Prtg.Lang.common.roots[key]['basetype'])
        _this.root.push(_Prtg.Lang.common.roots[key]);
    });
    this.selectionTypes = (data.selectionTypes || ['', 'probe', 'group', 'device', 'sensor']);
    element[pluginName] = $.now();
    this.$el
      .attr({
        'placeholder': _Prtg.Lang.common.strings.search,
        'title': _Prtg.Lang.common.strings.searchtitle,
        'data-placement': 'left'
      });
    this.init(this);
  };

  QuickSearch.prototype.init = function init(_this){
    this.$el
      .on('keydown.' + pluginName, function(event) {
        var $lis = _this.$content.find('li');
        var $current = $lis
          .filter('.focus')
          .removeClass('focus');

        if(!$lis || !$lis.length)
          return;

        if (event.which === 27
        || (event.which === 9 && this.value === '')) {
          _this.stop.call(_this, event, $current);
        }else if([38, 40].indexOf(event.which) > -1){
          _this.arrowKeysUpDown.call(_this, event, $current, $lis);
        }else if(_this.autocomplete && [8, 9, 37, 39].indexOf(event.which) > -1){
          _this.arrowKeysLeftRight.call(_this, event, $current);
        }else if([9, 13].indexOf(event.which) > -1){
          _this.select.call(_this, event, $current);
        }else{
          _this.$content.show();
        }
      })
      .on('keypress.' + pluginName + ' paste.' + pluginName, _Prtg.debounce(function(event){
          var input = this;
          var searchtext = this.value.trim();
          var remember = input.readOnly;

          if(searchtext.length){
            input.readOnly = true;
            _this.keyUp.call(_this, searchtext)
              .done(function(){
                input.readOnly = remember;
              });
          }
        }, 999)
      )
      .on('focusout.' + pluginName, function(event){
        _this.stop();
      })
      .after('<ul class="quick-search-content" style="display:none;width:'
             + (_Prtg.scrollbarDimensions.width + this.$el.width())
             + 'px" />');

      this.$content = this.$el.parent().find('ul.quick-search-content');

      this.$content.parents('.control-group').css('z-index','100');

      this.$content
        .on('mouseenter.' + pluginName,'li', function(event){
          $(this)
            .parent()
              .find('li.focus')
              .removeClass('focus');
          $(this)
            .addClass('focus');
        })
        .on('mousedown.' + pluginName, function(event){
          event.stopImmediatePropagation();
          event.preventDefault();
        })
        .on('mousedown.' + pluginName, 'li', function(event){
          event.stopImmediatePropagation();
          event.preventDefault();
          _this.select.call(_this, event, $(this));
        });
  };

  QuickSearch.prototype.stop = function stop(event, $current){
    this.$el[0].value = '';
    this.autocomplete = false;
    this.searchtext = '';
    this.data = [];
    !! this.jqXHR
    && this.jqXHR.abort
    && this.jqXHR.abort();
    this.$content.empty().hide();
    this.$el
      //.attr('placeholder', _Prtg.Lang.common.strings.search)
      .focus()[0].readOnly = false;
    return this;
  };

  QuickSearch.prototype.select = function select(event, $current){
    var data = $current && $current.data();

    if(event.which === 13){
      event.stopImmediatePropagation();
      event.preventDefault();
    }
    !! data
    && data.id > 0
    && this.selectionTypes.indexOf(data.type) > -1
    && this.$el.trigger('changed.' + pluginName, $.extend($current.data(), {key: event.which}));
    this.stop();
    return this;
  };

  QuickSearch.prototype.arrowKeysUpDown = function arrowKeysUpDown(event, $current, $lis){
    event.stopImmediatePropagation();
    event.preventDefault();

    if($current.length){
      if(event.which === 38)
        $current = $current.prev();
      else
        $current = $current.next();
    }
    if($current.length === 0){
      if(event.which === 38)
        $current = $lis.filter(':last-child');
      else
        $current = $lis.filter(':first-child');
    }
    $current.addClass('focus');

    $current[0].parentNode.scrollTop = $current[0].offsetTop;

    if(this.autocomplete){
      this.$el
        .val(this.autocomplete + $current.data().name )[0]
        .setSelectionRange(this.autocomplete.length, this.autocomplete.length + $current.data().name.length);
    }
    return this;
  };

  QuickSearch.prototype.arrowKeysLeftRight = function arrowKeysLeftRight(event, $current){
    var _this = this;
    var txt = '';
    var data = this.$el.data().objects;

    event.stopImmediatePropagation();
    event.preventDefault();

    if($current.data().type === 'sensor'){
       _this.select.call(_this, event, $current);
       return this;
    }

    if([8, 37].indexOf(event.which) > -1){
      $current.data(data.shift());
    }else{
      data.unshift($current.data());
    }


    data.forEach(function(element){
      if(element && element.name)
        txt = element.name + '/' + txt;
    });

    if(txt){
      txt  = '//' + txt;
      this.$el.val(txt);

      this.$el[0]
        .setSelectionRange(this.autocomplete.length, txt.length);
      this.keyUp.call(this, txt);
    }else{
      this.stop();
    }
    return this;
  };

  QuickSearch.prototype.keyUp = function keyUp(searchtext){
    var _this = this;
    var filtered = [];
    var filtertext = searchtext.split('/');
    var dfd = $.Deferred();

    filtertext = filtertext[filtertext.length - 1];

    if (searchtext.length >= 2
    && ( !this.searchtext
      || searchtext.indexOf(this.searchtext) !== 0
      || searchtext.lastIndexOf('/') === searchtext.length - 1)){
      _this.jqXHR = this
        .fetch(searchtext)
        .done(function(data){
          filtered = _this.filter.call(_this, filtertext.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"));
          if(filtered.lengh)
            _this.$content
              .removeClass('loading')
              .show();
          _this.show.call(_this, filtered);
          dfd.resolve();
        })
        .fail(function(){
          dfd.resolve();
        });
    } else if(filtertext.length > 2){
      filtered = _this.filter.call(_this, filtertext.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"));
      _this.show.call(_this, filtered);
      dfd.resolve();
    } else{
      _this.$content
        .empty()
          .append('<div class="loadspinner"></div>')
        .addClass('loading');
      dfd.resolve();
    }
    return dfd;
  };

  QuickSearch.prototype.show = function show(data){
    var html = data.map(function(element){
      return templates.element.printf(element);
    });
    var $current = this.$content
      .removeClass('loading')
      .empty()
      .append(html)
      .find('li')
      .filter(':first-child')
      .addClass('focus');

    if($current.length){
      this.$content.show();
      if(this.autocomplete){
        // this.$el.data().objects.unshift($current.data())
        this.$el
          .val(this.autocomplete + $current.data().name)[0]
          .setSelectionRange(this.autocomplete.length, this.autocomplete.length + $current.data().name.length);

      }
    }
    return this;
  };

  QuickSearch.prototype.filter = function filter(searchtext){
    var regexTags = new RegExp(' '+searchtext, 'gi');
    var regexText = new RegExp(searchtext, 'gi');


    return this.data.filter(function(element){
      return ((element['objid'] - searchtext) === 0
          || element['name'].match(regexText)
          || (' ' + element['tags']).match(regexTags));
    });
  };

  QuickSearch.prototype.fetch = function fetch(searchtext){
    var _this = this;
    var search;
    var done = function(){};
    var request = {
          dataType: 'json',
          timeout: 99999,
          beforeSend: function(jqXHR){
            jqXHR.ignoreManager = true;
            jqXHR.ignoreError = true;
          }
        };
    var id = (!!_this.$el.data().objects
          && !!_this.$el.data().objects[0]
          && _this.$el.data().objects[0].id > -1
          ? _this.$el.data().objects[0].id
          : undefined);


    _this.searchtext = searchtext;
    _this.$el.attr('placeholder', _Prtg.Lang.common.strings.search);
    if(searchtext[0] === '/'
    && searchtext[1] === '/'){
      _this.autocomplete = searchtext;
      _this.$el[0].readOnly = true;
      if(searchtext === '//'){
        _this.data = _this.root;
        _this.$el.data({objects: []});
        return $.when({});
      }else if(id !== undefined){
        request = $.extend(true, request ,{
          url: '/api/quicksearch.json',
          data: {
            parentid: id
          }
        });
        done = function(data) {
          var ret = [];
          !!data && !!data.objects && data.objects.forEach(function(elm){
              if(!elm.icon)
                elm.icon = _this.$el.data().objects[0].icon;
            });
            !!data && !!data.objects && ret.push.apply(ret, data.objects);
            _this.data = ret;
        };
      }else{
        return $.Deferred().reject();
      }
    }else{
      _this.autocomplete = false;
      request = $.extend(true, request ,{
        url: '/api/searchtreeobject.json',
        data: {
          searchtext: searchtext
        }
      });
      done = function(data) {
        var ret = [];
        Object
          .keys(data)
          .forEach(function(key){
             !!data[key] && !!data[key].sensorxref && ret.push.apply(ret, data[key].sensorxref);
             !!data[key] && !!data[key].multiobj && ret.push.apply(ret, data[key].multiobj);
          });
          _this.data = ret;
      }
    }
    if(this.$content.find(".loadspinner").length === 0){
        this.$content.append('<div class="loadspinner"></div>')
    }
    this.$content.addClass('loading').show();
    return $.ajax(request)
      .done(done)
      .fail(function(){
        _this.$el.attr('placeholder', _Prtg.Lang.common.strings.noresult);
        _this.stop();
      });
  };
  _Prtg.Plugins.registerPlugin(pluginName, QuickSearch);
})(jQuery, window, document);
