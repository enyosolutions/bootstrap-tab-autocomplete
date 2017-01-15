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

        // Polyfill the translation function for other projects
        var _t = window._t || function(e) {
            return e;
        };

        $.fn.bsTabAutocomplete = function(funcOrOptions, value) {

            var $this = $(this);
            var options = {};
            if (typeof(funcOrOptions) !== 'string') {
                options = $.extend(options,
                    $.fn.bsTabAutocomplete.defaults, funcOrOptions);
                $this.data('bs-tab-autocomplete', this);
            } else { // if options is string, call string function.
                var $dp = $this.data('bs-tab-autocomplete');
                return $dp[funcOrOptions](value);

            }

            if ($this.length > 1) {
                $this.each(function() {
                    options.id = 'tab' + Date.now() + Math.round(Math.random() * 1000);
                    $this.bsTabAutocomplete(options);
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
                var $input = $this;
                var $popoverContent = $parentDiv.find('.popover-content');

                var name = $input.attr('name'),
                    id = $input.attr('id');
                var tmp = Date.now();
                var $visibleInput = $('<input type="text" id="' + id + tmp + '"/>');

                $visibleInput.attr('class', $input.attr('class')).attr('placeholder', $input.attr('placeholder')).attr('data-toggle', $input.attr('data-toggle'));
                $input.addClass("hidden");
                $input.attr('rel', id + tmp).data('rel', id + tmp);


                this.setValue = function(valOrObject) {
                    var value, label;
                    if (typeof(valOrObject) === 'string') {
                        value = valOrObject;
                        label = valOrObject;
                    } else {
                        value = valOrObject[options.valueField];
                        label = valOrObject[options.labelField];
                    }
                    $input.append("<option value='" + value + "'>" + label + '</option>');
                    $input.val(value);
                    $input.data('label', label);
                    $visibleInput.val(label);
                    $visibleInput.data('value', value);
                    $visibleInput.data('label', value);
                    $visibleInput.attr('placeholder', label);

                };
                this.set = this.setValue;

                this.getValue = function() {
                    var obj = {};
                    obj[options.valueField] = $input.val();
                    obj[options.labelField] = $visibleInput.val() || $input.data('label');
                    return obj;
                };

                if (typeof(funcOrOptions) === 'string') {
                    this[funcOrOptions](value);
                    return;
                }

                if (options.selectedValue) {
                    $input.val(options.selectedValue.value);
                } else if ($input.data('value')) {
                    $input.val($input.data('value'));
                }
                if ($input.data('label')) {
                    $visibleInput.attr('placeholder', $input.data('label'));
                }

                $visibleInput.prependTo($parentDiv);

                /**
                 * EVENTS
                 */

                //Click on input field
                $visibleInput.click(function(evt) {
                    $(this).select();
                    $visibleInput.attr('placeholder', $input.data('live-search-placeholder'));
                    $parentDiv.addClass('open');
                    setTimeout(function() {
                        $popover.addClass('in')
                    }, 10);

                    var position = $visibleInput.position();
                    if (Object.keys(autoCompleteObj.tabAutocompCache).length < 1) {
                        autoCompleteCallback({
                            which: ''
                        });
                    } else {
                        autoCompleteCallback({
                            which: ''
                        });
                    }
                    if ($(document).width() > 790) {
                        console.log($popover.width());
                        $popover.css({
                            'position': 'absolute',
                            'left': "-" + (($popover.width() - $visibleInput.width()) / 2) + 'px',
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
                    var label = $(evt.target).data('label'),
                        value = $(evt.target).data('value');
                    if (!value) {
                        evt.preventDefault();
                        return false;
                    }
                    $visibleInput.addClass("tac-val-selected");
                    setTimeout(function() {
                        $visibleInput.blur();
                    }, 50);

                    var obj = {};
                    obj[options.valueField] = value;
                    obj[options.labelField] = label;
                    autoCompleteObj.setValue(obj);
                    $parentDiv.removeClass('open');
                });

                //change of tabs
                $popoverContent.find('.nav-tabs').on('click', 'a[data-toggle=tab]', function(evt) {
                    if (queryHandle) {
                        queryHandle.abort();
                        queryHandle = null;
                    }
                    autoCompleteCallback({
                        which: ''
                    });
                });

                $popoverContent.on('click', 'button.close', function() {
                    $parentDiv.removeClass('open');
                    $visibleInput.attr('placeholder', $input.data('placeholder'));
                });

                //click outside of the tab
                $(document).click(function(event) {
                    var $targetWrapper = $(event.target).closest('.tab-autocomplete-wrapper');
                    if (!$targetWrapper.length) { //if it wasn't one of us
                        var $wrapper = $('.tab-autocomplete-wrapper');
                        $wrapper.removeClass('open');

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
                            $input.val(null).data('label', null);
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
                                    if (val[options.valueField] && (val[options.valueField].indexOf($input.val() !== -1) || val[options.labelField]
                                            .indexOf($input.val()) !== -1)) {
                                        content += '<li class="list-group-item tab-autocomplete-item" data-label="' + (val[options.labelField]) + '"  data-value="' + val[options.valueField] + '" data-type="' + _t(val[options.typeField]) + '" data-subtext="' + _t(val[options.typeField]) + '" >' + hightlight(val[options.labelField], q) + ' <span class="pull-right text-gray">' + _t(val[options.typeField]) + '</span></li>';
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
                                    if (data instanceof Array) {
                                        autoCompleteObj.tabAutocompCache[type] = {};
                                        if ('all' === type) {
                                            autoCompleteObj.tabAutocompCache = {};
                                        }
                                        var content = "";
                                        if (!data || data.length === 0) {
                                            content += '<li class="list-group-item">' + _t('search.results.noresults.for.label', {
                                                'query': q
                                            }) + '</li>';
                                        } else {
                                            data.forEach(function(val, idx) {
                                                if (!autoCompleteObj.tabAutocompCache[val[options.typeField]]) {
                                                    autoCompleteObj.tabAutocompCache[val[options.typeField]] = {};
                                                }
                                                autoCompleteObj.tabAutocompCache[val[options.typeField]][val[options.valueField]] = (val);
                                                if (options.tabs['all'] && 'all' != type) {
                                                    if (!autoCompleteObj.tabAutocompCache['all']) autoCompleteObj.tabAutocompCache['all'] = {};
                                                    autoCompleteObj.tabAutocompCache[val[options.typeField]][val[options.valueField]] = (val);
                                                }
                                                content += '<li class="list-group-item tab-autocomplete-item" data-value="' + val[options.valueField] +
                                                    '" data-type="' + _t(val[options.typeField]) + '" data-label="' +
                                                    (val.city ? val.city.name : val[options.labelField]) + '" data-subtext="' +
                                                    _t(val[options.typeField]) + '" >' + hightlight(val[options.labelField], q) +
                                                    ' <span class="pull-right text-gray">' + _t(val[options.typeField]) + '</span></li>';

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



        $.fn.bsTabAutocomplete.defaults = {
            placement: "bottom",
            className: "tab-autocomplete",
            valueField: "value",
            labelField: "label",
            typeField: "type",
            selected: {
                value: null,
                label: null
            },
            tabs: {
                'all': 'all',
                // 'airport': _t('airport'),
                'city': 'city',
                'country': 'country',
                'region': 'region'
            }
        };

        var hightlight = function(str, substring) {
            return (str && str !== "" ?
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
    });;
