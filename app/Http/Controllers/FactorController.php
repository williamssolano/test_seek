<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Factor;
use App\Subfactor;
use App\Subfactorporcentaje;
use App\Http\Requests;
use Response;

class FactorController extends Controller
{
	protected $_factor;
	protected $_subfactor;
	protected $_subfactorporc;

    public function __construct(Factor $factor,Subfactor $subfactor,
    	Subfactorporcentaje $Subfactorporcentaje) {
        $this->_factor = $factor;
        $this->_subfactor = $subfactor;
        $this->_subfactorporc = $Subfactorporcentaje;
    }

    public function postListar(Request $request)
    {
    	return Response::json(
    		array(
    			'rst' => 1, 
    			'datos' => $this->_factor->getAll()
    		)
    	);
    }

    public function postListarsubfact(Request $request)
    {
    	$this->_subfactor->setData($request->all());
    	return Response::json(
    		array(
    			'rst' => 1, 
    			'datos' => $this->_subfactor->getByfact()
    		)
    	);
    }

    public function postCalcularpoints(Request $request)
    {
    	if(count($request->all()) > 0){    		
    		$sum_points = 0;
    		foreach ($request->all() as $key => $value) {    			    		
    			if($value['factor_id'] == 1){
    				foreach ($value as $index => $val) {
    					if($index != 'factor_id'){
    						$this->_subfactor->setNombre($index);
			    			$subfactor = $this->_subfactor->getByName();

			    			$this->_subfactorporc->setSubfactorId($subfactor->id);
			    			$porcentaje = $this->_subfactorporc->getBySubfactor($val);

			    			$porc = $porcentaje->porcentaje / 100;    			
			    			$points = (int)round($subfactor->peso * $porc);    			
			    			$sum_points+= $points;
    					}    					
    				}    			
    			}else if($value['factor_id'] == 2){
    				$nums = array($value['PrecioPropiedad'],$value['PrecioHistorico']);		    				
    				$sum = 0;
					for($i=0;$i<count($nums);$i++){
						$sum+=$nums[$i];
					}
					$media = $sum/count($nums);
					$sum2=0;
					for($i=0;$i<count($nums);$i++){
						$sum2+=($nums[$i]-$media)*($nums[$i]-$media);
					}
					$vari = $sum2/count($nums);
					$sq = (int)round(sqrt($vari)) / 100;			
					
					$this->_subfactor->setNombre('PrecioPropiedad');
		    		$subfactor = $this->_subfactor->getByName();

		    		$this->_subfactorporc->setSubfactorId($subfactor->id);		    	
		    		$porcentaje = $this->_subfactorporc->getBySubfactor($sq);

		    		$this->_factor->setId($subfactor->factor_id);
		    		$factor = $this->_factor->getById();

		    		$porc = $porcentaje->porcentaje / 100;    	    		
		    		$points = (int)round($factor->peso * $porc);  					    	
		    		$sum_points+= $points;	
    			}else if($value['factor_id'] == 3){
    				$porc = ($value['InputPresentado']/$value['InputSolicitados']);
    				$this->_factor->setId($value['factor_id']);
		    		$factor = $this->_factor->getById();
		    		$points = round($factor->peso * $porc);  	
		    		$sum_points+= $points;    				
    			}
    		} 	
            
    		return Response::json(
	    		array(
	    			'rst' => 1, 
	    			'points' => $sum_points
	    		)
    		);	
    	}    	
    }

}
