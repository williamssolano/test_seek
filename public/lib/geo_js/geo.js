//Nueva objeto tipo mapa
var map;
//Limites del mapa
var bounds;
//Marcadores
var markers = [];
var markerArray = [];
//Poligonos
var polygonObject;
var polygonCoords = [];
var polygonArray = [];
//Address
var addressArray = [];
var addressMarkerArray = [];
//Objeto geocoder, libreria Google Maps
var geocoder;
//Objeto tipo infowindow
var infowindow;
//Cadena de datos a enviar via ajax
var data_content;
//Elementos seleccionados para mostrar en el mapa
var selectedItem;
//Items con check
var itemsChecked;
var itemsCheckedOpen;
//Item envio (concatenado)
var itemSet;
//Enviar peticion
var sendRequest;
//Elementos a seleccionar
var geoItemArray = new Array();
//Objetos del mapa
var mapObjects = {};
//Grupo de capas
var layerGroup = {};
//Variables globales estilos
var iconSelected = "";
var colorSelected = "";
var colorLineSelected = "";

var polygonOpacity = "";
var polygonLineWidth = "";

//z-index
var zIndexItem = 0;

//Carga y busqueda de direcciones
var myInterval;
var dynamicInc = 0;

//Capas por files KML o KMZ
var fileLayers = new Array();

//Google base icon
var googleMarktxt = "http://chart.apis.google.com/chart" 
                    + "?chst=d_map_pin_letter&chld=";

//Capas intermitentes
var flickLayer = new Array();

//PolyLine
var polyLineCoords = [];

//Inicializar Google Maps
function mapInit() {
    bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        zoom: 10,
        center: new google.maps.LatLng(-12.033284, -77.0715493)
    };
    map = new google.maps.Map(document.getElementById('geo_map'),
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
    return true;
}

/**
 * Redimensiona el mapa si el tamaño
 * del canvas cambia
 * 
 * @param {type} full TRUE = 100%
 * @returns {Boolean}
 */
function canvasResize(full) {
    if (full) {
        $("#geo_map").css("width", "100%");
    } else {
        var bodyWidth = parseFloat($("body").css("width"));
        var toolWidth = parseFloat($("#geo_tools").css("width"));
        var mapWidth = bodyWidth - toolWidth;
        $("#geo_map").css("width", mapWidth);
    }
    mapResize();
    return true;
}

/**
 * Redimensiona solo el mapa
 * @returns {Boolean}
 */
function mapResize() {
    google.maps.event.trigger(map, 'resize');
    return true;
}

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

/**
 * Realiza una acción de acuerdo al nivel de zoom
 * @param {type} zoom
 * @returns {Boolean}
 */
function onZoomDo(zoom) {
    return true;
}

