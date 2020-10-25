<?php

require_once($_SERVER['DOCUMENT_ROOT'] . '/water/inc/functions.php');

// Подключаемся к базе
$dbh=connect_db();

// авторизируемся на начальной странице сайта

if ($_POST) {
    if (isset($_POST['login_form'])) {
        //Авторизация

        $login = trim(filter_input(INPUT_POST, 'login', FILTER_SANITIZE_SPECIAL_CHARS));
        $password = trim(filter_input(INPUT_POST, 'password', FILTER_SANITIZE_SPECIAL_CHARS));
        $error = "";

        $sess = '';
        try {
            $res = $dbh->query("SELECT * FROM `iwater_users` WHERE `login`='$login'");
            $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (Exception $e) {
            echo 'Подключение не удалось: ' . $e->getMessage();
        }
        if ($login != "") {
            while ($r = $res->fetch(PDO::FETCH_ASSOC)) {
                $hash = $r['password'];
                $salt = $r['salt'];
                $sess = $r['session'];
            }
        }
        if ($hash == crypt($password, $salt)) {
            $hash_s = sha1($login . time());
            $_SESSION['fggafdfc'] = $hash_s;
            try {
                $res = $dbh->query("UPDATE `iwater_users` SET `session`='$hash_s' WHERE `login`='$login'");
                $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            } catch (Exception $e) {
                echo 'Подключение не удалось: ' . $e->getMessage();
            }
        }

        header('Location: /water' . $error);
    }
}