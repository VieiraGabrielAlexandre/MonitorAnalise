// _Prtg.MainMenuHandlers.js
(function ($, window, undefined) {

    var debounce = 0;
    var reload = 0;

    var mainMenuHandlers = function(){
        this.init();
    }

    mainMenuHandlers.prototype.init = function ($el) {

        $(window).resize(resizeMainMenuDebounced);
        resizeMainMenuDebounced();

        fixContent();

        $('footer').addClass('hovered').delay(3000).queue(function(){
            $(this).removeClass('hovered').dequeue();
        });
        
        menuClickAndHover();
    }

    var resizeMainMenuDebounced = function(){
        clearTimeout(debounce);
        debounce = setTimeout(resizeMainMenu, 200);
    }


 /* –––– set menu lvl 3 list position (top, left) on window resize –––– */
    var resizeMainMenu = function () {

        !!_Prtg.Events && _Prtg.Events.publish('prtg.resize.layout');

        var topSpacing = 40,
            leftSpacing = 30,
            header = $('.js-header'),
            footer = $('.footer'),
            windowWidth = $(window).width(),
            windowHeight = $(window).height(),
            bigMenu = window.innerWidth > 1880,
            smallMenu = window.innerWidth < 1150,
            mediumMenu = !bigMenu && !smallMenu;

        if(mediumMenu){
            topSpacing = 70;
            leftSpacing = 0;
        }

        // Fix if you change from mobile to desktop menu
        $('#main_menu li.active').removeClass('active');

        var init = function(){
            $('#main_menu > li > ul').each(function(k,el){
                editMenu($(el),true)
                $(el).find('> li > ul').each(function(k2,el2) {
                    editMenu($(el2))
                    $(el2).find('> li > ul').each(function(k3,el3) {
                        editMenu($(el3))
                        $(el3).find('> li > ul').each(function(k4,el4) {
                            editMenu($(el4))
                        })
                    })
                })
            })
        };

       var editMenu = function(elem,root){

            // init / reset
            $(window).scrollTop(0);
            elem.css({
                top:root?30:0,
                marginTop:0,
                marginLeft:0,
                left:'',
                maxHeight:'',
                overflowY:'',
                overflowX:''
            });
            elem.removeClass('groupedList');

            if(smallMenu) return;

            var letterBox=elem.find('>li>a').toArray().some(function(v,k){
                var text=$(v).text().trim();
                return (text.length==2 && text.indexOf('…')===1);
            });

            var fitsIntoView = ((elem.height() + topSpacing + header.height() + footer.height()) < windowHeight);

            // is too big to display in view, so we need scrollsbars
            if(!fitsIntoView){

                if(letterBox){
                    elem.addClass('groupedList');
                }else if(elem.find('ul').length==0){

                    var maxHeight = windowHeight - header.height() - footer.height() - topSpacing;
                    if(!fitsIntoView) elem.css('maxHeight',maxHeight);

                    elem.css({overflowY: "auto", overflowX: "hidden"});
                }
            }


            // needs to be moved higher, else it leaves view at bottom
            if(!root && elem.height()+elem.offset().top > windowHeight){
                
                var minusHeight = -elem.height()+elem.parent().height();
                var nearlyTop = -elem.parent().offset().top+topSpacing;

                elem.css({marginTop:(minusHeight<nearlyTop?nearlyTop:minusHeight)});
            }

            if(elem.parent().parent().hasClass('groupedList')) elem.css({'zIndex':1 });

            if(elem.width()+elem.offset().left > windowWidth){
                var marginLeft = windowWidth-elem.width()-elem.offset().left-20;
                var parentUls=elem.parents('ul:not(#main_menu)');
                if(parentUls.length) marginLeft = -elem.parents().outerWidth()-elem.width()-10;
                elem.css({marginLeft: marginLeft,'z-index':1})
            }
        }

        init();
    };


    var fixContent = function(){

        var pageContent = $('.js-adjustToMenu'),
            paddingMainContainer = 22,
            breadcrumbs = $('.headerBreadcrumbs'),
            header = $('.js-header');

        /* –––– adjusting content starting position to heder height & breadcrumbs –––– */
        pageContent.each(function (i, elem) {
            var $elem = $(elem);
            if ($elem.hasClass('headerBreadcrumbs')) {
                $elem.css('padding-top', header.outerHeight());
            }
            else {
                $elem.css('padding-top', header.outerHeight() + breadcrumbs.find('.breadcrumbs').outerHeight() - paddingMainContainer);
            }
        });
    }



    /* ––––––––––––––––––––––––––––––––––––––––––––––––––
                  Menu Click & Hover Handling
    –––––––––––––––––––––––––––––––––––––––––––––––––– */
    var menuClickAndHover = function(){

        var e = $('.js-header'),
        allLi = e.find('li'),
        burgerMenuIcon = $('.js-menuIcon');

        allLi.each(handleSubMenu);

        $(window).mousemove(function(event){
            'timeout' in this && clearTimeout(this.timeout);
            this.timeout=setTimeout(delayMenuHover,250,event.target);
        });

        burgerMenuIcon.click(function (event) {
            event.preventDefault();
            $(event.target).closest('.menu-wrapper').toggleClass('active');
        });

        function handleSubMenu(key,liElem){
            liElem=$(liElem);
            if (liElem.has("ul").length) {
              //adding an arrow icon and handling clicking on that or the li itself for mobile handling
              var triggerArrow = $('<span></span>').addClass("ui-icon header_menu-trigger js-menuIcon");
              liElem.prepend(triggerArrow);
              liElem.click(handleMenuClick);
              triggerArrow.click(handleMenuClick);
            }
        }

        function delayMenuHover(target){

            if($(target).parents('#main_menu').length){
                $(target).parents('li').addClass('hovered').addClass('new_hovered');
                $('.hovered:not(.new_hovered)').removeClass('hovered');
                $('.new_hovered').removeClass('new_hovered');
                $(target).addClass('hovered');
            }else{
                $('.hovered').removeClass('hovered');
            }
        }


        function handleMenuClick(event) {

            if($(event.target).is('a')){
                $('.menu-wrapper').removeClass('active');
                return;
            }

            if ($(window).width() < 1150) {
              event.preventDefault();
              event.stopImmediatePropagation();

              var target = $(event.target);

              if (!target.is("li")) {
                target = target.closest('li');
              }

              target.siblings().removeClass('active');
              target.toggleClass('active');
            }
        }
    }

    _Prtg.Plugins.registerPlugin("main-menu-handlers", mainMenuHandlers);

})(jQuery, window, document);