
var map;
var data_polygon = "";
var polygonCoords = [];
var markers = [];
var markerArray = [];
var polygonArray = [];
var bounds;
var capasArray = [];
var polygonObject;
var layerStyle = new Array();
var mapObjects = new Array();
var projectLayers = new Array();

//Variables funcionales
var geoVal;

//Tamaño de objeto javascript
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

//Inicializar Google Maps
function initialize() {
    bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        zoom: 10
    };
    map = new google.maps.Map(document.getElementById('content'),
            mapOptions);

    // Try HTML5 geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude,
                    position.coords.longitude);
            /*
             var infowindow = new google.maps.InfoWindow({
             map: map,
             position: pos,
             content: 'Location found using HTML5.'
             });
             */
            map.setCenter(pos);
        }, function() {
            handleNoGeolocation(true);
        });
    } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
    }
}


function handleNoGeolocation(errorFlag) {
    if (errorFlag) {
        var content = 'Error: The Geolocation service failed.';
    } else {
        var content = 'Error: Your browser doesn\'t support geolocation.';
    }

    var options = {
        map: map,
        position: new google.maps.LatLng(-12.033284, -77.0715493),
        content: content
    };

    //var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
    map.setZoom(12);
}

function polygonDo(polygon) {
    polygonObject = polygon;
    //Opciones de edicion poligono
    $("#colorPickerPoligonoEdit").val(polygon.fillColor);

    $.magnificPopup.open({
        items: {
            src: '#polygonOptions', // can be a HTML string, jQuery object, or CSS selector
            type: 'inline'
        }
    });
    //Caracteristicas del color picker
    $(".simpleColorDisplay").css("width", "100px");
    $(".simpleColorDisplay").css("height", "30px");
    $(".simpleColorDisplay").css("background-color", polygon.fillColor);
    $(".simpleColorDisplay").html(polygon.fillColor);
    $("#box").css("background-color", polygon.fillColor);

}

