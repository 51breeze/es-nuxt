<?php
declare (strict_types = 1);
include_once(__DIR__ . '/../../server/es/core/System.php');
System::print('----client:defineAppConfig----');
System::setConfig('defineAppConfig',1);
return defineAppConfig([
    'test'=>'dev'
]);