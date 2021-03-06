
var map;
var geocoder;
var myInterval;
var dynamicInc = 0;
var data_polygon = "";
var polygonCoords = [];
var markers = [];
var markerArray = [];
var addressArray = [];
var addressMarkerArray = [];
var polygonArray = [];
var bounds;
var infowindow = "";
var infoWinContent = [];
var capasArray = [];
var polygonObject;
var elementData;
//Estilo por capa
var layerStyle = new Array();
//Objetos del mapa
var mapObjects = new Array();
//Id de capas
var projectLayers = new Array();
//Capas intermitentes
var flickLayer = new Array();
//Capas por files KML o KMZ
var fileLayers = new Array();
//Soporte multiple proyectos
var multiLayer = new Array();
//Tmp items seleccionados antes de dibujar
var selectedItem = new Array();
var selectedItemTmp = new Array();

var layerGroup = new Array();
var layerGroupTmp = new Array();

//Variables funcionales
var geoVal;
//zIndex capa
var zIndexLayer = 0;

//Variables globales estilos
var iconSelected = "";
var colorSelected = "";
var colorLineSelected = "";

/**
 * Tamaño de un objeto Array (obj)
 * 
 * @param {type} obj
 * @returns {Number}
 */
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key))
            size++;
    }
    return size;
};

//Genera y obtiene color aleatorio
function getRandomColor() {
    var hex = Math.floor(Math.random() * 0xFFFFFF);
    return "#" + ("000000" + hex.toString(16)).substr(-6);
}

//Realiza una acción de acuerdo al nivel de zoom
function onZoomDo(zoom) {

}

//Inicializar Google Maps
function initialize() {
    bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        zoom: 10,
        center: new google.maps.LatLng(-12.033284, -77.0715493)
    };
    map = new google.maps.Map(document.getElementById('content'),
            mapOptions);

    infowindow = new google.maps.InfoWindow({
        content: "Loading..."
    });

    //Zoom 
    google.maps.event.addListener(map, 'zoom_changed', function() {
        onZoomDo(map.getZoom());
    });

    //Geocoder
    geocoder = new google.maps.Geocoder();

    //Estilos del mapa, carreteras, agua, bloques, etc.
    var styles = [
        {
            stylers: [
                {hue: "#F08FD9"},
                {saturation: -5}
            ]
        }
        , {
            featureType: "water",
            elementType: "geometry",
            stylers: [
                {color: "#b1b0f7"}
            ]
        }
    ];

    //map.setOptions({styles: styles});
}

/**
 * 
 * @param {type} position objeto latLng Google maps
 * @param {type} content contenido del infowindow
 * @returns {Boolean}
 */
function doInfoWindow(position, content) {
    var html = "<div style=\"width: 300px; height: 150px\">";

    $.each(content, function(id, val) {
        html += val;
    });
    html += "</div>";

    infowindow.setPosition(position);
    infowindow.setContent(html);
    infowindow.open(self.map);

    $('.picker').colpick({
        layout: 'hex',
        submit: 0,
        colorScheme: 'dark',
        onChange: function(hsb, hex, rgb, el, bySetColor) {
            $(el).css('border-color', '#' + hex);
            // Fill the text box just if the color was set using the picker, and not the colpickSetColor function.
            if (!bySetColor)
                $(el).val(hex);
        }
    }).keyup(function() {
        $(this).colpickSetColor(this.value);
    });

    $("#polygonStyle").click(function() {

        polygonObject.setMap(null);
        //Color de fondo
        polygonObject.fillColor = "#" + $("#singlePolygonFill").val();
        //Color de linea
        polygonObject.strokeColor = "#" + $("#singlePolygonLine").val();
        //Opacidad
        polygonObject.fillOpacity = $("#singlePolygonOpacity").val();
        //Espesor de linea
        polygonObject.strokeWeight = $("#singlePolygonStroke").val();
        //Dibujar en mapa
        polygonObject.setMap(map);

        //Aplicar nuevos estilos antes de guardar cambios
        for (key in layerGroup) {
            if (layerGroup.hasOwnProperty(key)) {
                //Keys coinciden
                if (key.indexOf(elementData[ elementData.length - 1 ]) >= 0) {

                    for (nKey in layerGroup[key]) {
                        if (layerGroup[key].hasOwnProperty(nKey)) {
                            if (elementData[ elementData.length - 2 ].indexOf(nKey) >= 0) {
                                $.each(layerGroup[key][nKey], function(id, val) {
                                    var sp = val.split("___");
                                    if (elementData[ elementData.length - 3 ] === sp[0]) {

                                        layerGroup[key][nKey][id] = elementData[ elementData.length - 3 ]
                                                + "___"
                                                + "#" + $("#singlePolygonFill").val()
                                                + "___"
                                                + $("#singlePolygonOpacity").val()
                                                + "___"
                                                + "#" + $("#singlePolygonLine").val()
                                                + "___"
                                                + $("#singlePolygonStroke").val()
                                                + "___"
                                                + "undefined"
                                        if (key.indexOf("___circle___") && sp.length === 7) {
                                            layerGroup[key][nKey][id] += "___" + sp[ sp.length - 1 ];
                                        }

                                    }
                                });
                            }
                        }
                    }

                }
            }
        }
    });

    $(".removeObject").click(function(event) {
        var type = $(this).attr("title");
        var conf = confirm("Se eliminará este elemento del mapa.\n¿Desea continuar?");

        if (conf) {
            if (type === "polygon") {
                //Eliminar objeto del mapa
                polygonObject.setMap(null);
                //Eliminar del arreglo grupal
                for (key in layerGroup) {
                    if (layerGroup.hasOwnProperty(key)) {
                        //Keys coinciden
                        if (key.indexOf(elementData[ elementData.length - 1 ]) >= 0) {

                            for (nKey in layerGroup[key]) {
                                if (layerGroup[key].hasOwnProperty(nKey)) {
                                    if (elementData[ elementData.length - 2 ].indexOf(nKey) >= 0) {
                                        $.each(layerGroup[key][nKey], function(id, val) {
                                            var sp = val.split("___");
                                            if (elementData[ elementData.length - 3 ] === sp[0]) {
                                                //console.log(val);
                                            }
                                        });
                                    }
                                }
                            }

                        }
                    }
                }
            }
        }

    });

    return true;
}

/**
 * Función que se dispara al hacer click sobre un poligono:
 * 
 * @param {type} polygon el Objeto sobre el cual se hace click
 * @param {type} event el evento con datos como ubicación, etc
 * @param {type} value el nombre del elemento
 * @param {type} gcoder boolean true:usa Geocoder false:no usa geocoder
 * @returns {Boolean}
 */
function polygonDo(polygon, event, value, gcoder) {

    polygonObject = polygon;
    elementData = value;

    var op = "<select id=\"singlePolygonOpacity\">";
    for (var i = 0; i <= 1; ) {
        var sel = "";
        if (Number(polygon.fillOpacity).toFixed(1) == i.toFixed(1)) {
            sel = "selected";
        }
        op += "<option value=\"" + i.toFixed(1) + "\" " + sel + ">" + i.toFixed(1) + "</option>";
        i += 0.1;
    }
    op += "</select>";

    var gl = "<select id=\"singlePolygonStroke\">";
    for (var i = 0; i <= 10; i++) {
        var sel = "";
        if (Number(polygon.strokeWeight) == i) {
            sel = "selected";
        }
        gl += "<option value=\"" + i + "\" " + sel + ">" + i + "</option>";
    }
    gl += "</select>";

    infoWinContent = [];
    if (value[ value.length - 2 ].indexOf("___") >= 0) {
        infoWinContent.push("<div>" + value[ value.length - 2 ].replace(/___/g, " / ") + "</div>");
    } else {
        infoWinContent.push("<div>" + value + "</div>");
    }
    infoWinContent.push("<div>" + event.latLng.lng() + "</div>");
    infoWinContent.push("<div>" + event.latLng.lat() + "</div>");

    var polyArea = google.maps.geometry.spherical.computeArea(polygon.getPath());
    infoWinContent.push("<div>Area: " + polyArea.toFixed(2) + " m&#178</div>");

    var tDesign = '<div style="display: table">'
            + '<div style="display: table-row">'
            + '<div style="display: table-cell">Fondo</div>'
            + '<div style="display: table-cell"><input type="text" size="6" class="picker" id="singlePolygonFill" value="' + polygon.fillColor.substring(1, 7) + '" style="border-color: ' + polygon.fillColor + '"></div>'
            + '<div style="display: table-cell">Opacidad</div>'
            + '<div style="display: table-cell">' + op + '</div>'
            + '</div>'
            + '<div style="display: table-row">'
            + '<div style="display: table-cell">Linea</div>'
            + '<div style="display: table-cell"><input type="text" size="6" class="picker" id="singlePolygonLine" value="' + polygon.strokeColor.substring(1, 7) + '" style="border-color: ' + polygon.strokeColor + '"></div>'
            + '<div style="display: table-cell">Espesor</div>'
            + '<div style="display: table-cell">' + gl + '</div>'
            + '</div>'
            + '</div>'
            + '<div><input type="button" class="removeObject" title="polygon" value="Remover elemento">'
            + '<input type="button" id="polygonStyle" value="Aplicar cambios"></div>';
    infoWinContent.push(tDesign);

    if (gcoder) {
        getGeoCoderData(event.latLng, function(data) {
            infoWinContent.push(data);
            doInfoWindow(event.latLng, infoWinContent);
        });
    } else {
        doInfoWindow(event.latLng, infoWinContent);
    }
    return true;
}

/**
 * Función que se dispara al hacer click sobre un marcador:
 * 
 * @param {type} marker
 * @param {type} event
 * @param {type} value
 * @param {type} gcoder
 * @returns {Boolean}
 */
function markerDo(marker, event, value, gcoder) {
    infoWinContent = [];
    if (value[0] !== "geoAddress") {
        infoWinContent.push("<div>" + value[ value.length - 2 ].replace(/___/g, " / ") + "</div>");
    } else {
        infoWinContent.push("<div>" + value[ 1 ] + "</div>");
        infoWinContent.push("<div>" + value[ 2 ] + "</div>");
    }
    infoWinContent.push("<div>" + event.latLng.lng() + "</div>");
    infoWinContent.push("<div>" + event.latLng.lat() + "</div>");

    if (gcoder) {
        getGeoCoderData(event.latLng, function(data) {
            infoWinContent.push(data);
            doInfoWindow(event.latLng, infoWinContent);
        });
    } else {
        doInfoWindow(event.latLng, infoWinContent);
    }
    return true;
}

/**
 * Use GeoCoder functions
 * 
 * @param {type} latlng
 * @param {type} callback
 * @returns {undefined}
 */
function getGeoCoderData(latlng, callback) {

    geocoder.geocode({'latLng': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                callback(results[0].formatted_address);
            }
        } else {
            callback(status);
        }
    });

}

/**
 * Muestra una capa del proyecto
 * 
 * @param {type} keyLayer, el ID de la capa
 * @returns {Boolean}
 */
function showMapLayer(keyLayer) {
    for (key in mapObjects) {
        if (mapObjects.hasOwnProperty(key)) {
            //Keys coinciden
            if (key.substring(0, keyLayer.length) == keyLayer) {
                //Mostrar elementos del mapa
                mapObjects[ key ].setMap(map);
            }
        }
    }
    return true;
}

/**
 * Oculta una capa del proyecto
 * 
 * @param {type} keyLayer, el ID de la capa
 * @returns {Boolean}
 */
function hideMapLayer(keyLayer) {
    for (key in mapObjects) {
        if (mapObjects.hasOwnProperty(key)) {
            //Keys coinciden
            if (key.substring(0, keyLayer.length) == keyLayer) {
                //Mostrar elementos del mapa
                mapObjects[ key ].setMap(null);
            }
        }
    }
    return true;
}

/**
 * Funcion para carga de iconos vía Ajax
 * 
 * @param {Str} Edit Se es nueva imagen o edita
 * @returns {undefined}
 */
function uploadAjax(Edit) {

    var inputFileImage = document.getElementById("archivoImage" + Edit);
    var file = inputFileImage.files[0];
    var data = new FormData();
    var url = "upload.icon.php";

    data.append('archivo', file);

    $.ajax({
        url: url,
        type: 'POST',
        contentType: false,
        data: data,
        processData: false,
        cache: false,
        dataType: "json",
        success: function(datos) {
            if (datos.upload) {
                //Upload OK
                $("#customIconPreview").prop("src", datos.file);
                $("#tmpIcon").val(datos.file);

                $("#customIconPreview" + Edit).prop("src", datos.file);
                $("#tmpIcon" + Edit).val(datos.file);
            } else {
                //Upload Error

            }
        }
    });
}

/**
 * Dibuja en el mapa un proyecto 
 * de acuerdo a su ID
 * 
 * @returns {undefined}
 */
