var instance2 = axios.create({
	baseURL: '/logeo'
});

var vm = new Vue({
	el: '#app',
	data: {
		usuario: '',
		password: '',	
		new_password: '',
		confirm_new_pass: '',
		init : 0,
		msj : '',
		msjInicio : true,
		msjError: false,
		msjNewPass: '',
		rstNewPass: 0,
		errorNewpass : true, 
		msjErrorNewPass : 'OBS: Contraseña debe contener: Texto, Número y debe ser mayor a 6 dígitos',
	},
	computed: {
	  apear: function () {
	    return {
	      show: this.init == 5,
	      hide: this.init != 5	     
	    }
	  },
	},
	components:{

	},

	mounted: function () {
		
	},
	methods: {
		MostrarMensaje : function(msj){
			var self = this;
			this.msj = msj;
			this.msjInicio = false;
			this.msjError = true;
				
			setTimeout(function(){
                self.msjError = false;
                self.msjInicio = true;
            }, 2000);
		},
		IniciarSession: function () {		
			if(!this.usuario){				
				this.MostrarMensaje("Ingrese su Usuario");
				
			}else if(!this.password){				
				this.MostrarMensaje("Ingrese su Password");
			}else{
				this.IniciarLogin();
			}
		},
		IniciarLogin: function(){
			obj = {'usuario' : this.usuario,'password' : this.password};
			instance2.post('login', obj)
				.then((response) => {
					var data = response.data;
					this.init = data.rst;				

					if(data.rst == 1 && data.estado == 1){
						window.location='admin.inicio';
					}else if(data.rst == 1 || data.rst == 2){
						this.MostrarMensaje(response.data.msj);
					}
			})
		},
		MisDatos:function(){
			obj = {'usuario' : this.usuario,'password' : this.password,
					'newpassword' : this.new_password, 'confirm_new_password': this.confirm_new_pass};
			instance2.post('misdatosvalida', obj)
				.then((response) => {
					var data = response.data;
					this.rstNewPass = data.rst;

					if(data.rst == 1){
						this.password = '';
						this.new_password = '';
						this.confirm_new_pass = '';
						this.MostrarMensaje("Actualización Exitosa");
					}else if(data.rst == 3){
						this.password = '';
						this.new_password = '';
						this.confirm_new_pass = '';
						this.msjErrorNewPass = data.msj;						
					}else{	
						var self = this;					
						 $.each(data.msj,function(index,datos){
						 	self.msjErrorNewPass = datos;							
	                    });						 						
					}
			})
    	},
		Cancelar: function(){
        	window.location='login';
    	}
	}
})