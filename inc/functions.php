<?php

ini_set('session.gc_maxlifetime', 18000);
session_set_cookie_params(18000);
session_start();
require($_SERVER['DOCUMENT_ROOT'] . '/water/inc/Classes/DBConnect.php');

//$res =connect_db();
//print_r($res);