function drawProject(idProject, typeEdit) {
    //Modal "loading"
    $("body").addClass("loading");

    //recuperar datos de puntos y/o poligonos
    var dataObjects = "action=getProjectLayer&id=" + idProject
    $.ajax({
        type: "POST",
        url: "georeferencia.request.php",
        data: dataObjects,
        dataType: 'json',
        success: function(datos) {
            polygonCoords = [];
            //bounds (limites del mapa por coordenadas)
            $.each(datos, function() {
                //Si el elemento generado es un poligono
                if (this.tipo == "poli") {

                    var xy = this.coords;

                    //draw Polygon
                    $.each(xy, function() {
                        var pt = new google.maps.LatLng(this.coord_y, this.coord_x);
                        bounds.extend(pt);
                        polygonCoords.push(pt);
                    });
                    var poliColor = this.chars.split("___");

                    // Construct the polygon.
                    polygon = new google.maps.Polygon({
                        paths: polygonCoords,
                        strokeColor: poliColor[2],
                        strokeOpacity: 0.8,
                        strokeWeight: poliColor[3],
                        fillColor: poliColor[0],
                        fillOpacity: poliColor[1]
                    });

                    //Agregar capa al mapa
                    mapObjects[this.layer
                            + "___"
                            + this.tipo
                            + "___"
                            + this.origen
                            + "|^"
                            + this.datos
                    ] = polygon;
                    //Agrega o no capas para edicion depende de "typeEdit"
                    if (typeEdit == "Edit") {
                        //Agregar capa al proyecto
                        projectLayers[this.layer
                                + "___"
                                + this.tipo
                                + "___"
                                + this.origen
                                + "|^"
                                + this.capa
                        ] = this.origen + " en " + this.capa;
                        //Agregar estilos de la capa
                        layerStyle[this.layer
                                + "___"
                                + this.tipo
                                + "___"
                                + this.origen] = this.chars;
                    }
                    //Soporte MultiLayer
                    multiLayer[this.layer
                            + "___"
                            + this.tipo
                            + "___"
                            + this.origen
                            + "|^"
                            + this.datos
                    ] = idProject;
                    /**
                     * Al hacer click a un poligono invoca a polygonDo()
                     * Envia el objeto poligono
                     google.maps.event.addListener(polygon, 'click', function() {
                     polygonDo(this);
                     });
                     */

                    polygon.setMap(map);
                    map.fitBounds(bounds);

                    polygonArray.push(polygon);

                    polygon = null;
                    polygonCoords = [];

                } else if (this.tipo == "punto") {
                    var xy = this.coords;
                    var itemIcon = this.chars;

                    var puntoOrigen = this.origen;
                    var puntoLayer = this.layer;
                    var puntoDatos = this.datos;
                    var puntoCapa = this.capa;
                    var puntoExt = this.chars.split("|");

                    markerNumber = 1;
                    $.each(xy, function() {
                        var pt = new google.maps.LatLng(this.coord_y, this.coord_x);
                        bounds.extend(pt);
                        markers.push(pt);

                        if (itemIcon == "" || itemIcon == "undefined") {
                            iconSelected = "";
                        } else if (itemIcon.indexOf("custom|") >= 0) {
                            iconSelected = itemIcon.substr(7);
                        } else {
                            iconSelected = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + itemIcon;
                        }

                        var marker = new google.maps.Marker({
                            position: pt,
                            map: map,
                            icon: iconSelected
                        });
                        //if ( itemIcon == "undefined" ) {
                        marker.metadata = {type: "point", id: puntoExt[0]};
                        //}

                        //Agregar capa al mapa
                        mapObjects[puntoLayer
                                + "___"
                                + "punto"
                                + "___"
                                + puntoOrigen
                                + "|^"
                                + puntoDatos
                        ] = marker;

                        //Agregar capa al proyecto
                        projectLayers[puntoLayer
                                + "___"
                                + "punto"
                                + "___"
                                + puntoOrigen
                                + "|^"
                                + puntoCapa
                        ] = puntoOrigen + " en " + puntoCapa;
                        //Agregar estilos de la capa
                        layerStyle[puntoLayer
                                + "___"
                                + "punto"
                                + "___"
                                + puntoOrigen] = itemIcon;
                        //Soporte MultiLayer
                        multiLayer[puntoLayer
                                + "___"
                                + "punto"
                                + "___"
                                + puntoOrigen
                                + "|^"
                                + puntoDatos
                        ] = idProject;

                        markerArray.push(marker);
                        marker.setMap(map);
                        marker = null;
                        markerNumber++;

                    });
                    map.fitBounds(bounds);

                }
            });
            //Remover class "loading" luego de dibujar elementos
            $("body").removeClass("loading");
        }
    });
}
/**
 * Recalcula posicion del mapa de acuerdo a los
 * elementos que contenga, funciona para polygon y marker
 * 
 * @returns {undefined}
 */
function mapFitBounds() {
    //Fit Bounds, con nuevas coordenadas por elementos
    bounds = new google.maps.LatLngBounds();
    for (key in mapObjects) {
        var thisLat;
        var thisLng;
        if (mapObjects.hasOwnProperty(key)) {
            //Get coords for polygon
            if (key.indexOf("___poli___") >= 0) {
                var path = mapObjects[key].getPath();

                if (typeof path !== "undefined") {
                    for (var i = 0; i < path.getLength(); i++) {
                        var xy = path.getAt(i);
                        thisLng = xy.lng();
                        thisLat = xy.lat();
                    }
                }
            }
            //Get coords for Marker
            if (key.indexOf("___punto___") >= 0) {
                var path = mapObjects[key].getPosition();
                if (typeof path !== "undefined") {
                    thisLng = path.lng();
                    thisLat = path.lat();
                }
            }
        }
        var pt = new google.maps.LatLng(thisLat, thisLng);
        bounds.extend(pt);
    }
    map.fitBounds(bounds);
}

/**
 * Crea las capas del objeto layerGroup
 * @param {type} index indice de la subcapa
 * @param {type} key indice del elemento de subcapa
 * @param {type} value valor asociado a key
 * @param {type} estilo estilo del elemento o capa
 * @param {type} capa ID de la capa
 * @param {type} layer Nombre de la capa
 * @param {type} dep valores previos a value
 * @returns {Boolean} 
 */
function setLayerGroup(index, key, value, estilo, capa, layer, dep) {

    for (indice in selectedItemTmp) {
        if (selectedItemTmp.hasOwnProperty(indice)) {
            $.each(selectedItemTmp[indice], function(k, v) {
                if (layerGroup.hasOwnProperty(capa) === false) {
                    layerGroup[capa] = new Array();
                }
                if (layerGroup[capa].hasOwnProperty(indice) === false) {
                    layerGroup[capa][indice] = new Array();
                }
                if (layerGroup[capa][indice].indexOf(v + "___" + estilo) === -1) {
                    layerGroup[capa][indice].push(v + "___" + estilo);
                }
            });
        }
    }
    selectedItemTmp = new Array();
    return true;
}

/**
 * Borra todos los marcadores generados por
 * búsqueda de direcciones
 * @returns {Boolean}
 */
function cleanAddressMarker() {
    if (addressMarkerArray.length > 0) {
        //Eliminar marcadores
        for (var i = 0; i < addressMarkerArray.length; i++) {
            addressMarkerArray[i].setMap(null);
        }
    }
    return true;
}

/**
 * Convierte un valor hexadecimal al sistema decimal
 * @param {type} h
 * @returns {unresolved}
 */
function hexdec(h) {
    h = h.toUpperCase();
    return parseInt(h, 16);
}

/**
 * Retorna color de texto de acuerdo al color de fondo
 * Color de texto: Blanco o negro.
 * Recibe color en hexadecimal con '#'
 * @param {type} color
 * @returns {String}
 */
function textByColor(color) {
    color = color.substring(1);

    var c_r = hexdec(color.substring(0, 2));
    var c_g = hexdec(color.substring(2, 4));
    var c_b = hexdec(color.substring(4, 6));

    var bg = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
    if (bg > 130) {
        return "#000000";
    } else {
        return "#FFFFFF";
    }
}

/**
 * Busqueda de direccion str
 * retorna las coordenadas XY de la direccion ingresada
 * @param {type} target
 * @param {type} address
 * @returns {undefined}
 */
function coordByAddress(target, address) {
    //lista de resultados
    var lista = "";
    var values;
    var color = getRandomColor();

    //Nuevo objeto geocoder
    geocoder = new google.maps.Geocoder();
    geocoder.geocode(
            {
                //envía la direccion de consulta
                address: address
            },
    function(results, status) {
        //Existem resultados, formato Json
        if (status === "OK") {
            var nmark = 0;
            var estilo = "";
            $.each(results, function() {
                //ID de marcador
                var markerId;
                //Numero de marcador
                nmark++;
                //estilo
                estilo = "|" + color.substring(1) + "|" + textByColor(color).substring(1);
                //Crear nuevo marcador con ubicacion
                var addressMarker = new google.maps.Marker({
                    map: map,
                    position: this.geometry.location,
                    draggable: true,
                    icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + nmark + estilo
                });

                //Objeto en el mapa
                markerId = $.md5(target)
                        + "___"
                        + "punto"
                        + "___"
                        + "address"
                        + "|^"
                        + target
                        + "___"
                        + address.replace(/,/g, "___") + "#" + nmark;
                mapObjects[markerId] = addressMarker;

                //Arreglo de datos para infoWindow
                values = [];
                //Agregando datos al arreglo
                values.push("geoAddress");
                values.push(this.formatted_address);
                values.push(this.geometry.location_type);
                values.push(this.partial_match);
                values.push(this.geometry.location);
                values.push("markerId|^" + markerId);
                //Infowindow del marcador
                google.maps.event.addListener(addressMarker, "click", function(event) {
                    markerDo(this, event, values, true);
                });

                //Limites del mapa por ubicacion xy
                bounds.extend(this.geometry.location);
                //Agregar marcador al arreglo
                addressMarkerArray.push(addressMarker);
                //Items de lista
                lista +=
                        "<div class=\"dirContainer\">"
                        //+"<a href=\"javascript:void(0)\" alt=\"Eliminar marcador\" title=\"Eliminar marcador\" onclick=\"dropMarker('" + markerId + "')\">"
                        + "<a href=\"javascript:void(0)\" id=\"" + markerId + "\" alt=\"Eliminar marcador\" title=\"Eliminar marcador\" class=\"dropMarkerLink\">"
                        + "<img src=\"images/garbage_delete.png\" style=\"vertical-align: middle; margin: 2px\" />"
                        + "</a>"
                        + "<div class=\"circle\" style=\"background: " + color + "; color: " + textByColor(color) + "\">" + pad(nmark, 2) + "</div>"
                        + "<span class=\"dirText\">" + this.formatted_address
                        + " ("
                        + this.geometry.location_type
                        + ")</span>"
                        + "</div>";

                var capa = "demo|~" + $.md5('demo') + "___punto___direccionpunto___chld=";
                if (layerGroup.hasOwnProperty(capa) === false) {
                    layerGroup[capa] = new Array();
                }
                if (layerGroup[capa].hasOwnProperty(target) === false) {
                    layerGroup[capa][target] = new Array();
                }
                if (layerGroup[capa][target].indexOf(address + "___chld=" + nmark + estilo) === -1) {
                    layerGroup[capa][target].push(address + "___chld=" + nmark + estilo);
                }

            });
            //Lista de resultados
            $("#address_result").append(
                    "<hr><div><input type=\"checkbox\" id=\"\" value=\"" + $.md5(target) + "\" class=\"hideShowAddressLayer\" style=\"float: left; outline: 3px solid " + color + "; margin: 5px;\" checked=\"true\" />"
                    + "<a href=\"" + target + "___" + address + "\" class=\"addTargetMarker\"><img src=\"images/marker_plus.png\" style=\"float: left\" /></a>"
                    + "<h4>" + target + " / " + address + "</h4></div>"
                    + "<br><div>" + lista + "</div><br>"
                    );
            $(".hideShowLayer").click(function() {
                var keyLayer = $(this).val();
                if ($(this).prop("checked") === true) {
                    //Mostrar objetos
                    showMapLayer(keyLayer);
                } else if ($(this).prop("checked") === false) {
                    //Ocultar objetos
                    hideMapLayer(keyLayer);
                }
            });
            //Redimensionar mapa
            map.fitBounds(bounds);
            //Zoom para un solo resultado
            if (nmark === 1) {
                map.setCenter(values[4]);
                map.setZoom(16);
            }
        } else {
            //No se encontraron resultados
            console.log(results);
            console.log(status);
            console.log("------------------------");
        }

    });
}


