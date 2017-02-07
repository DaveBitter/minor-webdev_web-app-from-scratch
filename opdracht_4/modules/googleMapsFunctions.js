var googleMapsFunctions = (function(config) {
    var config: {
        currentPosition: false,
        currentPositionMarker: false,
        map: false,
        generateMap: function() {
            return generate_map(myOptions, canvasId);
        },
        updatePositie: function() {
            return update_positie(event);
        }
    };

    function generate_map(myOptions, canvasId) {
        // GOOGLE MAPS FUNCTIES
        /**
         * generate_map(myOptions, canvasId)
         *  roept op basis van meegegeven opties de google maps API aan
         *  om een kaart te genereren en plaatst deze in het HTML element
         *  wat aangeduid wordt door het meegegeven id.
         *
         *  @param myOptions:object - een object met in te stellen opties
         *      voor de aanroep van de google maps API, kijk voor een over-
         *      zicht van mogelijke opties op http://
         *  @param canvasID:string - het id van het HTML element waar de
         *      kaart in ge-rendered moet worden, <div> of <canvas>
         */
        // TODO: Kan ik hier asynchroon nog de google maps api aanroepen? dit scheelt calls
        debug_message("Genereer een Google Maps kaart en toon deze in #" + canvasId)
        config.map = new google.maps.Map(document.getElementById(canvasId), myOptions);
        var routeList = [];
        // Voeg de markers toe aan de map afhankelijk van het tourtype
        debug_message("Locaties intekenen, tourtype is: " + tourType);
        for (var i = 0; i < locaties.length; i++) {
            // Met kudos aan Tomas Harkema, probeer local storage, als het bestaat, voeg de locaties toe
            try {
                (localStorage.visited == undefined || isNumber(localStorage.visited)) ? localStorage[locaties[i][0]] = false: null;
            } catch (error) {
                debug_message("Localstorage kan niet aangesproken worden: " + error);
            }
            var markerLatLng = new google.maps.LatLng(locaties[i][3], locaties[i][4]);
            routeList.push(markerLatLng);
            markerRij[i] = {};
            for (var attr in locatieMarker) {
                markerRij[i][attr] = locatieMarker[attr];
            }
            markerRij[i].scale = locaties[i][2] / 3;
            var marker = new google.maps.Marker({
                position: markerLatLng,
                map: config.map,
                icon: markerRij[i],
                title: locaties[i][0]
            });
        }
        // TODO: Kleur aanpassen op het huidige punt van de tour
        if (tourType == LINEAIR) {
            // Trek lijnen tussen de punten
            debug_message("Route intekenen");
            var route = new google.maps.Polyline({
                clickable: false,
                map: config.map,
                path: routeList,
                strokeColor: 'Black',
                strokeOpacity: .6,
                strokeWeight: 3
            });
        }
        // Voeg de locatie van de persoon door
        config.currentPositionMarker = new google.maps.Marker({
            position: kaartOpties.center,
            map: config.map,
            icon: positieMarker,
            title: 'U bevindt zich hier'
        });
        // Zorg dat de kaart geupdated wordt als het config.positionUpdated event afgevuurd wordt
        ET.addListener(config.positionUpdated, update_positie);
    }

    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    // Update de positie van de gebruiker op de kaart
    function update_positie(event) {
        // use config.currentPosition to center the map
        var newPos = new google.maps.LatLng(config.currentPosition.coords.latitude, config.currentPosition.coords.longitude);
        config.map.setCenter(newPos);
        currentPositionMarker.setPosition(newPos);
    }
    // FUNCTIES VOOR DEBUGGING
    function _geo_error_handler(code, message) {
        debug_message('geo.js error ' + code + ': ' + message);
    }
})();
export {
    googleMapsFunctions
};