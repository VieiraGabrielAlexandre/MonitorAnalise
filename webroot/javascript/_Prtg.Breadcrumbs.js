/* _Prtg.Breadcrumbs.js */
;
(function breadcrumbs($, window, document, undefined) {
  var child;

  function prtgBreadcrumbs(element, data, parent) {
    this.el = (!(element instanceof jQuery)) ? element : element[0];
    this.$el = (!(element instanceof jQuery)) ? $(element) : element;
    this.$parent = (!(parent instanceof jQuery)) ? $(parent) : parent;
    this.menuDivs = {};
    this.init();
  }

  prtgBreadcrumbs.prototype.init = function() {
    var self = this;

    if (child !== undefined) this.changeContent(child);
    this.$el.find(".breadcrumbmenu").each(function() {
      $(this).find(".breadcrumbdivider").addClass("breadcrumbdivideractive");
      self.loadJsonMenuData($(this));
    });
    this.InitEvents();
  };

  prtgBreadcrumbs.prototype.changeContent = function(child) {
    var self = this;
    var $child = (!(child instanceof jQuery)) ? $(child) : child;
    this.$el.children().replaceWith($child.children());
    $child.remove();
    this.$el.find(".breadcrumbmenu").each(function() {
      $(this).find(".breadcrumbdivider").addClass("breadcrumbdivideractive");
      self.loadJsonMenuData($(this));
    });
  };

  prtgBreadcrumbs.prototype.loadJsonMenuData = function($menuparent) {
    var self = this;
    $.ajax({
      beforeSend: function(jqXHR) {
        jqXHR.ignoreManager = true;
      },
      url: "/api/nodechilds.json",
      data: {
        "id": $menuparent.attr("data-breadid")
      },
      dataType: "json"
    }).done(function(response) {
      self.initMenu($menuparent, response);
    });
  };

  prtgBreadcrumbs.prototype.InitEvents = function() {
    var self = this;
    var closeTimer;
    this.$el.on("click", ".breadcrumbmenu", function(e) {
      if (self.menuDivs[$(this).attr("data-breadid")] && !self.menuDivs[$(this).attr("data-breadid")].menu.is(":visible")) {
        $(".breadcrumbsubmenu").hide();
        self.resetSubMenu(self.menuDivs[$(this).attr("data-breadid")].menu);
        self.menuDivs[$(this).attr("data-breadid")].menu.show();
        self.menuDivs[$(this).attr("data-breadid")].menu.find(".breadcrumbsubmenusearchboxinput").focus();
        self.menuDivs[$(this).attr("data-breadid")].menu.find(".hoveritem").removeClass("hoveritem");

        self.menuDivs[$(this).attr("data-breadid")].menu.find("ul").scrollTop(0);
        self.menuDivs[$(this).attr("data-breadid")].menu.find("ul").scrollTop(self.menuDivs[$(this).attr("data-breadid")].menu.find(".breadcrumbsubmenuselected").offset().top - 130);
        e.stopPropagation();
        e.preventDefault();
      }
    }).on("click", ".breadcrumbmenu a", function(e) {
      if (self.menuDivs[$(this).attr("data-breadid")] && !self.menuDivs[$(this).parent(".breadcrumbmenu").attr("data-breadid")].menu.is(":visible")) {
        $(".breadcrumbsubmenu").hide();
        self.resetSubMenu(self.menuDivs[$(this).parent(".breadcrumbmenu").attr("data-breadid")].menu);
        self.menuDivs[$(this).parent(".breadcrumbmenu").attr("data-breadid")].menu.show();
        self.menuDivs[$(this).parent(".breadcrumbmenu").attr("data-breadid")].menu.find(".breadcrumbsubmenusearchboxinput").focus();
        self.menuDivs[$(this).parent(".breadcrumbmenu").attr("data-breadid")].menu.find(".hoveritem").removeClass("hoveritem");
        e.stopPropagation();
        e.preventDefault();
      }
    });
    this.$el.parent('#header_breadcrumbs').on("mouseout", ".breadcrumbsubmenu", function(e) {
      var $this = $(this);
      closeTimer = setTimeout(function() {
        $this.hide();
      }, 500);
    }).on("mouseover", ".breadcrumbsubmenu", function(e) {
      clearTimeout(closeTimer);
    }).on("click", ".breadcrumbsubmenu li", function(e) {
      if ($(this).children().index(e.target) != -1) return;
      $(this).find('a').trigger('click');
      e.stopPropagation();
      e.preventDefault();
    });
    this.$el.parent().on("keyup", ".breadcrumbsubmenusearchboxinput", function(e) {
      self.search($(this).val(), $(this).parents(".breadcrumbsubmenu"));
    });
    //.on("focus", ".breadcrumbsubmenusearchboxinput", function(e) {
      //$(this).val(""); TODO
    //});
  };

  prtgBreadcrumbs.prototype.initMenu = function($menuparent, menuData) {
    var menuContent = "",
      selectedEntry, menuDiv = $("<div />", {
        "class": "breadcrumbsubmenu"
      });

    if (!menuData.children) return false; // If no data availible -> abort
    $menuparent.append('<span class="icon-triangle-1-s icon-gray breadcrumbsubmenuopener"></span>');
    menuContent = menuContent + "<ul>";
    for (var i = 0, len = menuData.children.length; i < len; i++) {
      if (!menuData.children[i].error) {
        menuContent = menuContent + "<li " + (i % 2 === 0 ? 'class="odd"' : '') + 'objid="' + menuData.children[i].id + '">' + menuData.children[i].link + "</li>";
      }
    }
    menuContent = menuContent + "</ul>";
    menuDiv.append(menuContent);
    menuDiv.css({
      "top": ($menuparent.position().top + $menuparent.outerHeight(true)) + "px",
      "left": $menuparent.position().left + "px"
    });
    selectedEntry = menuDiv.find('li[objid="' + $menuparent.attr("data-breadid") + '"]').addClass("breadcrumbsubmenuselected");

    // current object to first position
    //selectedEntry.detach();
    //menuDiv.find("ul").prepend(selectedEntry.clone());

    menuDiv.prepend($("<p />", {
      'class': 'breadcrumbsubmenusearchbox',
      'html': '<span class="icon-search icon-gray"></span><input type="text" class="breadcrumbsubmenusearchboxinput">'
    }));
    this.$el.after(menuDiv);
    this.menuDivs[$menuparent.attr("data-breadid")] = {
      "menu": menuDiv
    };
  };

  prtgBreadcrumbs.prototype.search = function(text, $menuDiv) {
    if (text.length > 1) {
      var searchStr = new RegExp(text, "ig");
      $menuDiv.find("li a").each(function() {
        if ($(this).text().search(searchStr) > -1) {
          $(this).parent().show();
        } else {
          $(this).parent().hide();
        }
      });
    } else {
      $menuDiv.find("li").show();
    }
  };

  prtgBreadcrumbs.prototype.resetSubMenu = function($menuDiv) {
    $menuDiv.find("li").show();
    $menuDiv.find(".breadcrumbsubmenusearchboxinput").val("");
  };

  $.fn['prtg-breadcrumbs'] = function(data, parent) {
    return this.each(function() {
      if (data.child) {
        var $this = $(this).detach().removeClass('hide');
        $('#header_breadcrumbs').html($this);
        if (!$.data(this, 'plugin_prtgBreadcrumbs')) {
          $.data(this, 'plugin_prtgBreadcrumbs', new prtgBreadcrumbs(this, data, parent));
        }
      }
    });
  };

})(jQuery, window, document);
