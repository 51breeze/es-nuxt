<?php
declare (strict_types = 1);
namespace app\model;
include_once(__DIR__ . '/../../es/core/System.php');
include_once(__DIR__ . '/../../es/core/Object.php');
include_once(__DIR__ . '/../../es/core/Array.php');
use \think\Model;
use \es\core\System;
class UserProfile extends Model{
    static public function getProfile($accountId){
        return UserProfile::where('account_id','=',$accountId)->find()->toArray();
    }
    public function edit($accountId,$data){
        if($accountId){
            $profile = $this->where('account_id','=',$accountId)->find();
            if($profile){
                \es\core\es_array_foreach(\es\core\es_object_keys($data),function($name)use(&$data,&$profile){
                    if(System::condition($data[$name] ?? null)){
                        $profile[$name]=$data[$name];
                    }
                });
                $profile->update_at=time();
                return $profile->save();
            }else{
                $data['account_id']=$accountId;
                $data['status']=1;
                $data['create_at']=time();
                $data['update_at']=time();
                $this->insert($data);
                return true;
            }
        }else{
            return false;
        }
    }
}