<?php
declare (strict_types = 1);
/*
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */
namespace es\core;

/**
 * @name Object.Assign
 */
function es_object_assign($target, ...$args){
    $isObj = is_object($target);
    if( !($isObj || is_array($target)) ) {
        throw new TypeError('Cannot convert null to object');
    }
    $len = count($args);
    for ($index = 0; $index < $len; $index++) {
        $nextSource = $args[ $index ];
        if( is_array($nextSource) || is_object($nextSource) ) {
            foreach ($nextSource as $key => $value) {
                if( $isObj ){
                    $target->{$key} = $value; 
                }else{
                    $target[$key] = $value;
                }
            }
        }
    }
    return $target;
}

/**
 * @name Object.keys
 */
function es_object_keys($target){
    if( is_string($target) ){
        return range(0, mb_strlen($target)-1);
    }
    return array_keys( (array)$target );
}

/**
 * @name Object.values
 */
function es_object_values($target){
    if( is_string($target) ){
        $len = mb_strlen($target);
        $array = [];
        for($i=0;$i<$len;$i++){
            $array[] = mb_substr($target,$i,1);
        }
        return $array;
    }
    return array_values( (array)$target );
}

/**
 * @name propertyIsEnumerable
 * @bind target
 */
function es_object_property_is_enumerable($target, $name){
    if( is_object($target) ){
        return property_exists($target, $name);
    }else if( is_array($target) ){
        return isset( $target[$name] );
    }
    return false;
}

/**
 * @name hasOwnProperty
 * @bind target
 */
function es_object_has_own_property($target, $name){
    if( is_object($target) ){
        return property_exists($target, $name);
    }else if( is_array($target) || is_string($target) ){
        return isset( $target[$name] );
    }
    return false;
}

/**
 * @name valueOf
 * @bind target
 */
function es_object_value_of($target){
    if(is_object($target) && method_exists($target,"valueOf")){
        return $target->valueOf();
    }
    return $target;
}

/**
 * @name toString
 * @bind target
 */
function es_object_to_string($target){
    if( is_callable($target) ){
        $reflect = new \ReflectionFunction($target);
        if( !$reflect->isClosure() ){
            return sprintf('function %s(){[local code]}', $reflect->getName());
        }else{
            return 'function {[local code]}';
        }
    }else if( is_object($target) ){
        if( is_object($target) ){
            if( method_exists($target,'toString') ){
                return $target->toString();
            }else if(method_exists($target,'__toString')){
                return $target->__toString();
            }
        }
        return sprintf('[object %s]', get_class($target));
    }else if( is_array($target) ){
        return implode(', ', $target);
    }
    return json_encode($target,JSON_UNESCAPED_UNICODE);
}
