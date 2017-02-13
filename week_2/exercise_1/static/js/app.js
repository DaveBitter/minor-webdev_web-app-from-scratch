(function() {
    var config = {
        BASEURL: 'https://api.themoviedb.org/3/',
        APIKEY: '?api_key=a0706af9573b50ce0069760a6d103914',
        QUERY: {
            ALL: 'genre/10751/movies',
            RANDOM: '',
        },
        IMAGEPATH: 'http://image.tmdb.org/t/p/w500/'
    }
    var cacheResults = []
    // renderAll data
    var renderAll = function(data) {
        var movies = document.querySelector('#movies'),
            template = document.querySelector('#template'),
            source = template.innerHTML,
            compile = Handlebars.compile(source),
            html = ''
        html = compile(data);
        movies.innerHTML += html;
    }
     var renderDetail = function(data) {
        var movies = document.querySelector('#movie'),
            template = document.querySelector('#detailtemplate'),
            source = template.innerHTML,
            compile = Handlebars.compile(source),
            html = ''
        html = compile(data);
        movies.innerHTML += html;
    }

    // get data
    var getData = function(url) {
        aja().url(url).on('success', function(data) {
            data.poster_path = config.IMAGEPATH + data.poster_path
            cacheResults.push(data)
            data = ['title', 'poster_path', 'overview', 'id'].reduce(function(o, k) {
                o[k] = data[k];
                return o;
            }, {});
            renderAll(data);
        }).go();
    }
    var buildUrl = function(type, id) {
        var queryUrl = "";
        if (type === "all") {
            queryUrl = config.QUERY.ALL;
        }
        if (type === "random") {
            document.querySelector('#movie').innerHTML = ''
            cacheResults = []
            for (i = 0; i < 5; i++) {
                var MAX = 5;
                var randomMovieId = randomNum(1000, MAX);
                queryUrl = config.QUERY.RANDOM;
                queryUrl = config.QUERY.RANDOM = 'movie/' + randomMovieId
                getData(config.BASEURL + queryUrl + config.APIKEY)
            }
            return;
        }
        if (type === "detail") {
            document.querySelector('#movies').innerHTML = ''
            var detailData = cacheResults.find(function(result) {
                return result.id == id
            });
            renderDetail(detailData);
            return
        }
        getData(config.BASEURL + queryUrl + config.APIKEY)
    }
    var randomNum = function(min, max) {
        return Math.floor(Math.random() * ((max - min) + 1) + min);
    }
    routie({
        'all': function() {
            buildUrl("all");
        },
        'random': function() {
            buildUrl("random");
        },
        'movie/:id': function(id) {
            buildUrl("detail", id);
        }
    });
})();
// MICROLIBS:
// Handlebars (http://handlebarsjs.com/)
// Aja (http://krampstudio.com/aja.js/)