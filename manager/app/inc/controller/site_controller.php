<?php

class site_controller
{
    public function display($info)
    {

        if (!auth_controller::check_login()) {
            basic_redir($GLOBALS["login_url"]);
        }
        
        // Use unified controllers bundle to simplify assets
        $alpineControllers = ['site', 'auth'];

        include(constant("cRootServer") . "ui/common/head.php");
        include(constant("cRootServer") . "ui/common/header.php");
        include(constant("cRootServer") . "ui/page/home.php");
        include(constant("cRootServer") . "ui/common/footer.php");
        include(constant("cRootServer") . "ui/common/foot.php");
    }
}