function coordByAddressString(dirString) {
    //Arreglo de datos
    var dirArray = dirString.split(",");
    var address, target;
    /**
     * Formato de arreglo de direcciones
     * 00: Nombre de direccion buscada
     * 01: Direccion
     * 02: Distrito
     * 03: Ciudad
     * 04: Pais
     * 05: Terminal nombre
     * 06: Terminal X
     * 07: Terminal Y
     * 08: Tap nombre
     * 09: Tap X
     * 10: Tap Y
     * 11: Otro nombre
     * 12: Otro X
     * 13: Otro Y
     */
    
    //Validar indices
    target  = dirArray[0];
    address = dirArray[1]
              + ", "
              + dirArray[2]
              + ", "
              + dirArray[3]
              + ", "
              + dirArray[4];
    
    //lista de resultados
    var lista = "";
    var values;
    var color = getRandomColor();

    //Nuevo objeto geocoder
    geocoder = new google.maps.Geocoder();
    geocoder.geocode(
            {
                //envía la direccion de consulta
                address: address
            },
    function(results, status) {
        //Existem resultados, formato Json
        if (status === "OK") {
            var nmark = 0;
            var estilo = "";
            $.each(results, function() {
                //ID de marcador
                var markerId;
                //Numero de marcador
                nmark++;
                //estilo
                estilo = "|" + color.substring(1) + "|" + textByColor(color).substring(1);
                //Crear nuevo marcador con ubicacion
                var addressMarker = new google.maps.Marker({
                    map: map,
                    position: this.geometry.location,
                    draggable: true,
                    icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + nmark + estilo
                });

                //Objeto en el mapa
                markerId = $.md5(target + address)
                        + "___"
                        + "punto"
                        + "___"
                        + "address"
                        + "|^"
                        + target
                        + "___"
                        + address.replace(/,/g, "___") + "#" + nmark;
                mapObjects[markerId] = addressMarker;

                //Arreglo de datos para infoWindow
                values = [];
                //Agregando datos al arreglo
                values.push("geoAddress");
                values.push(this.formatted_address);
                values.push(this.geometry.location_type);
                values.push(this.partial_match);
                values.push(this.geometry.location);
                values.push("markerId|^" + markerId);
                //Infowindow del marcador
                google.maps.event.addListener(addressMarker, "click", function(event) {
                    markerDo(this, event, values, true);
                });

                //Limites del mapa por ubicacion xy
                bounds.extend(this.geometry.location);
                //Agregar marcador al arreglo
                addressMarkerArray.push(addressMarker);
                //Items de lista
                lista +=
                        "<div class=\"dirContainer\">"
                        //+"<a href=\"javascript:void(0)\" alt=\"Eliminar marcador\" title=\"Eliminar marcador\" onclick=\"dropMarker('" + markerId + "')\">"
                        + "<a href=\"javascript:void(0)\" id=\"" + markerId + "\" alt=\"Eliminar marcador\" title=\"Eliminar marcador\" class=\"dropMarkerLink\">"
                        + "<img src=\"images/garbage_delete.png\" style=\"vertical-align: middle; margin: 2px\" />"
                        + "</a>"
                        + "<div class=\"circle\" style=\"background: " + color + "; color: " + textByColor(color) + "\">" + pad(nmark, 2) + "</div>"
                        + "<span class=\"dirText\">" + this.formatted_address
                        + " ("
                        + this.geometry.location_type
                        + ")</span>"
                        + "</div>";

                /*var capa = "demo|~" + $.md5('demo') + "___punto___direccionpunto___chld=";
                if (layerGroup.hasOwnProperty(capa) === false) {
                    layerGroup[capa] = new Array();
                }
                if (layerGroup[capa].hasOwnProperty(target) === false) {
                    layerGroup[capa][target] = new Array();
                }
                if (layerGroup[capa][target].indexOf(address + "___chld=" + nmark + estilo) === -1) {
                    layerGroup[capa][target].push(address + "___chld=" + nmark + estilo);
                }*/

            });
            
            //Terminales 
            if ( typeof dirArray[5] !== 'undefined' 
                && typeof dirArray[6] !== 'undefined' 
                && typeof dirArray[7] !== 'undefined') 
            {
                estilo = "|" + color.substring(1) + "|" + textByColor(color).substring(1);
                //Crear nuevo marcador con ubicacion
                nmark = "Tr";
                var addressMarker = new google.maps.Marker({
                    map: map,
                    position: new google.maps.LatLng(dirArray[7],dirArray[6]),
                    draggable: false,
                    icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + nmark + estilo
                });

                //Objeto en el mapa
                markerId = $.md5( dirArray[0] + address )
                        + "___"
                        + "punto"
                        + "___"
                        + "address"
                        + "|^"
                        + dirArray[0]
                        + "___"
                        + address.replace(/,/g, "___") + "#[eerr]" + dirArray[5];
                mapObjects[markerId] = addressMarker;
                
                //Arreglo de datos para infoWindow
                values = [];
                //Agregando datos al arreglo
                values.push("geoAddress");
                values.push(dirArray[5]);
                values.push("Terminal");
                values.push(dirArray[6]);
                values.push(dirArray[7]);
                values.push("markerId|^" + markerId);
                //Infowindow del marcador
                google.maps.event.addListener(addressMarker, "click", function(event) {
                    markerDo(this, event, values, true);
                });
                
                //Items de lista
                lista +=
                        "<div class=\"dirContainer\">"
                        + "<a href=\"javascript:void(0)\" style=\"float: left\">"
                        + "<img src=\"images/red_pin.png\" style=\"vertical-align: middle; margin: 2px\" />"
                        + "</a>"
                        + "<div class=\"circle\" style=\"background: " + color + "; color: " + textByColor(color) + "\">" + pad(nmark, 2) + "</div>"
                        + "<span class=\"dirText\">" + dirArray[5]
                        + "</span>"
                        + "</div>";
            }
            
            //Taps
            if ( typeof dirArray[8] !== 'undefined' 
                && typeof dirArray[9] !== 'undefined' 
                && typeof dirArray[10] !== 'undefined') 
            {
                estilo = "|" + color.substring(1) + "|" + textByColor(color).substring(1);
                //Crear nuevo marcador con ubicacion
                nmark = "Tp";
                var addressMarker = new google.maps.Marker({
                    map: map,
                    position: new google.maps.LatLng(dirArray[10],dirArray[9]),
                    draggable: false,
                    icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + nmark + estilo
                });

                //Objeto en el mapa
                markerId = $.md5( dirArray[0] + address )
                        + "___"
                        + "punto"
                        + "___"
                        + "address"
                        + "|^"
                        + dirArray[0]
                        + "___"
                        + address.replace(/,/g, "___") + "#[eerr]" + dirArray[8];
                mapObjects[markerId] = addressMarker;
                
                //Arreglo de datos para infoWindow
                values = [];
                //Agregando datos al arreglo
                values.push("geoAddress");
                values.push(dirArray[8]);
                values.push("Tap");
                values.push(dirArray[9]);
                values.push(dirArray[10]);
                values.push("markerId|^" + markerId);
                //Infowindow del marcador
                google.maps.event.addListener(addressMarker, "click", function(event) {
                    markerDo(this, event, values, true);
                });
                
                //Items de lista
                lista +=
                        "<div class=\"dirContainer\">"
                        + "<a href=\"javascript:void(0)\" style=\"float: left\">"
                        + "<img src=\"images/red_pin.png\" style=\"vertical-align: middle; margin: 2px\" />"
                        + "</a>"
                        + "<div class=\"circle\" style=\"background: " + color + "; color: " + textByColor(color) + "\">" + pad(nmark, 2) + "</div>"
                        + "<span class=\"dirText\">" + dirArray[8]
                        + "</span>"
                        + "</div>";
            }
            
            //Lista de resultados
            $("#address_result").append(
                    "<hr><div><input type=\"checkbox\" id=\"\" value=\"" + $.md5(target + address) + "\" class=\"hideShowAddressLayer\" style=\"float: left; outline: 3px solid " + color + "; margin: 5px;\" checked=\"true\" />"
                    + "<a href=\"" + target + "___" + address + "\" class=\"addTargetMarker\"><img src=\"images/marker_plus.png\" style=\"float: left\" /></a>"
                    + "<h4>" + target + " / " + address + "</h4></div>"
                    + "<br><div>" + lista + "</div><br>"
                    );
            $(".hideShowAddressLayer").click(function() {
                var keyLayer = $(this).val();
                if ($(this).prop("checked") === true) {
                    //Mostrar objetos
                    showMapLayer(keyLayer);
                } else if ($(this).prop("checked") === false) {
                    //Ocultar objetos
                    hideMapLayer(keyLayer);
                }
            });
            //Redimensionar mapa
            map.fitBounds(bounds);
            //Zoom para un solo resultado
            if (nmark === 1) {
                map.setCenter(values[4]);
                map.setZoom(16);
            }
        } else {
            //No se encontraron resultados
            console.log(results);
            console.log(status);
            console.log("------------------------");
        }

    });
}


/**
 * Lee una direccion de un arreglo cada segundo
 * luego invoca a la funcion de busqueda de direccion
 * coordByAddress()
 * @returns {Boolean}
 */
function readAddressTimer() {
    //Si el arreglo de direcciones contiene datos
    if (addressArray.length > 0) {
        //Show modal "loading"
        $("body").addClass("loading");
        //Begin address reading
        myInterval = setInterval(function() {
            //Si acumulador menor que cantidad de direcciones
            if (dynamicInc < addressArray.length) {
                //Separar objetivo (1st param) de su direccion(2nd param)
                var dirArray    = addressArray[dynamicInc].split(",");
                var dirString   = addressArray[dynamicInc];
                
                var address = "";
                for (var i = 1; i < dirArray.length; i++) {
                    address += "," + dirArray[i];
                }
                //Get coords by address
                //coordByAddress(dirArray[0], address.substring(1));
                coordByAddressString(dirString);
                dynamicInc++;
            } else {
                //No more addresses, fit map
                mapFitBounds();
                //Stop interval
                window.clearInterval(myInterval);
                //Remove "loading" modal
                $("body").removeClass("loading");
                //Eliminar marcador
                $(".dropMarkerLink").click(function() {
                    var conf = confirm("Desea eliminar este marcador?");
                    if (conf) {
                        dropMarker($(this).attr("id"));
                        $(this).parent().hide();
                    }
                });
                //Agregar marcador para una direccion
                $(".addTargetMarker").click(function(event) {
                    event.preventDefault();
                    addMarkerAddress($(this).attr("href"));
                });
            }

        }, 1000);
    }
    return true;
}

/**
 * Upload de archivo de direcciones
 * luego de subir el archivo invoca a la funcion de lectura:
 * readAddressTimer()
 * @returns {Boolean}
 */
function uploadTmpFile() {

    var inputFileImage = document.getElementById("dirfile");
    var file = inputFileImage.files[0];
    var data = new FormData();
    var url = "upload.tmpfile.php";

    data.append('archivo', file);

    $.ajax({
        url: url,
        type: 'POST',
        contentType: false,
        data: data,
        processData: false,
        cache: false,
        dataType: "json",
        success: function(datos) {
            if (datos.upload) {
                //Borra elementos del mapa
                //$("#btnClearItem").click();
                //Upload OK
                $("#addressControl").html(
                        "<div style=\"display: table\">"
                        + "<div style=\"display: table-row\">"
                        + "<div style=\"display: table-cell\">"
                        + "<input type=\"checkbox\" id=\"showAllAdress\" checked=\"true\" /> Mostrar capas"
                        + "</div>"
                        + "<div style=\"display: table-cell\">"
                        + "<span>Proyecto</span>"
                        + "<input type=\"text\" size=\"10\" id=\"addressProject\" />"
                        + "<span>capa</span>"
                        + "<input type=\"text\" size=\"10\" id=\"addressLayer\" />"
                        + "<input type=\"button\" value=\"Get Coords\" onclick=\"saveAllAddress()\" />"
                        + "</div>"
                        + "</div>"
                        + "</div>");
                //Incrementador en 0
                dynamicInc = 0;
                //Asigna datos recuperados del archivo a "addressArray"
                addressArray = datos.data;
                //Invoca a funcion que lee arreglo de direcciones
                readAddressTimer();
                //Checkbox ocultar/mostrar todas las direcciones
                $("#showAllAdress").click(function() {
                    if ($(this).prop("checked") === true) {
                        $.each($(".hideShowAddressLayer"), function() {
                            var keyLayer = $(this).val();
                            showMapLayer(keyLayer);
                            $(this).prop("checked", true);
                        });
                    } else {
                        $.each($(".hideShowAddressLayer"), function() {
                            var keyLayer = $(this).val();
                            hideMapLayer(keyLayer);
                            $(this).prop("checked", false);
                        });
                    }
                });
            } else {
                //Upload Error
                alert("Error al cargar el archivo, vuelva a intentarlo.");
            }
        },
        error: function(datos) {
            console.log(datos);
        }
    });
    return true;
}

/**
 * Elimina un marcador de mapa por ID
 * Elimina el elemento de mapObjects
 * @param {type} markerId
 * @returns {Boolean}
 */
function dropMarker(markerId) {
    //Quita elemento del mapa
    mapObjects[markerId].setMap(null);
    //Elimina elemento del arreglo de objetos del mapa
    delete mapObjects[markerId];
    return true;
}

