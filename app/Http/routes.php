<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/
Route::get(
    '/salir', function () {
        Auth::logout();
        Session::flush();
        return Redirect::to('/');
    }
);

Route::get(
    '/{ruta}', array('before' => 'auth', function ($ruta) {
        if (Session::has('accesos')) {
            $accesos = Session::get('accesos');
            $menu = Session::get('menu');          
            $val = explode("_", $ruta);
            $valores = array(
                'valida_ruta_url' => $ruta,
                'menu' => $menu
            );
            $val2 = explode('.', $ruta);
            if (count($val2) == 3) {
                if ($val2[2] != "misdatos") {
                    $nomSubMod = explode('.', $ruta);
                    $query ='SELECT `id` FROM `submodulos` WHERE `path` = ?';
                    $res = DB::select($query, array($nomSubMod[2]));
                }
            }
            if (count($val) == 2) {
                $dv = explode("=", $val[1]);
                $valores[$dv[0]] = $dv[1];
            }
            $rutaBD = substr($ruta, 6);
            //si tiene accesoo si accede al inicio o a misdatos
            if (in_array($rutaBD, $accesos) or
                $rutaBD == 'inicio' or $rutaBD=='mantenimiento.misdatos'
                or substr($ruta, 0, 7)=='angular' or (isset($val2[2]) && in_array($rutaBD.'#/'.$val2[2], $accesos) ) ) {
                return View::make($ruta)->with($valores);
            } else
                return Redirect::to('/');
        } else
            return Redirect::to('/');
    })
);

Route::get(
    '/', function () {
        if (Session::has('accesos')) {
            return View('admin.inicio');
        } else {
            return View('login');
        }
    }
);


Route::group(['middleware' => ['web']], function () {
	Route::auth();
    Route::controller('logeo', 'LoginController');
    Route::controller('factor', 'FactorController');
 });