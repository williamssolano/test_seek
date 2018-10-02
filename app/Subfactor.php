<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Subfactor extends Model
{
    protected $table = 'subfactor';
	protected $guarded = [];

    private $id;
    private $nombre;
    private $factor_id;
    private $peso;
    private $estado;

     public static function boot()
    {
       parent::boot();

       static::updating(function ($table) {
           $table->usuario_updated_at = \Auth::id();
       });
       static::creating(function ($table) {
           $table->usuario_created_at = \Auth::id();
       });
    }

    public function setData($data) {
        if(isset($data['id'])){
            $this->setId($data['id']);
        }

        if(isset($data['nombre'])){
            $this->setNombre($data['nombre']);
        }

        if(isset($data['estado'])){
            $this->setEstado($data['estado']);
        }

        if(isset($data['peso'])){
            $this->setPeso($data['peso']);
        }

         if(isset($data['factor_id'])){
            $this->setfactorId($data['factor_id']);
        }
    }

    public function getData(){
        $data = array(
            'id' => $this->getId(),
            'nombre' => $this->getNombre(),
            'estado' => $this->getEstado(),
            'peso' => $this->getPeso(),
            'factor_id' => $this->getfactorId(),
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

    public function setNombre($nombre)
    {
        $this->nombre = $nombre;
    }

    public function getNombre(){
        return $this->nombre;
    }

    public function setfactorId($factor_id)
    {
        $this->factor_id = $factor_id;
    }

    public function getfactorId(){
        return $this->factor_id;
    }

    public function setPeso($peso)
    {
        $this->peso = $peso;
    }

    public function getPeso(){
        return $this->peso;
    }

    public function setEstado($estado)
    {
        $this->estado = $estado;
    }

    public function getEstado(){
        return $this->estado;
    }

    public function listar($data){
    	$query = DB::table('perfiles')
    			->where(function($query) use ($data){
    				if(isset($data['id'])){
    					$query->where('id',$data['id']);
    				}
    			})
    			->get();
    	return $query;
    }

    public function guardar(){
        $Perfil = new $this;
        $Perfil->fill($this->getData());                
        $Perfil->save();
        $this->setData(json_decode(json_encode($Perfil),true));
        return ($Perfil) ? $Perfil : false;
    } 

    public function actualizar(){    
        $Perfil = $this::find($this->getId());
        $inputs = $this->getData();

        foreach (json_decode(json_encode($Perfil),true) as $key => $value) {  
            if (array_key_exists($key, $inputs)) {
            	if($key == 'estado' && $inputs[$key] == 2){
            		$Perfil[$key] = 0;
            	}else{
                	$Perfil[$key] = $inputs[$key];                              		
            	}
            }
        }
        $Perfil->save();
        $this->setData(json_decode(json_encode($Perfil),true));
        return ($Perfil) ? $Perfil : false;
    }

    public function getByfact(){
    	$query = $this::select('id','nombre','peso','descripcion')
    			->whereIn('factor_id', $this->factor_id)
    			->where('estado',1)
    			->get();
    	return $query;
    }

    public function getByName(){
    	$query = $this::select('id','nombre','peso','factor_id')
    			->where('nombre', $this->nombre)
    			->where('estado',1)
    			->get();
    	return $query[0];
    }
}
