var instance2 = axios.create({
	baseURL: '/factor'
});

var vm = new Vue({
	el: '#app',
	data: {
		_token : {},
		factor: [],
		factores: [],
		subfactores: [],
		Mercados:'',
		InkaFarma:'',
		Bodegas: '',
		GastoFood:'',
		CAPEX:'',
		PrecioPropiedad:'',
		PrecioHistorico:'',
		InputSolicitados:'',
		InputPresentado: '',
		points: 0,
	},
	computed: {
	},
	components:{

	},
	mounted: function () {
		this.getFactores();
		this.limpiar();
	},
	methods: {
		getFactores: function(){
			obj = {'_token':this._token};			
			instance2.post('listar', obj)
				.then((response) => {
					this.factores = response.data.datos;					
			})
		},
		getSubfactor: function(){
			obj = {'factor_id':this.factor,'_token':this._token};			
			instance2.post('listarsubfact', obj)
				.then((response) => {
					this.subfactores = response.data.datos;
			})
		},
		calcular: function(){
            var obj = [];			
			for(var i=0;i < this.factor.length;i++){
				if(this.factor[i] == 1){ //Zona Caliente
				
					var zona_caliente = {};
					zona_caliente.factor_id = this.factor[i];					
					zona_caliente.Mercados = this.Mercados;
					zona_caliente.InkaFarma = this.InkaFarma;
					zona_caliente.Bodegas = this.Bodegas;
					zona_caliente.GastoFood = this.GastoFood;
					zona_caliente.CAPEX = this.CAPEX;
					obj.push(zona_caliente);
				
				}else if(this.factor[i] == 2){ //Desviacion con precio Historico
					
					var precio_historico = {};
					precio_historico.factor_id = this.factor[i];
					precio_historico.PrecioPropiedad = this.PrecioPropiedad;
					precio_historico.PrecioHistorico = this.PrecioHistorico;
					obj.push(precio_historico);
				
				}else if(this.factor[i] == 3){ //Cumplimiento de Documentos
					
					var cumpli_docu = {};
					cumpli_docu.factor_id = this.factor[i];
					cumpli_docu.InputSolicitados = this.InputSolicitados;
					cumpli_docu.InputPresentado = this.InputPresentado;
					obj.push(cumpli_docu);
				
				}	
			}					
			instance2.post('calcularpoints', obj)
				.then((response) => {
					if(response.data.rst == 1){
						this.points = response.data.points;
					}		
				})
				.catch(error => {
    				if(error){
    					alert('Error al hacer el calculo');
    				}
				});
		},
		limpiar: function(){
			this.subfactores= [];
			this.Mercados='';
			this.InkaFarma='';
			this.Bodegas='';
			this.GastoFood='';
			this.CAPEX='';
			this.PrecioPropiedad='';
			this.PrecioHistorico='';
			this.InputSolicitados='';
			this.InputPresentado= '';
			this.points = 0;
		},
		Cancelar : function(){
			this.limpiar();
		}
	}
})