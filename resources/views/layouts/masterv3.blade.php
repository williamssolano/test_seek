<!DOCTYPE html>
<html lang="en">

    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="token" id="token" value="{{ csrf_token() }}">
        @section('autor')
        <meta name="author" content="Telefonica">
        @show

        <link rel="shortcut icon" href="favicon.ico">

        @section('descripcion')
        <meta name="description" content="">
        @show
        <title>
            @section('titulo')
                Seek Test
            @show
        </title>

        {{ HTML::style(asset("lib/bootstrap-3.3.1/css/bootstrap.min.css")) }}
        {{ HTML::style(asset("lib/font-awesome-4.2.0/css/font-awesome.min.css")) }}
        {{ HTML::style(asset("css/master/ionicons.min.css")) }}
        {{ HTML::style(asset("lib/datatables-1.10.4/media/css/dataTables.bootstrap.css")) }}
        {{ HTML::style(asset("css/admin/admin.min.css")) }}
        {{ HTML::style(asset("css/admin/horarios.css")) }}   

        @stack('stylesheets')
        <style type="text/css">
            .edit-button {
                background-color: #fff !important;
            }
            .edit-button i {
                color: #3c8dbc !important;
            }
            .edit-button:hover{
               background-color: #3c8dbc !important; 
            }
            .edit-button:hover i{
               color: #fff !important; 
            }
            .btn-middle {
                text-align: center
            }

        </style>
    </head>

    <body class="skin-blue">
        <div id="app">
            <div id="msj" class="msjAlert"> </div>
            @include( 'layouts.admin_head' )

            <div class="wrapper row-offcanvas row-offcanvas-left">
                @include( 'layouts.admin_left' )

                <aside class="right-side">
                    @yield('contenido')
                </aside>
                

            </div><!-- ./wrapper -->
           @yield('formulario')
       </div>
        
        {{ HTML::script('lib/jquery-2.1.3.min.js') }}
        {{ HTML::script('lib/jquery-ui-1.11.2/jquery-ui.min.js') }}
        {{ HTML::script('lib/bootstrap-3.3.1/js/bootstrap.min.js') }}
        {{ HTML::script('lib/datatables-1.10.4/media/js/jquery.dataTables.js') }}
        {{ HTML::script('lib/datatables-1.10.4/media/js/dataTables.bootstrap.js') }}
        {{ HTML::script('js/psi.js', array('async' => 'async')) }}
        @include( 'admin.js.app' )
        @stack('scripts')
        
    </body>
</html>