function addMarkerAddress(href) {
    var arrHref = href.split("___");
    var target = arrHref[0];
    var address = arrHref[1];
    //Agregar marcador al mapa
    for (key in layerGroup) {
        if (layerGroup.hasOwnProperty(key)) {
            for (index in layerGroup[key]) {
                if (layerGroup[key].hasOwnProperty(index)) {
                    if (index === target) {

                        var markerId = $.md5(target)
                                + "___"
                                + "punto"
                                + "___"
                                + "address"
                                + "|^"
                                + target
                                + "___"
                                + address.replace(/,/g, "___") + "#" + layerGroup[key][index].length;

                        var nmark = layerGroup[key][index].length + 1;
                        var estiloBase = layerGroup[key][index][nmark - 2].split("chld=");
                        var estiloArray = estiloBase[1].split("|");

                        var estilo = "|" + estiloArray[1] + "|" + estiloArray[2];
                        //Crear nuevo marcador con ubicacion
                        var addressMarker = new google.maps.Marker({
                            map: map,
                            position: mapObjects[markerId].position,
                            draggable: true,
                            icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + nmark + estilo
                        });
                    }
                }
            }
        }
    }
    return true;
}

/*function saveAllAddress(){console.log(layerGroup);
 for ( key in mapObjects ) {
 if ( mapObjects.hasOwnProperty(key) ) {
 console.log( key );
 console.log( 
 mapObjects[key].getPosition().lng() 
 + " / "
 +mapObjects[key].getPosition().lat() 
 );
 console.log( "--------------------------------------------" );
 }
 }
 }*/

function saveAllAddress() {

    var aP = $.trim($("#addressProject").val());
    var aL = $.trim($("#addressLayer").val());

    if (aP !== "" && aL !== "") {
        var capas = "";
        for (key in mapObjects) {
            if (mapObjects.hasOwnProperty(key)) {

                /**
                 * Parche (IF) para que no se graben otros elementos
                 * solo direcciones
                 * if ( key.indexOf("punto___address") >= 0 ) {}
                 */
                if (key.indexOf("punto___address") >= 0) {

                    var aArray = key.split("|^")
                    var bArray = aArray[0].split("___");
                    var cArray = aArray[1].split("#");
                    var dArray = cArray[0].split("___");
                    var target = dArray[0];
                    var address = "";
                    for (var i = 1; i < dArray.length; i++) {
                        address += "," + dArray[i];
                    }
                    address = address.substring(1);
                    var nmark = cArray[1];
                    var icon = mapObjects[key].icon;
                    var aIcon = icon.split("chld=");

                    var capa = $("#addressLayer").val()
                            + "|~"
                            + $.md5($("#addressLayer").val())
                            + "___punto___direccionpunto___chld=";
                    if (layerGroup.hasOwnProperty(capa) === false) {
                        layerGroup[capa] = new Array();
                    }
                    if (layerGroup[capa].hasOwnProperty(target) === false) {
                        layerGroup[capa][target] = new Array();
                    }
                    layerGroup[capa][target].push(address + "___chld=" + aIcon[1]);

                    //Si existe un elemento de red en el arreglo
                    if ( cArray[1].indexOf( "[eerr]" ) >= 0 ) {
                        target = cArray[1].substring(6);
                    }

                    var addressId = $.md5(
                            target
                            + address
                            + $.now()
                            + Math.random()
                            );

                    capas += "[{layer}]"
                            + target
                            + "[|^]"
                            + address
                            + "[|^]"
                            + addressId
                            + "[|^]"
                            + mapObjects[key].getPosition().lng()
                            + "[|^]"
                            + mapObjects[key].getPosition().lat()
                            + "[{chars}]"
                            + aIcon[1];
                }
            }
        }

        var dataObject = "action=saveAddressList&proyecto="
                + $("#addressProject").val()
                + "&capa="
                + $("#addressLayer").val()
                + "&capas=" + capas.substring(9);

        $.ajax({
            type: "POST",
            url: "georeferencia.request.php",
            data: dataObject,
            dataType: 'json',
            success: function(datos) {
                //Id del proyecto creado
                $("#proIdEdit").val(datos.id);
                //Mensaje de respuesta
                alert(datos.msg);
            }
        });
    } else {
        alert("Ingrese Nombre del proyecto y capa");
    }
}

function pad(num, size) {
    //Via http://stackoverflow.com/questions/2998784/how-to-output-integers-with-leading-zeros-in-javascript
    var s = num + "";
    while (s.length < size)
        s = "0" + s;
    return s;
}

//Carga la ventana de navegador e inicia el mapa
google.maps.event.addDomListener(window, 'load', initialize);

