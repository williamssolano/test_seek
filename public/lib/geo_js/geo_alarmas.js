/**
 * Direcciones
 */
var tapBounds = new google.maps.LatLngBounds();
var tapMarkers = [];
var tapIntervId;
var blinkAlert = [];

/**
 * Default XY
 */
var defZonalXY = {
    ARE:new google.maps.LatLng(-16.4040523,-71.5390114),
    CHB:new google.maps.LatLng(-9.0851792,-78.5801855),
    CHY:new google.maps.LatLng(-6.7815563,-79.8490405),
    CUZ:new google.maps.LatLng(-13.5300193,-71.939249),
    HYO:new google.maps.LatLng(-12.0485093,-75.2026391),
    ICA:new google.maps.LatLng(-14.0837542,-75.7456576),
    IQU:new google.maps.LatLng(-3.7529196,-73.2833147),
    LIM:new google.maps.LatLng(-12.099119, -77.028895),
    PIU:new google.maps.LatLng(-5.1930857,-80.6668063),
    TAC:new google.maps.LatLng(-18.0228769,-70.247547),
    TRU:new google.maps.LatLng(-8.1167523,-79.0196156)
};

var numAlertaTroba = 0;

$(document).ready(function() {

    $("#hideToolsAlarma").click(function(event) {
        event.preventDefault();
        //Ocultar barra de herramientas
        $("#geo_tools").hide();
        //Redimensionar mapa
        canvasResize(true);
        //Mostrar boton de herramientas
        $("#btn_tools").show();
    });

    $("#showToolsAlarma").click(function(event) {
        event.preventDefault();
        //Ocultar barra de herramientas
        $("#geo_tools").show();
        //Redimensionar mapa y canvas
        canvasResize(false);
        //Mostrar boton de herramientas
        $("#btn_tools").hide();
    });

    //Alarma TAPs
    $("#show_alarma_tap").click(function() {
        //Si check mostrar
        if ($(this).prop("checked") === true)
        {
            trobaColor();
        } else {

        }
    });
    
    //Cambio de Zonal
    $("#zonal_alarma").change(function (){
        $("#show_alarma_tap").prop("checked", true)
        trobaColor();
    });

    //Interval
    $("#interval_alarma_tap").click(function() {
        //Si check actualizar periodicamente
        if ($(this).prop("checked") === true)
        {
            tapIntervId = setInterval(tapIntervalUpdate, 60000);
        } else {
            //Detener actualizacion
            clearInterval(tapIntervId);
        }
    });

});

function trobaColor() {
    
    polygonCoords = [];
    bounds = new google.maps.LatLngBounds();
    
    $.ajax({
        type: "POST",
        url: "geoalarma.main.php",
        data: "action=geoAlarmaTrobas&zonal=" + $("#zonal_alarma").val(),
        dataType: 'json',
        error: function(data) {
            console.log(data);
        },
        success: function(data) {

            //Limpiar lista
            $("#listaTroba").html("");
            
            //Si no hay datos, mostrar centro por defecto
            if(data.length == 0){
                map.setCenter(defZonalXY[$("#zonal_alarma").val()]);
                map.setZoom(13);
            }

            $.each(data, function() {
                var nc = this.n;
                var zonal = this.zonal;
                var nodo = this.nodo;
                var blink = this.blink;
                var troba = this.troba;
                var alarma = this.alarma;
                var color = this.color;
                var opacidad = this.opacidad;
                
                if (blink == 1)
                {
                    var myObj = {id:zonal+nodo+troba, poly: null};
                    blinkAlert.push(myObj);
                }

                var fillColor = color;
                var strokeCollor = "#1E7509";
                
                $("#listaTroba").append(
                        "<div style=\"background-color: "
                        + fillColor
                        + "\"><a href=\"javascript:void(0)\" onclick=\"listaClientes('" + zonal + "', '" + nodo + "', '" + troba + "');\">"
                        + nodo
                        + " | "
                        + troba
                        + "</a></div>"
                        );

                $.ajax({
                    type: "POST",
                    url: "geoalarma.main.php",
                    data: "action=geoTrobaArea"
                            + "&zonal=" + this.zonal
                            + "&nodo=" + this.nodo
                            + "&troba=" + this.troba,
                    dataType: 'json',
                    error: function(data) {
                        console.log(data);
                    },
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
                        
                        // Construct the polygon.                        
                        polygon = new google.maps.Polygon({
                            paths: polygonCoords,
                            strokeColor: strokeCollor,
                            strokeOpacity: 0.8,
                            strokeWeight: 1.2,
                            fillColor: fillColor,
                            fillOpacity: opacidad,
                            zIndex: zIndexItem++,
                            map: map
                        });
                        
                        $.each(blinkAlert, function(idObject, myObject){
                            if (myObject.id==zonal+nodo+troba)
                            {
                                myObject.poly = polygon;
                            }
                        });

                        google.maps.event.addListener(polygon, "click", function() {
                            //polygonDo(this, event, value, true);
                            listaClientes(zonal, nodo, troba);
                        });

                        //Muestra poligono en mapa
                        polygon.setMap(map);
                        
                        //Si no hay datos, mostrar centro por defecto
                        if(datos.length == 0){
                            map.setCenter(defZonalXY[$("#zonal_alarma").val()]);
                            map.setZoom(13);
                        } else {
                            //Recalcula visibilidad de mapa por limites coord.
                            map.fitBounds(bounds);
                        }

                        polygon = null;
                        polygonCoords = [];
                    }
                });

            });
            //blink alertados
            setInterval(doBlinkAlert, 1000);
        }
    });
}

