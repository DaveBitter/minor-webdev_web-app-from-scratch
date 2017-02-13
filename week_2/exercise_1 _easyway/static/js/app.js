(function() {
    // set variables
    var tbody = document.querySelector('tbody'),
        template = document.querySelector('#template'),
        source = template.innerHTML,
        compile = Handlebars.compile(source),
        url = 'http://swapi.co/api/people',
        html = '',
        originalData = [];
    // render data
    var render = function(data) {
        tbody.innerHTML = "";
        data.forEach(function(item, i) {
            // api provides no id but the url to get info for each person start at /people/1 with the first person
            item.id = i
            html = compile(item);
            tbody.innerHTML += html;
        });
    }
    var renderFIlmData = function(film) {
        var detail = document.querySelector('#detail'),
            detailTemplate = document.querySelector('#detailtemplate'),
            source = detailTemplate.innerHTML,
            compile = Handlebars.compile(source),
            html = '';
        html = compile(film);
        detail.innerHTML += html;
    }
    var getFIlmData = function(person) {
        if (typeof person !== "undefined") {
            document.querySelector('#detail').innerHTML = "";
            person.films.forEach(function(film) {
                aja().url(film).on('success', function(filmsData) {
                    renderFIlmData(filmsData);
                }).go();
            })
        } else {
            // redirect
        }
    }
    var sort = function(data) {
        data.sort(function(a, b) {
            return a.height - b.height;
        });
        console.log(data)
       render(data);
    }
    // handle hashchange
    routie({
        'people/:id': function(id) {
            getFIlmData(originalData[id])
        },
        'sort/:way': function(id) {
            getFIlmData(sort(originalData))
        }
    });
    // get data
    aja().url(url).on('success', function(data) {
        originalData = data.results;
        render(data.results);
    }).go();
})();
// MICROLIBS:
// Handlebars (http://handlebarsjs.com/)
// Aja (http://krampstudio.com/aja.js/)