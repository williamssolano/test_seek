/**
 * Objeto GeoPSI
 * 
 * @type Object
 */
var Psigeo = {
    /**
     * Default Latitude -12.109121
     * @type Number
     */
    defLat: -12.109121,
    /**
     * Default Longitude -77.016269
     * @type Number
     */
    defLng: -77.016269,
    /**
     * Default Zoom 12
     * @type Number
     */
    defZoom: 12,
    /**
     * Infowindow
     * 
     * @type google.maps.InfoWindow
     */
    infowindow: new google.maps.InfoWindow({
        content: ""
    }),
    /**
     * Coordenadas para dibujar poligono
     * @type Array
     */
    polycoords: [],
    /**
     * Propiedades por defecto del poligono
     * 
     * @type Object
     */
    polyprops: {
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35
    },
    /**
     * Propiedades del mapa: center, zoom, mapTypeId:ROADMAP
     * @type object
     */
    mapProps: {
        center: new google.maps.LatLng(-12.109121, -77.016269),
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    },
    map: function (element) {
        return new google.maps.Map(document.getElementById(element), Psigeo.mapProps);
    },
    /**
     * agregar un marcador en una posicion por defecto
     * @param {type} map
     * @param {double} lat (y)
     * @param {double} lng (x)
     * @returns {google.maps.Marker}
     */
    marker: function (map, lat, lng) {
        return new google.maps.Marker({
            draggable: true,
            position: new google.maps.LatLng(lat, lng),
            map: map
        });
    },
    /**
     * Redimensiona solo el mapa
     * @param {type} map
     * @returns {Boolean}
     */
    mapResize: function (map) {
        google.maps.event.trigger(map, 'resize');
        return true;
    },
    /**
     * Muestra infowindow para un marcador
     * 
     * @param {type} map Mapa donde se mostrar marcador
     * @param {type} element Marcador (marker)
     * @param {type} content Contenido (html) del infowindow
     */
    doInfoWindow: function (map, element, content) {
        google.maps.event.addListener(element, 'click', (
                function (marker, infocontent, infowindow) {
                    return function () {
                        infowindow.setContent(infocontent);
                        infowindow.open(map, marker);
                    };
                })(element, content, Psigeo.infowindow));
    },
    /**
     * 
     * @returns {null}
     */
    closeInfoWindow: function () {
        Psigeo.infowindow.close();
    },
    /**
     * Inicia un obj tipo "panorama" de Google Street View
     * @param {type} lat Latitud (y)
     * @param {type} lng Longitud (x)
     * @param {type} item Elemento donde se mostrara el street view (div, p, etc.)
     * @returns {google.maps.StreetViewPanorama}
     */
    geoStreetView: function (lat, lng, item) {
        var fenway = new google.maps.LatLng(lat, lng);
        // Note: constructed panorama objects have visible: true
        // set by default.
        var panoOptions = {
            position: fenway,
            addressControlOptions: {
                position: google.maps.ControlPosition.BOTTOM_CENTER
            },
            linksControl: true,
            panControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL
            },
            enableCloseButton: false
        };
        var panorama = new google.maps.StreetViewPanorama(
                document.getElementById(item), panoOptions);
        return panorama;
    },
    /**
     * Crea un poligono 
     * 
     * @param Array coordenadas: Arreglo[] de coordenadas
     * @param String lineColor: codigo de color de linea hexadecimal
     * @param Number lineWeight: Ancho de linea de 1 a 10
     * @param String backColor: codigo de color de fondo hexadecimal
     * @param Number backOpac: Opacidad de fondo, decimal entre 0 y 1
     * @returns {google.maps.Polygon}
     */
    poligono: function (coordenadas, lineColor, lineWeight, backColor, backOpac) {
        var polygon = new google.maps.Polygon({
            paths: coordenadas,
            strokeColor: lineColor,
            strokeOpacity: 0.8,
            strokeWeight: lineWeight,
            fillColor: backColor,
            fillOpacity: backOpac
        });
        return polygon;
    },
    /**
     * Convierte un objeto con elementos de propiedades coord_x y coord_y
     * a un arreglo de coordenadas Google Maps
     * Ejemplo "obj":
     * 
     * 0: Object
     *      coord_x: "-77.06226646"
     *      coord_y: "-11.92563371"
     * 1: Object
     *      coord_x: "-77.06272567"
     *      coord_y: "-11.92536604"
     * 
     * @param Object obj: 
     * @returns {Array}
     */
    objToLatLngArray: function (obj) {
        var LatLngArray = [];

        $.each(obj, function (index, value) {
            LatLngArray.push(
                    new google.maps.LatLng(value.coord_y, value.coord_x)
                    );
        });

        return LatLngArray;
    }
};