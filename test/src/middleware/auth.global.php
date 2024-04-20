<?php
declare (strict_types = 1);
include_once(__DIR__ . '/../../../server/es/core/System.php');
use \es\core\System;
return defineNuxtRouteMiddleware(function($to,$from){
    System::print('----client:defineNuxtRouteMiddleware----');
    System::setConfig('defineNuxtRouteMiddleware',1);
});