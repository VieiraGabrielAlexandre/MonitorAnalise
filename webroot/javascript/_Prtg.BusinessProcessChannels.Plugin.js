//_Prtg.BusinessProcessChannels.Plugin.js
"use strict";

(function($, window, document, undefined) {
  var pluginName = "businessprocesschannels";
  var rwTemplates = {
      addObject: '<span class="add-object"><span class="ui-icon ui-icon-circle-plus"></span></span>',
      newRow: 'overwrite',
      row: '<tr><td><input type="text" name="channelname" value="{channelname}"></td><td><input name="errorthreshhold" type="number" min="0" max="100" step ="1" value="{errorthreshhold}"></td><td><input name="warningthreshhold" type="number" min="0" max="100" step ="1" value="{warningthreshhold}"></td>',
      element: '<li class="taglabel" data-objectid="{id}">' +
                '<span class="closetag" data-id="{id}"  data-node-type="{type}" style="background-image:url({icon})" title="#{id} {name}">{name}' +
                '</span></li>'
    };
  var roTemplates = {
      addObject: '',
      newRow: 'overwrite',
      row: '<tr><td><input readonly type="text" name="channelname" value="{channelname}"></td><td><input readonly name="errorthreshhold" type="number" min="0" max="100" step ="1" value="{errorthreshhold}"></td><td><input readonly name="warningthreshhold" type="number" min="0" max="100" step ="1" value="{warningthreshhold}"></td>',
      element:  '<li class="taglabel" data-objectid="{id}">' +
                '<span class="closetag" data-id="{id}"  data-node-type="{type}" style="background-image:url({icon})" title="#{id} {name}">{name}' +
                '</span></li>'
    };
  var maxChannels = 50;

  function businessProcessChannels(element, data, parent) {
    this.$el = $(element);
    this.data = data;
    this.templates = (this.data.readonly ? roTemplates : rwTemplates);
    this.$lastRow = this.$el.find('tbody tr:last-child');
    this.$values = this.$el.next();
    this.templates.newRow = this.$lastRow[0].outerHTML;

    this.init(this);
    !!this.data.objects.length && this.$values.val(JSON.stringify(this.data.objects));
  }
  businessProcessChannels.prototype.init = function init(me) {
    var ids = [];

    this.$el
      .parents('fieldset, div.control-group').css('overflow','visible');
    this.$el
      .closest('.controls')
      .addClass('fillwidth');

    if(!this.data.readonly)
      this.initEvents(me);

    this
      .data.objects.forEach(function(elm){
        return ids.push.apply(ids,elm.objects);
      });

    this
      .fetch(ids)
      .done(function(objects){
        me.$el
          .removeClass('loading');
        me.data.objects.forEach(function(row, index){
          var html = me.templates.row.printf($.extend({index:index}, row)) + '<td class="object-list"><ul>';
          !!row.objects && row.objects.forEach(function(objectid, index){
            html += me.templates.element.printf(objects[objectid]);
          });
          html += '</ul></td><td>' + me.templates.addObject + '</td></tr>';
          me.$lastRow.before(html).prev().data(row);
        });
        if(me.data.objects.length < 50)
          me.$lastRow.before('<tr class="separator"><td colspan="5"></td></tr');
        else
          me.$lastRow.remove();
      });
  }

  businessProcessChannels.prototype.initEvents = function initEvents(me) {
    this.$el
      .on('change.' + pluginName,'input:not(.quick-search)', function(event){
        var $this = $(this);
        var data = $this.closest('tr').data();

        if($this.is('.new-row')){
          if(!data[$this.attr('name')]){
            me.$lastRow
              .find('td.object-list-disabled')
                .toggleClass('object-list-disabled object-list')
              .end()
              .find('input[disabled]')
                .removeAttr('disabled')
                .eq(0)
                .focus();
            me.$lastRow
              .find('td:last-of-type')
                .append(me.templates.addObject);
            if(me.$el.find('tbody tr').length <= maxChannels){
              $this.closest('tr').after(me.templates.newRow);
              me.$lastRow = me.$el.find('tbody tr:last-child');
            }
          }

          if($this.val() === '' && me.$el.find('tbody tr').length > 1){
            $this.closest('tr').remove()
          }

          data[$this.attr('name')] = me.format($this.attr('type'), $this.val());

        } else {

          if($this.val() === ''
          && $this.attr('name') === 'channelname')
            $this.val(data[$this.attr('name')]);

          data[$this.attr('name')] = me.format($this.attr('type'), $this.val());
        }

        me.save();
      })
      .on('click.' + pluginName,'span.add-object', function(event){
        var $this = $(this);
        var data = $this.closest('tr').data();
        var $objects = $this.closest('tr').find('td.object-list ul');

        event.stopImmediatePropagation(),

        _Prtg.Dialogs.defaultDialog("/controls/objectselectorform.htm", {
          tablefilter:1,
          allowreadonly:1,
          allowroot:0,
          allowself:0,
          allowone:0,
          allownone:0,
          probes:1,
          groups:1,
          devices:1,
          sensors:1,
          hidesensors:false,
          onlysensors:0,
          rootid:0,
          selid: 1
        })
        .done(function(result, action) {
          var ids;
          if(!result || !result.id) return;

          ids = result.id
            .split(',')
            .map(function(element){
              if(0+element === 0)
                return null;
              else
                return Number(element)
            });

          if(ids.length){
            data.objects.push.apply(data.objects,ids);
            me
              .save()
              .fetch(ids)
              .done(function(objects){
                var html='';
                  ids.forEach(function(objectid){
                    html += me.templates.element.printf($.extend(objects[objectid], {index:data.objects.indexOf(objectid)}));
                  })
                if($objects.find('.quick-search').length)
                  $objects.find('.quick-search').parent().before(html);
                else
                  $objects.append(html);
              });
          }
        }).fail(function() {});
      })
      .on('click.' + pluginName,'.taglabel', function(event){

        if($(event.target).hasClass('closetag') ||  $(event.target).parent().hasClass('closetag')) return;

        var $this = $(this).closest('li');
        var data = $this.closest('tr').data();
        var index = data.objects.indexOf(Number($this.data().objectid));

        $this.remove();
        data.objects.splice(index,1);
        me.save();
      })
      .on('click.' + pluginName, 'tbody td.object-list', function(event){
        var $this = $(this);
        var data = $this.closest('tr').data();

        $this.children('ul:not(.object-list)')
          .addClass('object-list')
          .append('<li><input type="text" class="quick-search"></li>')
          .find('input')
            .focus()
            .on('focusout', function(event){
              $(this).parent().hide();
            })
            .on('changed.quicksearch', function(event, object){
              var html;
              data.objects.push.call(data.objects,object.id);
              me.save()
              html = me.templates.element.printf($.extend(object, {index:data.objects.indexOf(object.id)}));
              $(this).closest('li').before(html);
            })
            .on('keydown'+ pluginName, function(event){
              if([9,13,27].indexOf(event.which) === -1)
                return true;
              event.preventDefault();
              if(event.which === 27){
                $(this).parent().hide()
              }else if([9,13].indexOf(event.which) > -1){
                $(this)
                  .parent()
                  .show()
                  .end()
                  .focus();
              }
            })
            .on('click' + pluginName, function(event) {
              event.stopImmediatePropagation();
            })
            .filter(':visible')
            .each(function(){
              _Prtg.Plugins['quicksearch'].init.apply(this,[null, $this]);
            });
        $this = $this.find('input.quick-search');
        $this.parent().show();
        $this.focus();
      });

    this.$el
      .find('thead th:last-child')
      .eq(0)
      .append('<i class="flr ui-icon icon-clipboard"></i>')
      .on('click', 'i', function(){
        _Prtg.objectTools.copyClipBoard(undefined, me.$values.val());
      });

  }
  businessProcessChannels.prototype.update = function update() {
    return $.makeArray(this.$el.find('tbody tr:not(.separator)').map(function(){
        var ret = $(this).data();
        if (!ret.channelname.length)
          ret = null;
        return ret;
    }));
  }

  businessProcessChannels.prototype.save = function save() {
    var data = this.update();
    if(data.length)
      this.$values.val(JSON.stringify(data));
    return this;
  }

  businessProcessChannels.prototype.fetch = function fetch(ids) {
    var ida = [];
    ids.forEach(function(elm){
      if(ida.indexOf(elm) === -1)
        ida.push(elm)
    })
    if(ids.length){
      return $.ajax({
        url: '/api/objectlist.json',
        dataType: 'json',
        data: {
          id: ida.join(',')
        }
      });
    } else {
      return $.when({});
    }
  }
  businessProcessChannels.prototype.format = function format(type, value) {
    switch(type){
      case 'number':
        value = Number(value);
        break
    }
    return value;
  }
  _Prtg.Plugins.registerPlugin(pluginName, businessProcessChannels);

})(jQuery, window, document);
