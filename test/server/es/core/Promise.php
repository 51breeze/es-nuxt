<?php
declare (strict_types = 1);
/*
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */
namespace es\core;

class Promise{

    static public function all( $target ){
        $array = $target;
        if( is_string($target) ){
            $len = mb_strlen($target);
            for($i=0;$i<$len;$i++){
                $array[] = mb_substr($target,$i,1);
            }
        }else if( !is_array($target) ){
            throw new \Exception('target can only is a string or array.');
        }
        $results = [];
        foreach($array as $item){
            if( $item instanceof Promise){
                if( $item->status==='rejected'){
                    return static::reject($item->error);
                }
                $results[] = $item->result;
            }else{
                $results[] = $item;
            }
        }
        return static::resolve($results ?: null );
    }
    static public function race($target){
        $array = $target;
        if( is_string($target) ){
            return static::resolve(mb_substr($target,0,1));
        }else if( !is_array($target) ){
            throw new \Exception('target can only is a string or array.');
        }
        foreach($array as $item){
            if( $item instanceof Promise){
                if( $item->status==='resolved'){
                    return static::resolve( $item->result );
                }else if( $item->status==='rejected' ){
                    return static::reject($item->error);
                }
            }else{
                return static::resolve( $item );
            }
        }
        return new Promise();
    }
    static public function any($target){
        $array = $target;
        if( is_string($target) ){
            $len = mb_strlen($target);
            for($i=0;$i<$len;$i++){
                $array[] = mb_substr($target,$i,1);
            }
        }else if( !is_array($target) ){
            throw new \Exception('target can only is a string or array.');
        }
        $results = [];
        foreach($array as $item){
            if( $item instanceof Promise){
                if( $item->status==='resolved'){
                    return static::resolve( $item->result );
                }
                $results[] = $item->error;
            }else{
                return static::resolve( $item );
            }
        }
        return static::reject($results ?: null);
    }
    static public function allSettled($target){
        $array = $target;
        if( is_string($target) ){
            $len = mb_strlen($target);
            for($i=0;$i<$len;$i++){
                $array[] = mb_substr($target,$i,1);
            }
        }else if( !is_array($target) ){
            throw new \Exception('target can only is a string or array.');
        }
        $results = [];
        foreach($array as $item){
            if( $item instanceof Promise){
                if( $item->status==='rejected'){
                    $results[] = (object)['reason'=>$item->error,'status'=>'rejected'];
                }else if($item->status==='resolved'){
                    $results[] = (object)['value'=>$item->result,'status'=>'fulfilled'];
                }
            }else{
                $results[] = (object)['value'=>$item,'status'=>'fulfilled'];
            }
        }
        return static::resolve($results);
    }
    static public function reject($value){
        return new Promise(function($resolve,$reject)use(&$value){
            $reject($value);
        });
    }
    static public function resolve($value){
        return new Promise(function($resolve,$reject)use(&$value){
            $resolve($value);
        });
    }
    static public function getInstance( $value ){
        if( $value instanceof Promise ){
            return $value;
        }
        return new Promise(function($resolve,$reject)use(&$value){
            $resolve($value);
        });
    }
    static public function sent( $target ){
        if( $target instanceof Promise ){
            return $target->result;
        }
        return $target;
    }

    private $result = null;
    private $error  = null;
    private $status = 'pending';
    public function __construct( $executor ){
        $resolve = function($value){
            $this->status = 'resolved';
            $this->result = $value;
        };
        $reject = function($reason){
            $this->status = 'rejected';
            $this->error = $reason;
        };
        try{
            if( is_callable($executor) ){
                $executor($resolve, $reject);
            }
        }catch(\Exception $e){
            $reject($e);
        }
    }

    public function then($onFulfilled, $onRejected=null){
        try{
            $value = null;
            if( $this->status ==='resolved'){
                $value = is_callable($onFulfilled) ? $onFulfilled($this->result) : $onFulfilled;
            }else if( $this->status ==='rejected'){
                $value = is_callable($onRejected) ? $onRejected($this->error) : $onRejected;
            }
            if( $value && $value instanceof Promise){
                return $value;
            }
            return static::resolve($value);
        }catch(\Exception $e){
            return static::reject($e);
        }
        return $this;
    }

    public function catch( $onRejected ){
        try{
            if( $this->status ==='rejected'){
                $value = is_callable($onRejected) ? $onRejected($this->error) : $onRejected;
                if( $value && $value instanceof Promise){
                    return $value;
                }
                return static::resolve($value);
            }
        }catch(\Exception $e){
            return static::reject($e);
        }
        return $this;
    }

    public function finally( $onFinally ){
        if( $this->status ==='resolved' || $this->status ==='rejected'){
            if( is_callable($onFinally) ){
                $onFinally();
            }
        }
        return $this;
    }
}
