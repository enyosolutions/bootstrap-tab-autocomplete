'use strict';


$(function() {
    var ignore = {
        9: "tab",
        16: "shift",
        17: "ctrl",
        18: "alt",
        27: "esc",
        37: "left",
        39: "right",
        38: "up",
        40: "down",
        91: "meta",
        229: "unknown"
    };

    var delay = (function() {
        var timer = 0;
        return function(callback, ms) {
            clearTimeout(timer);
            timer = setTimeout(callback, ms);
        };
    })();


    $.fn.tabAutocomplete = function(funcOrOptions, value) {

        // if options is string, call string function.
        console.log(funcOrOptions);

        var $this = $(this);

        var options = {};
        if (typeof(funcOrOptions) !== 'string') {
            options = $.extend(options,
                $.fn.tabAutocomplete.defaults, funcOrOptions);
        }


        if ($this.length > 1) {
            $this.each(function() {
                options.id = 'tab' + Date.now() + Math.round(Math.random() * 1000);
                $(this).tabAutocomplete(options);
            });
            return $this;
        } else {
            this.tabAutocompCache = {};
            var autoCompleteObj = this;
            options.id = 'tab' + Date.now() + Math.round(Math.random() * 1000);
            if ($this.parents('.tab-autocomplete-wrapper').length > 0) {
                return;
            }
            $this.wrap("<div class='tab-autocomplete-wrapper " + options.className + "'  id='wrapper-" + options.id + "' ></div>");

            var $parentDiv = $("#wrapper-" + options.id);

            $parentDiv.append(initPopover(options));

            var $popover = $this.siblings('.popover');

            var $input = $parentDiv.children('input[type=text]');
            var queryHandle;
            console.log($input);
            var $input = $this;
            console.log($this);
            var $popoverContent = $parentDiv.find('.popover-content');

            var name = $input.attr('name'),
                id = $input.attr('id');
            var tmp = Date.now();
            var $visibleInput = $('<input type="text" id="' + id + tmp + '"/>');


            $visibleInput.attr('class', $input.attr('class')).attr('placeholder', $input.attr('placeholder')).attr('data-toggle', $input.attr('data-toggle'));
            $input.addClass("hidden");
            $input.attr('rel', id + tmp).data('rel', id + tmp);


            autoCompleteObj.set = function(data) {
                if (typeof(data) == "Array") {
                    data = data[0];
                }
                $input.val(data.value);
                $visibleInput.val(data.name);
            };

            console.log(funcOrOptions);
            if (typeof(funcOrOptions) === 'string') {
                console.log(funcOrOptions);
                this[funcOrOptions](value);
                return;
            }


            if (options.selectedValue) {
                $input.val(options.selectedValue.value);
            } else if ($input.data('value')) {
                $input.val($input.data('value'));
            }
            if ($input.data('value-label')) {
                $visibleInput.attr('placeholder', $input.data('value-label'));
            }

            $visibleInput.prependTo($parentDiv);

            /**
             * EVENTS
             */


            //Click on input field
            $visibleInput.click(function(evt) {
                $(this).select();
                $visibleInput.attr('placeholder', $input.data('live-search-placeholder'));
                console.log($parentDiv);
                $parentDiv.addClass('open');
                setTimeout(function() {
                    $popover.addClass('in')
                }, 10);

                var position = $visibleInput.position();
                console.log(autoCompleteObj.tabAutocompCache);
                if (Object.keys(autoCompleteObj.tabAutocompCache).length < 1) {
                    autoCompleteCallback({ which: '' });
                } else {
                    autoCompleteCallback({ which: '' });
                }
                if ($(document).width() > 790) {
                    $popover.css({
                        'position': 'absolute',
                        'left': ($visibleInput.width() / 2) + 'px',
                        'top': (position.top + $visibleInput.height() + 10)
                    });
                } else {
                    /*  $popover.css({
                     'position': 'fixed',
                     'left': '5px',
                     'right': '5px',
                     'min-width':  '100%',
                     'top':'5px',
                     'bottom':  (position.top + 20),
                     'height':  (position.top) - 10 ,
                     overflow: 'scroll'

                     });*/
                    $popover.css({
                        'position': 'absolute',
                        'left': '5px',
                        'right': '5px',
                        'min-width': '100%',
                        'top': (position.top + $visibleInput.height()),
                        overflow: 'scroll'

                    });
                }

            });
            $('.tab-autocomplete-wrapper:after').click(function(evt) {
                $visibleInput.click()
            });

            //click on an element
            $popoverContent.find('.tab-content').on('click', 'li.tab-autocomplete-item', function(evt) {

                //fixme when event is loaded from cache, sometimes it disappear when clicking on it...
                var name = $(evt.target).data('name'),
                    value = $(evt.target).data('value');
                if (!value) {
                    evt.preventDefault();
                    return false;
                }
                $visibleInput.addClass("tac-val-selected");
                setTimeout(function() {
                    $visibleInput.blur();
                }, 50);

                console.log("<option value='" + value + "'>" + name + '</option>');
                $input.append("<option value='" + value + "'>" + name + '</option>');
                $input.val(value);
                $visibleInput.val(name);
                $visibleInput.data('value', value);
                $input.data('name', name);
                $parentDiv.removeClass('open');


            });

            //change of tabs
            $popoverContent.find('.nav-tabs').on('click', 'a[data-toggle=tab]', function(evt) {
                if (queryHandle) {
                    queryHandle.abort();
                    queryHandle = null;
                }
                autoCompleteCallback({ which: '' });
            });
            $popoverContent.on('click', 'button.close', function() {
                console.log('button close,', $popoverContent);
                $parentDiv.removeClass('open');
                $visibleInput.attr('placeholder', $input.data('placeholder'));
            });

            //click outside of the tab
            $(document).click(function(event) {

                var $targetWrapper = $(event.target).closest('.tab-autocomplete-wrapper');
                if (!$targetWrapper.length) { //if it wasn't one of us

                    if ($targetWrapper.hasClass('open')) {
                        $targetWrapper.removeClass('open');
                        $visibleInput.attr('placeholder', $input.data('placeholder'));
                    }
                } else {
                    if ($targetWrapper.attr('id') === $parentDiv.attr('id')) {
                        $targetWrapper.find('input[type=text]').focus();
                    } else {
                        //  $targetWrapper.removeClass('open');
                    }
                }
                return true;
            });


            //$input.popover({html:true, placement:'bottom auto', trigger:'click', animate:true, content: function(){ return }});

            var autoCompleteCallback = function(event) {
                if (ignore[event.which] === undefined) {
                    //we don't know what key was pressed don't delete the previous value
                    if (event.which) {
                        $input.val(null).data('name', null);
                        $visibleInput.removeClass('tac-val-selected');
                    }
                    delay(function() {
                        var q = $visibleInput.val();
                        //$popoverContent.find('prepend('<option disabled data-content="<img src=\'/img/ajax-loader-inline.gif\'/>'+_('selectpicker.ajax.search.label')+'" ></option>');
                        var type = $popoverContent.find('li.active a').data('type');
                        type = type ? type : 'all';
                        $popoverContent.find('[data-tab-type=' + type + '] li.list-group-item').remove();
                        var content = '<li class="list-group-item"><img src="/img/ajax-loader-inline.gif" /></li>';
                        $popoverContent.find('[data-tab-type=' + type + "]").append(content);

                        //CACHING RESULTS
                        if (autoCompleteObj.tabAutocompCache[type]) {
                            for (var i in autoCompleteObj.tabAutocompCache[type]) {
                                var val = autoCompleteObj.tabAutocompCache[type][i];
                                if (val.value && (val.value.indexOf($input.val() !== -1) || val.name.indexOf($input.val()) !== -1)) {
                                    //(val.city ? val.city.name : val.name)
                                    content += '<li class="list-group-item tab-autocomplete-item" data-name="' + (val.name) + '"  data-value="' + val.value + '" data-type="' + _t(val.type) + '" data-subtext="' + _t(val.type) + '" >' + hightlight(val.name, q) + ' <span class="pull-right text-gray">' + _t(val.type) + '</span></li>';
                                }
                            }
                        }


                        // launching request
                        var queryHandle = $.ajax({
                            url: options['liveSearchUrl'] || $input.data('live-search-url'),
                            method: options['liveSearchMethod'] || $input.data('live-search-method') || 'GET',
                            data: {
                                q: q,
                                lang: (App.options.locale || 'en'),
                                type: type,
                                autocomp: 1
                            },
                            success: function(data) {
                                var targets = {};
                                var $existingValues = [];

                                /*
                                 $parentDiv.find('option').each(function (idex, elm) {

                                 $existingValues.push(elm.value);
                                 });
                                 */
                                console.log(type);
                                if (data instanceof Array) {
                                    autoCompleteObj.tabAutocompCache[type] = {};
                                    if ('all' === type) {
                                        autoCompleteObj.tabAutocompCache = {};
                                    }
                                    var content = "";
                                    if (!data || data.length === 0) {
                                        content += '<li class="list-group-item">' + _t('search.results.noresults.for.label', { 'query': q }) + '</li>';
                                    } else {
                                        data.forEach(function(val, idx) {
                                            if (!autoCompleteObj.tabAutocompCache[val.type]) {
                                                autoCompleteObj.tabAutocompCache[val.type] = {};
                                            }
                                            autoCompleteObj.tabAutocompCache[val.type][val.value] = (val);
                                            if (options.tabs['all'] && 'all' != type) {
                                                if (!autoCompleteObj.tabAutocompCache['all']) autoCompleteObj.tabAutocompCache['all'] = {};
                                                autoCompleteObj.tabAutocompCache[val.type][val.value] = (val);
                                            }
                                            content += '<li class="list-group-item tab-autocomplete-item" data-value="' + val.value +
                                                '" data-type="' + _t(val.type) + '" data-name="' + (val.city ? val.city.name : val.name) + '" data-subtext="' + _t(val.type) + '" >' + hightlight(val.name, q) + ' <span class="pull-right text-gray">' + _t(val.type) + '</span></li>';

                                        });

                                    }
                                    $popoverContent.find('[data-tab-type=' + type + "]").html(content);
                                    if (options.tabs['all'] && 'all' != type) {
                                        $popoverContent.find('[data-tab-type=all]').html(content);
                                    }
                                } else {}
                            }
                        });
                    }, 200);
                }
                return this;
            };


            $visibleInput.on('input', autoCompleteCallback);
            return this;
        };


    }


    $.fn.tabAutocomplete.defaults = {
        placement: "bottom",
        className: "tabautocomplete",
        selected: { value: null, label: null },
        tabs: {
            'all': 'all',
            // 'airport': _t('airport'),
            'city': 'city',
            'country': 'country',
            'region': 'region'
        }
    };

    var hightlight = function(str, substring) {
        return (str !== "" ?
            str.replace(new RegExp('(' + substring + ')', 'i'), "<b>$1</b>") : str);
    };


    var initPopover = function(options) {
        var options = $.extend({
            id: 'tabPopover' + Date.now(),
            animate: true,
            tabs: {},
            content: {},
            placement: 'bottom'
        }, options);

        //var html = '<div id="' + options.id + '" class="tab-block" style="min-width:300px, min-height:10vh">';
        var popover = '<div id="' + options.id + '" class="popover  ' + options.placement + ' fade" style="min-width:330px" role="tooltip"><div class="arrow"></div>';
        if (options.title) {
            popover += '<h3 class="popover-title">' + options.title + '</h3>';
        }
        popover += '<div class="popover-content">';
        popover += '<button type="button" class="close">x</button>';

        var header = '<ul class="nav nav-tabs autocomplete-tabs" role="tablist">';
        var content = '<div class="tab-content">';
        var first = true,
            tabClasses = '',
            contentClasses = '';
        if (options.animate) {
            tabClasses = '';
            contentClasses = 'fade';
        }
        for (var i in options.tabs) {
            var thisTabClasses = "",
                thisContentClasses = "";
            if (first) {
                thisTabClasses = tabClasses + ' active first ';
                thisContentClasses = contentClasses + ' active ' + (options.animate ? ' in' : '');
                first = false;
            }
            header += '<li role="presentation" class="' + thisTabClasses + '"><a href="#' + options.id + i + '" data-type="' + i + '" aria-controls="' + i + '" role="tab" data-toggle="tab">' + (options.tabs[i]) + '</a></li>';
            content += '<div role="tabpanel" class="tab-pane ' + thisContentClasses + '" id="' + options.id + i + '" data-tab-type="' + i + '"  >' + (options.content[i] ? options.content[i] : _t("tab.start.typing.label")) + '</div>';

        }
        content += "</div";
        header += "</ul>";

        return popover + header + content + '</div></div>';
    }
});

