(function() {
    var config = {
        BASEURL: 'https://api.themoviedb.org/3/',
        APIKEY: '?api_key=a0706af9573b50ce0069760a6d103914',
        QUERY: {
            ALL: 'genre/10751/movies',
            RANDOM: '',
        },
        totalSpan: 0,
        IMAGEPATH: 'http://image.tmdb.org/t/p/w500/'
    }
    var cache = {
        position: 0,
        results: []
    }

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
        aja().url(url).on('error', function() {
            return
        }).on('success', function(data) {
            data.budget = accounting.formatMoney(data.budget)
            data.revenue = accounting.formatMoney(data.revenue)
            data.poster_path = buildPosterPath(data.poster_path);
            cache.results.push(data)
            data.stars = getStars(data.vote_average, 10)
            data.imdb_link = buildImdbLink(data.imdb_id)
            data = ['title', 'poster_path', 'stars', 'vote_count', 'imdb_link' ,'id'].reduce(function(o, k) {
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
            getTotalSpan(config.BASEURL + queryUrl + config.APIKEY)
        }
        if (type === "random") {
            document.querySelector('#movies').classList.remove('hide')
            document.querySelector('#movie').classList.add('hide')
            window.scrollTo(0, cache.position);
            for (i = 0; i < 25; i++) {
                var randomMovieId = randomNum(0, config.totalSpan);
                queryUrl = config.QUERY.RANDOM;
                queryUrl = config.QUERY.RANDOM = 'movie/' + randomMovieId
                getData(config.BASEURL + queryUrl + config.APIKEY)
            }
            return;
        }
        if (type === "detail") {
            cache.position = (window.pageYOffset);
            document.querySelector('#movies').classList.add('hide')
            document.querySelector('#movie').classList.remove('hide')
            document.querySelector('#movie').innerHTML = ''
            var detailData = cache.results.find(function(result) {
                return result.id == id
            });
            renderDetail(detailData);
            return
        }
    }
    var buildPosterPath = function(poster_path) {
        if (typeof poster_path === 'undefined' || poster_path === null) {
            poster_path = "static/images/poster.jpg"
        } else {
            poster_path = config.IMAGEPATH + poster_path
        }
        return poster_path;
    }
    var getTotalSpan = function() {
        var url = config.BASEURL + config.QUERY.ALL + config.APIKEY;
        aja().url(url).on('success', function(data) {
            config.totalSpan = data.total_results;
            buildUrl("random")
        }).go();
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
    var buildImdbLink = function(imdb_id) {
        return('http://imdb.com/title/' + imdb_id)
    }
    routie({
        'all': function() {
            buildUrl("all");
        },
        '': function() {
            getTotalSpan("random");
        },
        'movie/:id': function(id) {
            buildUrl("detail", id);;
        }
    });
    window.addEventListener('scroll', function() {
        var topDoc = (window.pageYOffset);
        var topLoadmore = cumulativeOffset(loadmore);
        if (topLoadmore.top - topDoc < 1200 && window.location.hash === '') {
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