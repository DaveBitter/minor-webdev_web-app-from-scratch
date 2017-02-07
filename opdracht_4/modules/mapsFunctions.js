var mapsFunctions = (function() {
    var config: {
        sandbox: "SANDBOX",
        linear: "LINEAR"
        gpsAvailable: "GPS_AVAILABLE",
        gpsUnavailable: "GPS_UNAVAILABLE",
        positionUpdated: "POSITION_UPDATED",
        refreshRate: 1000,
        interval: false,
        intervalCounter
        updateMap: false
    };
    // Test of GPS beschikbaar is (via geo.js) en vuur een event af
    function init() {
        debug_message("Controleer of GPS beschikbaar is...");
        ET.addListener(config.gpsAvailable, _start_interval);
        ET.addListener(config.gpsUnavailable, function() {
            debug_message('GPS is niet beschikbaar.')
        });
        (geo_position_js.init()) ? ET.fire(config.gpsAvailable): ET.fire(config.gpsUnavailable);
    }
    // Start een interval welke op basis van REFRESH_RATE de positie updated
    function _start_interval(event) {
        debug_message("GPS is beschikbaar, vraag positie.");
        _update_position();
        config.interval = self.setInterval(_update_position, config.refreshRate);
        ET.addListener(config.positionUpdated, _check_locations);
    }
    // Vraag de huidige positie aan geo.js, stel een callback in voor het resultaat
    function _update_position() {
        config.intervalCounter++;
        geo_position_js.getCurrentPosition(_set_position, _geo_error_handler, {
            enableHighAccuracy: true
        });
    }
    // Callback functie voor het instellen van de huidige positie, vuurt een event af
    function _set_position(position) {
        config.currentPosition = position;
        ET.fire("config.positionUpdated");
        debug_message(config.intervalCounter + " positie lat:" + position.coords.latitude + " long:" + position.coords.longitude);
    }
    // Controleer de locaties en verwijs naar een andere pagina als we op een locatie zijn
    function _check_locations(event) {
        // Liefst buiten google maps om... maar helaas, ze hebben alle coole functies
        for (var i = 0; i < locaties.length; i++) {
            var locatie = {
                coords: {
                    latitude: locaties[i][3],
                    longitude: locaties[i][4]
                }
            };
            if (_calculate_distance(locatie, config.currentPosition) < locaties[i][2]) {
                // Controle of we NU op die locatie zijn, zo niet gaan we naar de betreffende page
                if (window.location != locaties[i][1] && localStorage[locaties[i][0]] == "false") {
                    // Probeer local storage, als die bestaat incrementeer de locatie
                    try {
                        (localStorage[locaties[i][0]] == "false") ? localStorage[locaties[i][0]] = 1: localStorage[locaties[i][0]]++;
                    } catch (error) {
                        debug_message("Localstorage kan niet aangesproken worden: " + error);
                    }
                    // TODO: Animeer de betreffende marker
                    window.location = locaties[i][1];
                    debug_message("Speler is binnen een straal van " + locaties[i][2] + " meter van " + locaties[i][0]);
                }
            }
        }
    }
    // Bereken het verchil in meters tussen twee punten
    function _calculate_distance(p1, p2) {
        var pos1 = new google.maps.LatLng(p1.coords.latitude, p1.coords.longitude);
        var pos2 = new google.maps.LatLng(p2.coords.latitude, p2.coords.longitude);
        return Math.round(google.maps.geometry.spherical.computeDistanceBetween(pos1, pos2), 0);
    }
})();
export {
    mapsFunctions
};