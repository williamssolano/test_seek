/**
 * jQuery required
 */
var neach;

$(document).ready(function (){
    /**
     * Direcciones
     */

     //Color picker control
    $("#pickerAddressLine").colpick({
    layout:'hex',
    submit:0,
    colorScheme:'dark',
    onChange:function(hsb,hex,rgb,el,bySetColor) {
        $(el).css('border-color','#'+hex);
        // Fill the text box just if the color was set using the picker, 
                // and not the colpickSetColor function.
        if(!bySetColor) $(el).val(hex);
    }
    }).keyup(function(){
            $(this).colpickSetColor(this.value);
    });
    
    //Carga de archivos con direcciones por georeferenciar
    $("#updirfile").click(function() {
        $("#address_result").html("");
        uploadTmpFile();
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

    //Busqueda de direcciones por tramos
    $("#geo_trama_form").submit(function (event){
        event.preventDefault();
        var datos = $(this).serialize();
        
        //Validacion
        if ( $.trim( $("#geo_trama_calle").val() ) === "" ) {
            alert("Debe ingresar nombre de la calle/av/jr consultada.");
            $("#geo_trama_calle").css("background-color", "#F6CECE");
            $("#geo_trama_calle").focus();
            return false;
        }

        //Limpiar limites del mapa
        bounds = new google.maps.LatLngBounds();

        //Loading
        $("body").addClass("loading");

        $.ajax({
            type: "POST",
            url: "geo.main.php",
            data: "action=geoTramaAddress&" + datos,
            dataType: 'json',
            error: function(data) {
                console.log(data);
            },
            success: function(data) {
                addressToMap(
                    data, 
                    $("#geo_trama_distrito option:selected").text(), 
                    $("#geo_trama_calle").val(), 
                    $("#geo_trama_numero").val(),
                    false
                );
            }
        });

    });
    
    //Archivo de direcciones, busqueda masiva
    $("#faddressmass").submit(function (event){
        event.preventDefault();
        //Funcion de carga masiva
        uploadAddressFile();
    });
    
});


function uploadAddressFile(){
    var inputFileImage = document.getElementById("adrsfile");
    var file = inputFileImage.files[0];
    var data = new FormData();
    var url = "geo.main.php";
    
    data.append('archivo', file);
    
    //Loading
    //$("body").addClass("loading");
    
    neach = 1;

    $.ajax({
        url: url,
        type: 'POST',
        contentType: false,
        data: data,
        processData: false,
        cache: false,
        dataType: "json",
        error: function(datos) {
            console.log("Error: " + datos);
        },
        success: function(data) {
            
            $.each(data, function(){
                var ub = this.ubigeo;
                var no = this.nombre;
                var vi = this.via;
                var nu = this.numero;
                //return false;
                $.ajax({
                    type: "POST",
                    url: "geo.main.php",
                    data: "action=geoTramaAddress&geo_trama_calle=" 
                            + $.trim(vi) 
                            + "&geo_trama_numero=" 
                            + $.trim(nu) 
                            + "&geo_trama_distrito=" + $("#geo_trama_distrito").val(),
                    dataType: 'json',
                    error: function(data) {
                        console.log(data);
                        $("body").removeClass("loading");
                    },
                    success: function(data) {
                        addressToMap(
                            data, 
                            '150100', 
                            vi, 
                            nu,
                            true
                        );
                        // Remove loading
                        if ( neach === data.length) 
                        {
                            $("body").removeClass("loading");
                        }

                        neach++;
                    }
                });
            });
            
        }
    });
    
    return true;
}

function addressToMap(data, coddis, calle, ndir, masivo){
    
    var neach = 1;    
    var newCoordIni;
    var newCoordEnd;
    var xDir;
    var yDir;
    var pt;
    var addressData = [];
    var marker;
    var markTextColor;
    var N = Number( ndir );
    
    if ( data.length === 0 && masivo === false ) 
    {
        alert("No se encontraron resultados");
        $("body").removeClass("loading");
    } else if ( data.length > 0 ) 
    {
        

        $.each(data, function(){
            polyLineCoords = [];
            
            //Coordenadas inicio y fin
            newCoordIni = new google.maps.LatLng(this.YA, this.XA);
            newCoordEnd = new google.maps.LatLng(this.YB, this.XB);

            //Punto indicador de direccion
            xDir = Number(this.XB) + ( (- Number(this.NUM_IZQ_FI) + N) * (- Number(this.XB) + Number(this.XA)) / (- Number(this.NUM_IZQ_FI) + Number(this.NUM_DER_IN)) );
            yDir = Number(this.YB) + ( (- Number(this.NUM_IZQ_FI) + N) * (- Number(this.YB) + Number(this.YA)) / (- Number(this.NUM_IZQ_FI) + Number(this.NUM_DER_IN)) );


            pt = new google.maps.LatLng(this.YA, this.XA);
            bounds.extend(pt);
            pt = new google.maps.LatLng(this.YB, this.XB);
            bounds.extend(pt);

            //Marcador solo si el numero es valido
            if ( N > 0 ) 
            {
                addressData = [];
                marker = new google.maps.Marker({
                                position: new google.maps.LatLng(yDir, xDir),
                                map: map,
                                animation: google.maps.Animation.DROP
                            });
                            
                if (coddis === '')
                {
                    coddis = this.COD_DPTO + this.COD_PROV + this.COD_DIST;
                }
                if (calle === '')
                {
                    calle = this.NOM_VIA_TR;
                }

                addressData.push( coddis );
                addressData.push( calle );
                addressData.push( N );
                addressData.push( xDir );
                addressData.push( yDir );
                google.maps.event.addListener(marker, "click", function(event) {
                    addressInfoWindow(addressData, event);
                });
            }

            //Orden visibilidad
            zIndexItem++;

            //Mostrar o no Inicio y Fin del tramo
            if( $("#showPathMarker").prop("checked") === true )
            {
                //Marcadores inicio y fin de recta
                markTextColor = textByColor("#" 
                                        + $("#pickerAddressLine")
                                        .val())
                                        .substring(1);

                marker = new google.maps.Marker({
                                position: new google.maps.LatLng(this.YA, this.XA),
                                map: map,
                                icon: googleMarktxt 
                                        + "I|" 
                                        + $("#pickerAddressLine").val() 
                                        + "|" 
                                        + markTextColor,
                                animation: google.maps.Animation.DROP,
                                zIndex: zIndexItem
                            });

                google.maps.event.addListener(marker, "click", function(event) {
                    markerPathInfoWindow(event);
                });

                marker = new google.maps.Marker({
                                position: new google.maps.LatLng(this.YB, this.XB),
                                map: map,
                                icon: googleMarktxt 
                                        + "F|" 
                                        + $("#pickerAddressLine").val() 
                                        + "|" 
                                        + markTextColor,
                                animation: google.maps.Animation.DROP,
                                zIndex: zIndexItem
                            });


                google.maps.event.addListener(marker, "click", function(event) {
                    markerPathInfoWindow(event);
                });
            }                        


            //Creando path
            polyLineCoords.push(newCoordIni);
            polyLineCoords.push(newCoordEnd);                        

            var addressPath = new google.maps.Polyline({
                path: polyLineCoords,
                geodesic: true,
                strokeColor: '#' + $("#pickerAddressLine").val(),
                strokeOpacity: 1.0,
                strokeWeight: $("#polyLineAddress").val(),
                zIndex: zIndexItem
            });

            var lineData = this;

            //Infowindow del tramo
            google.maps.event.addListener(addressPath, "click", function(event) {
                lineInfoWindow(lineData, event);
            });

            addressPath.setMap(map);
            //map.fitBounds(bounds);                        

            // Remove loading
            if ( neach === data.length && masivo === false ) 
            {
                $("body").removeClass("loading");
            }

            neach++;
        });

        map.fitBounds(bounds);
    }
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
 * Agrega un marcador de direccion en el mapa
 * 
 * @param {type} href
 * @returns {Boolean}
 */
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
            url: "geo.main.php",
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


function lineInfoWindow(polyLine, event){
    var content = "";
    
    content += '<table>';
    content += '<tr><td>COD DEP</td><td>' + polyLine.COD_DPTO + '</td></tr>';
    content += '<tr><td>COD PRO</td><td>' + polyLine.COD_PROV + '</td></tr>';
    content += '<tr><td>COD DIS</td><td>' + polyLine.COD_DIST + '</td></tr>';
    content += '<tr><td>NOM VIA</td><td>' + polyLine.NOM_VIA_TR + '</td></tr>';
    content += '<tr><td>NUM DER IN</td><td>' + polyLine.NUM_DER_IN + '</td></tr>';
    content += '<tr><td>NUM DER FI</td><td>' + polyLine.NUM_DER_FI + '</td></tr>';
    content += '<tr><td>NUM IZQ IN</td><td>' + polyLine.NUM_IZQ_IN + '</td></tr>';
    content += '<tr><td>NUM IZQ FI</td><td>' + polyLine.NUM_IZQ_FI + '</td></tr>';
    content += '<tr><td>XA</td><td>' + polyLine.XA + '</td></tr>';
    content += '<tr><td>YA</td><td>' + polyLine.YA + '</td></tr>';
    content += '<tr><td>XB</td><td>' + polyLine.XB + '</td></tr>';
    content += '<tr><td>YB</td><td>' + polyLine.YB + '</td></tr>';
    content += '</table>';

    infowindow.setPosition(event.latLng);
    infowindow.setContent(content);
    infowindow.open(self.map);
}

function addressInfoWindow(data, event){
    var content = "";
    var href = '<a href="http://maps.google.com?q='
                + data[4] 
                + ',' 
                +data[3] 
                +'" target="_blank">Go</a>';
    
    content += '<table>';
    content += '<tr><td>Distrito</td><td>' + data[0] + '</td></tr>';
    content += '<tr><td>Calle</td><td>' + data[1] + '</td></tr>';
    content += '<tr><td>Numero</td><td>' + data[2] + '</td></tr>';
    content += '<tr><td>X</td><td>' + data[3] + '</td></tr>';
    content += '<tr><td>Y</td><td>' + data[4] + '</td></tr>';
    content += '<tr><td>Ubicacion</td><td>' + href + '</td></tr>';
    content += '</table>';

    infowindow.setPosition(event.latLng);
    infowindow.setContent(content);
    infowindow.open(self.map);
}

function markerPathInfoWindow(event){
    var content = "";
    var href = '<a href="http://maps.google.com?q='
                + event.latLng.lat() 
                + ',' 
                +event.latLng.lng() 
                +'" target="_blank">Go</a>';
    
    content += '<table>';
    content += '<tr><td>X</td><td>' + event.latLng.lng() + '</td></tr>';
    content += '<tr><td>Y</td><td>' + event.latLng.lat() + '</td></tr>';
    content += '<tr><td>Ubicacion</td><td>' + href + '</td></tr>';
    content += '</table>';

    infowindow.setPosition(event.latLng);
    infowindow.setContent(content);
    infowindow.open(self.map);
}