<?php

ini_set('session.gc_maxlifetime', 18000);
session_set_cookie_params(18000);
session_start();
require($_SERVER['DOCUMENT_ROOT'] . '/water/inc/Classes/DBConnect.php');



function path()
{

    return explode('/', $_SERVER['REQUEST_URI']);

}




/**
 * @return для работы с Базой данных
 */
function select_db()
{

    $arr = func_get_args();
    $dbh = $arr[0];
    $cols = $arr[1];
    $table = $arr[2];
    if (array_key_exists(3, $arr)) { $args = $arr[3]; }
    if (array_key_exists(4, $arr)) { $cond = $arr[4]; }
    if (array_key_exists(5, $arr)) { $order = $arr[5]; }
    if (array_key_exists(6, $arr)) { $limit = $arr[6]; }

    if (array_key_exists(3, $arr) && !is_array($args)) { $args = array($args); }

    $s_cols = implode(", ", $cols);
    if (array_key_exists(4, $arr) && $cond != NULL) { $s_cond = " WHERE " . implode(" = ? AND ", $cond) . " = ?"; } else { $s_cond = ""; }

    try {
        $res = $dbh->prepare("SELECT $s_cols FROM `$table` " . $s_cond);
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        if (array_key_exists(4, $arr) && $cond != NULL) {
            $res->execute($args);
        } else {
            $res->execute();
        }
    } catch (Exception $e) {
        echo 'Подключение не удалось: ' . $e->getMessage();
    }

    return $res;

}

function template($func = NULL)
{
    if (isset($_GET)) {
        $func = explode("?", $func);
        $func = $func[0];
        // Костыль, чтобы проходили гет запросы
    }

    require_once($_SERVER['DOCUMENT_ROOT'] . '/water/template/tpl_start.php');
    require_once(realpath($_SERVER["DOCUMENT_ROOT"]) . "/water/template/layout/header.html");
    require_once($_SERVER['DOCUMENT_ROOT'] . '/water/template/tpl_page.php');
    require_once($_SERVER['DOCUMENT_ROOT'] . '/water/template/tpl_finish.php');

}


function admin($path)
{
    if (check_perms($path[3])) {
        template('tpl_' . $path[3]);
    } else {
        template('tpl_insuf');
    }
}

function map($path)
{
    if ($path[3]) {
        template('tpl_map');
    }
}

function lists($path)
{
    if ($path[2]) {
        template('tpl_lists');
    }
}


function check_perms($perm)
{

    $login = get_login();
    $dbh = connect_db();
    $extraSQL = '';

    try {
        $res = $dbh->query("SELECT `perms` FROM `iwater_users` AS u JOIN `iwater_roles` AS r ON (u.role=r.id) WHERE `login`='$login' LIMIT 1");
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (Exception $e) {
        echo 'Подключение не удалось: ' . $e->getMessage();
    }

    $r = $res->fetch(PDO::FETCH_ASSOC);
    $perms = json_decode($r['perms']);

    if (isset($_GET)) {
        $perm = explode("?", $perm);
        $perm = $perm[0];
        // Костыль, чтобы проходили гет запросы
    }

    try {
        $res = $dbh->query("SELECT * FROM `iwater_links` WHERE `desc` = '$perm' LIMIT 1");
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (Exception $e) {
        echo 'Подключение не удалось: ' . $e->getMessage();
    }

    $r = $res->fetch(PDO::FETCH_ASSOC);
    $level = $r['level']; // Уровень доступа необходимый для доступа (тавтология)
    $section = $r['section'] - 1; // Номер объекта, к которому прописаны доступы

    if ( $perms[$section] < $level ) {
        $ok = false;
    } else {
        $ok = $perms[$section];
    }
    return $ok;
}
function check_auth()
{

    $ok = false;
    $dbh = connect_db();
    $cols = array('count(`session`)', 'ban');
    $table = 'iwater_users';

    $session = "";
    if (isset($_SESSION['fggafdfc'])) { $session = $_SESSION['fggafdfc']; }

    $args = array($session);
    $cond = array('session');
    $res = select_db($dbh, $cols, $table, $args, $cond);
    while ($r = $res->fetch(PDO::FETCH_ASSOC)) {
        if ($r['count(`session`)'] == 1 && $r['ban'] == 0) {
            $ok = true;
        }
    }
    return $ok;

}

function get_login()
{

    $dbh = connect_db();
    $cols = array('login');
    $table = 'iwater_users';
    $args = array($_SESSION['fggafdfc']);
    $cond = array('session');
    $res = select_db($dbh, $cols, $table, $args, $cond);
    while ($r = $res->fetch(PDO::FETCH_ASSOC)) {
        $login = $r['login'];
    }
    return $login;

}

/**
 *
 */
function get_title()
{

    $path = path();
    $titles = array('list_users' => 'Список пользователей', 'water' => 'Главная', 'admin' => 'Панель управления', 'add_company' => 'Добавить компанию', 'periods' => 'Изменить периоды', 'add_user' => 'Добавить пользователя', 'add_role' => 'Добавить роль', 'add_client' => 'Добавить клиента', 'list_clients' => 'Список клиентов', 'add_order' => 'Создать заказ', 'list_orders' => 'Список заказов', 'list_orders_app' => 'Список заказов Android/iOS', 'list_unit' => 'Список товаров', 'migrate_order' => 'Оформить заказ','add_list' => 'Добавить путевой лист', 'list_cut' => 'Разделить путевой лист', 'list_lists' => 'Список путевых листов', 'driver_position' => 'Координаты водителя', 'driver_stat' => 'Статистика водителей', 'analytics' => 'Предиктивная аналитика', 'logs' => 'Логи', 'delete_clients' => 'Корзина', 'settings' => 'Настройки', 'driver_list' => 'Путевой лист водителя', 'map' => 'Карта', 'driver_notice' => 'Уведомления');
    $title = 'Не опредлено';
    if (array_key_exists(3, $path)) {
        $title = $titles[$path[3]];
    } elseif ($path[2]) {
        $title = $titles[$path[2]];
    } elseif ($path[1]) {
        $title = $titles[$path[1]];
    }

    return $title;

}