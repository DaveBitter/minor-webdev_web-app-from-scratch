/*global window */
(function () {
    "use strict";
    var app = {
        init: function (routes, sections, window) {
            routes.init(sections, window);
        }
    };
    var routes = {
        init: function (sections, window) {
            window.onhashchange = function () {
                sections.toggle();
            };
        }
    };
    var sections = {
        toggle: function () {

            var sectionList = document.querySelectorAll("section");

            sectionList.forEach(function (sec) {
                console.log(sec.id);
                if (location.hash === "#" + sec.id) {
                    sec.classList.add("active");
                    document.querySelector("a[href='#" + sec.id + "']").classList.add("active");
                } else {
                    sec.classList.remove("active");
                    document.querySelector("a[href='#" + sec.id + "']").classList.remove("active");
                }

            });
        }
    };
    app.init(routes, sections, window);
}());