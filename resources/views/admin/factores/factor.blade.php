<!DOCTYPE html>
@extends('layouts.masterv3')  

@push("stylesheets")
    {{ HTML::style('lib/bootstrap-multiselect/dist/css/bootstrap-multiselect.css') }}
    {{ HTML::style('css/admin/factor.css') }}
@endpush

@section('contenido')
<!-- Content Header (Page header) -->
<section class="content-header">
    <h1>
       Calculo de Factores
        <small> </small>
    </h1>
    <ol class="breadcrumb">
        <li><a href="#"><i class="fa fa-dashboard"></i> Admin</a></li>    
    </ol>
</section>

<!-- Main content -->
<section class="content">
    <input type="hidden" id="_token" value="{{ csrf_token() }}">  
    <div class="row" id="app">
        <div class="col-md-10">

            <table border="0" cellpadding="0" cellspacing="0">
              <thead>
                <tr>
                  <th>Seleccione Factor:</th>
                  <th>
                    <select multiple="true" v-model="factor" @change="getSubfactor()">               
                        <option v-for="fact in factores" :value="fact.id">@{{ fact.nombre }}</option>
                    </select>
                  </th>
                </tr>                
              </thead>
              <tbody>
                <tr v-for="(subfactor,index) in subfactores">
                  <td> @{{subfactor.descripcion}} </td>
                  <td>
                    <input type="text" class="subfact" :id="subfactor.nombre" :required="true"/>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>
                    <button type="button" @click="calcular()" class="btn btn-primary btn-sm">Calcular</button>
                  </td>
                  <td>
                    <button type="button" @click="Cancelar()" class="btn btn-danger btn-sm">Cancelar</button>
                  </td>
                </tr>
              </tfoot>
            </table>

            <h3>Cantidad de Puntos Obtenidos: <span> @{{points}}</span></h3>        
        </div>
    </div>

</section><!-- /.content -->
@stop


@push('scripts')
    {{ HTML::script('lib/bootstrap-multiselect/dist/js/bootstrap-multiselect.js') }}
    {{ Html::script('https://unpkg.com/axios@0.16.1/dist/axios.min.js') }}
    {{ Html::script('https://unpkg.com/vue@2.3.3') }}
    {{ HTML::script('js/admin/factor/factor.js')}}

     <script type="text/javascript">
        $(document).ready(function() {   
            var token = $("#_token").val();    
            vm._token = token;             

            $(document).on('keyup', '.subfact', function(event) {
              vm.Mercados = $("#Mercados").val();
              vm.InkaFarma = $("#InkaFarma").val();
              vm.Bodegas = $("#Bodegas").val();
              vm.GastoFood = $("#GastoFood").val();
              vm.CAPEX = $("#CAPEX").val();
              vm.PrecioPropiedad = $("#PrecioPropiedad").val();
              vm.PrecioHistorico = $("#PrecioHistorico").val();
              vm.InputSolicitados = $("#InputSolicitados").val();
              vm.InputPresentado = $("#InputPresentado").val();
            });            
        });
    </script>
@endpush('script')