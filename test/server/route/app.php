<?php
declare (strict_types = 1);
use think\facade\Route;
Route::get('index$', '\app\http\Account@index');