function layerCreated(){
    
    console.log(layerGroup);
    console.log( Object.size(layerGroup) );
    
    //Mostrar capas creadas
    for (index in layerGroup) {
        if ( layerGroup.hasOwnProperty(index) ) {
            console.log(index);
            //$("#layerCreated").append("<div>" + id + " / " + val + "</div>");
        }
    }
    return true;
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
                                                + "undefined";
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
 * @param {type} keyLayer el ID de la capa
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

function pad(num, size) {
    //Via http://stackoverflow.com/questions/2998784/how-to-output-integers-with-leading-zeros-in-javascript
    var s = num + "";
    while (s.length < size)
        s = "0" + s;
    return s;
}

/**
 * Muestra herramientas de diseño
 * de acuerdo al tipo de elemento
 * 
 * @param {type} type
 * @returns {Boolean}
 */
function showDesignTools(type){
    //Ocultar o mostrar bloque de estilos
    $(".estiloItem").hide();
    if (type === "poligono" || type === "circle") {
        $("#estilo_poligono").show();
    } else if (type === "punto") {
        $("#estilo_punto").show();
    }
    return true;
}

//Todo Ok jQuery
$(document).ready(function() {
    //Inicializa mapa
    mapInit();
    //jQuery
    $("#hideTools").click(function(event) {
        event.preventDefault();
        //Ocultar barra de herramientas
        $("#geo_tools").hide();
        //Redimensionar mapa
        canvasResize(true);
        //Mostrar boton de herramientas
        $("#btn_tools").show();
        
        //Si no existen elementos en el mapa, mostrar ubicacion por defecto
        if (Object.size(mapObjects)===0) {
            mapInit();
        } else {
            mapFitBounds();
        }
    });

    $("#showTools").click(function(event) {
        event.preventDefault();
        //Ocultar barra de herramientas
        $("#geo_tools").show();
        //Redimensionar mapa y canvas
        canvasResize(false);
        //Mostrar boton de herramientas
        $("#btn_tools").hide();
        
        //Si no existen elementos en el mapa, mostrar ubicacion por defecto
        if (Object.size(mapObjects)===0) {
            mapInit();
        }else {
            mapFitBounds();
        }
    });

    //Obtener lista de elementos para georeferencia (1ra carga)
    data_content = "action=geoElementos";
    $.ajax({
        type: "POST",
        url: "geo.main.php",
        data: data_content,
        dataType: 'json',
        success: function(datos) {
            $.each(datos, function() {
                $('<option>').val(
                        this.id
                        + "_"
                        + this.tipo
                        + "_"
                        + this.nombre
                        ).text(this.descripcion).appendTo('#geo_elemento');
            });
        }
    });

    //Listas, seleccion de elementos y dependencias
    $("#geo_elemento").change(function() {
        var geoVal = $("#geo_elemento").val().split("_");
        var origen = geoVal[2];
        
        /**
         * Ocultar o mostrar bloque de estilos
         * 
         * poligono, circle, punto
         */
        showDesignTools(geoVal[1]);

        //Nueva capa
        selectedItem = new Array();

        data_content = "action=getGeoDedependencia&elemento_id=" 
                + geoVal[0] 
                + "&origen=" 
                + origen;
        $.ajax({
            type: "POST",
            url: "geo.main.php",
            data: data_content,
            success: function(datos) {
                $("#geo_response").html(datos);

                geoItemArray = new Array();
                $.each($(".geo_item"), function() {
                    geoItemArray.push($(this).attr("id"));
                });

                //Make multiselect only <select> with "multple" prop (last one)
                var nItem = 1;
                $.each($("#geo_response select[multiple=multiple]"), function() {
                    var itemId = $(this).attr("id");
                    //Convierte elemento en multiselect
                    $("#" + $(this).attr("id")).multiselect({
                        //Encabezado en cada elemento
                        //header: $(this).attr("id").replace(/geo_/g, ""),
                        checkAllText: 'Todos',
                        uncheckAllText: 'Ninguno',
                        selectedText: $(this)
                                .attr("id")
                                .replace(/geo_/g, "") 
                                + ": # of # seleccionados",
                        open: function(event, iu){
                            //Obtener elementos seleccionados
                            itemsCheckedOpen = $(this)
                                    .multiselect("getChecked")
                                    .map(function() {
                                return this.value;
                            }).get();
                        },
                        close: function(event, ui) {
                            //Obtener posicion del elemento actual
                            var posGeoItem = geoItemArray
                                    .indexOf($(this).attr("id"));
                            //Siguiente lista de elementos para actualizar
                            var nextGeoItem;
                            //Cadena de Items a buscar por peticion
                            var searchItem="";
                            
                            //Validar si existe un elemento posterior
                            if (typeof geoItemArray[posGeoItem + 1]
                                    !== "undefined")
                            {
                                //Enviar peticion ajax con seleccionados
                                nextGeoItem = geoItemArray[posGeoItem + 1];
                                
                                //Obtener elementos seleccionados
                                itemsChecked = $(this)
                                        .multiselect("getChecked")
                                        .map(function() {
                                    return this.value;
                                }).get();
                                
                                //Cadena de elementos a buscar
                                $.each(itemsChecked, function(){
                                    searchItem += "," + this;
                                });
                                searchItem = searchItem.substring(1);
                                                                
                                //Enviar peticion ajax
                                if ( $.md5(itemsChecked) !== $.md5(itemsCheckedOpen) ) {
                                    //Limpiar proximos elementos
                                    var idxThis = geoItemArray.indexOf(itemId);
                                    $.each(geoItemArray, function(id, val){
                                        if (id > idxThis) {
                                            $('#' + val)
                                                    .find('option')
                                                    .remove();
                                            $("#" + val).multiselect("refresh");
                                        }
                                    });
                                    
                                    data_content = "action=getGeoItem&element="
                                        + nextGeoItem.replace(/geo_/g, "")
                                        + "&dependencia="
                                        + searchItem
                                        + "&origen="
                                        + origen;
                                
                                    $.ajax({
                                        type: "POST",
                                        url: "geo.main.php",
                                        data: data_content,
                                        dataType: 'json',
                                        success: function(dato) {

                                            $.each(dato, function(id, val){
                                                var nid = 0;
                                                var optStr = '<optgroup label="'
                                                            + id.replace(/___/g, " / ")
                                                            + '">';
                                                $.each(val, function(){
                                                    optStr += '<option value="'
                                                        + id 
                                                        + "___"
                                                        + this.id
                                                        + '">'
                                                        + this.campo
                                                        + '</option>';
                                                    nid++;
                                                });
                                                optStr += '</optgroup>';
                                                
                                                $("#" + nextGeoItem)
                                                        .append(optStr);
                                                
                                            });
                                            //Refrescar multi select
                                            $("#" + nextGeoItem)
                                                .multiselect('refresh');
                                        }
                                    });
                                }
                                
                            } else {
                                /**
                                 * Ya no existen elementos, es el ultimo
                                 * 
                                 * 1. Mostrar botones
                                 */
                                $(".btn_drawSet").show();
                            }
                            
                            if (ui.checked === true)
                            {
                                //console.log(ui.value + ' Agregar ' );

                            }
                            else if (ui.checked === false)
                            {
                                //console.log(ui.value + ' Eliminar ' );
                            }
                        }
                    }).multiselectfilter({
                        label: $(this).attr("id").replace(/geo_/g, ""),
                        placeholder: "Ingrese texto"
                    });
                                       
                    
                    nItem++;
                });

                //Patron de búsqueda
                var patron = $(".geo_item").attr("title");
                patron = patron.replace(/_/g, " / ");

                $(".geo_item").change(function() {
                    var title = $(this).attr("title");
                    var call = title.split("_");
                    var dep = "";
                    var itemId;

                    if ($(this).val() !== "") {
                        itemId = $(this).attr("id");
                        itemSet = $(this).val();

                        var itemIndex = call.indexOf(itemId.substring(4));

                        //Remover options existentes
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
                                    url: "geo.main.php",
                                    data: data_content,
                                    dataType: 'json',
                                    success: function(dato) {
                                        var nextItem = $(".geo_item[id="
                                                + itemId
                                                + "]")
                                                .next(".geo_item");

                                        if (typeof nextItem !== "undefined") {
                                            $.each(dato, function() {
                                                $("#" + nextItem.attr("id"))
                                                        .append(
                                                            '<option value="'
                                                            + this.id
                                                            + '">'
                                                            + this.campo
                                                            + '</option>');
                                            });
                                            $("#" + nextItem.attr("id"))
                                                    .multiselect('refresh');
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
    
    //Dibuja capa de elemento seleccionado
    $("#draw").click(function (){
        itemsChecked = $( "#" + geoItemArray[ geoItemArray.length - 1 ] )
                .multiselect("getChecked")
                .map(function() {
            return this.value;
        }).get();
        
        if (itemsChecked.length === 0) {
            alert("Debe seleccionar al menos un elemento");
            return false;
        }
        
        var geoVal = $("#geo_elemento").val().split("_");
        //var nombreCapa = prompt("Ingrese nombre para la capa", "");
        var nombreCapa = $.trim( $("#newLayerName").val() );

        //Validar nombre de capa y dibujar elementos
        if (nombreCapa !== "") {
            var origen = geoVal[2];

            //Tipo de Icono: default, numeric o custom
            var icontype = $('input[name=iconSelect]:checked').val();

            var timeStamp = new Date().getTime();
            
            var layerTmpId = $.md5( timeStamp + getRandomColor() + nombreCapa );
            
            //Limpiar caja de texto, nombre capa
            $("#newLayerName").val("");

            //Objeto poligono
            var polygon;
            var idFirst;
            var idLast;
            var idCount;
            
            $("body").addClass("loading");

            //Si elemento a dibujar es un poligono
            if (geoVal[1] === 'poligono') {

                //Recorrer arreglo selectedItem
                //for (index in selectedItem) {
                    //if (selectedItem.hasOwnProperty(index)) {
                        $.each(itemsChecked, function(key, value) {
                            //Enviar peticion y respuesta json
                            data_polygon = "action=drawPolygon&origen=" 
                                    + origen 
                                    + "&data=" 
                                    + value;
                            $.ajax({
                                type: "POST",
                                url: "geo.main.php",
                                data: data_polygon,
                                dataType: 'json',
                                success: function(datos) {
                                    
                                    idCount = 1;
                                    $.each(datos, function() {
                                        if (idCount === 1) {
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
                                    colorSelected = $("#pickerPolyBack").val();

                                    //Color de linea
                                    colorLineSelected = $("#pickerPolyLine").val();
                                    
                                    //Opacidad
                                    polygonOpacity = $("#sliderPolyOpac" ).slider( "value" );
                                    
                                    //Linea
                                    polygonLineWidth = $("#polyLineCreate").val();

                                    // Construct the polygon.
                                    polygon = new google.maps.Polygon({
                                        paths: polygonCoords,
                                        strokeColor: "#" + colorLineSelected,
                                        strokeOpacity: 0.8,
                                        strokeWeight: polygonLineWidth,
                                        fillColor: "#" + colorSelected,
                                        fillOpacity: polygonOpacity,
                                        zIndex: zIndexItem++
                                    });

                                    google.maps.event.addListener(polygon, "click", function(event) {
                                        polygonDo(this, event, value, true);
                                    });

                                    var polygonStyle = colorSelected
                                            + "___"
                                            + polygonOpacity
                                            + "___"
                                            + colorLineSelected
                                            + "___"
                                            + polygonLineWidth;

                                    //Agrega el poligono al Objeto mapObjects
                                    mapObjects[layerTmpId 
                                                + "___poli___" 
                                                + origen 
                                                + "|^" 
                                                + value
                                                + "[{chars}]"
                                                + polygonStyle] = polygon;
                                    
                                    if ( layerGroup.hasOwnProperty(
                                            layerTmpId 
                                            + "|^" 
                                            + nombreCapa) === false ) {
                                        layerGroup[layerTmpId 
                                                    + "|^" 
                                                    + nombreCapa
                                        ] = polygonStyle;
                                        
                                        
                                    }
                                    
                                                                        
                                    //Muestra poligono en mapa
                                    polygon.setMap(map);
                                    //Recalcula visibilidad de mapa por limites coord.
                                    map.fitBounds(bounds);

                                    polygon = null;
                                    polygonCoords = [];
                                    
                                    //Remover pageLoader
                                    if (key+1 === itemsChecked.length) {
                                        $("body").removeClass("loading");
                                    }

                                    //$("body").removeClass("loading");
                                }
                            });


                        });
                    //}
                //}

            } else if (geoVal[1] === 'punto') {
                //Si el elemento es una coordenada (punto o marcador)
                var markerNumber = 1;
                var itemChars="";

                //for (index in selectedItem) {
                    //if (selectedItem.hasOwnProperty(index)) {
                        $.each(itemsChecked, function(key, value) {
                            //Enviar peticion y respuesta json
                            data_polygon = "action=drawMarker&origen=" 
                                    + origen 
                                    + "&data=" 
                                    + value;
                            $.ajax({
                                async: true,
                                type: "POST",
                                url: "geo.main.php",
                                data: data_polygon,
                                dataType: 'json',
                                success: function(datos) {
                                    $.each(datos, function() {
                                        var pt = new google.maps.LatLng(
                                                this.coord_y, this.coord_x
                                                );
                                        bounds.extend(pt);
                                        markers.push(pt);
                                        
                                        //Diseño del marcador
                                        if (icontype === "default") {
                                            iconSelected = "";
                                            itemChars = "";
                                        } else if (icontype === "custom") {
                                            iconSelected = $("#tmpIcon").val();
                                            itemChars = "custom|" 
                                                    + $("#tmpIcon").val();
                                        } else if (icontype === "numeric") {
                                            var markTextColor = textByColor("#" 
                                                        + $("#pickerMarkBack")
                                                        .val())
                                                        .substring(1);
                                                
                                            iconSelected = googleMarktxt 
                                                    + markerNumber 
                                                    + "|" 
                                                    + $("#pickerMarkBack").val() 
                                                    + "|" 
                                                    + markTextColor;
                                            
                                            itemChars = "&chld=" 
                                                    + markerNumber 
                                                    + "|" 
                                                    + $("#pickerMarkBack").val() 
                                                    + "|"
                                                    + markTextColor;
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

                                        //Estilo
                                        var newItemChars, arrayItemChars;
                                        if (itemChars.indexOf("&chld=") >= 0) {
                                            arrayItemChars = itemChars
                                                    .split("|");
                                            newItemChars = "chld=|"
                                                    + arrayItemChars[1]
                                                    + "|"
                                                    + arrayItemChars[2];
                                        } else {
                                            newItemChars = itemChars;
                                        }

                                        mapObjects[layerTmpId 
                                                    + "___punto___" 
                                                    + origen 
                                                    + "|^" 
                                                    + value
                                                    + "[{chars}]"
                                                    + newItemChars] = marker;
                                        
                                        //layerGroup[layerTmpId] = newItemChars;
                                        
                                        if ( layerGroup.hasOwnProperty(
                                                layerTmpId 
                                                + "|^" 
                                                + nombreCapa) === false ) {
                                            layerGroup[layerTmpId 
                                                        + "|^" 
                                                        + nombreCapa
                                            ] = newItemChars;

                                        }

                                        markerArray.push(marker);
                                        marker.setMap(map);
                                        markerNumber++;
                                    });
                                    map.fitBounds(bounds);
                                    //$("body").removeClass("loading");
                                    
                                    //Remover pageLoader
                                    if (key+1 === itemsChecked.length) {
                                        $("body").removeClass("loading");
                                    }
                                }
                            });


                        });
                    //}
                //}
            } else if (geoVal[1] === 'circle') {
                //Si el elemento es un circulo basado en una corodenada y radio
                var markerNumber = 1;
                var itemChars;

                //for (index in selectedItem) {
                    //if (selectedItem.hasOwnProperty(index)) {
                        $.each(itemsChecked, function(key, value) {
                            //Enviar peticion y respuesta json
                            data_polygon = "action=drawCircle&origen=" + origen + "&data=" + value;
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
                                    colorSelected = $("#pickerPolyBack").val();

                                    //Color de linea
                                    colorLineSelected = $("#pickerPolyLine").val();
                                    
                                    //Opacidad
                                    polygonOpacity = $("#sliderPolyOpac" ).slider( "value" );
                                    
                                    //Linea
                                    polygonLineWidth = $("#polyLineCreate").val();

                                        var circleOptions = {
                                            strokeColor: colorLineSelected,
                                            strokeOpacity: 0.8,
                                            strokeWeight: polygonLineWidth,
                                            fillColor: colorSelected,
                                            fillOpacity: polygonOpacity,
                                            map: map,
                                            center: pt,
                                            radius: Number(this.radio),
                                            zIndex: zIndexItem++
                                        };

                                        // Add the circle for this city to the map.
                                        var circle = new google.maps.Circle(circleOptions);

                                        google.maps.event.addListener(circle, "click", function(event) {
                                            polygonDo(this, event, value, true);
                                        });

                                        bounds.union(circle.getBounds());

                                        var polygonStyle = colorSelected
                                                + "___"
                                                + $(".simpleColorDisplay").css("opacity")
                                                + "___"
                                                + colorLineSelected
                                                + "___"
                                                + $("#lineWeight").val();

                                        mapObjects[layerTmpId 
                                                    + "___circle___" 
                                                    + origen 
                                                    + "|^" 
                                                    + value
                                                    + "[{chars}]"
                                                    + polygonStyle] = circle;

                                        //layerGroup[layerTmpId] = polygonStyle;
                                        
                                        if ( layerGroup.hasOwnProperty(
                                                layerTmpId 
                                                + "|^" 
                                                + nombreCapa) === false ) {
                                            layerGroup[layerTmpId 
                                                        + "|^" 
                                                        + nombreCapa
                                            ] = polygonStyle;

                                        }

                                    });
                                    
                                    map.fitBounds(bounds);
                                    //$("body").removeClass("loading");
                                    
                                    //Remover pageLoader
                                    if (key+1 === itemsChecked.length) {
                                        $("body").removeClass("loading");
                                    }
                                }
                            });
                        });
                    //}
                //}
            }
            //$("body").removeClass("loading");
            
            //$("#basket_layer").attr("src", "images/basket_full.png");
        } else {
            //alert("Debe ingresar un nombre para la capa");
            $("#newLayerName").focus();
            $("#newLayerNameError").show();
            $("#newLayerNameError").delay(3000).fadeOut(3000);
        }
        
    });
    
    //Limpiar mapa
    $("#clearAll").click(function (){
        var conf = confirm("Se eliminaran todos los elementos creados\n"
                           + "¿Desea continuar?");
        if (conf) {
            for (index in mapObjects) {
                if (mapObjects.hasOwnProperty(index)) {
                    if ( typeof mapObjects[ index ] !== "undefined" ) {
                        mapObjects[ index ].setMap(null);
                        delete mapObjects[ index ];
                    } else {
                        console.log("Error: " + index);
                    }
                }
            }
            
            //Limpiar limites del mapa
            bounds = new google.maps.LatLngBounds();
            
            //Limpiar grupos creados
            layerGroup = new Array();
            
            //Proyecto pre cargado en blanco
            $("#proIdEdit").val('');
            
            //Inicializar mapa
            mapInit();
            
        }
        
    });
    
    //Guardar proyecto
    $("#saveProject").click(function (){
        
        //Validar existencia de elementos en el mapa
        if ( Object.size(mapObjects) === 0 ) {
            alert("El mapa no contiene elementos.");
            return false;
        }

        //Validar campo de nombre de proyecto no vacío
        if ( $.trim( $("#proyecto").val() ) === "" ) {
            
            $("#newProjectNameError").show();
            
            $("#proyecto").val("");
            $("#proyecto").css("background-color", "#ffcccc");
            $("#proyecto").focus();
            return false;
        }

        var capas = "";
        var itemSet = "";
        
        for (key in mapObjects) {
            if (mapObjects.hasOwnProperty(key)) {

                var nMarker = 1;
                var arrObj = key.split("|^");
                
                var ext = arrObj[0].split("___");
                
                //Nombre de la capa
                var a = "";
                for ( index in layerGroup ) {
                    if ( layerGroup.hasOwnProperty(index) ) {
                        var arrIndex = index.split("|^");
                        if ( ext[0] === arrIndex[0] ) {
                            a = arrIndex[1];
                        }
                    }
                }

                var objData = arrObj[1].split("[{chars}]");
                var eData = arrObj[1].split("___");

                if (ext[1] === "poli" || ext[1] === "circle") {

                    itemSet = objData[1];
                } else if (ext[1] === "punto") {

                    //var eData = n.split("___");
                    var nPipe = {};
                    if (objData[1].indexOf("|") >= 0) {
                        nPipe = objData[1].split("|");
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
                    } else if ($.trim(eData[1]) === "") {
                        //Marcador pot defecto Google Maps
                        itemSet = "undefined";
                    } else if (nPipe.length >= 2) {
                        itemSet = nMarker + "|" + nPipe[1] + "|" + nPipe[2];
                        nMarker++;
                    }
                }
                capas += "[{layer}]"
                        + a
                        + "|~"
                        + arrObj[0]
                        + "|^"
                        + objData[0]
                        + "[{chars}]"
                        + itemSet;
            }
        }
        
        //Bloquear boton de guardado
        $("#saveProject").prop("disabled", true);

        var dataObject = "action=saveObject&proyecto="
                + $("#proyecto").val()
                + "&capas=" + capas.substring(9)
                + "&keyProject=" + $("#proIdEdit").val();

        $.ajax({
            type: "POST",
            url: "geo.main.php",
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
    
    //Color picker control
    $("#pickerPolyBack").colpick({
	layout:'hex',
	submit:0,
	colorScheme:'dark',
	onChange:function(hsb,hex,rgb,el,bySetColor) {
		$(el).css('border-color','#'+hex);
		// Fill the text box just if the color was set using the picker, 
                // and not the colpickSetColor function.
		if(!bySetColor) $(el).val(hex);
                $( "#" + $(el).attr("title") ).css("background-color", '#'+hex);
	}
    }).keyup(function(){
            $(this).colpickSetColor(this.value);
    });
    
    $("#pickerPolyBack_edit").colpick({
	layout:'hex',
	submit:0,
	colorScheme:'dark',
	onChange:function(hsb,hex,rgb,el,bySetColor) {
		$(el).css('border-color','#'+hex);
		// Fill the text box just if the color was set using the picker, 
                // and not the colpickSetColor function.
		if(!bySetColor) $(el).val(hex);
                $( "#" + $(el).attr("title") ).css("background-color", '#'+hex);
	}
    }).keyup(function(){
            $(this).colpickSetColor(this.value);
    });
    
    $("#pickerPolyLine").colpick({
	layout:'hex',
	submit:0,
	colorScheme:'dark',
	onChange:function(hsb,hex,rgb,el,bySetColor) {
		$(el).css('border-color','#'+hex);
		// Fill the text box just if the color was set using the picker, 
                // and not the colpickSetColor function.
		if(!bySetColor) $(el).val(hex);
                $( "#" + $(el).attr("title") + "Mapx" ).css("border-color", '#'+hex);
	}
    }).keyup(function(){
            $(this).colpickSetColor(this.value);
    });
    
    $("#pickerPolyLine_edit").colpick({
	layout:'hex',
	submit:0,
	colorScheme:'dark',
	onChange:function(hsb,hex,rgb,el,bySetColor) {
		$(el).css('border-color','#'+hex);
		// Fill the text box just if the color was set using the picker, 
                // and not the colpickSetColor function.
		if(!bySetColor) $(el).val(hex);
                $( "#" + $(el).attr("title") + "Mapx_edit" ).css("border-color", '#'+hex);
	}
    }).keyup(function(){
            $(this).colpickSetColor(this.value);
    });
    
    
    $( "#sliderPolyOpac" ).slider({
        value:0,
        min: 0,
        max: 0.99,
        step: 0.01,
        slide: function( event, ui ) {
            $("#" + $(this).attr("title")).css("opacity", ui.value);
        }
    });
    
    $( "#sliderPolyOpac_edit" ).slider({
        value:0,
        min: 0,
        max: 0.99,
        step: 0.01,
        slide: function( event, ui ) {
            $("#" + $(this).attr("title")).css("opacity", ui.value);
        }
    });
    
    //Marcador
    $("#pickerMarkBack").colpick({
	layout:'hex',
	submit:0,
	colorScheme:'dark',
	onChange:function(hsb,hex,rgb,el,bySetColor) {
		$(el).css('border-color','#'+hex);
		// Fill the text box just if the color was set using the picker, 
                // and not the colpickSetColor function.
		if(!bySetColor) $(el).val(hex);
                
                $(".newMarkerBackground").css(
                        "background-color", 
                        "#" + $("#pickerMarkBack").val()
                    );
	}
    }).keyup(function(){
            $(this).colpickSetColor(this.value);
    });
    
    $("#pickerMarkBack_edit").colpick({
	layout:'hex',
	submit:0,
	colorScheme:'dark',
	onChange:function(hsb,hex,rgb,el,bySetColor) {
		$(el).css('border-color','#'+hex);
		// Fill the text box just if the color was set using the picker, 
                // and not the colpickSetColor function.
		if(!bySetColor) $(el).val(hex);
                
                $(".newMarkerBackground").css(
                        "background-color", 
                        "#" + $("#pickerMarkBack_edit").val()
                    );
	}
    }).keyup(function(){
            $(this).colpickSetColor(this.value);
    });
    
    //Click en marcador por defecto o numerico
    $('[name="iconSelect"]').click(function (){
        if ( $(this).val() === "default" ) {
            $(".newMarkerBackground").css("background-color", "#F7584C");
        }
        if ( $(this).val() === "numeric" ) {
            $(".newMarkerBackground").css(
                        "background-color", 
                        "#" + $("#pickerMarkBack").val()
                    );
        }
    });
    
    $('[name="iconSelect_edit"]').click(function (){
        if ( $(this).val() === "default" ) {
            $(".newMarkerBackground").css("background-color", "#F7584C");
        }
        if ( $(this).val() === "numeric" ) {
            $(".newMarkerBackground").css(
                        "background-color", 
                        "#" + $("#pickerMarkBack_edit").val()
                    );
        }
    });
    
    //Botones ocultos
    $(".btn_drawSet").hide();
    
    $( "#draw" ).button({
      icons: {
        primary: "ui-icon-locked"
      },
      text: "Dibujar Capa"
    });
    
    //Demo poligono, valores iniciales
    $("#polyDemoCreate")
            .css("opacity", $( "#sliderPolyOpac" ).slider( "value" ) );
    $("#polyDemoCreateMapx")
            .css("border-style", "solid" );
    $("#polyDemoCreateMapx")
            .css("border-color", $( "#sliderPolyLine" ).slider( "value" ) );
    $("#polyDemoCreateMapx")
            .css("border-width", $( "#polyLineCreate" ).val() );
    
    $("#polyDemoCreate_edit")
            .css("opacity", $( "#sliderPolyOpac_edit" ).slider( "value" ) );
    $("#polyDemoCreateMapx_edit")
            .css("border-style", "solid" );
    $("#polyDemoCreateMapx_edit")
            .css("border-color", $( "#sliderPolyLine_edit" ).slider( "value" ) );
    $("#polyDemoCreateMapx_edit")
            .css("border-width", $( "#polyLineCreate_edit" ).val() );
    
    //Linea de poligono
    $("#polyLineCreate").change(function (){
        $("#polyDemoCreateMapx")
            .css("border-width", $( this ).val() + "px" );
    });
    $("#polyLineCreate_edit").change(function (){
        $("#polyDemoCreateMapx_edit")
            .css("border-width", $( this ).val() + "px" );
    });
    
    $( "#tabs" ).tabs();
    $( "#addressTabs" ).tabs();
    $( "#accordion" ).accordion({
        heightStyle: "content",
        collapsible: true,
        autoHeight: false,
        navigation: true
    });
        
    //Grid de proyectos creados
    $(".flexme4").flexigrid({
        url : 'listas/geo.proyectos.php',
        dataType : 'json',
        colModel : [
            {
                display : 'ID',
                name : 'id',
                width : 10,
                sortable : true,
                align : 'center',
                hide: true
            }, {
                display : 'Nro',
                name : 'inc',
                width : 30,
                sortable : true,
                align : 'center'
            }, {
                display : 'Proyecto',
                name : 'nombre',
                width : 150,
                sortable : true,
                align : 'left'
            }, {
                display : 'Creado',
                name : 'fec_creacion',
                width : 140,
                sortable : true,
                align : 'left'
            }, {
                display : 'Capas',
                name : 'btn',
                width : 50,
                sortable : true,
                align : 'center',
                process: cellAction
            }
        ],
        buttons : [ 
            /*{
                name : 'Eliminar',
                bclass : 'delete',
                onpress : projectGrid
            }
            ,*/
            {
                separator : true
            }
            ,
            {
                name : 'Limpiar',
                bclass : 'clean',
                onpress : projectGrid
            }
            ,
            {
                separator : true
            }
        ],
        searchitems : [
            {
                display : 'Proyecto',
                name : 'nombre',
                isdefault : true
            }, {
                display : 'Fecha creacion',
                name : 'fec_creacion'
            }
        ],
        sortname : "iso",
        sortorder : "asc",
        usepager : true,
        useRp : true,
        rp : 10,
        showTableToggleBtn : true,
        showToggleBtn: false,
        width : 400,
        height : 175
    });
    
    /**
     * Click en un boton de la fila,
     * retorna el class de la imagen
     * 
     * @param {type} celDiv la celda
     * @param {type} id el id de la celda
     * @returns {Boolean}
     */
    function cellAction(celDiv,id){        
        $(celDiv).click(
          function(){
              var cell = $(this)[0].innerHTML;
              var attr = $(cell).attr("class");
              
              //ID del proyecto
              $("#proIdEdit").val(id);
              
              //Mostrar capas del proyecto
              if ( attr === 'showLayer' ) {
                  //$("a [href='#tabs-2'").click();
                  //$(".currentProject").click();
                  showProjectLayer();
                  $(".currentProject").click();
              }
          }
        );
        return true;
    }

    function projectGrid(com, grid) {
        if (com === 'Eliminar') {
            var conf = confirm(
                    '¿Eliminar proyecto: ' 
                    + $('.trSelected td', grid)
                        .next("td:eq(1)")
                        .contents()
                        .text() 
                    + '?');
            if(conf){
                $.each($('.trSelected', grid),
                    function(key, value){
                        $.post('example4.php', { Delete: value.firstChild.innerText}
                            , function(){
                                // when ajax returns (callback), update the grid to refresh the data
                                $(".flexme4").flexReload();
                        });
                });    
            }
        } else if (com === 'Limpiar') {
            $("#clearAll").click();
        }
    }


    function showProjectLayer(){
        //Limpiar bloque de capas del proyecto
        $("#currentProject").html("");
                
        var idProject = $("#proIdEdit").val();

        var htmlProjectHeader = "<div style=\"display: table;\">"
                + "<div style=\"display: table-row;\">"
                + "<div style=\"display: table-cell; text-align: center\">Capa</div>"
                + "<div style=\"display: table-cell; text-align: center\">Editar</div>"
                + "<div style=\"display: table-cell; text-align: center\">Drop</div>"
                + "<div style=\"display: table-cell; text-align: center\">Show</div>"
                + "<div style=\"display: table-cell; text-align: center\">Flick</div>"
                + "</div>";
        var htmlProjectBody = "";

        var dataObjects = "action=getProjectLayers&id=" + idProject;
        $.ajax({
            type: "POST",
            url: "geo.main.php",
            data: dataObjects,
            dataType: 'json',
            success: function(datos) {
                //Id de la capa
                var keyLayerId;
                

                $.each(datos, function(key, value) {
                    //Layer ID
                    keyLayerId = value.layer_id
                            + "___"
                            + value.tipo
                            + "___"
                            + value.origen;
                    //Estilos de la capa
                    //layerStyle[keyLayerId] = value.estilo;

                    htmlProjectBody += "<div style=\"display: table-row;\">"
                            + "<div id=\"" + keyLayerId + "\" style=\"display: table-cell;\" class=\"rowEditLayer\">"
                            + "<a href=\"edit\" title=\"" + keyLayerId + "\" class=\"onProjectLayer\">"
                            + value.layer
                            + "</a></div>"
                            + "<div id=\"" + keyLayerId + "\" style=\"display: table-cell;\" class=\"rowEditLayer\">"
                            + "<a href=\"editTools\" title=\"" + keyLayerId + "\" class=\"showEditTools\">"
                            + "Editar"
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

                    //Loading
                    $("body").addClass("loading");

                    if (action === "drop") {

                        for (key in mapObjects) {
                            if (mapObjects.hasOwnProperty(key)) {
                                //Keys coinciden, eliminar elemento
                                if (key.substring(0, keyLayer.length) === keyLayer) {
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

                    } else if (action === "edit") {
                        //Editar layer
                        var tipo = keyLayer.split("___");
                        //Modal "loading"
                        //$("body").addClass("loading");

                        /*
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
                        */
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
                            type: "POST",
                            url: "geo.main.php",
                            data: dataObjects,
                            dataType: 'json',
                            success: function(datos) {
                                polygonCoords = [];

                                //Marcar capa seleccionada
                                $(".hideShowLayer[value='" + keyLayer + "']").prop("checked", true);
                                
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
                                            strokeColor: '#' + poliColor[2],
                                            strokeOpacity: 0.8,
                                            strokeWeight: poliColor[3],
                                            fillColor: '#' + poliColor[0],
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
                        var layerCss = "";

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
                
                //Mostrar herramientas de diseño de elementos
                $(".showEditTools").click(function (event){
                    event.preventDefault();
                    
                    var title = $(this).attr("title");
                    var arrTitle = title.split("___");
                    
                    for (key in layerGroup) {
                        //Capa cargada en el arreglo
                        if ( layerGroup.hasOwnProperty(key) 
                                && key.indexOf(title) >= 0 ) {
                            if (arrTitle[1] === "punto") {
                                $( "#estilo_poligono_edit" ).dialog( "close" );
                                $( "#estilo_punto_edit" ).dialog( "open" );

                            } else {
                                $( "#estilo_punto_edit" ).dialog( "close" );
                                $( "#estilo_poligono_edit" ).dialog( "open" );                        
                            }
                        } else {
                            alert("La capa no ha sido cargada aun."
                                    + "Haga click sobre el nombre de la capa");
                        }
                    }
                    
                });

            }
        });
    }
    
    
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
        
    $( "#estilo_punto_edit" ).dialog({
        autoOpen: false,
        width:370
    });
    
    $( "#estilo_poligono_edit" ).dialog({
        autoOpen: false,
        width:370
    });
    
    
});