google.maps.event.addDomListener(window, 'load', initialize);

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
        if (event.which == 13) {
            $("#menu").toggle();
        }
    });

    //Evitar que width del menu oculte el selector de color
    $(".simpleColorDisplay").click(function() {
        $(".simpleColorChooser").css("top", "22px");
        $(".simpleColorChooser").css("left", "-80px");
        $(".simpleColorChooser").css("z-index", "1000");
    })


    //Guardar cambios realizados al poligono
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

        //Ocultar o mostrar bloque de estilos
        $(".estiloItem").hide();
        $("#estilo_" + geoVal[1]).show();

        data_content = "action=getGeoDedependencia&elemento_id=" + geoVal[0] + "&origen=" + origen;
        $.ajax({
            type: "POST",
            url: "georeferencia.request.php",
            data: data_content,
            success: function(datos) {
                $("#geo_response").html(datos);

                $(".geo_item").change(function() {
                    var title = $(this).attr("title");
                    var call = title.split("_");
                    var dep = "";
                    var itemId;

                    if ($(this).val() != "") {
                        itemId = $(this).attr("id");

                        var itemIndex = call.indexOf(itemId.substring(4));

                        //$(".ui-multiselect").remove();

                        $.each(call, function(id, val) {
                            if (id > itemIndex) {
                                $('#geo_' + val).find('option').remove()
                            }
                        });

                        $.each(call, function(id, val) {

                            if ($("#geo_" + val + " option").length > 0) {
                                dep += "___" + $("#geo_" + val).val();
                            }

                            if ($("#geo_" + val + " option").length == 0) {

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

                                            $("#geo_" + val).multiselect();
                                            $("#geo_" + val).multiselect('refresh');
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

    //Dibujar poligono o punto
    $("#btnDrawItem").click(function() {
        geoVal = $("#geo_elemento").val().split("_");
        //var origen = $("#geo_elemento option:selected").text();
        var origen = geoVal[2];

        var title = $("#geo_" + origen).attr("title");
        var call = title.split("_");
        var items = "";
        var dep = "";

        //geoVal = $("#geo_elemento").val().split("_");

        //Color fijo o aleatorio
        var colorType = $('input[name=colorSelect]:checked').val();
        var colorSelected;

        var icontype = $('input[name=iconSelect]:checked').val();
        var iconSelected;

        var colorLineSelected;

        var timeStamp = new Date().getTime();


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

        if (geoVal[1] == 'poligono') {
            $.each(items, function(key, value) {
                //Enviar peticion y respuesta json
                data_polygon = "action=drawPolygon&origen=" + origen + "&data=" + dep + "&item=" + value;
                $.ajax({
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
                            //console.log("KO Checkbox");
                            colorLineSelected = colorSelected;
                        }

                        // Construct the polygon.
                        polygon = new google.maps.Polygon({
                            paths: polygonCoords,
                            strokeColor: colorLineSelected,
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: colorSelected,
                            fillOpacity: $(".simpleColorDisplay").css("opacity")
                        });

                        var valueToPush = {};
                        //valueToPush["tipo"]     = "poligono";
                        //valueToPush["origen"]   = origen;
                        //valueToPush["dep"]      = dep;
                        //valueToPush["name"]     = value;                            
                        valueToPush["objeto"] = polygon;
                        mapObjects[timeStamp + "___poli___" + origen + "|^" + dep + "___" + value] = polygon;

                        //Agregar capa al proyecto
                        projectLayers[timeStamp + "___poli___" + origen + "|^" + dep] = origen + " en " + dep;

                        //console.log(mapObjects);
                        valueToPush = null;
                        /*
                         var dataObject = "action=saveObject&dep=" 
                         + dep 
                         + "&origen=" + origen 
                         + "&item=" + value 
                         + "&tipo=poligono&obj=" + JSON.stringify(polygon)
                         $.ajax({
                         type: "POST",
                         url: "georeferencia.request.php",
                         data: dataObject,
                         dataType: 'json',
                         success: function(datos){
                         console.log(datos);
                         }
                         });
                         */
                        google.maps.event.addListener(polygon, 'click', function() {
                            polygonDo(this);
                        });

                        polygon.setMap(map);
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
                    }
                });
            });
        } else if (geoVal[1] == 'punto') {
            var markerNumber = 1;
            $.each(items, function(key, value) {
                //Enviar peticion y respuesta json
                data_polygon = "action=drawMarker&origen=" + origen + "&data=" + dep + "&item=" + value;
                $.ajax({
                    type: "POST",
                    url: "georeferencia.request.php",
                    data: data_polygon,
                    dataType: 'json',
                    success: function(datos) {
                        //console.log(this.coord_x);
                        $.each(datos, function() {
                            var pt = new google.maps.LatLng(this.coord_y, this.coord_x);
                            bounds.extend(pt);
                            markers.push(pt);

                            if (icontype == "default") {
                                iconSelected = "";
                            } else if (icontype == "numeric") {
                                iconSelected = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + markerNumber + "|" + $("#colorPickerPunto").val().substring(1) + "|000000";
                            }

                            var marker = new google.maps.Marker({
                                position: pt,
                                map: map,
                                icon: iconSelected
                            });
                            marker.metadata = {type: "point", id: markerNumber};

                            var valueToPush = {};
                            //valueToPush["tipo"]     = "poligono";
                            //valueToPush["origen"]   = origen;
                            //valueToPush["dep"]      = dep;
                            //valueToPush["name"]     = value;                            
                            //valueToPush["objeto"]   = polygon;
                            mapObjects[timeStamp + "___punto___" + origen + "|^" + dep + "___" + value] = marker;

                            //Agregar capa al proyecto
                            projectLayers[timeStamp + "___punto___" + origen + "|^" + dep] = origen + " en " + dep;

                            //console.log(mapObjects);
                            valueToPush = null;


                            /*
                             var dataObject = "action=saveObject&dep=" 
                             + dep 
                             + "&origen=" + origen 
                             + "&item=" + value 
                             + "&tipo=punto&obj=" + JSON.stringify(polygon)
                             $.ajax({
                             type: "POST",
                             url: "georeferencia.request.php",
                             data: dataObject,
                             dataType: 'json',
                             success: function(datos){
                             console.log(datos);
                             }
                             });
                             */

                            markerArray.push(marker);
                            marker.setMap(map);
                            markerNumber++;
                        });
                        map.fitBounds(bounds);
                    }
                });
            });
        }
        //console.log(mapObjects);
    });

    $("#btnSaveLayout").click(function(event) {

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
        for (key in mapObjects) {
            if (mapObjects.hasOwnProperty(key)) {

                var ext = key.split("___");
                if (ext[1] == "poli") {
                    itemSet = mapObjects[key].fillColor
                            + "___"
                            + mapObjects[key].fillOpacity
                            + "___"
                            + mapObjects[key].strokeColor
                } else if (ext[1] == "punto") {
                    var iconSet = mapObjects[key].icon.split("&");
                    itemSet = iconSet[1];
                }

                capas += "," + key + "[{chars}]" + itemSet;
            }
        }


        var dataObject = "action=saveObject&proyecto="
                + $("#proyecto").val()
                + "&capas=" + capas.substring(1)
                + "&keyProject=" + $("#proIdEdit").val();
        $.ajax({
            type: "POST",
            url: "georeferencia.request.php",
            data: dataObject,
            dataType: 'json',
            success: function(datos) {
                alert(datos.msg);
            }
        });
    });

    //Elimina todos los elementos del mapa y de memoria (script)
    $("#btnClearItem").click(function() {
        for (var i = 0; i < markerArray.length; i++) {
            markerArray[i].setMap(null);
        }
        for (var i = 0; i < polygonArray.length; i++) {
            polygonArray[i].setMap(null);
        }
        //Limpiar limites del mapa
        bounds = new google.maps.LatLngBounds();
        //Limpiar elementos del mapa
        mapObjects = new Array();
        //Limpiar elementos del proyecto
        projectLayers = new Array();
        //Limpiar estilos de las capas
        layerStyle = new Array();
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

                    event.preventDefault();
                    //Project Key
                    var idProject = $(this).attr("href");
                    //Poblar Key proyecto
                    $("#proIdEdit").val(idProject);
                    //Nombre del proyecto en el bloque de edición
                    $(".projectTitle").html($(".loadProject[href=" + idProject + "]").html());

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
                                        strokeWeight: 2,
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
                                            + this.origen
                                            + "|^"
                                            + this.capa
                                    ] = this.chars;

                                    google.maps.event.addListener(polygon, 'click', function() {
                                        polygonDo(this);
                                    });

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

                                        if (itemIcon == "undefined") {
                                            iconSelected = "";
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
                                                + puntoOrigen
                                                + "|^"
                                                + puntoCapa
                                        ] = itemIcon;

                                        markerArray.push(marker);
                                        marker.setMap(map);
                                        marker = null;
                                        markerNumber++;

                                    });
                                    map.fitBounds(bounds);

                                }
                            });
                        }
                    });

                });
            }
        });
    });

    $(".currentProject").click(function(event) {
        $("#currentProject").html("");

        //Dividiendo informacion
        var pjLayers = new Array();
        var pjOrigenData;
        var pjOrigen;
        var pjData;
        var pjLayerArray;
        var pjLayer;
        var htmlProject = "<div style=\"display: table;\">"
                + "<div style=\"display: table-row;\">"
                + "<div style=\"display: table-cell; text-align: center\">Capa</div>"
                + "<div style=\"display: table-cell; text-align: center\">Eliminar</div>"
                + "</div>";

        for (key in projectLayers) {
            if (projectLayers.hasOwnProperty(key)) {

                var formattedLayer = projectLayers[key];
                formattedLayer = formattedLayer.replace("___", ", ");

                htmlProject += "<div style=\"display: table-row;\">"
                        + "<div id=\"" + key + "\" style=\"display: table-cell;\" class=\"rowEditLayer\">"
                        + "<a href=\"edit\" title=\"" + key + "\" class=\"onProjectLayer\">"
                        + formattedLayer
                        + "</a></div>"
                        + "<div style=\"display: table-cell; text-align: center\">"
                        + "<a href=\"drop\" title=\"" + key + "\" class=\"onProjectLayer\">[X]</a>"
                        + "</div>"
                        + "</div>";
                /*
                 $("#currentProject").append(
                 "<div id=\"" + key + "\">" 
                 + projectLayers[key] 
                 + "<a href=\"drop\" title=\"" + key + "\" class=\"onProjectLayer\">[X]</a>" 
                 + "<a href=\"edit\" title=\"" + key + "\" class=\"onProjectLayer\">[E]</a>"
                 + "</div>");*/
            }
        }
        htmlProject += "</div>";
        $("#currentProject").append(htmlProject);

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
                        } else {
                            //console.log(mapObjects);
                        }
                    }
                }
                //Elimina elemento HTML
                $("div#" + keyLayer).remove();
                $(".currentProject").click();

            } else if (action == "edit") {
                //Editar layer
                var tipo = keyLayer.split("___");
                var editZone = "";

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
                    if (layerStyle[keyLayer] === "undefined") {
                        markerColor = "F7584C";
                        $("input[name=iconSelectEdit][value='default']").prop("checked", true);
                    } else {
                        estilosLayer = layerStyle[keyLayer].split("|");
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

                } else if (tipo[1] == "poli") {

                    /**
                     * 
                     * Estilos de la capa seleccioanda
                     * 
                     */
                    var estilosLayer = layerStyle[keyLayer].split("___");
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
                    });

                    $("#estilo_poligono_edit").show();
                }
            }
        });

    });

    //Guardar cambios en los poligonos modificados
    $("#savePoli").click(function(event) {
        var colorFondo;
        var opacidad;
        var colorLinea;
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

                    //Agregar objeto al mapa
                    mapObjects[ key ].setMap(map);
                }
            }
        }

        /*
         //Objetos del proyecto
         for (key in projectLayers) {
         if (projectLayers.hasOwnProperty(key)) {
         //Keys coinciden, eliminar elemento
         if( key.substring(0, grupo.length) == grupo ) {
         
         //Cambiar propiedades
         projectLayers[ key ].fillColor     = colorFondo;
         projectLayers[ key ].opacity       = opacidad;
         projectLayers[ key ].strokeColor   = colorLinea;
         }
         }
         }
         */

    });

    //Guardar cambios en los puntos modificados
    $("#savePunto").click(function(event) {
        var grupo = $("#keyEdit").val();
        var iconSelected;
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
                //Keys coinciden, eliminar elemento
                if (key.substring(0, grupo.length) == grupo) {
                    //Icono del elemento
                    if (icontype == "default") {
                        iconSelected = "";
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

                    //Eliminar objeto del mapa
                    mapObjects[ key ].setMap(null);

                    //Cambiar propiedades
                    mapObjects[ key ].icon = iconSelected;

                    //Agregar objeto al mapa
                    mapObjects[ key ].setMap(map);
                }
            }
        }
        /*
         //Objetos del proyecto
         for (key in projectLayers) {
         if (projectLayers.hasOwnProperty(key)) {
         //Keys coinciden, eliminar elemento
         if( key.substring(0, grupo.length) == grupo ) {
         
         //Cambiar propiedades
         projectLayers[ key ].fillColor     = colorFondo;
         projectLayers[ key ].opacity       = opacidad;
         projectLayers[ key ].strokeColor   = colorLinea;
         }
         }
         }
         */
    });

    //Boton de guardar cambios en la edicion de poligonos y puntos
    $(".saveAllEditLayer").click(function(event) {
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