/*ar TabAutocomplete = function (element, options, e) {
 if (e) {
 //e.stopPropagation();
 e.preventDefault();
 }

 this.$element = $(element);
 this.$newElement = null;
 this.options = options;

 // If we have no title yet, try to pull it from the html title attribute (jQuery doesnt' pick it up as it's not a
 // data-attribute)
 if (this.options.title === null) {
 this.options.title = this.$element.attr('title');
 }

 //Expose public methods
 this.val = TabAutocomplete.prototype.val;
 this.show = TabAutocomplete.prototype.show;
 this.hide = TabAutocomplete.prototype.hide;

 this.init();
 };

 TabAutocomplete.DEFAULTS = {
 id: 'tab' + Date.now(),
 placement: "bottom",
 tabs: {
 'all': 'all',
 // 'airport': _t('airport'),
 'city': 'city',
 'country': 'country',
 'region': '<i class="fa fa-bell"></i> region'
 }
 };
 */
/*
 TabAutocomplete.prototype = {

 constructor: TabAutocomplete,

 init: function () {
 var that = this,
 id = this.$element.attr('id');

 $(this).wrap("<div class='tab-autocomplete-wrapper'></div>");
 this.$parentDiv = this.$element.parents('.tab-autocomplete-wrapper');// $(this).wrap('<parent div>');
 this.$popover = this.$element.siblings('.popover');
 this.$popoverContent = $parentDiv.find('.popover-content');
 this.$popoverTitle = $parentDiv.find('.popover-title');
 this.$shadowInput = $(this.$element).clone();
 this.$shadowInput.attr('type', 'hidden');
 this.$shadowInput.attr('value', this.$element.data('value'));
 this.$parentDiv.after(this.$shadowInput);
 /*
 this.$newElement = this.createView();
 this.$element.after(this.$newElement);
 this.$menu = this.$newElement.children('.dropdown-menu');
 this.$button = this.$newElement.children('button');
 this.$searchbox = this.$newElement.find('input');
 },
 */


