<div class="main">
	<div class="login_form">
		<div class="login_form_name">
			<!-- Авторизация -->
			<img src="/water/css/image/main_logo.png" alt="Логотип">
		</div>
		<form method="post" action="/water/backend.php" autocomplete="off">
			<input class="input" name="login" type="text" placeholder="Логин" autocomplete="off">
			<input class="input" name="password" type="password" placeholder="Пароль" autocomplete="off">
			<input class="input" name="login_form" type="hidden">
			<input class="input button" name="submit" type="submit" value="Войти">
              <div style="    margin-top: 25px;   color: red;" id="err"> <?php if(isset($_GET['err'])){ echo "Неверный логин или пароль";} ?></div>
</form>
</div>
<div>

    <style media="screen">
        body {
            background-color: #fff;
        }
        .login_form form {
            /* background-color: #eff3f6;
            margin: 20px 0 0 22px;
            position: absolute; */
        }
        .login_form_name {
            margin: 0 0 25px 145px;
        }

        .login_form {
            width: 300px;
            left: 50%;
            margin: 0 0 0 -150px;
        }
        .login_form img {
            max-width: 200px;
            left: 50%;
            margin: 0 0 0 -85px;
        }
        .login_form input {
            width: 100%;
            background-color: #eff3f6;
            border: 0;
            border-bottom: 1px solid #74ccea;
        }
        .login_form input:-webkit-autofill{
            box-shadow:inset 0 0 0 1000px #fff;
        }
        .input.button {
            width: 40%;
            margin: 30px 30% 0px 30%;
            height: 30px;
            background-color: #0157a4;
            border-radius: 15px;
        }
        .input.button:hover {
            background-color: #136cbb;
            color: #e7edf4;
        }
    </style>