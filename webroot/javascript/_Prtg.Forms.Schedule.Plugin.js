// _Prtg.ContentList.Plugin.js
(function ($, window, document, undefined) {

    function formSchedule(element) {
        var $element = (!(element instanceof jQuery)) ? $(element) : element;
        var table,
            buttons,
            actionTypes;

        this.init($element);
    }

    formSchedule.prototype.init = function ($el) {
        var Schedule = this;

        Schedule.table = $el;
        Schedule.buttons =  Schedule.table.find('.schedulebutton');
        Schedule.actionTypes = {
            on: 'ON',
            off: 'OFF'
        };

        Schedule.bindToggleElements(Schedule);
        Schedule.determineDefaultState(Schedule);
        Schedule.determineCheckboxesState(Schedule);
    };

    formSchedule.prototype.determineDefaultState = function (Schedule) {
        Schedule.buttons.each(function(i,elem) {
            var button = $(elem),
                targetClass = button.data('targets'),
                checkboxes = Schedule.table.find('input.' + targetClass + ':checked');

            var action = (checkboxes.length > 0) ? Schedule.actionTypes.off : Schedule.actionTypes.on;

            Schedule.switchButtonText(button, action);

            if(targetClass == 'scheduleAll') {
                button.html(_Prtg.Lang.common.strings.scheduleAll[action]);
            }
        });
    };

    formSchedule.prototype.determineCheckboxesState = function (Schedule) {
        Schedule.table.find('input[type="checkbox"]').change(function(event) {
            var classList = $(event.target).attr('class').split(/\s+/);

            $.each(classList, function(index, classname) {
                if ($('input.'+classname+':not(:checked)').length === 0 ){
                    Schedule.switchButtonText($('[data-targets="'+classname+'"]'), Schedule.actionTypes.off);
                }
                else if ($('input.'+classname+':checked').length  === 0 ) {
                    Schedule.switchButtonText($('[data-targets="'+classname+'"]'), Schedule.actionTypes.on);
                }
            });

        });
    };

    formSchedule.prototype.bindToggleElements = function (Schedule) {

        Schedule.buttons.click(function(e) {
            var button = $(e.target),
                targetClass = button.data('targets'),
                action = button.data('toggle'),
                checkboxes = Schedule.table.find('.' + targetClass);

            if (action == Schedule.actionTypes.on) {
                // need to click, just setting the property won't work
                checkboxes.each(function (i, elem) {
                    if (!$(elem).is(':checked')) {
                        $(elem).click();
                    }
                });
                action = Schedule.actionTypes.off;
            }
            else if (action == Schedule.actionTypes.off) {
                checkboxes.attr('checked', false);
                action = Schedule.actionTypes.on;
            }

            Schedule.switchButtonText(button, action);

            if(button.data('targets') == 'scheduleAll') {
                button.html(_Prtg.Lang.common.strings.scheduleAll[action]);

                Schedule.buttons.each(function(i, elem){
                    Schedule.switchButtonText($(elem), action);
                });
            }
        });
    };

    formSchedule.prototype.switchButtonText = function(button, action) {
        button.removeClass('OFF');
        button.removeClass('ON');
        button.addClass(action);
        button.data('toggle', action);

        if(button.data('targets') !== 'scheduleAll') {
            button.attr('data-original-title', button.text() + ' ' + _Prtg.Lang.common.strings.buttonstate[action])
        }
    };


    _Prtg.Plugins.registerPlugin("form-schedule", formSchedule);

})(jQuery, window, document);
