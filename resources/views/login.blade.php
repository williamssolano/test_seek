<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="token" id="token" value="{{ csrf_token() }}">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no">
    <meta name="author" content="Seek">
    <meta name="theme-color" content="#000000">
    <link rel="shortcut icon" href="favicon.ico">
    <meta name="description" content="">
    <title>Seek</title>

    {{ HTML::style('lib/font-awesome-4.2.0/css/font-awesome.min.css') }}
    {{ HTML::style('lib/bootstrap-3.3.1/css/bootstrap.min.css') }}
    {{ HTML::style('css/login/login.css') }}

</head>
<body  bgcolor="#FFF">
    <div id="app">
        <div id="loggit">
            <h1><i class="fa fa-lock"></i> Seek</h1>
            <h3 id="mensaje_msj"  class="label-success">
                {{ Session::get('msj') }}
            </h3>

            <transition name="slide-fade">
                <h3 v-if="msjError" class="label-danger">@{{msj}}</h3>              
            </transition>

            <transition name="slide-fade">
                <h3 v-if="msjInicio">Por Favor <strong>Logeate</strong></h3>               
            </transition>

            <form action="check" id="logForm" method="post" class="form-horizontal">
               {{--  <input type="hidden" name="_token" value="{{ csrf_token() }}">
                {!! csrf_field() !!} --}}
                <div class="row">
                    <div class="col-md-12">
                        <div class="form-group">
                            <div class="col-xs-12">
                                <div class="input-group">
                                    <span class="input-group-addon"><i class="fa fa-user fa-fw"></i></span>
                                    <input type="text" name="usuario" id="usuario" class="form-control input-lg" v-model="usuario" :disabled="init == 5 && rstNewPass != 1" placeholder="Usuario" autocomplete="off" required>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="col-xs-12">
                                <div class="input-group">
                                    <span class="input-group-addon"><i class="fa fa-key fa-fw"></i></span>
                                    <input type="password" name="password" id="password" v-model="password" :disabled="init == 5 && rstNewPass != 1" class="form-control input-lg" placeholder="Password" autocomplete="off" required>
                                </div>
                            </div>
                        </div>
                        <div class="form-group formSubmit">
                            <div class="col-sm-7">
                                <div class="checkbox">
                                    <label>
                                        <input type="checkbox" name="remember" checked autocomplete="off"> Mantener activa la session
                                    </label>
                                </div>
                            </div>
                            <div class="col-sm-5 submitWrap">
                                <button type="button" id="btnIniciar" :disabled="init == 5 && rstNewPass != 1" class="btn btn-primary btn-lg" @click="IniciarSession()">Iniciar</button>
                            </div>
                        </div>
                        <div class="load" align="center" v-show="false"><i class="fa fa-spinner fa-spin fa-3x"></i></div>

                        <h3 id="msj2" v-show="init == 5 && rstNewPass != 1">Por Favor <strong>Actualizar Contraseña</strong></h3>
                        <div id="divNewPassword1" class="form-group" v-show="init == 5 && rstNewPass != 1">
                            <div class="col-xs-12">
                                <div class="input-group">
                                    <span class="input-group-addon"><i class="fa fa-key fa-fw"></i></span>
                                    <input type="password" v-model="new_password" class="form-control input-lg" placeholder="Nuevo Password" autocomplete="off" :required="true">
                                </div>

                                <transition name="slide-fade">
                                    <h3 v-if="errorNewpass">
                                        @{{msjErrorNewPass}}
                                    </h3>            
                                </transition>                                
                            </div>
                        </div>
                        <div id="divNewPassword2" class="form-group" v-show="init == 5 && rstNewPass != 1">
                            <div class="col-xs-12">
                                <div class="input-group">
                                    <span class="input-group-addon"><i class="fa fa-key fa-fw"></i></span>
                                    <input type="password" v-model="confirm_new_pass" class="form-control input-lg" placeholder="Confirmar Nuevo Pass" autocomplete="off" :required="true">
                                </div>
                            </div>
                        </div>
                        <div id="divAccion" class="form-group formSubmit" v-show="init == 5 && rstNewPass != 1">
                            <div class="col-sm-6">
                                <button type="button" @click="Cancelar()" id="btnCancelar" class="btn btn-danger btn-lg">&nbsp;Cancelar&nbsp;</button>
                            </div>
                            <div class="col-sm-6">
                                <button type="button" @click="MisDatos()" id="btnActualizar" class="btn btn-primary btn-lg">Actualizar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
    
    {{ Html::script('lib/jquery-2.1.3.min.js')}}
    {{ Html::script('lib/jquery-ui-1.11.2/jquery-ui.min.js')}}
    {{ Html::script('lib/bootstrap-3.3.1/js/bootstrap.min.js')}}
    {{ Html::script('https://unpkg.com/axios@0.16.1/dist/axios.min.js') }}
    {{ Html::script('https://unpkg.com/vue@2.3.3') }}
    
    <script src="https://unpkg.com/babel-polyfill@latest/dist/polyfill.min.js"></script>
    <script src="https://unpkg.com/tether@latest/dist/js/tether.min.js"></script>
   {{ Html::script('js/login/logeo.js')}}

    </body>
</html>