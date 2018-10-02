<!DOCTYPE html>
@extends('layouts.masterv3')  

@section('includes')
@parent
    {{-- {{ Html::script('js/admin/misdatos.js') }}
    {{ Html::script('js/admin/mantenimiento/usuario_ajax.js') }} --}}
@stop

@section('contenido')
    <section class="content-header">
        <ol class="breadcrumb">
            <li><a href="#"><i class="fa fa-dashboard"></i> Admin</a></li>
            <li class="active">{{ trans('greetings.menu_inicio') }}</li>
        </ol>
    </section>

    <section class="content">
        <div class="row">
            <div class="col-xs-12">
{{--                 <form action="check" id="inicioFomr" method="post" class="form-horizontal">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        {!! csrf_field() !!}
                </form> --}}
            </div>
        </div>
    </section>
@stop