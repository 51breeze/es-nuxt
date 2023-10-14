<?php
declare (strict_types = 1);
/*
 * EaseScript
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */
namespace es\core;
include_once(__DIR__ . '/System.php');
use \es\core\System;

final class Reflect{
    /**
     * 针对全局对象中的方法进行兼容
     */
    final static private function method($type){
        static $map=null;
        if( $map === null ){
            $map = [
                "function"=>function (&$target, &$name, $args=[]) {
                    switch ( $name ) {
                        case "call" :
                        case "apply" :
                            return  [["Reflect","apply"], $args ];
                        case "bind" :
                            return  [["System","bind"], $args ];
                    }
                    return null;
                },
                "array"=>function (&$target, &$name, $args=[]){
                    if( $target ==='Array' ){
                        switch( $name ){
                            case 'from' :
                                return [['System','toArray'], $args ];
                            case 'of'  :   
                                return ['es_array_new', $args ];
                            case 'isArray'  :   
                                return ['is_array', $args ];
                        }
                        return null;
                    }
                    switch ( $name ){
                        case "slice" :
                            return ["array_slice", array_merge( [&$target], $args) ];
                        case "indexOf" :
                            return ['es_array_search_index', array_merge( [&$target], $args) ];
                        case "splice" :
                            return ["array_splice", array_merge( [&$target], $args) ];
                        case "push" :
                            return ["array_push", array_merge( [&$target], $args) ];
                        case "shift" :
                            return ["array_shift", array_merge( [&$target], $args) ];
                        case "unshift" :
                            return ["array_unshift", array_merge( [&$target], $args) ];
                        case "pop" :
                            return ["array_pop", [&$target] ];
                        case "length" :
                            return ["count", [&$target], 2];
                        case "concat" :
                            return ['es_array_concat', [array_merge( [&$target], $args)] ];
                        case "fill" :
                            return ["array_fill", array_merge( [&$target], $args) ];
                        case "filter" :
                            return ["es_array_filter", array_merge( [&$target], $args) ];
                        case "forEach" :
                            return ["es_array_foreach", array_merge( [&$target], $args) ];
                        case "join" :
                            return ["implode", array_merge($args,[&$target]) ];
                        case "unique" :
                            return ["array_unique", [&$target] ];
                        case "sort" :
                            return ["es_array_sort", array_merge( [&$target], $args) ];
                        case "map" :
                            return ["es_array_map", array_merge([&$target],$args) ];
                        case "lastIndexOf" :
                            return ['es_array_search_last_index', array_merge( [&$target], $args) ];
                        case "find" :
                            return ['es_array_find', array_merge( [&$target], $args) ];
                        case "includes" :
                            return ['in_array', array_merge($args, [&$target]) ];
                        case "entries" :
                        case "values" :
                            return ['array_values', [&$target] ];
                        case "every" :
                            return ['es_array_every', array_merge( [&$target], $args)];
                        case "some" :
                            return ['es_array_some', array_merge( [&$target], $args)];
                        case "fill" :
                            return ['es_array_fill', array_merge( [&$target], $args)];
                        case "flat" :
                            return ['es_array_flat', array_merge( [&$target], $args)];
                        case "flatMap" :
                            return ['es_array_flat_map', array_merge( [&$target], $args)];
                        case "reduce" :
                            return ['es_array_reduce', array_merge( [&$target], $args)];
                        case "reduceRight" :
                            return ['es_array_reduce_right', array_merge( [&$target], $args)];
                        case "keys" :
                            return ['array_keys', [&$target]];
                        case "reverse" :
                            return ['array_reverse',  [&$target]];
                        case "copyWithin" :
                            return ['es_array_copy_within',  [&$target]];
                        case "hasOwnProperty" :
                        case "propertyIsEnumerable" :
                            return ['array_key_exists',  array_merge($args,[&$target])];
                        case "toLocaleString" :
                        case "toString" :
                            return ['implode',  [', ',&$target]];
                        case "valueOf" :
                            return [function()use(&$target){return $target;},[]];
                    }
                    return null;
                },
                "string"=>function (&$target, &$name, $args=[]){
                    switch ( $name ){
                        case "length" :
                            return ["mb_strlen", [$target], 2];
                        case "replace" :
                            return ["es_string_replace", array_merge([$target],$args)];
                        case "replaceAll" :
                            return ["es_string_replace_all", array_merge([$target],$args)];
                        case "indexOf" :
                            return ['es_string_index', array_merge( [$target], $args) ];
                        case "lastIndexOf" :
                            return ['es_string_last_index', array_merge( [$target], $args) ];
                        case "match" :
                        case "matchAll" :
                        case "search" :
                            if( System::typeof( $args[0] ) ==='regexp' ){
                                return [ [$args[0],$name], [$target] ];
                            }else{
                                $classRegExp = System::getCoreSystemNamespace('RegExp');
                                return [ [new $classRegExp($args[0]),$name], [$target] ];
                            }
                        case "split" :
                            return ["explode", [$args[0],$target]];
                        case "charAt" :
                            return ["mb_substr", [$target,$args[0],$args[0]+1] ];
                        case "charCodeAt" :
                            return ["ord", [mb_substr($target,$args[0],$args[0]+1)]];
                        case "repeat" :
                            return ["str_repeat",  array_merge([$target], $args)];
                        case "slice" :
                            return ["es_string_slice",array_merge([$target], $args)];
                        case "substring" :
                            return ["es_string_substring",array_merge([$target], $args)];
                        case "substr" :
                            return ["mb_substr",array_merge([$target], $args)];
                        case "toLocaleLowerCase" :
                        case "toLowerCase" :
                            return ["strtolower",[$target]];
                        case "toLocaleUpperCase" :
                        case "toUpperCase" :
                            return ["strtoupper",[$target]];
                        case "trim" :
                            return ["trim",[$target]];
                        case "trimRight" :
                            return ["rtrim",[$target]];
                        case "trimLeft" :
                            return ["ltrim",[$target]];
                        case "includes" :
                            return [function($target,$needle){
                                return @strpos( $target, $needle) !== false;
                            },array_merge([$target], $args)];
                        case "concat" :
                            return ["implode",  array_merge([""], array_merge([$target], $args))];
                        case "padEnd" :
                            return ["str_pad", array_merge([$target], array_merge( array_pad( $args,3," " ), [STR_PAD_RIGHT] ))];
                        case "padStart" :
                            return ["str_pad", array_merge([$target], array_merge( array_pad( $args,3," " ), [STR_PAD_LEFT] ))];
                        case "valueOf" :
                        case "toString" :
                            return ['strval', [$target]];
                        case "propertyIsEnumerable" :
                        case "hasOwnProperty" :
                            return ['isset', array_merge([$target],$args) ];
                    }
                    return null;
                },
                "math"=>function (&$target, &$name, $args=null){
                    $callback = function($val){return $val;};
                    switch ( $name ){
                        case "E" :
                            return [$callback,[2.718281828459045]];
                        case "LN10" :
                            return [$callback,[2.302585092994046]];
                        case "LN2" :
                            return [$callback,[0.6931471805599453]];
                        case "LOG2E" :
                            return [$callback,[1.4426950408889634]];
                        case "LOG10E" :
                            return [$callback,[0.4342944819032518]];
                        case "PI" :
                            return [$callback,[3.141592653589793]];
                        case "SQRT1_2" :
                            return [$callback,[0.7071067811865476]];
                        case "SQRT2" :
                            return [$callback,[1.4142135623730951]];
                        case "abs" :
                        case "acos" :
                        case "asin" :
                        case "atan" :
                        case "atan2" :
                        case "ceil" :
                        case "cos" :
                        case "exp" :
                        case "log" :
                        case "max" :
                        case "min" :
                        case "pow" :
                        case "sin" :
                        case "sqrt" :
                        case "tan" :
                        case "round" :    
                        case "floor" :
                            return [$name, [$args[0]]];
                        case "random" :
                            return [function(){
                                return mt_rand(1,2147483647) / 2147483647;
                            },[]];
                       
                    }
                    return null;
                },
                "number"=>function (&$target, &$name, $args=null){
                    $callback = function($val){return $val;};
                    switch ( $name ){
                        case "toFixed" :
                            return ['es_number_to_fixed', [$target, $args[0]]];
                        case "toExponential" :
                            return ['es_number_to_exponential', [$target, $args[0]]];
                       
                    }
                    return null;
                }
            ];
        }
        return $map[ $type ] ?? null;
    }

