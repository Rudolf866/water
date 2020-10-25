<?php
$path=path();
if(check_auth()){
    switch ($path[2]) {
        case 'admin':
            admin($path);
            break;
        case 'map':
            map($path);
            break;
        case 'lists':
            lists($path);
            break;
        default:
            template('tpl_index');
            break;
    }
}else {
    require_once($_SERVER['DOCUMENT_ROOT'] . '/water/template/tpl_start.php');
    require_once($_SERVER['DOCUMENT_ROOT'] . '/water/template/tpl_login.php');
    require_once($_SERVER['DOCUMENT_ROOT'] . '/water/template/tpl_finish.php');
}