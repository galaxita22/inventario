<?php

    /* Por favor no modificar estas variables */ 
    $id = isset($_GET['id']) ? $_GET['id'] : false;
    $v = isset($_GET['v']) ? $_GET['v'] : false;
    /* -------------------------------------- */
    

    if (!$id) {
        /* Redirección a aplicativo de inicio de sesión - ¡NO MODIFICAR! */
        $url = urlencode(( $_SERVER['HTTPS'] ? 'https://' : 'http://' ) . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
        header("location: https://huemul.utalca.cl/sso/login.php?url=".$url);
        /* ----------------------------------------------------------- */
    } elseif ($v) {

        /* Configuración de sesión - Según lo requerido en el sistema, tener en cuenta que sesión del IDP-SP dura 25 min*/
        error_reporting(-1);
        ini_set('display_errors', 'On');
        ini_set('session.gc_maxlifetime','900');
        ini_set('session.cookie_lifetime','900');
        session_start();
        $_SESSION['id'] = $id;
        $_SESSION['sso'] = true;
        /*-------------------------*/ 
        /* Link de página de inicio sistema a loguear - Modificable*/
        $url_backend = "https://backend-service-136368519148.us-central1.run.app/api/accounts/sso-callback?id=" . urlencode($id);
        header("location: " . $url_backend);
        /* ------------------------------------------ */
    }

?>