    /**
     * 获取对象中的方法或者属性
     */
    final static private function getReflectionMethodOrProperty( $target, $name, $accessor='',$scope=null){
        if( $target==null ){
            return null;
        }

        $reflect = null;
        if( is_string($target) ){
            $reflect = new \ReflectionClass( $target );
        } else{
            $reflect = new \ReflectionObject( $target );
        }

        $type = 0;
        $method = null;
        //在实例对象中查找
        if( $reflect->hasProperty($name) ){
            $type = 1;
            $method = $reflect->getProperty($name);
        }else if( $accessor && $reflect->hasMethod( $accessor.$name ) ){
            $type = 2;
            $name = $accessor.$name;
            $method = $reflect->getMethod( $name );
        }else if(  $reflect->hasMethod( $name ) ){
            $type = 3;
            $name = $name;
            $method = $reflect->getMethod( $name );
        }

        $scopeReflect = null;

        //如果指定的$target是$scope的子类，尝试在作用域中查找
        if( $type === 0 && $scope && is_subclass_of($target, $scope) ){
            $scopeReflect = is_string($scope) ? new \ReflectionClass($scope) : new \ReflectionObject( $scope );
            if( $scopeReflect->hasProperty($name) ){
                $type = 1;
                $method = $scopeReflect->getProperty($name);
            }else if( $accessor && $scopeReflect->hasMethod( $accessor.$name ) ){
                $type = 2;
                $name = $accessor.$name;
                $method = $scopeReflect->getMethod( $name );
            }else if( $scopeReflect->hasMethod( $name ) ){
                $type = 3;
                $name = $name;
                $method = $scopeReflect->getMethod( $name );
            }
        }

        if( $method === null )return null;
        $accessible = $method->isPublic();
        if( $scope != null && !$accessible ){
            if( $scopeReflect ===null ){
                $scopeReflect = is_string($scope) ? new \ReflectionClass($scope) : new \ReflectionObject( $scope );
            }
            if( $method->isPrivate() && $method->class === $scopeReflect->getName() ){
                $method->setAccessible( true );
                $accessible = true;
            }else if( $method->isProtected() && ( $method->class === $scopeReflect->getName() || $scopeReflect->isSubclassOf( $method->class ) ) ){
                $method->setAccessible( true );
                $accessible=true;
            }
        }
        return array($type, $method, $accessible, $reflect);
    }

