<!-- header logo: style can be found in header.less -->
        <header class="header">
            {{-- <a href="/" class="logo">
                Seek Test
            </a> --}}
            <!-- Header Navbar: style can be found in header.less -->
            <nav class="navbar navbar-static-top" role="navigation">
                <!-- Sidebar toggle button-->
                <a href="#" class="navbar-btn sidebar-toggle" data-toggle="offcanvas" role="button">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </a>
                <div class="navbar-right">
                    <ul class="nav navbar-nav">
                        <!-- User Account: style can be found in dropdown.less -->
                        <li class="dropdown user user-menu">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                                <i class="glyphicon glyphicon-user"></i>
                                <span>{{ Session::get('usuario') }} <i class="caret"></i></span>
                            </a>
                            <ul class="dropdown-menu">
                                <!-- User image -->
                                <li class="user-header bg-light-blue" data-toggle="modal" data-target="#imagenModal">
                                    @if (Session::get('imagen')!=null)
                                        <img src="img/user/<?= md5('u'.Auth::id()).'/'.Session::get('imagen'); ?>" class="img-circle" alt="User Image" />
                                    @else
                                        <img src="" class="img-circle" alt="User Image" />
                                    @endif
                                    <p>
                                        {{ Session::get('usuario') }}
                                        <small>{{ trans('greetings.desde_usuario') .' '. date( "Y-m-d",strtotime(Session::get('created_at')) ) }}</small>
                                    </p>
                                </li>
                                <!-- Menu Body -->
                                <!--<li class="user-body">
                                    <div class="col-xs-4 text-center">
                                        <a href="#">Followers</a>
                                    </div>
                                    <div class="col-xs-4 text-center">
                                        <a href="#">Sales</a>
                                    </div>
                                    <div class="col-xs-4 text-center">
                                        <a href="#">Friends</a>
                                    </div>
                                </li>-->
                                <!-- Menu Footer-->
                                <li class="user-footer">
                                    <div class="pull-right">
                                        <a href="salir" class="btn btn-default btn-flat">{{ trans('greetings.cerrar_session') }}</a>
                                    </div>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
