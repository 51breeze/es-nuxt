<?php
declare (strict_types = 1);
include_once(__DIR__ . '/es/core/System.php');
include_once(__DIR__ . '/es/core/Promise.php');
use \es\core\System;
use \es\core\Promise;
class App{
    public function onInitialized(){
        return new \es\core\Promise(function($resolve,$reject){
            try{
                $resolve(call_user_func(function(){
                    System::setConfig('http.request.baseURL','/api');
                    System::registerHook('httpRequestCreated',function($request){
                        $request->interceptors['response']->use(function($res){
                            if($res && $res->status === 200){
                                return $res->data;
                            }else{
                                return [];
                            }
                        });
                    });
                }));
            }catch(\Exception $e){
                $reject($e);
            }
        });
    }
    public function render($h){
        $createNode = System::bind([$this,'createElement'],$this);
        return $createNode('div',null,[
            $createNode(Viewport::class)
        ]);
    }
}