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
    var cachePosition = 0;
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
            data.stars = getStars(data.vote_average, 10)
            data = ['title', 'poster_path', 'stars', 'vote_count', 'id'].reduce(function(o, k) {
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
            document.querySelector('#movies').classList.remove('hide')
            document.querySelector('#movie').classList.add('hide')
            window.scrollTo(0, cachePosition);
            for (i = 0; i < 25; i++) {
                var MAX = 5;
                var randomMovieId = randomNum(1000, MAX);
                queryUrl = config.QUERY.RANDOM;
                queryUrl = config.QUERY.RANDOM = 'movie/' + randomMovieId
                getData(config.BASEURL + queryUrl + config.APIKEY)
            }
            return;
        }
        if (type === "detail") {
            document.querySelector('#movies').classList.add('hide')
            document.querySelector('#movie').classList.remove('hide')
            document.querySelector('#movie').innerHTML = ''
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
    var getStars = function(value, max) {
        var stars = [];
        for (i = 0; i < Math.floor((value / 10) * 5); i++) {
            stars.push("*");
        }
        return stars;
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
    window.addEventListener('scroll', function() {
        cachePosition = (window.pageYOffset);
        var topDoc = (window.pageYOffset);
        var topLoadmore = cumulativeOffset(loadmore);
        console.log(topDoc, topLoadmore)
        if (topLoadmore.top - topDoc < 1200 && window.location.hash === '#random') {
            buildUrl("random")
        }
    });
    var cumulativeOffset = function(element) {
        var top = 0,
            left = 0;
        do {
            top += element.offsetTop || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent;
        } while (element);
        return {
            top: top,
            left: left
        };
    };
})();
// MICROLIBS:
// Handlebars (http://handlebarsjs.com/)
// Aja (http://krampstudio.com/aja.js/)