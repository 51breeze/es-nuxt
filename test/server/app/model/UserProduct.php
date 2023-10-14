<?php
declare (strict_types = 1);
namespace app\model;
include_once(__DIR__ . '/../../es/core/System.php');
include_once(__DIR__ . '/../../es/core/Object.php');
include_once(__DIR__ . '/../../es/core/Array.php');
use \think\Model;
use \es\core\System;
class UserProduct extends Model{
    static public function getList($userId,$category=null){
        $model = UserProduct::where('account_id','=',$userId);
        if($category){
            $model=$model->where('category','=',$category);
        }
        return $model->select()->toArray();
    }
    static public function detail($id){
        $model = UserProduct::where('id','=',$id);
        return $model->find();
    }
    public $errorMessage='';
    public function edit($userId,$productId,$data){
        if($userId){
            $recored = $productId ? $this->where('account_id','=',$userId)->where('id','=',$productId)->find() : null;
            if($recored){
                if($recored->status == 2){
                    $this->errorMessage='This record has been approved cannot modified.';
                    return false;
                }
                $has = $this->where('account_id','=',$userId)->where('order_number','=',$data['order_number'])->where('id','<>',$recored->id)->count('id');
                if($has){
                    $this->errorMessage='Order number \'' . ($data['order_number'] ?? null) . '\' already exists.';
                    return false;
                }
                \es\core\es_array_foreach(\es\core\es_object_keys($data),function($name)use(&$data,&$recored){
                    if(System::condition($data[$name] ?? null)){
                        $recored[$name]=$data[$name];
                    }
                });
                $recored->update_at=time();
                if($recored->save()){
                    return $recored->id;
                }
                return false;
            }else{
                $has = $this->where('account_id','=',$userId)->where('order_number','=',$data['order_number'])->count('id');
                if($has){
                    $this->errorMessage='Order number \'' . ($data['order_number'] ?? null) . '\' already exists.';
                    return false;
                }
                $data['status']=1;
                $data['account_id']=$userId;
                $data['config']='';
                $data['create_at']=time();
                $data['update_at']=time();
                return $this->insert($data,true);
            }
        }else{
            return false;
        }
    }
}