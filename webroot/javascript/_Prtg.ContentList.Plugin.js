// _Prtg.ContentList.Plugin.js
(function ($, window, document, undefined) {

    function contentList(element, data, parent) {
        this.data = data;
        this.$element = $(element);
        this.$parent = $(parent);

        this.init(this);
    }

    contentList.prototype.init = function (me) {
        createContentAncors(me.$element);

        // Bind refresh on global 30sec refresh
        _Prtg.Events.subscribe('refresh.events.prtg', this.refresh.bind(this, me));
    };

    contentList.prototype.refresh = function (me) {
        createContentAncors(me.$element);
    };


    function createContentAncors($elem) {
        var headlines = $elem.find('h1, h2, .js-contentList_add').not('.main-headline'),
            contentList = $elem.find('.js-contentList') || {};

        contentList.html('');
        headlines.each(function (i, elem) {
            $(elem).attr('id', 'toc-index-' + i)
                   .attr('tabindex','-1');
            contentList.append('<li><a href="#' + $(elem).attr('id') + '">' + $(elem).text() + '</a></li>');
        });
    }


    _Prtg.Plugins.registerPlugin("content-list", contentList);

})(jQuery, window, document);
