(function () {
    "use strict";
    var app = {
        init: function () {
            routes.init(sections, window);
        }
    };
    var routes = {
        init: function (sections, window) {
            window.onhashchange = sections.toggle();
        }
    };
    var sections = {
        toggle: function () {
            console.log("sections");
        }
    };
    app.init(routes, sections, window);
}());