(function($) {
  /**
   * Take an text input field and style it as an autocomplete tags field, with each tag in a box and a remove button.
   * @param {array} options to set various options.
   * @param {array} options.tags array with availible tags for the autocomplete menu.
   * @todo check if object is input type=text!
   */
  $.Tagsinput = function(el, options) {
    var base = this;
    base.$el = $(el);
    base.el = el;
    base.$el.data('Tagsinput', base),
    shiftPressed=false;

    var tags = [],
      tagslist = $('<div />', {
        'class': 'taglist'
      }),
      list = $('<ul />'),
      inputLi = $('<li />', {
        'class': 'newtaginput'
      }),
      input = $('<input />', {
        'type': 'text',
        'disabled': base.$el.prop('disabled')
      }),
      editmode = false;

    base.init = function() {
      base.options = $.extend(true, {}, $.Tagsinput.defaultOptions, options);
      if (base.$el.prop('id').indexOf('filter') < 0) {
        base.options.firstkeycode.push(43, 45);
        base.options.firstregex = /^(\+|\-)/;
      }

      var loadedTags = base.$el.val().replace(/,/g, base.options.seperator);
      loadedTags = loadedTags.split(base.options.seperator);
      if (base.options.pastesplitregex !== null) {
        base.options.pastesplitregex = new RegExp(base.options.pastesplitregex, 'i');
      }

      if (!base.options.readonly) {
        inputLi.append(input);
        list.append(inputLi);
      } else {
        tagslist.addClass('readonly');
      }

      tagslist.append(list);
      base.$el.prop('type', 'hidden');
      base.$el.after(tagslist);

      for (var i = 0; i < loadedTags.length; i++) {
        base.addTag(loadedTags[i], true);
      }

      if (!base.options.readonly) base.initEvents();
    };

    base.initEvents = function() {
      input.on('keydown', function(event) {

        if(event.which==16) shiftPressed=true;
        else if (event.which == 226 || (shiftPressed && (event.which == 56 || event.which == 57))) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        if (event.which == 8) {
          if (this.value === '') {
            $('li:last', list).prev().remove();
            tags = [];
            $('li', list).each(function() {
              tags.push($('span', this).text());
            });
            base.$el.val(tags.join(base.options.seperator));
          }
        }
      });

      input.on('keyup', function(event) {
          if (event.which == 16) shiftPressed=false;
      });

      input.on('keypress', function(event) {
        if (this.value === '' && $.inArray(event.which, base.options.firstkeycode) > -1) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        if ($.inArray(event.which, base.options.newtagkeycode) > -1) {
          event.preventDefault();
          if (this.value !== '') {
            base.addTag(this.value);
            this.value = '';
            if (base.options.autocomplete) {
              input.autocomplete('close');
            }
          }
        }
      });
      input.on('focus', function(event) {
        if (base.options.autocomplete) {
          $(this).autocomplete('search', '');
        }
      });

      input.on('focusout', function(event) {
        if (input.val() !== '') {
          base.addTag(input.val());
          input.val('');
        }
      });

      input.on('paste', function(e) {
        setTimeout(function() {
          var seperatedTags;
          if (base.options.pastesplitregex === null) {
            seperatedTags = [input.val()];
          } else {
            seperatedTags = input.val().split(base.options.pastesplitregex);
          }

          for (var i = 0; i < seperatedTags.length; i++) {
            base.addTag(seperatedTags[i]);
          }

          input.val('');
        }, 100);
      });

      list.on('click', '.taglabel', function (event) {

        if($(event.target).hasClass('closetag') ||  $(event.target).parent().hasClass('closetag')) return;

        if (!input.prop('disabled')) {
          $(this).remove();
          base.updateTagsInput();
        }

        return false;
      });

      // "Edit on click"-functionality replaced with "show specific tag overview"-page
      list.on('click', '.taglabel>span', function(event) {
        var path = location.pathname;
        var sourceDestionationMap = {
          '/probenode.htm': '/devices.htm',
          '/group.htm': '/devices.htm',
          '/device.htm': '/devices.htm',
          '/sensor.htm': '/sensors.htm',
          '/library.htm': '/libraries.htm',
          '/report.htm': '/reports.htm',
          '/addsensor1.htm': '/sensors.htm',
          '/addsensor2.htm': '/sensors.htm',
          '/addsensor3.htm': '/sensors.htm',
          '/addsensor4.htm': '/sensors.htm'
        };
        if(path in sourceDestionationMap){
          path=sourceDestionationMap[path];
          window.open(path+'?filter_tags=@tag('+$(event.target).html()+')','_blank');
        }
      });

      tagslist.on('click', function() {
        if ($('.taglabeledit').length < 1) {
          input.focus();
        }
      });

      if (base.options.autocomplete) {
        input.autocomplete({
          minLength: 0,
          messages: {
            noResults: null,
            results: function() {}
          },
          search: function() {
            if (base.$el.prop('disabled')) {
              return false;
            }
          },
          focus: function() {
            return false;
          },
          select: function(event, ui) {
            base.addTag(ui.item.value);
            input.val('');
            return false;
          },
          create: function() {
            if (typeof (base.options.tags) === 'function') {
              base.options.tags($(this), function(tags) {
                base.options.tags = tags;
              });
            } else {
              $(this).autocomplete({
                source: base.options.tags,
                messages: {
                  noResults: null,
                  results: function() {}
                }
              });
            }
          }
        });
      }
    };

    base.addTag = function(newTag, initTags) {
      if (newTag !== '') {
        var newTagLabel;
        if (base.options.firstregex)
        newTag = newTag.replace(base.options.firstregex, '');
        if (!base.options.readonly) {
          newTagLabel = $('<li />', {
            'class': 'taglabel',
            'html': '<span class="closetag"></span>'
          });
        } else {
          newTagLabel = $('<li />', {
            'class': 'taglabel',
            'html': '<span></span>'
          });
        }

        if(newTag.length>21) newTagLabel.attr('title',newTag);

        tags.push(newTag);
        newTagLabel.find('span').text(newTag);
        if (!base.options.readonly) {
          inputLi.before(newTagLabel);
        } else {
          list.append(newTagLabel);
        }

        base.$el.val(tags.join(base.options.seperator));
        if (!initTags) {
          base.$el.change();
        }
      }
    };

    base.updateTagsInput = function() {
      tags = [];
      $('li.taglabel', list).each(function(elm, i) {
        tags.push($('span', this).text());
      });
      base.$el.val(tags.join(base.options.seperator)).change();
    };

    base.init();
  };

  $.Tagsinput.defaultOptions = {
    'tags': '[]',
    'autocomplete': true,
    'seperator': ' ',
    'newtagkeycode': [44, 13, 32],
    'pastesplitregex': ',| ',
    'firstkeycode': [],
    'firstregex': null
  };
  $.fn.tagsinput = function(options) {
    if (!$(this).is('input')) {
      return;
    }

    return this.each(function() {
      if (!$(this).data('Tagsinput'))
      (new $.Tagsinput(this, options));
    });
  };
})(jQuery);