function tapIntervalUpdate() {
    $("#show_alarma_tap").prop("checked", false);

    tapMarkers = [];
    tapBounds = new google.maps.LatLngBounds();
    mapInit();

    trobaColor();

    $("#show_alarma_tap").click();
}

function doBlinkAlert(){
    
    if(blinkAlert.length > 0)
    {
        $.each(blinkAlert, function (id, obj){
            if (typeof this === 'object')
            {
                var element = obj.poly;

                if (typeof element === 'object')
                {
                    var d = new Date();
                    var n = d.getSeconds();
                    if (n % 2 === 0) {
                        element.setMap(null);
                    } else {
                        element.setMap(map);
                    }
                }
            }
        });
    }
    
    
}

function listaClientes(zonal, nodo, troba) {

    if (tapMarkers.length > 0)
    {
        $.each(tapMarkers, function(id, val) {
            val.setMap(null);
        });

        tapMarkers = [];
        tapBounds = new google.maps.LatLngBounds();
    }

    $.ajax({
        type: "POST",
        url: "geoalarma.main.php",
        data: "action=geoTapClientes"
                + "&zonal=" + zonal
                + "&nodo=" + nodo
                + "&troba=" + troba,
        dataType: 'json',
        error: function(data) {
            console.log(data);
        },
        success: function(datos) {
            var contenido = "<h3>"
                    + zonal
                    + " | "
                    + nodo
                    + " | "
                    + troba
                    + "&nbsp;&nbsp;<a href=\"http://www.movistar1.com:9571/cmts/alertas_down.php?nodo="+nodo+"&troba="+troba+"\" target=\"_blank\">Descarga</a>"
                    + "</h3><ol>";

            //Mostrar Taps
            $.each(datos.tap, function() {
                contenido += "<li>"
                        + this.codcli
                        + " / "
                        + this.nombres
                        + " / "
                        + this.ipaddress
                        + "</li>";
                
                var amp = this.amplificador;

                if (this.coord_x !== null && this.coord_y !== null)
                {
                    var pt = new google.maps.LatLng(
                            this.coord_y, this.coord_x
                            );
                    var tap = this.tap;
                    tapBounds.extend(pt);

                    var marker = new google.maps.Marker({
                        position: pt,
                        map: map,
                        animation: google.maps.Animation.DROP,
                        icon: "images/Tap.ico"
                    });

                    google.maps.event.addListener(marker, "click", function(event) {
                        infowindow.setPosition(pt);
                        infowindow.setContent(
                                "Zonal: " + zonal
                                + "<br>"
                                + "Nodo: " + nodo
                                + "<br>"
                                + "Troba: " + troba
                                + "<br>"
                                + "Amplificador: " + amp
                                + "<br>"
                                + "Tap: " + tap
                                );
                        infowindow.open(self.map);
                    });

                    tapMarkers.push(marker);
                }
            });

            //Mostrar Amplificadores
            $.each(datos.amp, function() {

                if (this.coord_x !== null && this.coord_y !== null)
                {
                    var pt = new google.maps.LatLng(
                            this.coord_y, this.coord_x
                            );
                    var amp = this.amplificador;
                    tapBounds.extend(pt);

                    var marker = new google.maps.Marker({
                        position: pt,
                        map: map,
                        animation: google.maps.Animation.DROP,
                        icon: "images/Amplificador.ico"
                    });

                    google.maps.event.addListener(marker, "click", function(event) {
                        infowindow.setPosition(pt);
                        infowindow.setContent(
                                "Zonal: " + zonal
                                + "<br>"
                                + "Nodo: " + nodo
                                + "<br>"
                                + "Troba: " + troba
                                + "<br>"
                                + "Amp.: " + amp
                                );
                        infowindow.open(self.map);
                    });

                    tapMarkers.push(marker);
                }
            });

            $("#detalleTroba").html("");
            $("#detalleTroba").append(contenido);

            //infowindow.setPosition(event.latLng);
            //infowindow.setContent(contenido);
            //infowindow.open(self.map);

            map.fitBounds(tapBounds);
        }
    });
}