    /**
     * Reflect.construct() 方法的行为有点像 new 操作符 构造函数 ， 相当于运行 new target(...args).
     * @param target
     * @param argumentsList
     * @returns {*}
     */
    final static public function construct($scope, $target , $args=null ){
        if( class_exists($target) ){
            $reflect = new \ReflectionClass( $target );
            if( $reflect->isAbstract() ){
                throw new TypeError('Abstract class cannot be instantiated');
            }
            if ($args && is_array($args) ) {
                return $reflect->newInstanceArgs($args);
            } else {
                return $reflect->newInstance($args);
            }
        }else{
            throw new \TypeError('Not found the "'.$target.'" class.');
        }
    }

    /**
     * 调用指定的方法
     */
    final static public function apply( $target, &$thisArg=null, array $argumentsList=[] ){
        if( !is_callable($target) ){
            throw new \TypeError('target is not callable');
        }
        if( $thisArg !== null ){
            $target = System::bind($target, $thisArg);
        }
        return call_user_func_array( $target, !is_array($argumentsList) ? array() :  $argumentsList );
    }

    /**
     * 调用指定对象中的方法
     */
    final static public function call( $scope, &$target, $name=null, array $args=[], $thisArg=null, $isStatic=false){
        $type_name = gettype($target);
        if($isStatic===true){
            if( $target ==='Array' ){
                $type_name = 'array';
            }else if( $target ==='Math' ){
                $type_name = 'math';
            }
        }
        if($type_name ==="integer" || $type_name ==="double"){
            $type_name = 'number';
        }
        switch ($type_name) {
            case 'string' :
            case 'array' :
            case 'math' :
            case 'number' :
                $object = self::method( $type_name );
                if( $object ){
                    $method_array = $object($target, $name, $args);
                    if( $method_array ){
                        @list($method,$args,$type) = $method_array;
                        if( $type !== 2 ){
                            if( substr($method,0,3) ==='es_' ){
                                $method = System::getCoreSystemNamespace( $method );
                            }
                            return call_user_func_array( $method, $args);
                        }
                        throw new \Error( $name." is not callable.");
                    }
                }
                throw new \Error( $name." method is not exists.");
        }

        if( is_callable($target) && $name===null ){
            return Reflect::apply($target, $thisArg, $args);
        }

        if( !is_object($target) ){
            throw new \Error( 'target is non-object');
        }

        $desc =  self::getReflectionMethodOrProperty($target, $name,'',$scope);
        if( $desc ){
            list($type, $method, $accessible) = $desc;
            if( !$accessible ){
                throw new \Error( $name." method is not accessible");
            }
            if( $type===3 ){
                $thisArg = $thisArg==null && !is_string($target) ? $target : $thisArg;
                if( $thisArg != null && $thisArg !== $target ){
                    $fn = \Closure::bind( $method->getClosure($thisArg), $thisArg );
                    return call_user_func_array($fn, $args);
                }
                return !$args ? $method->invoke( $thisArg ) : $method->invokeArgs( $thisArg , $args );
            }else if( method_exists($target, '__call') ){
                return $target->__call($name, $args);
            }
        }
        throw new \Error( $name." method is not exists.");
    }

