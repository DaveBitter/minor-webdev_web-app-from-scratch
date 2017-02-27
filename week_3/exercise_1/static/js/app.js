(function() {
    var app = {
        config: {
            BASEURL: 'https://api.themoviedb.org/3/',
            APIKEY: '?api_key=a0706af9573b50ce0069760a6d103914',
            QUERY: {
                ALL: 'genre/10751/movies',
                RANDOM: '',
            },
            totalSpan: 0,
            IMAGEPATH: 'http://image.tmdb.org/t/p/w500/'
        },
        cache: {
            position: 0,
            results: []
        },
        init: function() {
            router.init();
            getFilterConfig();
            gesture.init()
        }
    }
    var router = {
        init: function() {
            routie({
                // handle routing
                'all': function() {
                    buildUrl("all");
                },
                '': function() {
                    getTotalSpan("random");
                },
                'movie/:id': function(id) {
                    buildUrl("detail", id);
                }
            });
        }
    }

    var gesture = {
        init: function() {
            swipe()
        }
    }
    var filter = {
        adult: false,
        config: function() {
            getFilterConfig();
        }
    }
    var data = {
        get: function(url, time) {
            getData(url, time)
        }
    }
    var swipe = function() {
        var bodySwipe = new Hammer(document.querySelector('body'));
        bodySwipe.on('swiperight', function(ev) {
            buildUrl('random')
        });
    }
    var construct = {
        url: function(type, id) {
            buildUrl(type, id);
        },
        posterPath: function(path) {
            buildPosterPath(path);
        },
        amount: function(amount) {
            return parseAmount(amount);
        },
        randomNum: function(min, max) {
            return randomNum(min, max);
        },
        stars: function(amount) {
            return getStars(amount);
        },
        imdbLink: function(id) {
            return buildImdbLink(id);
        }
    }
    var render = {
        all: function(data) {
            renderAll(data);
        },
        detail: function(data) {
            renderDetail(data);
        }
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
        var template = document.querySelector('#detailtemplate')
        // redirect to home if no data is found
        if (typeof template === 'undefined' || template === null) {
            window.location.href = ('#')
        }
        var movies = document.querySelector('#movie'),
            source = template.innerHTML,
            compile = Handlebars.compile(source),
            html = ''
        html = compile(data);
        movies.innerHTML += html;
    }
    //  toggle loader
    var toggleLoader = function() {
        var loader = document.getElementById("loader");
        loader.classList.toggle("hide");
    }
    // get data from API
    var getData = function(url, time) {
        aja().url(url).on('4xx', function() {
            if (time === 29) {
                toggleLoader();
            }
        }).on('success', function(data) {
            //  manuipulating data to use in the front-end
            data.budget = construct.amount(data.budget);
            data.revenue = construct.amount(data.revenue);
            data.poster_path = buildPosterPath(data.poster_path);
            data.stars = construct.stars(data.vote_average, 10)
            data.imdb_link = buildImdbLink(data.imdb_id)
            // storing data in cache in order to use it later on
            if (toBeFiltered(data) === true) {
                return;
            }
            app.cache.results.push(data)
            // reducing of the properties of data to the minumum required by the front-end
            data = ['title', 'poster_path', 'stars', 'vote_count', 'imdb_link', 'id'].reduce(function(o, k) {
                o[k] = data[k];
                return o;
            }, {});
            // render the overview page
            if (time === 29) {
                toggleLoader();
            }
            render.all(data);
        }).go();
    }
    // build url for data request to API
    var buildUrl = function(type, id) {
        var queryUrl = "";
        // build the url for the query to get the amount of movies available
        switch (type) {
            case "all":
                if (type === "all") {
                    queryUrl = app.config.QUERY.ALL;
                    getTotalSpan(app.config.BASEURL + queryUrl + app.config.APIKEY)
                }
                break;
            case "random":
                // build the url for the query for the overviewpage
                document.querySelector('#movies').classList.remove('hide')
                document.querySelector('#movie').classList.add('hide')
                document.querySelector('#back').classList.add('hide')
                window.scrollTo(0, app.cache.position);
                // add X amount of movies to the overviewpage
                toggleLoader();
                for (i = 0; i < 30; i++) {
                    var randomMovieId = construct.randomNum(0, app.config.totalSpan);
                    queryUrl = app.config.QUERY.RANDOM;
                    queryUrl = app.config.QUERY.RANDOM = 'movie/' + randomMovieId
                    data.get(app.config.BASEURL + queryUrl + app.config.APIKEY, i)
                }
                canLoad = false
                limit()
                break;
            case "detail":
                // get all the data from the required movie out of the app.cached movies
                document.querySelector('#movies').classList.add('hide')
                document.querySelector('#movie').classList.remove('hide')
                document.querySelector('#back').classList.remove('hide')
                document.querySelector('#movie').innerHTML = ''
                // find the required movie
                var detailData = app.cache.results.find(function(result) {
                    return result.id == id
                });
                render.detail(detailData);
                break;
        }
    }
    var getFilterConfig = function() {
        document.getElementById("filter-adult").addEventListener('click', function() {
            filter.adult = !filter.adult;
        })
    }
    var toBeFiltered = function(movie) {
        if (movie.adult === true && filter.adult === true) {
            return true
        } else {
            return false
        }
    }
    // build the full path for the poster
    var buildPosterPath = function(poster_path) {
        // create fallback for when no poster is available, otherwise build the file url
        if (typeof poster_path === 'undefined' || poster_path === null) {
            poster_path = "static/images/poster.jpg"
        } else {
            poster_path = app.config.IMAGEPATH + poster_path
        }
        return poster_path;
    }
    // get total span of movies in the database (to know the bounds for the random movie)
    var getTotalSpan = function() {
        var url = app.config.BASEURL + app.config.QUERY.ALL + app.config.APIKEY;
        aja().url(url).on('success', function(data) {
            app.config.totalSpan = data.total_results;
            construct.url("random")
        }).go();
    }
    // parse number to amount, comma seperated
    var parseAmount = function(amount) {
        amount = amount.toFixed(0).replace(/./g, function(c, i, a) {
            return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
        });
        amount = "$ " + amount;
        return amount;
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
    var limit = function() {
        setTimeout(function() {
            canLoad = true
        }, 000);
    }
    var canLoad = true;
    // check if the user scrolled to the bottom of the page (then add new items)
    window.addEventListener('scroll', function(e) {
        // get the top of the viewport (window) and the top of the load more element at the bottom of the page
        var topDoc = (window.pageYOffset);
        var topLoadmore = cumulativeOffset(loadmore);
        if (window.location.hash === '') {
            // app.cache the current position on the page for when you return from the detailpage
            app.cache.position = (window.pageYOffset);
        }
        // check if more items should be loaded
        if (topLoadmore.top - topDoc < 1200 && window.location.hash === '' && canLoad === true) {
            app.cache.position = (window.pageYOffset);
            construct.url("random")
        }
    });
    app.init();
})();
// MicroLibs used:
// Handlebars (http://handlebarsjs.com/)
// Aja (http://krampstudio.com/aja.js/)
// Routie (https://github.com/jgallen23/routie)