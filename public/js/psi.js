/**
 * Utilitarios PSI
 * @type type
 */

var Psi = {
    /**
     * Muestra un mensaje al pie de la página
     * 
     * @param String tipo "success" para OK o "danger" para ERROR
     * @param String texto El mensaje a mostrar
     * @param Int tiempo Tiempo que tarda en desaparecer el mensaje
     * @returns {undefined}
     */
    mensaje: function (tipo, texto, tiempo) {
        if(texto === undefined) {
            texto = '';
        }
        if (tipo == 'danger' && texto.length == 0) {
            texto = 'Ocurrio una interrupción en el proceso, favor de intentar nuevamente.';
        }
        $("#msj").html('<div class="alert alert-dismissable alert-' + tipo + '">' +
                '<i class="fa fa-ban"></i>' +
                '<button aria-hidden="true" data-dismiss="alert" class="close" type="button">×</button>' +
                '<b>' + texto + '</b>' +
                '</div>');
        $("#msj").effect('shake');
        $("#msj").fadeOut(tiempo);
    },
    /**
     * Genera un color aleatorio en Hexadecimal
     * 
     * @returns String Codigo de color HEX
     */
    color_aleatorio: function () {
        var hex = Math.floor(Math.random() * 0xFFFFFF);
        return "#" + ("000000" + hex.toString(16)).substr(-6);
    },
    /**
     * Retorna color de texto de acuerdo al color de fondo
     * Color de texto: Blanco o negro.
     * Recibe color en hexadecimal con '#'
     * @param {type} color
     * @returns {String}
     */
    texto_color: function (color) {
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
    },

    sweetAlertConfirm: function(text) {
        swal({
            title: "Exitoso",
            type: "success",
            text: text,
            confirmButtonText: 'OK!',
            showCancelButton: false
        });
    },

    sweetAlertError: function(text) {
        swal({
            title: 'Error!',
            text: text,
            type: 'error',
            confirmButtonText: 'OK'
        });
    }
}
