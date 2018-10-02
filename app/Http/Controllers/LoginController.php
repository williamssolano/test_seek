<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Http\Requests;
use DB;
use Auth;
use Session;
use Lang;
use Response;
use App\Usuario;
use Validator;
use Hash;

class LoginController extends Controller
{
	protected $_usuario;

    public function __construct(Usuario $usuario) {
        $this->_usuario = $usuario;
    }

   public function postLogin(Request $request)
    {
        if ($request) {

            $estadoLog = 0;
            $contadorFallo = 0;
            $user = $request->input('usuario');
          	
            $this->_usuario->setData($request->all());

            if($this->_usuario->logeo()->identificador == 0){
                return Response::json(
                       		array(
	                            'rst'=>'2',
	                            'msj'=>'Usuario incorrecto',
                            )
                        );
            }
           
            if ($this->_usuario->getNumIntentos()->intento < 5) {
            	$userdata= array(
                    'usuario' => $this->_usuario->getUsuario(),
                    'password' => $this->_usuario->getPassword(),
                );

                if (Auth::attempt($userdata, $request->input('remember', 0))) {   
                             	
                	$detaAuditoria = $this->_usuario->getBitacoraPass();
                	if (empty($detaAuditoria[0]->fecha) || $detaAuditoria[0]->fecha == "" || $detaAuditoria[0]->estado == 0 ) {
                        return Response::json(
                            array(
                                'rst'=>'5',
                                'datos' => 'y'
                            )
                        );
                    } else {                    	
                    	if ($detaAuditoria[0]->difDias > 120 && $detaAuditoria[0]->estado == 1) {
                            return Response::json(
                                array(
                                    'rst'=>'5','datos' => 'X'
                                )
                            );
                        } else {       
                     		$this->_usuario->setId(Auth::id());                 
                        	$res = $this->_usuario->getsubmodulos();                        	
                        	$menu = array();
                            $accesos = array();

                            if($res){
                            	foreach ($res as $data) {
	                                $modulo = $data->modulo;
	                                $submodulo = $data->submodulo;
	                                $submodulo2 = $data->submodulo2;
	                                array_push($accesos, $data->path);

	                                if( empty($menu[$modulo]) ){ $i=0;}

	                                if( $data->submodulo2 <> ''){
	                                    $menu[$modulo][$submodulo][$submodulo][] = $data;
	                                }
	                                else{
	                                    $menu[$modulo][$i] = $data;
	                                    $i++;
	                                }
                            	}
                            }                        

                            Session::set('language', 'Español');
                            Session::set('language_id', 'es');
                            Session::set('menu', $menu);
                            Session::set('accesos', $accesos);
                            Session::set('perfilId', Auth::user()->perfil_id);
                            Session::set('usuario', Auth::user()->usuario);
                            Session::set('dni', Auth::user()->dni);
                            Session::set('celular', Auth::user()->celular);
                            Session::set('sexo', Auth::user()->sexo);
                            Session::set('created_at', Auth::user()->created_at);
                            Session::set('full_name', Auth::user()->full_name);
                            Session::set('email', Auth::user()->email);
                            Session::set('imagen', Auth::user()->imagen);
                            Session::set('tipoPersona', Auth::user()->tipo_persona_id);
                            Session::set('estado', Auth::user()->estado);
                            Session::set('nomusuario', $request->input('usuario'));
                            Session::set("s_token", md5(uniqid(mt_rand(), true)));
                            Lang::setLocale(Session::get('language_id'));

                            return Response::json(
                                array(
                                'rst'=>'1',
                                'estado'=>Auth::user()->estado
                                )
                            );
                        }
                    }
                }else{

                    if ( $this->_usuario->getNumFallos()->total == 0 ) {
                        $contadorFallo = 1;
                    } else {                        
                        $contadorFallo = $numFallos[0]->contador_error + 1;
                    }

                    $estadoLog = 0;
                    
                    return Response::json(
                        array(
                            'rst'=>'2',
                            'msj'=>'El Usuario y/o la contraseña errado',
                            )
                        );
                }
            }else{

                $ultFecha = $this->_usuario->getLastDateError();
                if ( $ultFecha->minuto < 30 ) {
                    $valor = 30 - $ultFecha->minuto;

                    return Response::json(
                        array(
                            'rst'=>'2',
                            'msj'=>'Por favor, ingresar dentro de '. $valor .' minutos',
                        )
                    );
                } else {
                    $estadoLog = 0;
                    $this->_usuario->setId(467);
                    $this->_usuario->setIntento(0);
                    $this->_usuario->setFechaError(date("Y-m-d H:i:s"));
                    $this->_usuario->setEstadoLog($estadoLog);
                	$this->_usuario->actualizar();

                    return Response::json(
                        array(
                            'rst'=>'2',
                            'msj'=>'Ya Transcurrió el Plazo de 30 min,Por Favor Logeate',
                        )
                    );
                }
            }
        }
    }


