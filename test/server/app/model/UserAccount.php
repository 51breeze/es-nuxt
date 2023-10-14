<?php
declare (strict_types = 1);
namespace app\model;
include_once(__DIR__ . '/../../es/core/System.php');
include_once(__DIR__ . '/UserProfile.php');
use \think\Model;
use \es\core\System;
use \app\model\UserProfile;
class UserAccount extends Model{
    private $errorMessage='';
    private $errorCode=1500;
    public function getError(){
        return $this->errorMessage;
    }
    public function getErrorCode(){
        return $this->errorCode;
    }
    public function createAccount(string $account,string $password){
        if(!$account){
            $this->errorMessage='Account is not empty.';
            $this->errorCode=1501;
            return false;
        }else if(!System::condition(filter_var($account,FILTER_SANITIZE_EMAIL))){
            $this->errorMessage='Account is not a vaild email format.';
            $this->errorCode=1502;
            return false;
        };
        if(!$password || mb_strlen($password) < 6){
            $this->errorCode=1503;
            $this->errorMessage='Password invaild.';
            return false;
        }
        if($this->findAccount($account)){
            $this->errorCode=1500;
            $this->errorMessage='Account already exists. please to login';
            return false;
        }
        $password=md5($password);
        $result = $this->insertGetId([
            'account'=>$account,
            'password'=>$password,
            'status'=>1,
            'create_at'=>time(),
            'update_at'=>time()
        ]);
        if(System::condition($result)){
            $profile = new UserProfile();
            $profile->edit($result,[
                'email'=>$account,
                'status'=>1
            ]);
        }
        return $result;
    }
    public function resetPassword(string $account,string $password){
        if(!$account){
            $this->errorMessage='Account is not empty.';
            $this->errorCode=1501;
            return false;
        }else if(!System::condition(filter_var($account,FILTER_SANITIZE_EMAIL))){
            $this->errorMessage='Account is not a vaild email format.';
            $this->errorCode=1502;
            return false;
        };
        if(!$password || mb_strlen($password) < 6){
            $this->errorCode=1503;
            $this->errorMessage='Password invaild.';
            return false;
        }
        $data = $this->findAccount($account);
        if(!$data){
            $this->errorCode=1504;
            $this->errorMessage='Account is not exists.';
            return false;
        }else if($data->status != 1){
            $this->errorCode=1505;
            $this->errorMessage='Account is disabled.';
            return false;
        };
        $data->update_at=time();
        $data->password=md5($password);
        return $data->save();
    }
    public function findAccount(string $account){
        return $this->where('account','=',$account)->find();
    }
    public function findAccountById($id){
        return $this->where('id','=',$id)->find();
    }
}