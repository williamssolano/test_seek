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
                var itemChars, arrItemIcon;

                var puntoNombre = this.layer;
                var puntoOrigen = this.origen;
                var puntoLayer = this.layer_id;
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

                    /*
                     var newItemChars, arrItemChars;
                     if (itemIcon.indexOf("|") >= 0) {
                     arrItemChars = itemIcon.split("|");
                     if (arrItemChars.length === 3) {
                     newItemChars = "chld=|"
                     + arrItemChars[1]
                     + "|"
                     + arrItemChars[2];
                     }
                     } else {
                     newItemChars = itemIcon;
                     }
                     */
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