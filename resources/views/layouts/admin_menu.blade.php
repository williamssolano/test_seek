<!-- sidebar menu: : style can be found in sidebar.less -->
<ul class="sidebar-menu">
    <!--
    <li>
        <a href="admin.inicio">
            <i class="fa fa-dashboard"></i> <span>{{ trans('greetings.menu_inicio') }}</span>
        </a>
    </li>
    -->



@if (isset($menu))  
        @foreach ( $menu as $key => $val)

            <li class="treeview">
              <a href="#">
                <i class="fa {{ $val[0]->icon }}"></i> <span>{{ $key }}</span>
                <i class="fa fa-angle-left pull-right"></i>
              </a>
              <ul class="treeview-menu">
                   @foreach ( $val as $key2 => $k)                                            
                            @if (!is_array($k))
                                @if ($k->menu_visible == 1)
                                    <li style="margin-left:5px;">
                                       <a href="admin.{{ $k->path }}" data-clave="{{ hash('sha256', Config::get('wpsi.permisos.key').$k->agregar.$k->editar.$k->eliminar) }}" data-accesos="{{ $k->agregar.$k->editar.$k->eliminar }} ">
                                           <i class="fa fa-angle-double-right"></i>{{ $k->submodulo }}
                                       </a>
                                    </li>
                                @endif                            
                            @else
                                <li style="margin-left:5px;">
                                     <a href="#" >
                                         <i class="fa fa-angle-double-right"></i>{{ key($k) }}<i class="fa fa-angle-left pull-right"></i>
                                     </a>
                                    <ul class="treeview-menu" style="margin-left:10px;">                                   
                                    @foreach ( $k[key($k)] as $value )
                                         <li>
                                         <a href="admin.{{ $value->path2 }}" 
                                         data-clave="{{ hash('sha256', Config::get('wpsi.permisos.key').$value->agregar2.$value->editar2.$value->eliminar2) }}" data-accesos="{{ $value->agregar2.$value->editar2.$value->eliminar2 }} "><i class="fa fa-angle-double-right"></i> {{ $value->submodulo2 }} </a></li>
                                    @endforeach
                                    </ul>                                                   
                                </li> 
                          @endif          
                         
                   @endforeach
               </ul>
            </li>
        @endforeach
@endif




 



    <li class="treeview">
        <a href="#">
            <i class="fa fa-shield"></i> <span>{{ trans('greetings.menu_info') }}</span>
            <i class="fa fa-angle-left pull-right"></i>
        </a>
        <ul class="treeview-menu">
            <li><a href="admin.mantenimiento.misdatos"><i class="fa fa-angle-double-right"></i>{{ trans('greetings.menu_info_actualizar') }} </a></li>
        </ul>
    </li>
</ul>