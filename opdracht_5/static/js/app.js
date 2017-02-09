/*global window */
(function () {
    "use strict";
    var app = {
        init: function () { // Omdat alles in de iffe zit, hoef je de andere object methods niet als argument mee te geven? 
            routes.init();
        }
    };
    var routes = {
        init: function () {
            window.onhashchange = function () { // window is altijd beschikbaar toch? 
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
    app.init(); // Ook hier geen parameters toch? 
}());