/**
 *
 * @param options options {titles : object with keys => tabs ids and values = tab titles.}
 * options options {content : object with keys => tabs ids and values = tab contents.}
 * options {id : id of the tabs hight div}
 * @returns {string}
 */
/*    initPopover: function (options) {
 var options = $.extend({
 id: 'tab' + Date.now(),
 animate: true,
 tabs: {},
 content: {},
 placement: 'bottom'
 }, options);


 //var html = '<div id="' + options.id + '" class="tab-block" style="min-width:300px, min-height:10vh">';
 var popover = '<div id="' + options.id + '" class="popover  ' + options.placement + ' fade" style="min-width:380px, min-height:10vh" role="tooltip"><div class="arrow"></div>';
 if (options.title) {
 popover += '<h3 class="popover-title">' + options.title + '</h3>';
 }
 popover += '<div class="popover-content">';

 var header = '<ul class="nav nav-tabs autocomplete-tabs" role="tablist">';
 var content = '<div class="tab-content">';
 var first = true, tabClasses = '', contentClasses = '';
 if (options.animate) {
 tabClasses = '';
 contentClasses = 'fade';
 }
 for (var i in options.tabs) {
 var thisTabClasses = "", thisContentClasses = "";
 if (first) {
 thisTabClasses = tabClasses + ' active first ';
 thisContentClasses = contentClasses + ' active ' + (options.animate ? ' in' : '');
 first = false;
 }
 header += '<li role="presentation" class="' + thisTabClasses + '"><a href="#' + i + '" aria-controls="' + i + '" role="tab" data-toggle="tab">' +  options.tabs[i] + '</a></li>';
 content += '<div role="tabpanel" class="tab-pane ' + thisContentClasses + '" id="' + i + '">' + (options.content[i] ? options.content[i] : "") + '</div>';

 }
 content += "</div>";
 header += "</ul>";

 return popover + header + content + '</div></div>';
 },

 val: function (value) {
 if (typeof value !== 'undefined') {
 this.$element.val(value);
 this.render();

 return this.$element;
 } else {
 return this.$element.val();
 }
 }


 }



 /*

 // SELECTPICKER PLUGIN DEFINITION
 // ==============================
 function Plugin(option, event) {
 // get the args of the outer function..
 var args = arguments;
 // The arguments of the function are explicitly re-defined from the argument list, because the shift causes them
 // to get lost/corrupted in android 2.3 and IE9 #715 #775
 var _option = option,
 _event = event;
 [].shift.apply(args);

 var value;
 var chain = this.each(function () {
 var $this = $(this);
 if ($this.is('input')) {
 var data = $this.data('tabautocomplete'),
 options = typeof _option == 'object' && _option;

 if (!data) {
 var config = $.extend({}, TabAutocomplete.DEFAULTS, $.fn.tabAutocomplete2.defaults || {}, $this.data(), options);
 $this.data('tabautocomplete', (data = new TabAutocomplete(this, config, _event)));
 } else if (options) {
 for (var i in options) {
 if (options.hasOwnProperty(i)) {
 data.options[i] = options[i];
 }
 }
 }

 if (typeof _option == 'string') {
 if (data[_option] instanceof Function) {
 value = data[_option].apply(data, args);
 } else {
 value = data.options[_option];
 }
 }
 }
 });

 if (typeof value !== 'undefined') {
 //noinspection JSUnusedAssignment
 return value;
 } else {
 return chain;
 }
 }


 var old = $.fn.tabAutocomplete2;
 $.fn.tabAutocomplete2 = Plugin;
 $.fn.tabAutocomplete2.Constructor = TabAutocomplete;

 // SELECTPICKER NO CONFLICT
 // ========================
 $.fn.tabAutocomplete2.noConflict = function () {
 $.fn.tabAutocomplete2 = old;
 return this;
 };

 */
;
