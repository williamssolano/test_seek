<?php

namespace App;
use DB;
use Auth;
use Session;
use Lang;
use Response;

use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    protected $guarded =[];
    protected $table = 'usuarios';

    private $id;
    private $perfil_id;
    private $nombre;
    private $apellido;
    private $usuario;
    private $password;
    private $dni;
    private $sexo;
    private $remember_token;
    private $imagen;
    private $email;
    private $celular;
    private $area_id;
    private $estado;
    private $intento;
    private $fecha_login;
    private $estado_log;
    private $fecha_error;
    private $contador_error;
    private $modulos_select;
    private $pertenece;
    private $submodulos;
    private $submodulos_parent;
    private $areas_gestion;
    private $newpassord;
    private $confirm_new_password;

    public function submodulos()
    {
        return $this->belongsToMany('App\Submodulo');
    }

    public static function boot()
    {
       parent::boot();

       static::updating(function ($table) {
           $table->usuario_updated_at = Auth::id();
       });
       static::creating(function ($table) {
           $table->usuario_created_at = Auth::id();
       });
    }

    public function setData($data) {
        if(isset($data['id'])){
            $this->setId($data['id']);
        }

        if(isset($data['perfil'])){
            $this->setPerfilId($data['perfil']);
        }else{
             $this->setPerfilId(8);
        }

        if(isset($data['nombre'])){
            $this->setNombre($data['nombre']);
        }

        if(isset($data['apellido'])){
            $this->setApellido($data['apellido']);
        }

        if(isset($data['usuario'])){
            $this->setUsuario($data['usuario']);
        }

        if(isset($data['password'])){
            $this->setPassword($data['password']);
        }

        if(isset($data['dni'])){
            $this->setDni($data['dni']);
        }

        if(isset($data['sexo'])){
            $this->setSexo($data['sexo']);
        }

        if(isset($data['remember_token'])){
            $this->setRemenberToken($data['remember_token']);
        }

        if(isset($data['imagen'])){
            $this->setImagen($data['imagen']);
        }

        if(isset($data['email'])){
            $this->setEmail($data['email']);
        }

        if(isset($data['celular'])){
            $this->setCelular($data['celular']);
        }

        if(isset($data['area'])){
            $this->setAreaId($data['area']);
        }

        if(isset($data['estado'])){
            $this->setEstado($data['estado']);
        }

        if(isset($data['intento'])){
            $this->setIntento($data['intento']);
        }

        if(isset($data['fecha_login'])){
            $this->setFechaLogin($data['fecha_login']);
        }

        if(isset($data['estado_log'])){
            $this->setEstadoLog($data['estado_log']);
        }

        if(isset($data['fecha_error'])){
            $this->setFechaError($data['fecha_error']);
        }

        if(isset($data['contador_error'])){
            $this->setContadorError($data['contador_error']);
        }

        if(isset($data['modulos_selec'])){
            $this->setModulosSelect($data['modulos_selec']);
        }

        if(isset($data['pertenece'])){
            $this->setPertenece($data['pertenece']);
        }

        if(isset($data['submodulos'])){
            $this->setSubmodulo($data['submodulos']);
        }

        if(isset($data['submodulos_parent'])){
            $this->setSubmoduloParent($data['submodulos_parent']);
        }

        if(isset($data['areas_gestion'])){
            $this->setAreasGestion($data['areas_gestion']);
        }

        if(isset($data['newpassword'])){
            $this->setNewpassword($data['newpassword']);
        }

        if(isset($data['confirm_new_password'])){
            $this->setConfirmNewPassword($data['confirm_new_password']);
        }
    }

    public function getData(){
        $data = array(
            'id' => $this->getId(),
            'perfil_id' => $this->getPerfilId(),
            'nombre' => $this->getNombre(),
            'apellido' => $this->getApellido(),
            'usuario' => $this->getUsuario(),
            'empresa_id' =>3,
            'password' => $this->getPassword(),
            'dni' => $this->getDni(),
            'sexo' => $this->getSexo(),
            'remember_token' => $this->getRemenberToken(),
            'imagen' => $this->getImagen(),
            'email' => $this->getEmail(),
            'celular' => $this->getCelular(),
            'area_id' => $this->getAreaId(),
            'estado' => $this->getEstado(),
            'intento' => $this->getIntento(),
            'fecha_login' => $this->getFechaLogin(),
            'estado_log' => $this->getEstadoLog(),
            'fecha_error' => $this->getFechaError(),
            'contador_error' => $this->getContadorError()
        ); 
        return array_filter($data,'strlen');
    }

    public function setId($id)
    {
        $this->id = $id;
    }

    public function getId(){
        return $this->id;
    }

    public function setPerfilId($perfil_id)
    {
        $this->perfil_id = $perfil_id;
    }

    public function getPerfilId(){
        return $this->perfil_id;
    }

    public function setNombre($nombre)
    {
        $this->nombre = $nombre;
    }

    public function getNombre(){
        return $this->nombre;
    }

    public function setApellido($apellido)
    {
        $this->apellido = $apellido;
    }

    public function getApellido(){
        return $this->apellido;
    }

    public function setUsuario($usuario)
    {
        $this->usuario = $usuario;
    }

    public function getUsuario(){
        return $this->usuario;
    }

    public function setPassword($password)
    {
        $this->password = $password;
    }

    public function getPassword(){
        return $this->password;
    }

    public function setDni($dni)
    {
        $this->dni = $dni;
    }

    public function getDni(){
        return $this->dni;
    }

    public function setSexo($sexo)
    {
        $this->sexo = $sexo;
    }

    public function getSexo(){
        return $this->sexo;
    }

    public function setRemenberToken($remember_token)
    {
        $this->remember_token = $remember_token;
    }

    public function getRemenberToken(){
        return $this->remember_token;
    }

    public function setImagen($imagen)
    {
        $this->imagen = $imagen;
    }

    public function getImagen(){
        return $this->imagen;
    }

    public function setEmail($email)
    {
        $this->email = $email;
    }

    public function getEmail(){
        return $this->email;
    }

    public function setCelular($celular)
    {
        $this->celular = $celular;
    }

    public function getCelular(){
        return $this->celular;
    }

    public function setAreaId($area_id)
    {
        $this->area_id = $area_id;
    }

    public function getAreaId(){
        return $this->area_id;
    }

    public function setEstado($estado)
    {
        $this->estado = $estado;
    }

    public function getEstado(){
        return $this->estado;
    }

    public function setIntento($intento)
    {
        $this->intento = $intento;
    }

    public function getIntento(){
        return $this->intento;
    }

    public function setFechaLogin($fecha_login)
    {
        $this->fecha_login = $fecha_login;
    }

    public function getFechaLogin(){
        return $this->fecha_login;
    }

    public function setEstadoLog($estado_log)
    {
        $this->estado_log = $estado_log;
    }

    public function getEstadoLog(){
        return $this->estado_log;
    }

    public function setFechaError($fecha_error)
    {
        $this->fecha_error = $fecha_error;
    }

    public function getFechaError(){
        return $this->fecha_error;
    }

    public function setContadorError($contador_error)
    {
        $this->contador_error = $contador_error;
    }

    public function getContadorError(){
        return $this->contador_error;
    }

    public function setModulosSelect($modulos_select)
    {
        $this->modulos_select = $modulos_select;
    }

    public function getModulosSelect(){
        return $this->modulos_select;
    }

    public function setPertenece($pertenece)
    {
        $this->pertenece = $pertenece;
    }

    public function getPertenece(){
        return $this->pertenece;
    }

    public function setSubmodulo($submodulos)
    {
        $this->submodulos = $submodulos;
    }

    public function getSubmodulo(){
        return $this->submodulos;
    }

    public function setSubmoduloParent($submodulos_parent)
    {
        $this->submodulos_parent = $submodulos_parent;
    }

    public function getSubmoduloParent(){
        return $this->submodulos_parent;
    }

    public function setAreasGestion($areas_gestion)
    {
        $this->areas_gestion = $areas_gestion;
    }

    public function getAreasGestion(){
        return $this->areas_gestion;
    }

    public function setNewpassword($newpassword)
    {
        $this->newpassord = $newpassword;
    }

    public function getNewpassword(){
        return $this->newpassord;
    }

    public function setConfirmNewPassword($confirmnewPass)
    {
        $this->confirm_new_password = $confirmnewPass;
    }

    public function getConfirmNewPassword(){
        return $this->confirm_new_password;
    }

    public function logeo(){
    	if ($this->usuario) {
    		$identificador = $this::select(DB::raw('count(*) as identificador'))
    						->where('usuario', $this->usuario)->get();
    		return $identificador[0];
    	}    	
    }

    public function getNumIntentos(){
    	if ($this->usuario) {
    		$numIntentos = $this::select('intento')
    					->where('usuario', $this->usuario)->get();
    		return $numIntentos[0];
    	}    	
    }

    public function getBitacoraPass(){   
    	$query = DB::table('usuario_password')
    			->select('fecha','estado',DB::raw('DATEDIFF(NOW(), DATE(`fecha`)) AS difDias'))
    			->where('usuario',$this->usuario)
    			->orderBy('id','desc')
    			->skip(0)->take(1)
    			->get();
		return $query;
    }

    public function actualizar(){    
        $usuario = $this::find($this->getId());
        $inputs = $this->getData();
        foreach (json_decode(json_encode($usuario),true) as $key => $value) {  
            if (array_key_exists($key, $inputs)) {
                $usuario[$key] = $inputs[$key];                  
            }
        }
        $usuario->save();
        $this->setData(json_decode(json_encode($usuario),true));
        return ($usuario) ? $usuario : false;
    }

    public function getNumFallos(){
    	$numFallos = $this::select(DB::raw('COUNT(*) AS total'),'contador_error')
    				->where('usuario',$this->usuario)
    				->whereRaw('DATE(fecha_error) = DATE(NOW())')
    				->get();
    	return $numFallos[0];
    }

     public function getLastDateError(){
    	$ultFecha = $this::select(DB::raw('TIMESTAMPDIFF(MINUTE,`fecha_error`, NOW()) AS minuto'))
    				->where('usuario',$this->usuario)
    				->get();
    	return $ultFecha[0];
    }

    public function getByUser(){
        $user = $this::select('usuario','id')
                    ->where('usuario',$this->usuario)
                    ->get();
        return $user[0];
    }

    public function validateRegistry(){   
        $query = DB::table('usuario_password')
                ->select(DB::raw('count(*) as total'))
                ->where('usuario',$this->usuario)
                ->orderBy('id','desc')
                ->skip(0)->take(1)
                ->get();
        return $query;
    }

    public function validateNewPassword(){
        $query = DB::table('usuario_password')
                ->select('password',DB::raw('TIMESTAMPDIFF(MINUTE,`fecha`, NOW()) AS hora'),'estado')
                ->where('usuario',$this->usuario)
                ->orderBy('id','desc')
                ->skip(0)->take(3)
                ->get();
        return $query;
    }

    public function getsubmodulos(){
        $submodulos = DB::table('modulos as m')
                    ->select('m.nombre as modulo','s.nombre as submodulo','s2.nombre as submodulo2',
                        's.menu_visible','s2.menu_visible as menu_visible2','su.agregar',
                        'su.editar','su.eliminar','s2.agregar as agregar2','s2.editar as editar2',
                        's2.eliminar as eliminar2',DB::raw('CONCAT(m.path,".", s.path) as path'),
                        DB::raw('CONCAT(m.path,".", s.path,"." , s2.path) as path2'),
                        'm.icon','su.submodulo_id','s2.id as sub2_id')
                    ->join('submodulos as s',
                        function ($join) {
                            $join->on('s.modulo_id', '=', 'm.id')
                            ->where('s.parent', '=', 0);
                        }
                    )
                    ->join('submodulo_usuario as su','s.id','=','su.submodulo_id')
                    ->leftJoin(DB::raw('(SELECT s.*,su.estado AS estadop,su.agregar,su.editar,su.eliminar 
                                    FROM submodulos s
                                    JOIN submodulo_usuario  su ON su.submodulo_id=s.id AND s.parent<>0
                                    WHERE  s.menu_visible=1 AND su.usuario_id = '.$this->getId().') as s2')
                                    ,'s2.parent','=','s.id')
                    ->where('su.estado', '=', 1)
                    ->where('m.estado', '=', 1)
                    ->where('s.estado', '=', 1)
                    ->where('su.usuario_id', '=', $this->getId())
                    ->orderBy('m.nombre', 'ASC')
                    ->orderBy('s.nombre', 'ASC')
                    ->orderBy('s2.nombre', 'ASC')               
                    ->get();         
       return $submodulos;      
    }
}
