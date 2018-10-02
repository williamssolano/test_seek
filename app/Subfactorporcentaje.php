<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Subfactorporcentaje extends Model
{
    protected $table = 'subfactor_porcentaje';
	protected $guarded = [];

    private $id;
    private $porcentaje;
    private $minimo;
    private $maximo;
    private $subfactor_id;
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

        if(isset($data['porcentaje'])){
            $this->setPorcentaje($data['porcentaje']);
        }

        if(isset($data['minimo'])){
            $this->setMinimo($data['minimo']);
        }

        if(isset($data['maximo'])){
            $this->setMaximo($data['maximo']);
        }

        if(isset($data['subfactor_id'])){
            $this->setSubfactorId($data['subfactor_id']);
        }

        if(isset($data['estado'])){
            $this->setEstado($data['estado']);
        }
    }

    public function getData(){
        $data = array(
            'id' => $this->getId(),
            'porcentaje' => $this->getPorcentaje(),
            'minimo' => $this->getMinimo(),
            'maximo' => $this->getMaximo(),
            'subfactor_id' => $this->setSubfactorId(),
            'estado' => $this->getfactorId()
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

    public function setPorcentaje($porcentaje)
    {
        $this->porcentaje = $porcentaje;
    }

    public function getPorcentaje(){
        return $this->porcentaje;
    }

    public function setMinimo($minimo)
    {
        $this->minimo = $minimo;
    }

    public function getMinimo(){
        return $this->minimo;
    }

    public function setMaximo($maximo)
    {
        $this->maximo = $maximo;
    }

    public function getMaximo(){
        return $this->maximo;
    }

    public function setSubfactorId($subfactor_id)
    {
        $this->subfactor_id = $subfactor_id;
    }

    public function getSubfactorId(){
        return $this->subfactor_id;
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

    public function getBySubfactor($cant){
    	$query = $this::select('id','porcentaje','minimo','maximo')
    			->where('subfactor_id', $this->subfactor_id)
    			->whereRaw("($cant BETWEEN minimo AND maximo)")
    			->where('estado',1)
    			->get();  	
    	return $query[0];
    }
}