//DOM ready
$(document).ready(function() {
    $('.open-map-ctrl').magnificPopup({
        type: 'inline',
        midClick: true // Allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source in href.
    });
    $('.polygon-options').magnificPopup({
        type: 'inline'
    });
    $('#map-tab').easyResponsiveTabs();

    $('#cascade1').hide();

    $('.simple_color_color_code').simpleColor({displayColorCode: true});

    //Ocultar menu al inicio, mostrar y ocultar con enter
    $("#menu").hide();
    $(window).keypress(function(event) {
        if (event.which === 13 || event.which === 27) {
            $("#menu").toggle();
            $("#tabControl").toggle();
        }
    });
    //Ocultar menu al presionar escape
    $(document).keyup(function(e) {
        if (e.keyCode === 27) {
            $("#menu").hide();
            $("#tabControl").show();
        }
    });

    //Evitar que width del menu oculte el selector de color
    $(".simpleColorDisplay").click(function() {
        $(".simpleColorChooser").css("top", "22px");
        $(".simpleColorChooser").css("left", "-80px");
        $(".simpleColorChooser").css("z-index", "1000");
    });

    //Tab Control
    $("#tabControl a").click(function(event) {
        event.preventDefault();
        //Muestra u oculta menu principal 
        $("#menu").toggle();
        //Muestra u oculta Icono de acceso al menu
        $("#tabControl").toggle();

        //Muestra lista de Proyectos almacenados en DB
        $(".projectDbList").click();
    });
    //Close menu
    $(".closeMenu a").click(function(event) {
        event.preventDefault();
        $("#menu").toggle();
        $("#tabControl").toggle();
    });

    //Guardar cambios realizados al poligono (No implementado aun)
    $("#savePolygon").click(function() {
        polygonObject.setMap(null);
        //Color de fondo
        polygonObject.fillColor = $("#colorPickerPoligonoEdit").val();
        polygonObject.strokeColor = $("#colorPickerPoligonoEdit").val();
        //Opacidad
        polygonObject.fillOpacity = $(".simpleColorDisplay").css("opacity");
        //Dibujar en mapa
        polygonObject.setMap(map);
    });

    //Evento de carga de icono, si se selecciona un archivo
    $("#archivoImage").change(function() {
        //Invoca a la funcion uploadAjax()
        uploadAjax('');
    });
    $("#archivoImageEdit").change(function() {
        //Invoca a la funcion uploadAjax()
        uploadAjax('Edit');
    });

    //Cargar archivo KMZ o KML
    $(".getFileLayer").click(function(event) {
        event.preventDefault();
        var id = $(this).prop("title");
        var href = $(this).prop("href");

        //Borrar proyectos existentes
        $("#btnClearItem").click();

        //Borrar todas las capas por archivos del mapa
        for (key in fileLayers) {
            if (fileLayers.hasOwnProperty(key)) {
                //Eliminando capa del mapa
                fileLayers[ key ].setMap(null);
                //Eliminando del arreglo que pinta en mapa
                delete fileLayers[key];
            }
        }
        //Creando nuevo mapa en base a archivo
        fileLayers[id] = new google.maps.KmlLayer({
            url: href
        });

        //Dibujando archivo en el mapa
        fileLayers[id].setMap(map);
    });

    //Buscar direccion, GeoCoder
    $("#buscadir").click(function() {
        //Limpiar resultados
        $("#addressControl").html("");
        $("#address_result").html("");
        //Borra elementos del mapa
        $("#btnClearItem").click();
        //Busca coordenadas por direccion
        coordByAddress($("#address").val(), $("#address").val());
    });

    //Carga de archivos con direcciones por georeferenciar
    $("#updirfile").click(function() {
        $("#address_result").html("");
        uploadTmpFile();
    });

    //Obtener lista de elementos para georeferencia (1ra carga)
    data_content = "action=geoElementos";
    $.ajax({
        type: "POST",
        url: "georeferencia.request.php",
        data: data_content,
        dataType: 'json',
        success: function(datos) {
            $.each(datos, function() {
                $('<option>').val(this.id + "_" + this.tipo + "_" + this.nombre).text(this.descripcion).appendTo('#geo_elemento');
            });
        }
    });

    //Listas, seleccion de elementos y dependencias
    $("#geo_elemento").change(function() {
        //var origen = $("#geo_elemento option:selected").text();
        var dependencia = "";
        geoVal = $("#geo_elemento").val().split("_");
        var origen = geoVal[2];

        //Ocultar botones de DIBUJO y GUARDADO
        $(".buttonSet").hide();

        //Ocultar o mostrar bloque de estilos
        $(".estiloItem").hide();
        if (geoVal[1] == "poligono" || geoVal[1] == "circle") {
            $("#estilo_poligono").show();
        } else if (geoVal[1] == "punto") {
            $("#estilo_punto").show();
        }

        //Nueva capa
        selectedItem = new Array();

        data_content = "action=getGeoDedependencia&elemento_id=" + geoVal[0] + "&origen=" + origen;
        $.ajax({
            type: "POST",
            url: "georeferencia.request.php",
            data: data_content,
            success: function(datos) {
                $("#geo_response").html(datos);

                //Make multiselect only <select> with "multple" prop (last one)
                $("#geo_response select[multiple=multiple]").multiselect();

                //Patron de búsqueda
                var patron = $(".geo_item").attr("title");
                patron = patron.replace(/_/g, " / ");
                $(".patron_busqueda").html(patron);

                $(".geo_item").change(function() {
                    var title = $(this).attr("title");
                    var call = title.split("_");
                    var dep = "";
                    var itemId;

                    if ($(this).val() !== "") {
                        itemId = $(this).attr("id");

                        var itemIndex = call.indexOf(itemId.substring(4));

                        $.each(call, function(id, val) {
                            if (id > itemIndex) {
                                $('#geo_' + val).find('option').remove();
                            }
                        });

                        $.each(call, function(id, val) {

                            if ($("#geo_" + val + " option").length > 0) {
                                dep += "___" + $("#geo_" + val).val();
                            }

                            if ($("#geo_" + val + " option").length === 0) {

                                dep = dep.substring(3);
                                data_content = "action=getGeoItem&element="
                                        + val
                                        + "&dependencia="
                                        + dep
                                        + "&origen="
                                        + origen;
                                $.ajax({
                                    type: "POST",
                                    url: "georeferencia.request.php",
                                    data: data_content,
                                    success: function(dato) {
                                        $("#geo_" + val).html(dato);
                                        if (val == call[ call.length - 1 ]) {
                                            //Remover primer <option> = -Seleccione-
                                            $("#geo_" + val + " option").first().remove();
                                            //Aplica efecto multiselect
                                            $("#geo_" + val).multiselect({
                                                click: function(event, ui) {
                                                    var layerItem = "";
                                                    for (var i = 0; i < call.length - 1; i++) {
                                                        layerItem += "___" + $.trim($("#geo_" + call[i]).val());
                                                    }
                                                    if (ui.checked) {
                                                        //Agregar Item                                                        
                                                        //Verificar si el objeto a crear es Array
                                                        if (Object.prototype.toString.call(selectedItem[layerItem.substring(3)]) !== '[object Array]') {
                                                            selectedItem[ layerItem.substring(3) ] = new Array();
                                                            selectedItemTmp[ layerItem.substring(3) ] = new Array();
                                                        }
                                                        //Verificar si el item ya se encuentra en el Array
                                                        if (selectedItem[ layerItem.substring(3) ].indexOf(ui.value) === -1) {
                                                            selectedItem[ layerItem.substring(3) ].push(ui.value);
                                                            selectedItemTmp[ layerItem.substring(3) ].push(ui.value);
                                                        }
                                                    } else {
                                                        //Eliminar item                                                        
                                                        selectedItem[layerItem.substring(3)].splice(selectedItem[ layerItem.substring(3) ].indexOf(ui.value), 1);
                                                        selectedItemTmp[layerItem.substring(3)].splice(selectedItem[ layerItem.substring(3) ].indexOf(ui.value), 1);
                                                    }
                                                },
                                                checkAll: function() {
                                                    var layerItem = "";

                                                    var items = $("#geo_" + origen).multiselect("getChecked").map(function() {
                                                        return this.value;
                                                    }).get();
                                                    for (var i = 0; i < call.length - 1; i++) {
                                                        layerItem += "___" + $.trim($("#geo_" + call[i]).val());
                                                    }
                                                    if (items.length > 0) {
                                                        for (var j = 0; j < items.length; j++) {
                                                            var layerItemCheck = layerItem + "___" + items[j];
                                                            //Verificar si el objeto a crear es Array
                                                            if (Object.prototype.toString.call(selectedItem[layerItem.substring(3)]) !== '[object Array]') {
                                                                selectedItem[ layerItem.substring(3) ] = new Array();
                                                                selectedItemTmp[ layerItem.substring(3) ] = new Array();
                                                            }
                                                            //Verificar si el item ya se encuentra en el Array
                                                            if (selectedItem[ layerItem.substring(3) ].indexOf(items[j]) === -1) {
                                                                selectedItem[ layerItem.substring(3) ].push(items[j]);
                                                                selectedItemTmp[ layerItem.substring(3) ].push(items[j]);
                                                            }
                                                        }
                                                    }
                                                },
                                                uncheckAll: function() {
                                                    var layerItem = "";
                                                    for (var i = 0; i < call.length - 1; i++) {
                                                        layerItem += "___" + $.trim($("#geo_" + call[i]).val());
                                                    }
                                                    delete selectedItem[ layerItem.substring(3) ];
                                                    delete selectedItemTmp[ layerItem.substring(3) ];
                                                }
                                            });
                                            //Refresca lista multiselect
                                            $("#geo_" + val).multiselect('refresh');
                                            //Desmarcar todas las opciones
                                            //$("#geo_" + val).multiselect('uncheckAll');

                                            //Mostrar botones de DIBUJO y GUARDADO
                                            $(".buttonSet").show();
                                        }
                                    }
                                });

                                return false;
                            }
                        });
                    }
                });
            }
        });
    });

    //Dibujar poligono, punto o circulo
    $("#btnDrawItem").click(function() {

        geoVal = $("#geo_elemento").val().split("_");
        var nombreCapa = prompt("Ingrese nombre para la capa", "");

        if (Object.size(selectedItem) === 0) {
            alert("Debe seleccionar al menos un elemento");
            return false;
        }

        //Validar nombre de capa y dibujar elementos
        if ($.trim(nombreCapa) !== "") {
            var origen = geoVal[2];

            var title = $("#geo_" + origen).attr("title");
            var call = title.split("_");
            var items = "";
            var dep = "";

            //Color fijo o aleatorio
            var colorType = $('input[name=colorSelect]:checked').val();

            //Tipo de Icono: default, numeric o custom
            var icontype = $('input[name=iconSelect]:checked').val();

            var timeStamp = new Date().getTime();

            if (Object.size(selectedItemTmp) > 0 && Object.size(selectedItem) === 0) {
                selectedItem = selectedItemTmp;
            }

            $.each(call, function(id, val) {

                if (val != call[ call.length - 1 ]) {
                    dep += "___" + $.trim($("#geo_" + val).val());
                }

            });
            dep = dep.substring(3);

            //Objeto poligono
            var polygon;
            var idFirst;
            var idLast;
            var idCount;

            items = $("#geo_" + origen).multiselect("getChecked").map(function() {
                return this.value;
            }).get();

            $("body").addClass("loading");

            //Si elemento a dibujar es un poligono
            if (geoVal[1] == 'poligono') {

                //zIndex por capa (polygon), los layers en: projectLayers
                for (key in projectLayers) {
                    if (projectLayers.hasOwnProperty(key)) {
                        zIndexLayer++;
                    }
                }

                //Recorrer arreglo selectedItem
                for (index in selectedItem) {
                    if (selectedItem.hasOwnProperty(index)) {
                        $.each(selectedItem[index], function(key, value) {
                            //Enviar peticion y respuesta json
                            data_polygon = "action=drawPolygon&origen=" + origen + "&data=" + index + "&item=" + value;
                            $.ajax({
                                async: true,
                                type: "POST",
                                url: "georeferencia.request.php",
                                data: data_polygon,
                                dataType: 'json',
                                success: function(datos) {

                                    idCount = 1;
                                    $.each(datos, function() {
                                        if (idCount == 1) {
                                            idFirst = this.id;
                                        } else {
                                            idLast = this.id;
                                        }

                                        var pt = new google.maps.LatLng(this.coord_y, this.coord_x);
                                        bounds.extend(pt);
                                        polygonCoords.push(pt);
                                        idCount++;
                                    });

                                    //Color de fondo seleccionado
                                    if (colorType == "static") {
                                        colorSelected = $("#colorPickerPoligono").val();
                                    } else if (colorType == "random") {
                                        colorSelected = getRandomColor();
                                    }

                                    //Color de linea
                                    if ($('#colorLine').is(':checked')) {
                                        colorLineSelected = $("#colorPickerLine").val();
                                    } else {
                                        colorLineSelected = colorSelected;
                                    }

                                    // Construct the polygon.
                                    polygon = new google.maps.Polygon({
                                        paths: polygonCoords,
                                        strokeColor: colorLineSelected,
                                        strokeOpacity: 0.8,
                                        strokeWeight: $("#lineWeight").val(),
                                        fillColor: colorSelected,
                                        fillOpacity: $(".simpleColorDisplay").css("opacity"),
                                        zIndex: Object.size(layerGroup) + 1
                                    });

                                    google.maps.event.addListener(polygon, "click", function(event) {
                                        polygonDo(this, event, value, true);
                                    });

                                    var valueToPush = {};

                                    valueToPush["objeto"] = polygon;
                                    //Agrega el poligono al Objeto mapObjects
                                    mapObjects[timeStamp + "___poli___" + origen + "|^" + dep + "___" + value] = polygon;

                                    //Agregar capa al proyecto
                                    projectLayers[timeStamp + "___poli___" + origen + "|^" + dep] = origen + " en " + dep;

                                    //Agregar estilos de la capa
                                    layerStyle[
                                            timeStamp
                                            + "___poli___"
                                            + origen] = colorSelected
                                            + "___"
                                            + $(".simpleColorDisplay").css("opacity")
                                            + "___"
                                            + colorLineSelected
                                            + "___"
                                            + $("#lineWeight").val();

                                    valueToPush = null;

                                    //Muestra poligono en mapa
                                    polygon.setMap(map);
                                    //Recalcula visibilidad de mapa por limites coord.
                                    map.fitBounds(bounds);

                                    polygonArray.push(polygon);

                                    polygon = null;
                                    polygonCoords = [];

                                    capasArray.push(
                                            "poligono,"
                                            + origen
                                            + "," + value
                                            + "," + colorSelected
                                            + "," + idFirst
                                            + "," + idLast
                                            );

                                    var polygonStyle = colorSelected
                                            + "___"
                                            + $(".simpleColorDisplay").css("opacity")
                                            + "___"
                                            + colorLineSelected
                                            + "___"
                                            + $("#lineWeight").val();

                                    //Generar capas
                                    setLayerGroup(index, key, value, polygonStyle, nombreCapa
                                            + "|~"
                                            + timeStamp
                                            + "___"
                                            + "poli"
                                            + "___"
                                            + origen
                                            + "___"
                                            + polygonStyle, dep);

                                    $("body").removeClass("loading");
                                }
                            });


                        });
                    }
                }

            } else if (geoVal[1] == 'punto') {
                //Si el elemento es una coordenada (punto o marcador)
                var markerNumber = 1;
                var itemChars;

                for (index in selectedItem) {
                    if (selectedItem.hasOwnProperty(index)) {
                        $.each(selectedItem[index], function(key, value) {
                            //Enviar peticion y respuesta json
                            data_polygon = "action=drawMarker&origen=" + origen + "&data=" + index + "&item=" + value;
                            $.ajax({
                                async: true,
                                type: "POST",
                                url: "georeferencia.request.php",
                                data: data_polygon,
                                dataType: 'json',
                                success: function(datos) {
                                    $.each(datos, function() {
                                        var pt = new google.maps.LatLng(this.coord_y, this.coord_x);
                                        bounds.extend(pt);
                                        markers.push(pt);

                                        if (icontype == "default") {
                                            iconSelected = "";
                                            itemChars = "";
                                        } else if (icontype == "custom") {
                                            iconSelected = $("#tmpIcon").val();
                                            itemChars = "custom|" + $("#tmpIcon").val();
                                        } else if (icontype == "numeric") {
                                            iconSelected = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + markerNumber + "|" + $("#colorPickerPunto").val().substring(1) + "|000000";
                                            //->itemChars = markerNumber + "|" + $("#colorPickerPunto").val().substring(1) + "|000000";
                                            itemChars = "&chld=" + markerNumber + "|" + $("#colorPickerPunto").val().substring(1) + "|000000";
                                        }

                                        var marker = new google.maps.Marker({
                                            position: pt,
                                            map: map,
                                            icon: iconSelected,
                                            animation: google.maps.Animation.DROP
                                        });

                                        //Infowindow del marcador
                                        google.maps.event.addListener(marker, "click", function(event) {
                                            markerDo(this, event, value, true);
                                        });

                                        marker.metadata = {type: "point", id: markerNumber};

                                        var valueToPush = {};

                                        mapObjects[timeStamp + "___punto___" + origen + "|^" + dep + "___" + value] = marker;

                                        //Agregar capa al proyecto
                                        projectLayers[timeStamp + "___punto___" + origen + "|^" + dep] = origen + " en " + dep;

                                        //Agregar estilos de la capa
                                        layerStyle[
                                                timeStamp
                                                + "___punto___"
                                                + origen] = itemChars;

                                        //Estilo
                                        var newItemChars, arrayItemChars;
                                        if (itemChars.indexOf("&chld=") >= 0) {
                                            arrayItemChars = itemChars.split("|");
                                            newItemChars = "chld=|"
                                                    + arrayItemChars[1]
                                                    + "|"
                                                    + arrayItemChars[2];
                                        } else {
                                            newItemChars = itemChars;
                                        }
                                        setLayerGroup(index, key, value, newItemChars, nombreCapa
                                                + "|~"
                                                + timeStamp
                                                + "___"
                                                + "punto"
                                                + "___"
                                                + origen
                                                + "___"
                                                + newItemChars, dep);

                                        valueToPush = null;

                                        markerArray.push(marker);
                                        marker.setMap(map);
                                        markerNumber++;
                                    });
                                    map.fitBounds(bounds);
                                    $("body").removeClass("loading");
                                }
                            });


                        });
                    }
                }
            } else if (geoVal[1] == 'circle') {
                //Si el elemento es un circulo basado en una corodenada y radio
                var markerNumber = 1;
                var itemChars;

                for (index in selectedItem) {
                    if (selectedItem.hasOwnProperty(index)) {
                        $.each(selectedItem[index], function(key, value) {
                            //Enviar peticion y respuesta json
                            data_polygon = "action=drawCircle&origen=" + origen + "&data=" + index + "&item=" + value;
                            $.ajax({
                                async: true,
                                type: "POST",
                                url: "georeferencia.request.php",
                                data: data_polygon,
                                dataType: 'json',
                                success: function(datos) {
                                    $.each(datos, function() {

                                        var pt = new google.maps.LatLng(this.coord_y, this.coord_x);

                                        /**
                                         * Circulo por radio y coordenada
                                         */
                                        //Color de fondo seleccionado
                                        if (colorType == "static") {
                                            colorSelected = $("#colorPickerPoligono").val();
                                        } else if (colorType == "random") {
                                            colorSelected = getRandomColor();
                                        }

                                        //Color de linea
                                        if ($('#colorLine').is(':checked')) {
                                            colorLineSelected = $("#colorPickerLine").val();
                                        } else {
                                            colorLineSelected = colorSelected;
                                        }

                                        var circleOptions = {
                                            strokeColor: colorLineSelected,
                                            strokeOpacity: 0.8,
                                            strokeWeight: $("#lineWeight").val(),
                                            fillColor: colorSelected,
                                            fillOpacity: $(".simpleColorDisplay").css("opacity"),
                                            map: map,
                                            center: pt,
                                            radius: Number(this.radio),
                                            zIndex: Object.size(layerGroup) + 1
                                        };

                                        // Add the circle for this city to the map.
                                        var circle = new google.maps.Circle(circleOptions);

                                        google.maps.event.addListener(circle, "click", function(event) {
                                            polygonDo(this, event, value, true);
                                        });

                                        bounds.union(circle.getBounds());

                                        mapObjects[timeStamp + "___circle___" + origen + "|^" + dep + "___" + value] = circle;

                                        var polygonStyle = colorSelected
                                                + "___"
                                                + $(".simpleColorDisplay").css("opacity")
                                                + "___"
                                                + colorLineSelected
                                                + "___"
                                                + $("#lineWeight").val();

                                        //Generar capas
                                        setLayerGroup(index, key, value, polygonStyle, nombreCapa
                                                + "|~"
                                                + timeStamp
                                                + "___"
                                                + "circle"
                                                + "___"
                                                + origen
                                                + "___"
                                                + polygonStyle, dep);

                                    });
                                    map.fitBounds(bounds);
                                    $("body").removeClass("loading");
                                }
                            });
                        });
                    }
                }
            }
            selectedItem = new Array();
            //Actualizar icono canasta

            //$("#basket_layer").attr("src", "images/basket_full.png");
        } else {
            alert("Debe ingresar un nombre para la capa");
        }

    });

    //Guarda los cambios del proyecto
    $("#btnSaveLayout").click(function() {
        //Validar existencia de elementos en el mapa
        if (Object.size(mapObjects) == 0 || Object.size(projectLayers) == 0) {
            alert("El mapa no contiene elementos.");
            return false;
        }

        //Validar campo de nombre de proyecto no vacío
        if ($.trim($("#proyecto").val()) == "") {
            alert("Debe ingresar un nombre para el proyecto.");
            $("#proyecto").val("");
            $("#proyecto").css("background-color", "#ffcccc");
            $("#proyecto").focus();
            return false;
        }

        var capas = "";
        var itemSet = "";
        var timeKey;

        for (key in layerGroup) {
            if (layerGroup.hasOwnProperty(key)) {

                var nMarker = 1;
                var ext = key.split("___");

                for (a in layerGroup[key]) {
                    if (layerGroup[key].hasOwnProperty(a)) {

                        $.each(layerGroup[key][a], function(m, n) {
                            var eData = n.split("___");

                            if (ext[1] == "poli" || ext[1] == "circle") {

                                itemSet = eData[1]
                                        + "___"
                                        + eData[2]
                                        + "___"
                                        + eData[3]
                                        + "___"
                                        + eData[4]
                                        + "___"
                                        + eData[5]
                            } else if (ext[1] == "punto") {

                                //var eData = n.split("___");
                                var nPipe = {};
                                if (n.indexOf("|") >= 0) {
                                    nPipe = n.split("|");
                                }

                                if (eData[1].indexOf("images/tmp/") >= 0) {
                                    //Nuevo icono temporal
                                    itemSet = "custom|" + $("#tmpIcon").val();
                                } else if (eData[1].indexOf("images/upload.icon/") >= 0) {
                                    //Mantiene icono anterior
                                    itemSet = "custom|" + eData[1];
                                } else if (eData[1].indexOf("&") >= 0) {
                                    //Icono numerico Google Maps
                                    var iconSet = eData[1].split("&");
                                    itemSet = iconSet[1];
                                } else if ($.trim(eData[1]) == "") {
                                    //Marcador pot defecto Google Maps
                                    itemSet = "undefined";
                                } else if (nPipe.length >= 2) {
                                    itemSet = nMarker + "|" + nPipe[1] + "|" + nPipe[2];
                                    nMarker++;
                                }
                            }
                            capas += "[{layer}]"
                                    + key
                                    + "|^"
                                    + a
                                    + "___"
                                    + eData[0]
                                    + "[{chars}]"
                                    + itemSet;
                        });
                    }
                }
            }
        }
        //Bloquear boton de guardado
        $("#btnSaveLayout").prop("disabled", true);

        var dataObject = "action=saveObject&proyecto="
                + $("#proyecto").val()
                + "&capas=" + capas.substring(9)
                + "&keyProject=" + $("#proIdEdit").val();

        $.ajax({
            type: "POST",
            url: "georeferencia.request.php",
            data: dataObject,
            dataType: 'json',
            success: function(datos) {
                //Id del proyecto creado
                $("#proIdEdit").val(datos.id);
                //Mensaje de respuesta
                alert(datos.msg);
                //Habilitar boton de guardado
                $("#btnSaveLayout").prop("disabled", false);
            }
        });
    });

    //Elimina todos los elementos del mapa y de memoria (script)
    $("#btnClearItem").click(function() {
        //Eliminar marcadores geoAddress
        if (addressMarkerArray.length > 0) {
            for (var i = 0; i < addressMarkerArray.length; i++) {
                addressMarkerArray[i].setMap(null);
            }
            //Limpiar arreglo
            addressMarkerArray = [];
        }
        //Eliminar elementos del mapa
        for (index in mapObjects) {
            if (mapObjects.hasOwnProperty(index)) {
                mapObjects[ index ].setMap(null);
            }
        }
        //Marker y Polygon
        for (var i = 0; i < markerArray.length; i++) {
            markerArray[i].setMap(null);
        }
        for (var i = 0; i < polygonArray.length; i++) {
            polygonArray[i].setMap(null);
        }
        //Limpiar limites del mapa
        bounds = new google.maps.LatLngBounds();
        //Borrar todas las capas por archivos del mapa
        for (key in fileLayers) {
            if (fileLayers.hasOwnProperty(key)) {
                //Eliminando capa del mapa
                fileLayers[ key ].setMap(null);
                //Eliminando del arreglo que pinta en mapa
                delete fileLayers[key];
            }
        }
        //Limpiar elementos del mapa
        mapObjects = new Array();
        //Limpiar elementos del proyecto
        projectLayers = new Array();
        //Limpiar estilos de las capas
        layerStyle = new Array();
        //Limpiar capas intermitentes
        flickLayer = new Array();
        //limpiar capas combinadas
        multiLayer = new Array();
        //Limpiar item seleccionado
        selectedItem = new Array();
        selectedItemTmp = new Array();
        //Limpiar grupo de capas
        layerGroup = new Array();
        //Limpiar campo de nombre del proyecto
        $("#proyecto").val("");
        //Limpiar proyecto
        $("#proIdEdit").val(0);
        //Ocultar bloques de edicion
        $("#estilo_punto_edit").hide();
        $("#estilo_poligono_edit").hide();
        //ELiminar titulo del proyecto
        $(".projectTitle").html("");
    });

    $("#btnLayout").click(function() {

        //limpiar layout
        $("#layoutList").html("");

        //mostrar capas generadas
        for (var i = 0; i < capasArray.length; i++) {
            $("#layoutList").append("<div id=\"capa_" + i + "\" title=\"" + i + "," + capasArray[i] + "\"><a href=\""
                    + i
                    + "\" class=\"actionLayout\" title=\"edit\">[E]</a><a href=\""
                    + i
                    + "\" class=\"actionLayout\" title=\"drop\">[X]</a>"
                    + capasArray[i] + "</div>");
        }

        $(".actionLayout").click(function(event) {
            event.preventDefault();
            var href = $(this).attr("href");
            var title = $("#capa_" + href).attr("title");
            var datos = title.split(",");
            var action = $(this).attr("title");

            //eliminar elemento del mapa
            if (action == "drop") {
                polygonArray[ datos[0] ].setMap(null);
                //eliminar elemento del DOM
                $("#capa_" + datos[0]).remove();
                //eliminar elemento del array
                capasArray.splice(datos[0], 1);
                //polygonArray.splice(datos[0], 1);
            } else if (action == "edit") {

            }
        });
    });

    //Muestra lista de Proyectos almacenados en DB
    $(".projectDbList").click(function(event) {
        var dataObject = "action=doListLayer"
        $.ajax({
            type: "POST",
            url: "georeferencia.request.php",
            data: dataObject,
            success: function(datos) {

                //Mostrar lista de proyectos contenidos en "datos"
                $("#layoutList").html(datos);

                //Checkbox combina proyectos
                $(".mixProject").click(function() {
                    //Validar checked
                    if ($(this).prop("checked")) {
                        //Invocar a funcion de dibujo de proyecto
                        var idProject = $(this).attr("id").substring(3);
                        //Dibuja proyecto sin edicion por ser multiple
                        drawProject(idProject, 'NoEdit');
                    } else {
                        //Borrar proyecto del mapa
                        var idProject = $(this).attr("id").substring(3);
                        for (key in multiLayer) {
                            if (multiLayer.hasOwnProperty(key)) {
                                if (multiLayer[key] == idProject) {
                                    //remueve capas del proyecto del mapa
                                    mapObjects[key].setMap(null);
                                    //Eliminando del arreglo que pinta en mapa
                                    delete mapObjects[key];
                                    //Eliminando de multiLayer
                                    delete multiLayer[key];
                                }
                            }
                        }
                        //Call Fit Bounds customized
                        mapFitBounds();
                    }
                    //Set Project bounds
                    map.fitBounds(bounds);
                });

                //Eliminar proyecto
                $(".deleteProject").click(function(event) {
                    event.preventDefault();
                    //Project Key
                    var idProject = $(this).attr("href");

                    var conf = confirm(
                            "¿Desea eliminar el proyecto: "
                            + $(".loadProject[href=" + idProject + "]").html()
                            + "?"
                            );

                    if (conf) {
                        dataObject = "action=deleteProject&keyProject=" + idProject;
                        $.ajax({
                            type: "POST",
                            url: "georeferencia.request.php",
                            data: dataObject,
                            dataType: 'json',
                            success: function(datos) {
                                alert(datos.msg);
                                //Recargar lista de proyectos
                                $(".projectDbList").click();
                            }
                        });
                    }

                });

                //Al hacer click en un proyecto generar elementos
                $(".loadProject").click(function(event) {
                    //Invocar al evento que elimina todo del mapa y memoria
                    $("#btnClearItem").click();
                    //Poblar caja de texto con nombre del proyecto
                    $("#proyecto").val($(this).html());
                    //Ocultar bloques de edicion
                    $("#estilo_punto_edit").hide();
                    $("#estilo_poligono_edit").hide();

                    layerGroup = new Array();

                    event.preventDefault();
                    //Project Key
                    var idProject = $(this).attr("href");
                    //Poblar Key proyecto
                    $("#proIdEdit").val(idProject);
                    //Nombre del proyecto en el bloque de edición
                    $(".projectTitle").html($(".loadProject[href=" + idProject + "]").html());

                    //Recuperar capas del proyecto
                    /**
                     * Este evento contiene la peticion Ajax por Id
                     */
                    $(".currentProject").click();

                    //-> _script_add_01.js

                });
            }
        });
    });

    /**
     * Al hacer click en uno de los proyectos listados
     * muestra las capas que lo componen.
     */
    $(".currentProject").click(function(event) {

        $("#currentProject").html("");
        var idProject = $("#proIdEdit").val();

        var htmlProjectHeader = "<div style=\"display: table;\">"
                + "<div style=\"display: table-row;\">"
                + "<div style=\"display: table-cell; text-align: center\">Capa</div>"
                + "<div style=\"display: table-cell; text-align: center\">Drop</div>"
                + "<div style=\"display: table-cell; text-align: center\">Show</div>"
                + "<div style=\"display: table-cell; text-align: center\">Flick</div>"
                + "</div>";
        var htmlProjectBody = "";

        var dataObjects = "action=getProjectLayers&id=" + idProject;
        $.ajax({
            type: "POST",
            url: "georeferencia.request.php",
            data: dataObjects,
            dataType: 'json',
            success: function(datos) {
                //Id de la capa
                var keyLayerId;
                //Proyecto no guardado, capas en temporal
                if (Object.size(datos) === 0 && Object.size(layerGroup) > 0)
                {
                    //console.log(layerGroup);
                    //console.log(JSON.stringify(layerGroup));
                }

                $.each(datos, function(key, value) {
                    //Layer ID
                    keyLayerId = value.layer_id
                            + "___"
                            + value.tipo
                            + "___"
                            + value.origen;
                    //Estilos de la capa
                    layerStyle[keyLayerId] = value.estilo;

                    htmlProjectBody += "<div style=\"display: table-row;\">"
                            + "<div id=\"" + keyLayerId + "\" style=\"display: table-cell;\" class=\"rowEditLayer\">"
                            + "<a href=\"edit\" title=\"" + keyLayerId + "\" class=\"onProjectLayer\">"
                            + value.layer
                            + "</a></div>"
                            + "<div style=\"display: table-cell; text-align: center\">"
                            + "<a href=\"drop\" title=\"" + keyLayerId + "\" class=\"onProjectLayer\"><img src=\"images/DeleteRed.png\" /></a>"
                            + "</div>"
                            + "<div style=\"display: table-cell; text-align: center\">"
                            + "<input type=\"checkbox\" value=\"" + keyLayerId + "\" class=\"hideShowLayer\">"
                            + "</div>"
                            + "<div style=\"display: table-cell; text-align: center\">"
                            + "<input type=\"checkbox\" value=\"" + keyLayerId + "\" class=\"flickLayer\">"
                            + "</div>"
                            + "</div>";
                });
                htmlProjectBody += "</div>";
                $("#currentProject").append(htmlProjectHeader + htmlProjectBody);

                //Marcar checkbox si la capa ya esta cargada
                if (Object.size(layerGroup) > 0) {
                    for (key in layerGroup) {
                        if (layerGroup.hasOwnProperty(key)) {

                            var noName = key.split("|~");
                            var layerData = noName[1].split("___");
                            var layerId = layerData[0]
                                    + "___"
                                    + layerData[1]
                                    + "___"
                                    + layerData[2];

                            if (key.indexOf(layerId) >= 0) {
                                $(".hideShowLayer[value='" + layerId + "']").prop("checked", true);
                            }
                        }
                    }
                }

                //Ocultar o mostrar capas de forma individual
                $(".hideShowLayer").click(function() {
                    var keyLayer = $(this).val();
                    if ($(this).prop("checked") === true) {
                        //Mostrar objetos
                        showMapLayer(keyLayer);
                    } else if ($(this).prop("checked") === false) {
                        //Ocultar objetos
                        hideMapLayer(keyLayer);
                    }
                });

                //Test: flick Layer :)
                $(".flickLayer").click(function() {
                    var keyLayer = $(this).val();
                    var myVar;

                    /**
                     * Calcula segundos actuales
                     * Si es par muestra el layer
                     * Si es impar oculta el layer
                     * @returns invoca funcion
                     */
                    function myTimer()
                    {
                        var d = new Date();
                        var n = d.getSeconds();
                        if (n % 2 === 0) {
                            showMapLayer(keyLayer);
                        } else {
                            hideMapLayer(keyLayer);
                        }
                    }

                    if ($(this).prop("checked") === true) {
                        //Mostrar objetos
                        myVar = setInterval(function() {
                            myTimer();
                        }, 1000);
                        flickLayer[keyLayer] = myVar;
                    } else if ($(this).prop("checked") === false) {
                        //Ocultar objetos
                        clearInterval(flickLayer[keyLayer]);
                        showMapLayer(keyLayer);
                        delete flickLayer[keyLayer];
                    }
                });

                /**
                 * Al hacer click en una de las capas del proyecto
                 * muestra las opciones de edicion de acuerdo al tipo:
                 * Poligono o marcador
                 */
                $(".onProjectLayer").click(function(event) {
                    event.preventDefault();
                    var action = $(this).attr("href");
                    var keyLayer = $(this).attr("title");

                    $("#keyEdit").val(keyLayer);

                    //Todas las capas con fondo blanco
                    $(".rowEditLayer").css("background-color", "#FFFFFF");

                    //Capa seleccionada con nuevo estilo
                    $(".rowEditLayer[id='" + keyLayer + "']").css("background-color", "#CCFF66");

                    if (action == "drop") {

                        for (key in mapObjects) {
                            if (mapObjects.hasOwnProperty(key)) {
                                //Keys coinciden, eliminar elemento
                                if (key.substring(0, keyLayer.length) == keyLayer) {
                                    mapObjects[ key ].setMap(null);

                                    //Eliminando del arreglo que pinta en mapa
                                    delete mapObjects[key];

                                    //Elimina del arreglo que guarda las capas
                                    delete projectLayers[keyLayer];
                                }
                            }
                        }
                        //Elimina elemento HTML
                        $("div#" + keyLayer).remove();
                        $(".currentProject").click();

                    } else if (action == "edit") {
                        //Editar layer
                        var tipo = keyLayer.split("___");
                        //Modal "loading"
                        //$("body").addClass("loading");

                        //Elimina capa de mapa y arreglo de mapa
                        for (key in mapObjects) {
                            if (mapObjects.hasOwnProperty(key)) {
                                //Keys coinciden, eliminar elemento
                                if (key.substring(0, keyLayer.length) == keyLayer) {
                                    mapObjects[ key ].setMap(null);

                                    //Eliminando del arreglo que pinta en mapa
                                    delete mapObjects[key];

                                    //Elimina del arreglo que guarda las capas
                                    delete projectLayers[keyLayer];
                                }
                            }
                        }
                        //Elimina capa de arreglo de capas
                        for (key in layerGroup) {
                            if (layerGroup.hasOwnProperty(key)) {
                                //Keys coinciden, eliminar elemento
                                if (key.indexOf(keyLayer) >= 0) {
                                    //Eliminando del arreglo que pinta en mapa
                                    delete layerGroup[key];
                                }
                            }
                        }

                        //Include: _script_add_01.js

                        //recuperar datos de puntos y/o poligonos
                        var dataObjects = "action=getProjectLayer&id=" + tipo[0];
                        $.ajax({
                            async: true,
                            type: "POST",
                            url: "georeferencia.request.php",
                            data: dataObjects,
                            dataType: 'json',
                            success: function(datos) {
                                polygonCoords = [];

                                //Marcar capa seleccionada
                                $(".hideShowLayer[value='" + keyLayer + "']").prop("checked", true);
                                
                                //Loading
                                $("body").addClass("loading");

                                //bounds (limites del mapa por coordenadas)
                                $.each(datos, function() {
                                    //Si el elemento generado es un poligono
                                    if (this.tipo == "poli") {

                                        var xy = this.coords;

                                        //draw Polygon
                                        $.each(xy, function() {
                                            var pt = new google.maps.LatLng(this.coord_y, this.coord_x);
                                            bounds.extend(pt);
                                            polygonCoords.push(pt);
                                        });
                                        var poliColor = this.chars.split("___");

                                        // Construct the polygon.
                                        polygon = new google.maps.Polygon({
                                            paths: polygonCoords,
                                            strokeColor: poliColor[2],
                                            strokeOpacity: 0.8,
                                            strokeWeight: poliColor[3],
                                            fillColor: poliColor[0],
                                            fillOpacity: poliColor[1],
                                            zIndex: poliColor[4]
                                        });

                                        //Agregar capa al mapa
                                        mapObjects[this.layer_id
                                                + "___"
                                                + this.tipo
                                                + "___"
                                                + this.origen
                                                + "|^"
                                                + this.datos
                                        ] = polygon;
                                        //Agregar capa al proyecto
                                        projectLayers[this.layer_id
                                                + "___"
                                                + this.tipo
                                                + "___"
                                                + this.origen
                                                + "|^"
                                                + this.capa
                                        ] = this.origen + " en " + this.capa;
                                        //Agregar estilos de la capa
                                        layerStyle[this.layer_id
                                                + "___"
                                                + this.tipo
                                                + "___"
                                                + this.origen] = this.chars;

                                        //Verificar la nueva propiedad del Objeto
                                        if (Object.prototype.toString.call(
                                                layerGroup[
                                                        this.layer
                                                        + "|~"
                                                        + this.layer_id
                                                        + "___"
                                                        + this.tipo
                                                        + "___"
                                                        + this.origen
                                                        + "___"
                                                        + this.chars
                                                ]
                                                ) !== '[object Array]')
                                        {
                                            layerGroup[
                                                    this.layer
                                                    + "|~"
                                                    + this.layer_id
                                                    + "___"
                                                    + this.tipo
                                                    + "___"
                                                    + this.origen
                                                    + "___"
                                                    + this.chars] = new Array();
                                        }
                                        if (Object.prototype.toString.call(
                                                layerGroup[
                                                        this.layer
                                                        + "|~"
                                                        + this.layer_id
                                                        + "___"
                                                        + this.tipo
                                                        + "___"
                                                        + this.origen
                                                        + "___"
                                                        + this.chars
                                                ][this.capa]
                                                ) !== '[object Array]')
                                        {
                                            layerGroup[
                                                    this.layer
                                                    + "|~"
                                                    + this.layer_id
                                                    + "___"
                                                    + this.tipo
                                                    + "___"
                                                    + this.origen
                                                    + "___"
                                                    + this.chars][this.capa] = new Array();
                                        }


                                        //Layer Group
                                        var datosArray = this.datos.split("___");

                                        layerGroup[
                                                this.layer
                                                + "|~"
                                                + this.layer_id
                                                + "___"
                                                + this.tipo
                                                + "___"
                                                + this.origen
                                                + "___"
                                                + this.chars][this.capa].push(datosArray[ datosArray.length - 1 ] + "___" + this.chars);

                                        datosArray.push(this.datos);
                                        datosArray.push(this.layer_id
                                                + "___"
                                                + this.tipo
                                                + "___"
                                                + this.origen);

                                        google.maps.event.addListener(polygon, "click", function(event) {
                                            polygonDo(this, event, datosArray, true);
                                        });

                                        polygon.setMap(map);
                                        //map.fitBounds(bounds);

                                        polygonArray.push(polygon);

                                        polygon = null;
                                        polygonCoords = [];

                                    } else if (this.tipo == "punto") {
                                        var xy = this.coords;
                                        var itemIcon = this.chars;
                                        var itemChars, arrItemIcon;

                                        var puntoNombre = this.layer;
                                        var puntoOrigen = this.origen;
                                        var puntoLayer = this.layer_id;
                                        var puntoDatos = this.datos;
                                        var puntoCapa = this.capa;
                                        var puntoExt = this.chars.split("|");

                                        var markerNumber = 1;
                                        var pt;
                                        $.each(xy, function() {
                                            pt = new google.maps.LatLng(this.coord_y, this.coord_x);
                                            bounds.extend(pt);
                                            markers.push(pt);
                                        //});

                                            if (itemIcon == "" || itemIcon == "undefined") {
                                                iconSelected = "";
                                                itemChars = "";
                                            } else if (itemIcon.indexOf("custom|") >= 0) {
                                                iconSelected = itemIcon.substr(7);
                                                itemChars = "custom|" + $("#tmpIcon").val();
                                            } else {
                                                iconSelected = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + itemIcon;
                                                arrItemIcon = itemIcon.split("|");
                                                itemChars = "&chld=" + markerNumber + "|" + arrItemIcon[1] + "|000000";
                                            }

                                            var marker = new google.maps.Marker({
                                                position: pt,
                                                map: map,
                                                icon: iconSelected
                                            });
                                            //if ( itemIcon == "undefined" ) {
                                            marker.metadata = {type: "point", id: puntoExt[0]};
                                            //}

                                            //Agregar capa al mapa
                                            mapObjects[puntoLayer
                                                    + "___"
                                                    + "punto"
                                                    + "___"
                                                    + puntoOrigen
                                                    + "|^"
                                                    + puntoDatos
                                            ] = marker;

                                            //Agregar capa al proyecto
                                            projectLayers[puntoLayer
                                                    + "___"
                                                    + "punto"
                                                    + "___"
                                                    + puntoOrigen
                                                    + "|^"
                                                    + puntoCapa
                                            ] = puntoOrigen + " en " + puntoCapa;
                                            //Agregar estilos de la capa
                                            layerStyle[puntoLayer
                                                    + "___"
                                                    + "punto"
                                                    + "___"
                                                    + puntoOrigen] = itemIcon;

                                            var newItemChars, arrItemChars;
                                            if (itemChars.indexOf("&chld=") >= 0) {
                                                arrItemChars = itemChars.split("|");
                                                newItemChars = "chld=|"
                                                        + arrItemChars[1]
                                                        + "|"
                                                        + arrItemChars[2];
                                            } else {
                                                newItemChars = itemChars;
                                            }

                                            //Verificar la nueva propiedad del Objeto
                                            if (Object.prototype.toString.call(layerGroup[
                                                    puntoNombre
                                                    + "|~"
                                                    + puntoLayer
                                                    + "___"
                                                    + "punto"
                                                    + "___"
                                                    + puntoOrigen
                                                    + "___"
                                                    + newItemChars]) !== '[object Array]') {
                                                layerGroup[
                                                        puntoNombre
                                                        + "|~"
                                                        + puntoLayer
                                                        + "___"
                                                        + "punto"
                                                        + "___"
                                                        + puntoOrigen
                                                        + "___"
                                                        + newItemChars] = new Array();
                                            }
                                            if (Object.prototype.toString.call(layerGroup[
                                                    puntoNombre
                                                    + "|~"
                                                    + puntoLayer
                                                    + "___"
                                                    + "punto"
                                                    + "___"
                                                    + puntoOrigen
                                                    + "___"
                                                    + newItemChars][puntoCapa]) !== '[object Array]') {
                                                layerGroup[
                                                        puntoNombre
                                                        + "|~"
                                                        + puntoLayer
                                                        + "___"
                                                        + "punto"
                                                        + "___"
                                                        + puntoOrigen
                                                        + "___"
                                                        + newItemChars][puntoCapa] = new Array();
                                            }

                                            //Layer Group
                                            var puntoDatosArray = puntoDatos.split("___");

                                            layerGroup[
                                                    puntoNombre
                                                    + "|~"
                                                    + puntoLayer
                                                    + "___"
                                                    + "punto"
                                                    + "___"
                                                    + puntoOrigen
                                                    + "___"
                                                    + newItemChars][puntoCapa].push(puntoDatosArray[ puntoDatosArray.length - 1 ] + "___" + itemIcon);

                                            puntoDatosArray.push(puntoDatos);
                                            puntoDatosArray.push(puntoLayer
                                                    + "___"
                                                    + "punto"
                                                    + "___"
                                                    + puntoOrigen);

                                            //Solo para direcciones cargadas
                                            if (puntoOrigen === "address") {
                                                puntoDatosArray = puntoDatos.split("___");
                                                var target = puntoDatosArray[0];
                                                puntoDatosArray[0] = "address";
                                                puntoDatosArray[1] = target
                                                        + "___"
                                                        + this.direccion;
                                                puntoDatosArray[2] = "";
                                            }

                                            //Infowindow del marcador
                                            google.maps.event.addListener(marker, "click", function(event) {
                                                markerDo(marker, event, puntoDatosArray, true);
                                            });

                                            markerArray.push(marker);
                                            marker.setMap(map);
                                            marker = null;
                                            markerNumber++;

                                        });
                                        //map.fitBounds(bounds);

                                    } else if (this.tipo == "circle") {

                                        var xy = this.coords;
                                        var itemIcon = this.chars;
                                        var itemChars, arrItemIcon;

                                        var puntoNombre = this.layer;
                                        var puntoOrigen = this.origen;
                                        var puntoLayer = this.layer_id;
                                        var puntoDatos = this.datos;
                                        var puntoCapa = this.capa;
                                        var puntoExt = this.chars.split("___");
                                        var puntoRadio;

                                        $.each(xy, function() {
                                            var pt = new google.maps.LatLng(this.coord_y, this.coord_x);

                                            if (Number(this.radio) > 0) {
                                                puntoRadio = Number(this.radio);
                                            } else {
                                                puntoRadio = Number(puntoExt[5]);
                                            }

                                            var circleOptions = {
                                                strokeColor: puntoExt[2],
                                                strokeOpacity: 0.8,
                                                strokeWeight: puntoExt[3],
                                                fillColor: puntoExt[0],
                                                fillOpacity: puntoExt[1],
                                                map: map,
                                                center: pt,
                                                radius: puntoRadio
                                            };

                                            // Add the circle for this city to the map.
                                            var circle = new google.maps.Circle(circleOptions);

                                            bounds.union(circle.getBounds());

                                            //Agregar capa al mapa
                                            mapObjects[puntoLayer
                                                    + "___"
                                                    + "circle"
                                                    + "___"
                                                    + puntoOrigen
                                                    + "|^"
                                                    + puntoDatos
                                            ] = circle;

                                            //Agregar capa al proyecto
                                            projectLayers[puntoLayer
                                                    + "___"
                                                    + "circle"
                                                    + "___"
                                                    + puntoOrigen
                                                    + "|^"
                                                    + puntoCapa
                                            ] = puntoOrigen + " en " + puntoCapa;

                                            //Agregar estilos de la capa
                                            layerStyle[puntoLayer
                                                    + "___"
                                                    + "circle"
                                                    + "___"
                                                    + puntoOrigen] = itemIcon;

                                            //Verificar la nueva propiedad del Objeto
                                            if (Object.prototype.toString.call(layerGroup[
                                                    puntoNombre
                                                    + "|~"
                                                    + puntoLayer
                                                    + "___"
                                                    + "circle"
                                                    + "___"
                                                    + puntoOrigen
                                                    + "___"
                                                    + itemIcon]) !== '[object Array]') {
                                                layerGroup[
                                                        puntoNombre
                                                        + "|~"
                                                        + puntoLayer
                                                        + "___"
                                                        + "circle"
                                                        + "___"
                                                        + puntoOrigen
                                                        + "___"
                                                        + itemIcon] = new Array();
                                            }
                                            if (Object.prototype.toString.call(layerGroup[
                                                    puntoNombre
                                                    + "|~"
                                                    + puntoLayer
                                                    + "___"
                                                    + "circle"
                                                    + "___"
                                                    + puntoOrigen
                                                    + "___"
                                                    + itemIcon][puntoCapa]) !== '[object Array]') {
                                                layerGroup[
                                                        puntoNombre
                                                        + "|~"
                                                        + puntoLayer
                                                        + "___"
                                                        + "circle"
                                                        + "___"
                                                        + puntoOrigen
                                                        + "___"
                                                        + itemIcon][puntoCapa] = new Array();
                                            }

                                            //Layer Group
                                            var puntoDatosArray = puntoDatos.split("___");

                                            layerGroup[
                                                    puntoNombre
                                                    + "|~"
                                                    + puntoLayer
                                                    + "___"
                                                    + "circle"
                                                    + "___"
                                                    + puntoOrigen
                                                    + "___"
                                                    + itemIcon][puntoCapa].push(puntoDatosArray[ puntoDatosArray.length - 1 ] + "___" + itemIcon);

                                            puntoDatosArray.push(puntoDatos);
                                            puntoDatosArray.push(puntoLayer
                                                    + "___"
                                                    + "circle"
                                                    + "___"
                                                    + puntoOrigen);

                                            //Infowindow del marcador
                                            google.maps.event.addListener(circle, "click", function(event) {
                                                polygonDo(circle, event, puntoDatosArray, true);
                                            });

                                        });
                                        //map.fitBounds(bounds);
                                    }
                                });
                                //Ajustar elementos al mapa
                                map.fitBounds(bounds);
                                //Remover class "loading" luego de dibujar elementos
                                $("body").removeClass("loading");
                            }
                        });
                        //FIN: include _script_add_01.js


                        //Ubicar estilo
                        var layerCss = layerStyle[keyLayer];

                        $("#estilo_punto_edit").hide();
                        $("#estilo_poligono_edit").hide();

                        //Marcar casilla de color de linea
                        $("#colorLineEdit").prop("checked", true);

                        //Edicion por tipo de elemento
                        if (tipo[1] == "punto") {

                            /**
                             * 
                             * Estilos de la capa seleccioanda
                             * 
                             */
                            var markerColor;
                            var estilosLayer;
                            if (layerCss == "undefined" || layerCss == "") {
                                //Color del marcador por defecto de Google Maps
                                markerColor = "F7584C";
                                $("input[name=iconSelectEdit][value='default']").prop("checked", true);
                            } else if (layerCss.indexOf("custom|") >= 0) {
                                //Marcar radio button
                                $("input[name=iconSelectEdit][value='custom']").prop("checked", true);
                                //Mostrar imagen seleccionada
                                $("#customIconPreviewEdit").prop("src", layerCss.substring(7));
                            } else {
                                estilosLayer = layerCss.split("|");
                                markerColor = estilosLayer[1];
                                $("input[name=iconSelectEdit][value='numeric']").prop("checked", true);
                            }

                            //Color de fondo
                            $(".simpleColorDisplay").each(function(key, val) {
                                if (key == 5) {
                                    $(this).css("background-color", "#" + markerColor);
                                    //codigo de color
                                    $(this).html("#" + markerColor);
                                    //Input con codigo de color
                                    $("#colorPickerPuntoEdit").val("#" + markerColor);
                                }
                            });

                            $("#estilo_punto_edit").show();

                        } else if (tipo[1] == "poli" || tipo[1] == "circle") {

                            /**
                             * 
                             * Estilos de la capa seleccioanda
                             * 
                             */

                            var estilosLayer = layerCss.split("___");
                            //Color de fondo
                            $(".simpleColorDisplay").each(function(key, val) {
                                if (key == 3) {
                                    $(this).css("background-color", estilosLayer[0]);
                                    //Opacidad
                                    $(this).css("opacity", estilosLayer[1]);
                                    $(".sliderEdit a").css("left", (estilosLayer[1] * 100) + "px");
                                    //Código de color
                                    $(this).html(estilosLayer[0]);
                                    //Input con color de fondo
                                    $("#colorPickerPoligonoEdit").val(estilosLayer[0]);
                                }
                                //Color de linea
                                if (key == 4) {
                                    //Color de fondo
                                    $(this).css("background-color", estilosLayer[2]);
                                    //Código de color
                                    $(this).html(estilosLayer[2]);
                                    //Input con color de fondo
                                    $("#colorPickerLineEdit").val(estilosLayer[2]);
                                }
                                //Espesor de linea
                                $("#lineEditWeight option").filter(function() {
                                    return $(this).val() == estilosLayer[3];
                                }).prop('selected', true);
                            });

                            $("#estilo_poligono_edit").show();
                        }
                    }
                });

            }
        });


    });

    //Guardar cambios en los poligonos modificados
    $("#savePoli").click(function(event) {
        var colorFondo;
        var opacidad;
        var colorLinea;
        var espesorLinea;
        var grupo = $("#keyEdit").val();

        //Color de fondo
        $.each($(".simpleColorDisplay"), function(a, b) {
            if (a == 3) {
                colorFondo = $(this).html();
            }
        });

        //Color de linea
        if ($('#colorLineEdit').is(':checked')) {
            //Personalizado
            colorLinea = $("#colorPickerLineEdit").val();
        } else {
            //Igual al color de fondo
            colorLinea = colorFondo;
        }

        //Espesor de linea
        espesorLinea = $("#lineEditWeight").val();

        //Opacidad
        opacidad = $(".sliderEdit a").css("left");
        opacidad = Number(opacidad.substring(0, (opacidad.length - 2)));
        opacidad /= 100;

        //Objetos del mapa
        for (key in mapObjects) {
            if (mapObjects.hasOwnProperty(key)) {
                //Keys coinciden, eliminar elemento
                if (key.substring(0, grupo.length) == grupo) {
                    //Eliminar objeto del mapa
                    mapObjects[ key ].setMap(null);

                    //Cambiar propiedades
                    mapObjects[ key ].fillColor = colorFondo;
                    mapObjects[ key ].fillOpacity = opacidad;
                    mapObjects[ key ].strokeColor = colorLinea;
                    mapObjects[ key ].strokeWeight = espesorLinea;

                    //Agregar objeto al mapa
                    mapObjects[ key ].setMap(map);

                    //Recorrer layerGlayerGroup
                    for (idLayer in layerGroup) {
                        if (layerGroup.hasOwnProperty(idLayer)) {
                            //Si Id de Layer (grupo) coincide con Id de layerGrlayerGroup
                            if (idLayer.indexOf(grupo) >= 0) {
                                //Recorrer 2do nivel dentro de layerGlayerGroup
                                for (idSubLayer in layerGroup[idLayer]) {
                                    if (layerGroup[idLayer].hasOwnProperty(idSubLayer)) {
                                        //Recorrer ultimo nivel, arreglo de elementos
                                        $.each(layerGroup[idLayer][idSubLayer], function(eIndex, eVal) {

                                            var e = eVal.split("___");
                                            layerGroup[idLayer][idSubLayer][eIndex] = e[0] + "___"
                                                    + colorFondo
                                                    + "___"
                                                    + opacidad
                                                    + "___"
                                                    + colorLinea
                                                    + "___"
                                                    + espesorLinea;
                                        });
                                    }
                                }

                            }
                        }
                    }
                }
            }
        }
    });

    //Guardar cambios en los puntos modificados
    $("#savePunto").click(function(event) {
        var grupo = $("#keyEdit").val();
        var iconSelected;
        var itemChars;
        var icontype = $('input[name=iconSelectEdit]:checked').val();
        markerNumber = 1;

        //Color de fondo
        $.each($(".simpleColorDisplay"), function(a, b) {
            if (a == 3) {
                colorFondo = $(this).html();
            }
        });

        //Objetos del mapa
        for (key in mapObjects) {
            if (mapObjects.hasOwnProperty(key)) {
                //Keys coinciden
                if (key.substring(0, grupo.length) == grupo) {
                    //Icono del elemento
                    /*
                     if (icontype == "default") {
                     iconSelected = "";
                     } else if (icontype == "custom") {
                     iconSelected = $("#tmpIconEdit").val();
                     } else if (icontype == "numeric") {
                     //Numeración para marcadores
                     mapObjects[ key ].metadata.id = markerNumber;
                     markerNumber++;
                     
                     iconSelected = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld="
                     + mapObjects[ key ].metadata.id
                     + "|"
                     + $("#colorPickerPuntoEdit").val().substring(1)
                     + "|000000";
                     }
                     */
                    if (icontype == "default") {
                        iconSelected = "";
                        itemChars = "";
                    } else if (icontype == "custom") {
                        iconSelected = $("#tmpIconEdit").val();
                        itemChars = "custom|" + $("#tmpIconEdit").val();
                    } else if (icontype == "numeric") {
                        markerNumber++;
                        iconSelected = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + markerNumber + "|" + $("#colorPickerPuntoEdit").val().substring(1) + "|000000";
                        itemChars = "&chld=" + markerNumber + "|" + $("#colorPickerPuntoEdit").val().substring(1) + "|000000";
                    }

                    //Eliminar objeto del mapa
                    mapObjects[ key ].setMap(null);

                    //Cambiar propiedades
                    mapObjects[ key ].icon = iconSelected;

                    //Agregar objeto al mapa
                    mapObjects[ key ].setMap(map);

                    //Recorrer layerGlayerGroup
                    for (idLayer in layerGroup) {
                        if (layerGroup.hasOwnProperty(idLayer)) {
                            //Si Id de Layer (grupo) coincide con Id de layerGrlayerGroup
                            if (idLayer.indexOf(grupo) >= 0) {
                                //Recorrer 2do nivel dentro de layerGlayerGroup
                                for (idSubLayer in layerGroup[idLayer]) {
                                    if (layerGroup[idLayer].hasOwnProperty(idSubLayer)) {
                                        //Recorrer ultimo nivel, arreglo de elementos
                                        $.each(layerGroup[idLayer][idSubLayer], function(eIndex, eVal) {
                                            var e = eVal.split("___");
                                            layerGroup[idLayer][idSubLayer][eIndex] = e[0] + "___"
                                                    + itemChars;
                                        });
                                    }
                                }

                            }
                        }
                    }
                }
            }
        }
    });

    //Boton de guardar cambios en la edicion de poligonos y puntos
    $(".saveAllEditLayer").click(function() {
        $("#btnSaveLayout").click();
    });

    $('.slider').slider({min: 0, max: 1, step: 0.05, value: 1})
            .bind("slidechange", function() {
                //get the value of the slider with this call
                var o = $(this).slider('value');
                $(".simpleColorDisplay").first().css('opacity', o)
            });

    $('.sliderEdit').slider({min: 0, max: 1, step: 0.05, value: 1})
            .bind("slidechange", function() {
                //get the value of the slider with this call
                var o = $(this).slider('value');
                $.each($(".simpleColorDisplay"), function(a, b) {
                    if (a == 3) {
                        $(this).css('opacity', o);
                    }
                });
            });

});