    /**
     * 获取指定对象中的属性值
     */
    final static public function get( $scope, $target, $name, $thisArg=null, $isStatic=false){
        $type_name = gettype($target);
        if($isStatic===true){
            if( $target ==='Array' ){
                $type_name = 'array';
            }else if( $target ==='Math' ){
                $type_name = 'math';
            }
        }
        if($type_name ==="integer" || $type_name ==="double"){
            $type_name = 'number';
        }
        switch ($type_name) {
            case 'string' :
            case 'array' :
            case 'math' :
                if( isset( $target[$name] ) ){
                    return $target[$name];
                }else{
                    $object = self::method( $type_name );
                    if( $object ){
                        $method_array = $object($target,$name, []);
                        if( $method_array ){
                            @list($method,$args,$type) = $method_array;
                            if( $type === 2 ){
                                return call_user_func_array($method, $args);
                            }else{
                                if( substr($method,0,3) ==='es_' ){
                                    $method = System::getCoreSystemNamespace( $method );
                                }
                            }
                            return (new \ReflectionFunction($method))->getClosure();
                        }
                    }
                }
                return null;
        }

        if( !is_object($target) ){
            //throw new \Error( 'target is non-object');
            return null;
        }

        $desc = self::getReflectionMethodOrProperty($target, $name,'get', $scope);
        if( $desc ){
            list($type, $method, $accessible) = $desc;
            if( !$accessible ){
                throw new \Error( $name." is not accessible");
            }
            if( $type === 3 ){
                return $method->getClosure($target);
            }else if( $type===2 ){
                $thisArg = $thisArg==null ? $target : $thisArg;
                if( $thisArg !== $target ){
                    $fn = \Closure::bind( $method->getClosure($target), $thisArg );
                    return $fn();
                }
                return $method->invoke( $thisArg );
            }else if($type===1){
                return $method->getValue($target);
            }
        }else if(method_exists($target, '__get') ){
            return $target->__get( $name );
        }
        return null;
    }

    /**
     * 设置指定对象中的属性值
     */
    final static public function set($scope, &$target, $name, $value, $thisArg=null, $isStatic=false){
        $type_name = gettype($target);
        switch ($type_name) {
            case 'array' :
                return $target[ $name ]=$value;
            case 'object' :
                if( $target instanceof \stdClass){
                    return $target->$name=$value;
                }
        }

        if( !is_object($target) ){
            throw new \Error( 'target is non-object');
        }

        $desc =  self::getReflectionMethodOrProperty($target, $name,'set', $scope);
        if( $desc ){
            list($type, $method, $accessible) = $desc;
            if( !$accessible ){
                throw new \Error( $name." is not accessible");
            }
            if( $type===2 ){
                $thisArg = $thisArg==null ? $target : $thisArg;
                if( $thisArg!==$target ){
                    $fn = \Closure::bind( $method->getClosure($target), $thisArg);
                    return $fn( $value );
                }
                $method->invoke( $thisArg , $value );
                return $value;
            }else if($type === 1){
                $method->setValue($target, $value);
                return $value;
            }
            throw new \Error( $name." is not writeable.");
        }
        throw new \Error( $name." is not exists.");
    }

    /**
     * 指定对象中的属性值是否存在
     */
    final static public function has($scope, $target, $name){
        return !!static::getReflectionMethodOrProperty($target, $name,'get', $scope);
    }

    /**
     * 对指定对象中的属性做增量操作
     */
    final static public function incre($scope, &$target, $propertyKey, $flag=false){
        $val = static::get($scope,$target, $propertyKey, null );
        $ret = $val+1;
        static::set($scope,$target, $propertyKey, $ret , null);
        return !$flag ? $val : $ret;
    }

    /**
     * 对指定对象中的属性做减量操作
     */
    final static public function decre($scope, &$target, $propertyKey, $flag=false){
        $val = static::get($scope,$target, $propertyKey, null);
        $ret = $val-1;
        static::set($scope,$target, $propertyKey, $ret , null);
        return !$flag ? $val : $ret;
    }
}