    public function postMisdatosvalida(Request $request)
    {
        if ($request) {

        	$this->_usuario->setData($request->all());
        	$user = $this->_usuario->getUsuario();
            $newpassword = $this->_usuario->getNewpassword();
            $confirm_newpass = $this->_usuario->getConfirmNewPassword(); 

        	if( $newpassword != $confirm_newpass){
        		return Response::json(
                    array(
                        'rst'=>2,
                        'msj'=>array('newpassword'=>'Las contraseñas nuevas no pueden ser diferentes'),
                    )
                );
        	}

        	/*validate if password contains user's name*/
        	$usuario = $this->_usuario->getByUser();
        	if ((strrev($newpassword) == ($usuario->usuario)) || ($newpassword == $usuario->usuario)) {
                return Response::json(
                    array(
                        'rst'=>2,
                        'msj'=>array('newpassword'=>'La contraseña no puede contener su nombre de usuario'),
                    )
                );
            }

            $reglas = array(
                'password'      => 'required|between:6,50',
                'newpassword'   => 'required|regex:"^(?=\w*\d)(?=\w*[a-z])\S{6,50}$"',
            );
            $validator = Validator::make($request->all(), $reglas);

            if ($validator->fails()) {
                $final = '';
                $datosfinal = array();
                $msj = (array) $validator->messages();

                foreach ($msj as $key => $value) {
                    $datos=$msj[$key];
                    foreach ($datos as $keyI => $valueI) {
                        $datosfinal[$keyI]=str_replace(
                            $keyI, trans('greetings.'.$keyI), $valueI
                        );
                    }
                    break;
                }

                return Response::json(
                    array(
                        'rst'=>2,
                        'msj'=>$datosfinal,
                    )
                );
            }

            $userdata= array(
                'usuario' => $this->_usuario->getUsuario(),
                'password' => $this->_usuario->getPassword(),
            );

            if ( Auth::attempt($userdata) ) {
                if ( $newpassword != '' ) {

                    $validarRegistro = $this->_usuario->validateRegistry();
                    $validarNuevoPass = $this->_usuario->validateNewPassword();

                    if ($validarRegistro[0]->total > 0) {
                        if ($validarNuevoPass[0]->estado == 1) {
                            if ($validarNuevoPass[0]->hora <= 60) {
                                return Response::json(
                                    array(
                                        'rst' => 3,
                                        'msj' => 'Intentar Cambiar Contraseña'. ' dentro de '
                                        . (60-($validarNuevoPass[0]->hora)). ' minutos.',
                                    )
                                );
                            }
                        }
                    }

                    foreach ($validarNuevoPass as $pass) {
                        if (Hash::check(($newpassword),($pass->password))) {
                            return Response::json(
                                array(
                                    'rst' => 2,
                                    'msj' => array('newpassword'=>'Contraseña Usada Anteriormente'),
                                )
                            );
                        }
                    }

                    $this->_usuario->setId($usuario->id);
                    $this->_usuario->setPassword(Hash::make($newpassword));
                    $this->_usuario->actualizar();

                    // Insertamos dentro de la tabla Usuario_password
                    DB::table('usuario_password')
                    ->insert(
                        array(
                            'usuario' => $this->_usuario->getUsuario(),
                            'password' => Hash::make($newpassword),
                            'fecha' => date("Y-m-d H:i:s"),
                            'estacion' => $_SERVER['REMOTE_ADDR'],
                            'estado' => '1'
                        )
                    );
                }

                return Response::json(
                    array(
                        'rst' => 1,
                        'msj' => 'Registro actualizado correctamente',
                    )
                );

            } else {
                return Response::json(
                    array(
                        'rst' => 2,
                        'msj' => array('password'=>'Contraseña incorrecta'),
                    )
                );
            }
        }
    }


}
