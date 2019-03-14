(function($) {
  /**
   * Take an dropdown select field and style it with clickable stars to change the value.
   */
  $.Favstarsinput = function(el) {
    var base = this;
    base.$el = $(el);
    base.el = el;
    base.$el.data("Favstarsinput", base);

    var starSpan = $("<span />", {
      "id": "favstarinput",
      "html": "&nbsp;"
    });

    var aStar = $("<a />", {
      "class": "favstar",
      "href": "#"
    });
    var aEmptyStar = $("<a />", {
      "class": "favempty",
      "href": "#"
    });

    base.init = function() {
      base.$el.hide();
      //starSpan.css("width", base.$el.css("width"));

      var currentStars = base.$el.val();
      var starsCount = $("option", base.$el).size();

      for(var i = 0; i < starsCount; i++) {
        if(i < currentStars) {
          starSpan.append(aStar.clone().data("starnum", i + 1));
        } else {
          starSpan.append(aEmptyStar.clone().data("starnum", i + 1));
        }
      }

      base.$el.after(starSpan);

      starSpan.delegate("a", "click", function(e) {
        if(!base.$el.prop("disabled")) {
          var num = $(this).data("starnum");
          base.setStars(num);
          base.$el.val(num).change();
        }
        return false;
      }).delegate("a", "hover", function(e) {
        if(!base.$el.prop("disabled")) {
          if(e.type === "mouseenter") {
            base.setStars($(this).data("starnum"));
          } else {
            base.setStars(base.$el.val());
          }
        }
        return false;
      });
    };

    base.setStars = function(num) {
      $("a", starSpan).each(function(index, elm) {
        if(index < num) {
          $(elm).addClass("favstar");
          $(elm).removeClass("favempty");
        } else {
          $(elm).addClass("favempty");
          $(elm).removeClass("favstar");
        }
      });
    };
    base.init();
  };

  $.fn.favstarsinput = function() {
    if(!$(this).is("select") || $("#favstarinput").length > 0) {
      return;
    }
    return this.each(function() {
      (new $.Favstarsinput(this));
    });
  };
})(jQuery);
