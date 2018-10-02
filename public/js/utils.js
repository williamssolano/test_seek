/**
 * 
 * Utilitarios Javascript
 * 
 */

/**
 * Genera un color aleatorio
 * 
 * @returns {String}
 */
function getRandomColor() {
    var hex = Math.floor(Math.random() * 0xFFFFFF);
    return "#" + ("000000" + hex.toString(16)).substr(-6);
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
 * Retorna una cadena con ceros delante
 * 
 * @param {type} num El numero a formatear
 * @param {type} size El tamaño final de la cadena con ceros
 * @returns {String|pad.s}
 */
function pad(num, size) {
    //Via http://stackoverflow.com/questions/2998784/how-to-output-integers-with-leading-zeros-in-javascript
    var s = num + "";
    while (s.length < size)
        s = "0" + s;
    return s;
}

/**
 * Retorna los valores seleccionados 
 * de un elemento multiselect (jquery plugin)
 * separados por comas
 * 
 * @param {String} selector . / # / [vacio]
 * @param {String} element nombre del class, id o etiqueta
 * @returns {getMultiSelect.searchItem|String} Cadena de valores
 */
function getMultiSelect(selector, element) {
    try {
        if ($.trim(element) === "")
        {
            throw "[show]No se encuentra el elemento";
        }

        var searchItem = "";
        var itemsChecked = $(selector + element)
                .multiselect("getChecked")
                .map(function() {
                    return this.value;
                }).get();

        //Cadena de elementos a buscar
        $.each(itemsChecked, function() {
            searchItem += "," + this;
        });
        searchItem = searchItem.substring(1);

        return searchItem;

    } catch (e) {
        errorMessage(e);
    }
}

/**
 * recibe yyyy/mm/dd, dd/mm/yyyy, yyyy-mm-dd
 * @param {type} formato
 * @returns {String} Fecha según formato
 */
function getFechaActual(formato) {
    var currentTime = new Date();
    var month = parseInt(currentTime.getMonth() + 1);
    month = month <= 9 ? "0" + month : month;
    var day = currentTime.getDate();
    day = day <= 9 ? "0" + day : day;
    var year = currentTime.getFullYear();
    switch (formato) {
        case 'dd/mm/yyyy':
            return day + "/" + month + "/" + year;
            break;
        case 'yyyy/mm/dd':
            return year + "/" + month + "/" + day;
            break;
        case 'yyyy-mm-dd':
            return year + "-" + month + "-" + day;
            break;
        default:
            return year + "-" + month + "-" + day;
    }
}


function validaDni(e, id) {
    var tecla = (document.all) ? e.keyCode : e.which;//captura evento teclado
    if (tecla == 8 || tecla == 0)
        return true;//8 barra, 0 flechas desplaz
    if ($('#' + id).val().length == 8)
        return false;
    var patron = /\d/; // Solo acepta números
    var te = String.fromCharCode(tecla);
    return patron.test(te);
}

function validaLetras(e) { // 1
    var tecla = (document.all) ? e.keyCode : e.which; // 2
    if (tecla == 8 || tecla == 0)
        return true;//8 barra, 0 flechas desplaz
    var patron = /[A-Za-zñÑáéíóúÁÉÍÓÚ\s]/; // 4 ,\s espacio en blanco, patron = /\d/; // Solo acepta números, patron = /\w/; // Acepta números y letras, patron = /\D/; // No acepta números, patron =/[A-Za-z\s]/; //sin ñÑ
    var te = String.fromCharCode(tecla); // 5
    return patron.test(te); // 6
}

function validaAlfanumerico(e) { // 1
    var tecla = (document.all) ? e.keyCode : e.which; // 2
    if (tecla == 8 || tecla == 0 || tecla == 46)
        return true;//8 barra, 0 flechas desplaz
    var patron = /[A-Za-zñÑáéíóúÁÉÍÓÚ@.,_\-\s\d]/; // 4 ,\s espacio en blanco, patron = /\d/; // Solo acepta números, patron = /\w/; // Acepta números y letras, patron = /\D/; // No acepta números, patron =/[A-Za-z\s]/; //sin ñÑ
    var te = String.fromCharCode(tecla); // 5
    return patron.test(te); // 6
}

function validaNumeros(e) { // 1
    var tecla = (document.all) ? e.keyCode : e.which; // 2
    if (tecla == 8 || tecla == 0 || tecla == 46)
        return true;//8 barra, 0 flechas desplaz
    var patron = /\d/; // Solo acepta números
    var te = String.fromCharCode(tecla); // 5
    return patron.test(te); // 6
}