<?php
declare (strict_types = 1);
namespace app\http;
include_once(__DIR__ . '/Base.php');
use \app\http\Base;
class Account extends Base{
    private $lang='sss';
    public function index(){
        cookie('name','zhansan');
        cookie('age','30');
        return $this->success([
            'msg'=>'Account create. 66666666666'
        ]);
    }
}