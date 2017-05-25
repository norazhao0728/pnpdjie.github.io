'use strict';

var body;

function newDOMElement(tag, className, id) {
    var el = document.createElement(tag);

    if (className) {
        el.className = className;
    }

    if (id) {
        el.id = id;
    }

    return el;
}

function classOnCondition(element, className, condition) {
    if (condition) {
        $(element).addClass(className);
    } else {
        $(element).removeClass(className);
    }
}

$(function() {

    if ((location.pathname.split("/")[1]) !== "") {
        $('header .trigger a[href^="/' + location.pathname.split("/")[1] + '"]').addClass('nf');
    }
});

(function() {
    var yah = true;
    var moving = false;
    var CSS_BROWSER_HACK_DELAY = 25;

    $(document).ready(function() {
        // Safari chokes on the animation here, so...
        if (navigator.userAgent.indexOf('Chrome') == -1 && navigator.userAgent.indexOf('Safari') != -1) {
            var hackStyle = newDOMElement('style');
            hackStyle.innerHTML = '.pi-accordion .pi-wrapper{transition: none}';
            body.append(hackStyle);
        }
        // Gross.

        $('.pi-accordion').each(function() {
            var accordion = this;
            var content = this.innerHTML;
            var container = newDOMElement('div', 'container');
            container.innerHTML = content;
            $(accordion).empty();
            accordion.appendChild(container);
            CollapseBox($(container));
        });

        setYAH();

        setTimeout(function() {
            yah = false;
        }, 500);
    });

    function CollapseBox(container) {
        container.children('.item').each(function() {
            // build the TOC DOM
            // the animated open/close is enabled by having each item's content exist in the flow, at its natural height,
            // enclosed in a wrapper with height = 0 when closed, and height = contentHeight when open.
            var item = this;

            // only add content wrappers to containers, not to links
            var isContainer = item.tagName === 'DIV';

            var titleText = item.getAttribute('data-title');
            var title = newDOMElement('div', 'title');
            title.innerHTML = titleText;

            var wrapper, content;

            if (isContainer) {
                wrapper = newDOMElement('div', 'pi-wrapper');
                content = newDOMElement('div', 'content');
                content.innerHTML = item.innerHTML;
                wrapper.appendChild(content);
            }

            item.innerHTML = '';
            item.appendChild(title);

            if (wrapper) {
                item.appendChild(wrapper);
                $(wrapper).css({ height: 0 });
            }


            $(title).click(function() {
                if (!yah) {
                    if (moving) {
                        return;
                    }
                    moving = true;
                }

                if (container[0].getAttribute('data-single')) {
                    var openSiblings = item.siblings().filter(function(sib) {
                        return sib.hasClass('on');
                    });
                    openSiblings.forEach(function(sibling) {
                        toggleItem(sibling);
                    });
                }

                setTimeout(function() {
                    if (!isContainer) {
                        moving = false;
                        return;
                    }
                    toggleItem(item);
                }, CSS_BROWSER_HACK_DELAY);
            });

            function toggleItem(thisItem) {
                var thisWrapper = $(thisItem).find('.pi-wrapper').eq(0);

                if (!thisWrapper) {
                    return;
                }

                var contentHeight = thisWrapper.find('.content').eq(0).innerHeight() + 'px';

                if ($(thisItem).hasClass('on')) {
                    thisWrapper.css({ height: contentHeight });
                    $(thisItem).removeClass('on');

                    setTimeout(function() {
                        thisWrapper.css({ height: 0 });
                        moving = false;
                    }, CSS_BROWSER_HACK_DELAY);
                } else {
                    $(item).addClass('on');
                    thisWrapper.css({ height: contentHeight });

                    var duration = parseFloat(getComputedStyle(thisWrapper[0]).transitionDuration) * 1000;

                    setTimeout(function() {
                        thisWrapper.css({ height: '' });
                        moving = false;
                    }, duration);
                }
            }

            if (content) {
                var innerContainers = $(content).children('.container');
                if (innerContainers.length > 0) {
                    innerContainers.each(function() {
                        CollapseBox($(this));
                    });
                }
            }
        });
    }

    function setYAH() {
        var pathname = location.href.split('#')[0]; // on page load, make sure the page is YAH even if there's a hash
        var currentLinks = [];

        $('.pi-accordion a').each(function() {
            if (pathname === this.href) {
                currentLinks.push(this);
            }
        });

        currentLinks.forEach(function(yahLink) {
            $(yahLink).parents('.item').each(function() {
                $(this).addClass('on');
                $(this).find('.pi-wrapper').eq(0).css({ height: 'auto' });
                $(this).find('.content').eq(0).css({ opacity: 1 });
            });

            $(yahLink).addClass('yah');
            yahLink.onclick = function(e) { e.preventDefault(); };
        });
    }
})();

