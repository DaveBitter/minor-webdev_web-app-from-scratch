var worker = new Worker('js/task.js')
   worker.onmessage = function (event) {
     document.getElementById('result').textContent = event.data;
   };

(function() {
    // Config information
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

    // Cache storing
    var cache = {
        position: 0,
        results: []
    }

    // render overviewpage
    var renderAll = function(data) {
        var movies = document.querySelector('#movies'),
            template = document.querySelector('#template'),
            source = template.innerHTML,
            compile = Handlebars.compile(source),
            html = ''
        html = compile(data);
        movies.innerHTML += html;
    }

    //  render detailpage
    var renderDetail = function(data) {
        var movies = document.querySelector('#movie'),
            template = document.querySelector('#detailtemplate'),
            source = template.innerHTML,
            compile = Handlebars.compile(source),
            html = ''
        html = compile(data);
        movies.innerHTML += html;
    }

    // get data from API
    var getData = function(url) {
        aja().url(url).on('error', function() {
            return
        }).on('success', function(data) {
            //  manuipulating data to use in the front-end
            data.budget = accounting.formatMoney(data.budget)
            data.revenue = accounting.formatMoney(data.revenue)
            data.poster_path = buildPosterPath(data.poster_path);
            data.stars = getStars(data.vote_average, 10)
            data.imdb_link = buildImdbLink(data.imdb_id)

            // storing data in cache in order to use it later on
            cache.results.push(data)

            // reducing of the properties of data to the minumum required by the front-end
            data = ['title', 'poster_path', 'stars', 'vote_count', 'imdb_link', 'id'].reduce(function(o, k) {
                o[k] = data[k];
                return o;
            }, {});

            // render the overview page
            renderAll(data);
        }).go();
    }

    // build url for data request to API
    var buildUrl = function(type, id) {
        var queryUrl = "";

        // build the url for the query to get the amount of movies available
        if (type === "all") {
            queryUrl = config.QUERY.ALL;
            getTotalSpan(config.BASEURL + queryUrl + config.APIKEY)
        }

        // build the url for the query for the overviewpage
        if (type === "random") {
            document.querySelector('#movies').classList.remove('hide')
            document.querySelector('#movie').classList.add('hide')
            window.scrollTo(0, cache.position);

            // add X amount of movies to the overviewpage
            for (i = 0; i < 25; i++) {
                var randomMovieId = randomNum(0, config.totalSpan);
                queryUrl = config.QUERY.RANDOM;
                queryUrl = config.QUERY.RANDOM = 'movie/' + randomMovieId
                getData(config.BASEURL + queryUrl + config.APIKEY)
            }
            return;
        }

        // get all the data from the required movie out of the cached movies
        if (type === "detail") {
            // cache the current position on the page for when you return from the detailpage
            cache.position = (window.pageYOffset);
            document.querySelector('#movies').classList.add('hide')
            document.querySelector('#movie').classList.remove('hide')
            document.querySelector('#movie').innerHTML = ''

            // find the required movie
            var detailData = cache.results.find(function(result) {
                return result.id == id
            });
            renderDetail(detailData);
            return
        }
    }

    // build the full path for the poster
    var buildPosterPath = function(poster_path) {
        // create fallback for when no poster is available, otherwise build the file url
        if (typeof poster_path === 'undefined' || poster_path === null) {
            poster_path = "static/images/poster.jpg"
        } else {
            poster_path = config.IMAGEPATH + poster_path
        }
        return poster_path;
    }

    // get total span of movies in the database (to know the bounds for the random movie)
    var getTotalSpan = function() {
        var url = config.BASEURL + config.QUERY.ALL + config.APIKEY;
        aja().url(url).on('success', function(data) {
            config.totalSpan = data.total_results;
            buildUrl("random")
        }).go();
    }

    // get random number between to values
    var randomNum = function(min, max) {
        return Math.floor(Math.random() * ((max - min) + 1) + min);
    }

    //  build array of stars (needed it in the front-end for handlebars incapability)
    var getStars = function(value, max) {
        var stars = [];
        for (i = 0; i < Math.floor((value / 10) * 5); i++) {
            stars.push("*");
        }
        return stars;
    }

    //  build link for imdb page based on the id
    var buildImdbLink = function(imdb_id) {
        return ('http://imdb.com/title/' + imdb_id)
    }

    // get position of the 'refresh element'
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

    // handle routing
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

    // check if the user scrolled to the bottom of the page (then add new items)
    window.addEventListener('scroll', function() {
        // get the top of the viewport (window) and the top of the load more element at the bottom of the page
        var topDoc = (window.pageYOffset);
        var topLoadmore = cumulativeOffset(loadmore);

        // check if more items should be loaded
        if (topLoadmore.top - topDoc < 1200 && window.location.hash === '') {
            buildUrl("random")
        }
    });
})();


// MicroLibs used:
// Handlebars (http://handlebarsjs.com/)
// Aja (http://krampstudio.com/aja.js/)
// Routie (https://github.com/jgallen23/routie)
// Accounting (http://openexchangerates.github.io/accounting.js/)