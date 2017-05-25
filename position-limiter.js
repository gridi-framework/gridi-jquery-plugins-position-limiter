(function ( $ ) {
    'use strict';

    var PositionLimiter = function(element, options) {
        var documentElement = $(document);
        var bodyElement = $('body');
        var limitedElement = $(element);
        var topLimiterElement = false,
            bottomLimiterElement = false;
        var limitedElementHeight, limitedElementTop, windowHeight;
        var isElementLimitedOnTop = false,
            isElementLimitedOnBottom = false;

        var settings = $.extend(true, {
            animateDuration: 400,
            animateFunction: 'linear',
            changeElementPositionWhenLimitedOnTop: true,
            changeElementPositionWhenLimitedOnBottom: true,
            elements: {
                topLimiter: false,
                bottomLimiter: false
            },
            classes: {
                initialized: 'element-initialized',
                windowIsTop: 'window-is-top',
                windowIsBottom: 'window-is-bottom',
                elementLimitedOnTop: 'element-limited-on-top',
                elementLimitedOnBottom: 'element-limited-on-bottom'
            },
            elementsClasses: {
                onElementLimitedOnTop: {}, //make { className: [element, element, ...], secondClassName: [element, ...]}
                onElementLimitedOnBottom: {}
            }
        }, options);

        if($.type(settings.elements.topLimiter) === 'string' || $.type(settings.elements.topLimiter) === 'object') {
            topLimiterElement = $(settings.elements.topLimiter);
            settings.elementsClasses.onElementLimitedOnTop = makeJQueryElements(settings.elementsClasses.onElementLimitedOnTop);
        }

        if($.type(settings.elements.bottomLimiter) === 'string' || $.type(settings.elements.bottomLimiter) === 'object') {
            bottomLimiterElement = $(settings.elements.bottomLimiter);
            settings.elementsClasses.onElementLimitedOnBottom = makeJQueryElements(settings.elementsClasses.onElementLimitedOnBottom);
        }


        limitedElement.addClass(settings.classes.initialized);

        refresh();
        $(window).on('resize', refresh);
        $(window).on('scroll', chackWindowPositionPosition);

        function refresh() {
            windowHeight = $(window).height();
            limitedElement.removeClass(settings.classes.windowIsTop);
            limitedElement.removeClass(settings.classes.windowIsBottom);

            if(topLimiterElement.length > 0 || bottomLimiterElement.length > 0) {
                $(window).off('scroll', chackElementPosition);
                limitedElement.removeClass(settings.classes.elementLimitedOnTop);
                limitedElement.removeClass(settings.classes.elementLimitedOnBottom);

                if(isFixedElement()) {
                    if(settings.changeElementPositionWhenLimitedOnTop === true || settings.changeElementPositionWhenLimitedOnBottom === true) {
                        limitedElement.css({
                            top: '',
                            bottom: ''
                        });
                    }
                    limitedElementHeight = limitedElement.outerHeight(true);
                    limitedElementTop = parseInt(limitedElement.position().top);
                    if(settings.changeElementPositionWhenLimitedOnTop === true || settings.changeElementPositionWhenLimitedOnBottom === true) {
                        limitedElement.css({
                            top: limitedElementTop,
                            bottom: 'auto'
                        });
                    }
                    isElementLimitedOnTop = false;
                    isElementLimitedOnBottom = false;

                    chackElementPosition();
                    $(window).on('scroll', chackElementPosition);
                }
            }

            chackWindowPositionPosition();
        }

        function chackWindowPositionPosition() {
            var currentScrollTop = documentElement.scrollTop();

            if(currentScrollTop <= 0) {
                if(!limitedElement.hasClass(settings.classes.windowIsTop)) {
                    limitedElement.addClass(settings.classes.windowIsTop);
                }
            } else if(limitedElement.hasClass(settings.classes.windowIsTop)) {
                limitedElement.removeClass(settings.classes.windowIsTop);
            }

            if((currentScrollTop + windowHeight) >= $(document).outerHeight(true)) {
                if(!limitedElement.hasClass(settings.classes.windowIsBottom)) {
                    limitedElement.addClass(settings.classes.windowIsBottom);
                }
            } else if(limitedElement.hasClass(settings.classes.windowIsBottom)) {
                limitedElement.removeClass(settings.classes.windowIsBottom);
            }
        }

        function isFixedElement() {
            return (limitedElement.css('position') == 'fixed');
        }

        function chackElementPosition() {
            var currentScrollTop = documentElement.scrollTop();
            var limitOffsetTop, newLimitedElementTop;

            //check limit by top limiter
            if(topLimiterElement.length > 0) {
                limitOffsetTop = topLimiterElement.offset().top + topLimiterElement.outerHeight();
                newLimitedElementTop = limitOffsetTop - currentScrollTop;

                if(newLimitedElementTop > limitedElementTop) {
                    if(settings.changeElementPositionWhenLimitedOnTop === true) {
                        limitedElement.css('top', newLimitedElementTop);
                    }
                    if(isElementLimitedOnTop === false) {
                        isElementLimitedOnTop = true;
                        limitedElement.addClass(settings.classes.elementLimitedOnTop);
                        addElementsClasses(settings.elementsClasses.onElementLimitedOnTop);
                        limitedElement.trigger('element-start-limited-on-top');
                    }
                } else if(isElementLimitedOnTop === true) {
                    if(settings.changeElementPositionWhenLimitedOnTop === true) {
                        limitedElement.css('top', limitedElementTop);
                    }
                    isElementLimitedOnTop = false;
                    limitedElement.removeClass(settings.classes.elementLimitedOnTop);
                    removeElementsClasses(settings.elementsClasses.onElementLimitedOnTop);
                    limitedElement.trigger('element-stop-limited-on-top');
                }
            }

            //check limit by bottom limiter
            if(bottomLimiterElement.length > 0) {
                limitOffsetTop = bottomLimiterElement.offset().top;
                newLimitedElementTop = (limitOffsetTop - currentScrollTop) - limitedElementHeight;

                if(newLimitedElementTop < limitedElementTop && isElementLimitedOnTop === false) {
                    if(settings.changeElementPositionWhenLimitedOnBottom === true) {
                        limitedElement.css('top', newLimitedElementTop);
                    }
                    if(isElementLimitedOnBottom === false) {
                        isElementLimitedOnBottom = true;
                        limitedElement.addClass(settings.classes.elementLimitedOnBottom);
                        addElementsClasses(settings.elementsClasses.onElementLimitedOnBottom);
                        limitedElement.trigger('element-start-limited-on-bottom');
                    }
                } else {
                    if(isElementLimitedOnTop === false && isElementLimitedOnBottom === true && settings.changeElementPositionWhenLimitedOnBottom === true) {
                        limitedElement.css('top', limitedElementTop);
                    }

                    if(isElementLimitedOnTop === true || isElementLimitedOnBottom === true) {
                        isElementLimitedOnBottom = false;
                        limitedElement.removeClass(settings.classes.elementLimitedOnBottom);
                        removeElementsClasses(settings.elementsClasses.onElementLimitedOnBottom);
                        limitedElement.trigger('element-stop-limited-on-bottom');
                    }
                }
            }
        }

        function makeJQueryElements(elements) {
            $.each(elements, function(index, insideElements) {
                $.each(insideElements, function(elementIndex, element) {
                    elements[index][elementIndex] = $(element);
                });
            });

            return elements;
        }

        function addElementsClasses(elements) {
            $.each(elements, function(cssClass, classElements) {
                $.each(classElements, function(elementIndex, element) {
                    element.addClass(cssClass);
                });
            });
        }

        function removeElementsClasses(elements) {
            $.each(elements, function(cssClass, classElements) {
                $.each(classElements, function(elementIndex, element) {
                    element.removeClass(cssClass);
                });
            });
        }
    };

    //Initialize jQuery function
    $.fn.positionLimiter = function() {
        var limitedElements = this;
        var i, returnValue;

        for (i = 0; i < limitedElements.length; i++) {
            var limitedElement = limitedElements[i];

            if(limitedElement.positionLimiter instanceof PositionLimiter) {
                if(typeof limitedElement.positionLimiter[arguments[0]] === 'function') {
                    returnValue = limitedElement.positionLimiter[arguments[0]].apply(Array.prototype.slice.call(arguments, 1));
                } else {
                    throw 'Function: "' + arguments[0] + '" no exist';
                }
            } else {
                limitedElement.positionLimiter = new PositionLimiter(limitedElement, arguments[0]);
            }
        }

        if (typeof returnValue !== 'undefined') {
            return returnValue;
        }

        return limitedElements;
    };

}( jQuery ));