var kub = (function() {
    var HEADER_HEIGHT;
    var html, header, mainNav, quickstartButton, hero, encyclopedia, footer, headlineWrapper;

    $(document).ready(function() {
        html = $('html');
        body = $('body');
        header = $('header');
        mainNav = $('#mainNav');
        quickstartButton = $('#quickstartButton');
        hero = $('#hero');
        encyclopedia = $('#encyclopedia');
        footer = $('footer');
        headlineWrapper = $('#headlineWrapper');
        HEADER_HEIGHT = header.outerHeight();

        resetTheView();

        window.addEventListener('resize', resetTheView);
        window.addEventListener('scroll', resetTheView);
        window.addEventListener('keydown', handleKeystrokes);

        document.onunload = function() {
            window.removeEventListener('resize', resetTheView);
            window.removeEventListener('scroll', resetTheView);
            window.removeEventListener('keydown', handleKeystrokes);
        };

        setInterval(setFooterType, 10);
    });

    function setFooterType() {
        var windowHeight = window.innerHeight;
        var bodyHeight;

        switch (html[0].id) {
            case 'docs':
                {
                    bodyHeight = hero.outerHeight() + encyclopedia.outerHeight();
                    break;
                }

            case 'home':
                // case 'caseStudies':
                bodyHeight = windowHeight;
                break;

            case 'caseStudies':
            case 'partners':
                bodyHeight = windowHeight * 2;
                break;

            default:
                {
                    bodyHeight = hero.outerHeight() + $('#mainContent').outerHeight();
                }
        }

        var footerHeight = footer.outerHeight();
        classOnCondition(body, 'fixed', windowHeight - footerHeight > bodyHeight);
    }

    function resetTheView() {
        if (html.hasClass('open-nav')) {
            toggleMenu();
        } else {
            HEADER_HEIGHT = header.outerHeight();
        }

        if (html.hasClass('open-toc')) {
            toggleToc();
        }

        classOnCondition(html, 'flip-nav', window.pageYOffset > 0);

        if (html[0].id == 'home') {
            setHomeHeaderStyles();
        }
    }

    function setHomeHeaderStyles() {
        var Y = window.pageYOffset;
        var quickstartBottom = quickstartButton[0].getBoundingClientRect().bottom;

        classOnCondition(html[0], 'y-enough', Y > quickstartBottom);
    }

    function toggleMenu() {
        if (window.innerWidth < 800) {
            pushmenu.show('primary');
        } else {
            var newHeight = HEADER_HEIGHT;

            if (!html.hasClass('open-nav')) {
                newHeight = mainNav.outerHeight();
            }

            header.css({ height: px(newHeight) });
            html.toggleClass('open-nav');
        }
    }

    function handleKeystrokes(e) {
        switch (e.which) {
            case 27:
                {
                    if (html.hasClass('open-nav')) {
                        toggleMenu();
                    }
                    break;
                }
        }
    }

    function showVideo() {
        $('body').css({ overflow: 'hidden' });

        var videoPlayer = $("#videoPlayer");
        var videoIframe = videoPlayer.find("iframe")[0];
        videoIframe.src = videoIframe.getAttribute("data-url");
        videoPlayer.css({ zIndex: highestZ() });
        videoPlayer.fadeIn(300);
        videoPlayer.click(function() {
            $('body').css({ overflow: 'auto' });

            videoPlayer.fadeOut(300, function() {
                videoIframe.src = '';
            });
        });
    }

    function tocWasClicked(e) {
        var target = $(e.target);
        var docsToc = $("#docsToc");
        return (target[0] === docsToc[0] || target.parents("#docsToc").length > 0);
    }

    function listenForTocClick(e) {
        if (!tocWasClicked(e)) {
            toggleToc();
        }
    }

    function toggleToc() {
        html.toggleClass('open-toc');

        setTimeout(function() {
            if (html.hasClass('open-toc')) {
                window.addEventListener('click', listenForTocClick);
            } else {
                window.removeEventListener('click', listenForTocClick);
            }
        }, 100);
    }

    return {
        toggleToc: toggleToc,
        toggleMenu: toggleMenu,
        showVideo: showVideo
    };
})();
