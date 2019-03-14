//_Prtg.UserAndGroups.js
(function($, window, document, undefined) {

  function userandgroups(element, data, parent) {
    this.data = data;
    this.$element = $(element);
    this.$parent = $(parent);
    this.timer = this.$parent.Events && this.$parent.Events();
    this.initTicketUserAndGroup(this, data.ticketid, data.objectid);
    // else
    //   this.initUserAndGroup(this);
  }
  userandgroups.prototype.initTicketUserAndGroup = function(me, ticketid, objectid){
    var insert = me.$element.parent();
    me.$element.detach();
    me.$element.append('<option data-reload=\'[{"name":"filter_user","value":"'+_Prtg.Options.currentUserId+'"},{"name":"start","value":"0"}]\' value="' + _Prtg.Options.currentUserId +'"' + (_Prtg.Options.currentUserId==me.data.selector?' selected':'') + '>' + _Prtg.Lang.Dialogs.strings.assignedtome + '</option>');
    me.$element.append('<optgroup group label="'+_Prtg.Lang.common.strings['Groups']+'">');
    me.$element.append('<optgroup users label="'+_Prtg.Lang.common.strings['Users']+'">');
    me.$element.append('<optgroup disallowed label="'+_Prtg.Lang.common.strings['Disallowed']+'">');

    $.ajax({
      url: "/api/userlist.json",
      data: {
        id: ticketid,
        objectid: objectid
      },
      dataType: "json",
      type: "GET"
    }).done(function(data){
        var list = data["userlist"]
          , dest = null
          , group = me.$element.find("optgroup[group]")
          , users = me.$element.find("optgroup[users]")
          , disal = me.$element.find("optgroup[disallowed]");
        if(!!list)
          for(var i = 0; i < list.length; i++) {
            if(!list[i].access)
              dest = disal;
            else if(!list[i].isgroup)
              dest = users;
            else
              dest = group;
            dest.append('<option'+(!list[i].access?' disabled ':' ')+'data-reload=\'[{"name":"filter_user","value":"'+list[i]["objid"]+'"},{"name":"start","value":"0"}]\' value="' + list[i]["objid"] +'"'+ (me.data.selector==list[i]["objid"] && me.data.selector!=_Prtg.Options.currentUserId? ' selected':'') + '>' + list[i]["name"] + '</option>');
          }
    }).always(function(){
      insert.append(me.$element);
      !!me.$element.selectmenu && me.$element.selectmenu('refresh',true);
    });
  }
  userandgroups.prototype.initUserAndGroup = function(me) {
    
    me.$element.append('<optgroup label="'+_Prtg.Lang.common.strings['Groups']+'">');
    me.$element.append('<optgroup label="'+_Prtg.Lang.common.strings['Users']+'">');

    $.ajax({
      url: "/api/table.json",
      data: {
        "content": "usergroups",
        "output": "json",
        "columns": "name,objid",
        "sortby": "name"
      },
      dataType: "json",
      type: "GET"
    }).done(function(data){
        var groupList = data["usergroups"]
          , $group = me.$element.find('optgroup[label="'+_Prtg.Lang.common.strings['Groups']+'"]');
        if(!!groupList)
        for(var i = 0; i < groupList.length; i++) {
          $group.append('<option class="group" data-reload=\'[{"name":"filter_user","value":"'+groupList[i]["objid"]+'"}]\' value="' + groupList[i]["objid"] +'"'+ (me.data.selector===groupList[i]["objid"] ? ' selected':'') + '>' + groupList[i]["name"] + '</option>');
        }
    });

      $.ajax({
        url: "/api/table.json",
        data: {
          "content": "users",
          "output": "json",
          "columns": "name,objid",
          "sortby": "name"
        },
        dataType: "json",
        type: "GET"
      }).done(function(data){
        var groupList = data['users']
          , $group = me.$element.find('optgroup[label="'+_Prtg.Lang.common.strings['Users']+'"]');
        if(!!groupList)
        for(var i = 0; i < groupList.length; i++) {
          $group.append('<option class="user" data-reload=\'[{"name":"filter_user","value":"'+groupList[i]["objid"]+'"}]\' value="' + groupList[i]["objid"] +'"'+ (me.data.selector===groupList[i]["objid"] ? ' selected="selected"':'') + '>' + groupList[i]["name"] + '</option>');
        }
      });
  };

  userandgroups.prototype.refresh = function() {

  };

  _Prtg.Plugins.registerPlugin("userandgroups", userandgroups);

})(jQuery, window, document);
