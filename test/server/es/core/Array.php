<?php
declare (strict_types = 1);
/*
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */
namespace es\core;
include_once(__DIR__ . '/System.php');
include_once(__DIR__ . '/Iterator.php');
use \es\core\System;
use \es\core\Iterator;

/**
 * @name filter
 * @bind array
 */
function es_array_filter($array, $callback, $thisArg=null){
    $callback = $thisArg ? System::bind($callback,$thisArg) : $callback;
    return array_values(array_filter($array,function($value,$key)use(&$array,&$callback){
        return $callback($value,$key,$array);
    },ARRAY_FILTER_USE_BOTH));
}

/**
 * @name findIndex
 * @bind array
 */
function es_array_find_index($array, $callback, $thisArg=null){
    $callback = $thisArg ? System::bind($callback,$thisArg) : $callback;
    foreach( $array as $key=>$value){
       if( $callback($value,$key,$array) ){
           return $key;
       }
    }
    return -1;
}

/**
 * @name find
 * @bind array
 */
function es_array_find($array, $callback, $thisArg=null){
    $callback = $thisArg ? System::bind($callback,$thisArg) : $callback;
    foreach( $array as $key=>$value){
       if( $callback($value,$key,$array) ){
           return $value;
       }
    }
    return null;
}

/**
 * @name every
 * @bind array
 */
function es_array_every($array, $callback, $thisArg=null){
    $callback = $thisArg ? System::bind($callback,$thisArg) : $callback;
    foreach( $array as $key=>$value){
       if( !$callback($value,$key,$array) ){
           return false;
       }
    }
    return true;
}

/**
 * @name some
 * @bind array
 */
function es_array_some($array, $callback, $thisArg=null){
    $callback = $thisArg ? System::bind($callback,$thisArg) : $callback;
    foreach( $array as $key=>$value){
       if( $callback($value,$key,$array) ){
           return true;
       }
    }
    return false;
}

/**
 * @name map
 * @bind array
 */
function es_array_map($array, $callback, $thisArg=null){
    $callback = $thisArg ? System::bind($callback,$thisArg) : $callback;
    $index = 0;
    return array_map(function($value)use(&$array,&$callback,&$index){
        return $callback($value,$index++,$array);
    },$array);
}

/**
 * @name searchIndex
 * @bind array
 */
function es_array_search_index($array, $value){
    $result = array_search($value,$array);
    return $result === false ? -1 : $result;
}

/**
 * @name searchLastIndex
 * @bind array
 */
function es_array_search_last_index($array, $value, $formIndex=null ){
    $len = count($array);
    $index = $formIndex===null ? $len - 1 : min($len, max($formIndex,$len));
    while( $index > 0 ){
        if( isset($array[$index]) && $array[$index] === $value ){
            return $index;
        }
        $index--;
    }
    return -1;
}

/**
 * @name concat
 * @bind array
 */
function es_array_concat(array $array, ...$items){
    return array_merge($array, es_array_flat( $items ) );
}

/**
 * @name fill
 * @bind array
 */
function es_array_fill($array, $value, $start=0, $end=0){
    $len = count($array);
    $start = $start < 0 ? max($start+$len, 0) : min($start,$len);
    $end   = $end < 0 ?  max($end+$len, 0) : min($end,$len);
    while ($start < $end) {
        $array[ $start ] = $value;
        $start++;
    }
    return $array;
}

/**
 * @name foreach
 * @bind array
 */
function es_array_foreach($array, $callback, $thisArg=null){
    $callback = $thisArg ? System::bind($callback,$thisArg) : $callback;
    array_walk($array,$callback,$array);
}

function es_array_is( $array ){
    if( !is_array($array) )return false;
    $key = array_key_last( $array );
    if( $key === null )return true;
    return !is_string( $key );
}

/**
 * @name flat
 * @bind array
 */
function es_array_flat($array, $depth=1){
    if( $depth < 1)return $array;
    return es_array_reduce($array, function($all, $val)use($depth){
        $result = is_array($val) && $depth > 1 ? es_array_flat($val, $depth - 1) : $val;
        if( !es_array_is($result) ){
            $result = [$result];
        }
        array_push($all, ...$result);
        return $all;
    },[]);
}

/**
 * @name flatMap
 * @bind array
 */
function es_array_flat_map($array, $callback, $thisArg=null){
    $callback = $thisArg ? System::bind($callback,$thisArg) : $callback;
    return es_array_reduce( $array, function($all, $val, $index, $array)use(&$callback){
        $result = $callback($val,$index,$array);
        if( !es_array_is($result) ){
            $result = [$result];
        }
        array_push($all, ...$result);
        return $all;
    },[]);
}

/**
 * @name reduce
 * @bind array
 */
function es_array_reduce($array, $callback, $initial=null){
    $len = count( $array );
    $k = 0;
    $value = $initial;
    if ( $initial === null ) {
      while ( $k < $len && !isset( $array[$k] ) ) {
         $k++;
      }
      if ( $k >= $len) {
        throw new \TypeError( 'Reduce of empty array with no initial value' );
      }
      $value = $array[ $k++ ];
    }

    while ($k < $len) {
      if ( isset( $array[ $k ] ) ) {
        $value = $callback( $value, $array[$k], $k, $array);
      }
      $k++;
    }
    return $value;
}

/**
 * @name reduceRight
 * @bind array
 */
function es_array_reduce_right($array, $callback, $initial=null){
    $len = count( $array );
    $k = $len-1;
    $value = $initial;
    if ( $initial === null ) {
        while ( $k >= 0 && !isset( $array[$k] ) ) {
            $k--;
        }
        if ( $k < 0 ) {
            throw new \TypeError( 'Reduce of empty array with no initial value' );
        }
        $value = $array[ $k-- ];
    }

    while ($k >= 0) {
        if ( isset( $array[ $k ] ) ) {
            $value = $callback( $value, $array[$k], $k, $array);
        }
        $k--;
    }
    return $value;
}

/**
 * @name sort
 * @bind array
 * @reference array
 */
function es_array_sort(&$array, $callback=null){
    if( is_callable($callback) ){
        usort($array, $callback);
        return $array;
    }
    sort( $array, SORT_STRING);
    return $array;
}

/**
 * @name Array
 * @bind array
 */
function es_array_new( ...$args ){
    if( count($args) === 1 && is_numeric($args[0]) ){
        return array_fill(0, $args[0], null);
    }
    return array_slice((array)$args,0);
}

/**
 * @name copyWithin
 * @bind array
 */
function es_array_copy_within($array,$target, $start, $end){
    $len = count($array);
    $relativeTarget = $target >> 0;
    $to = $relativeTarget < 0 ? max($len + $relativeTarget, 0) : min($relativeTarget, $len);
    $relativeStart = $start >> 0;
    $from = $relativeStart < 0 ? max($len + $relativeStart, 0) : min($relativeStart, $len);
    $relativeEnd = $end === null ? $len : $end >> 0;
    $final = $relativeEnd < 0 ? max($len + $relativeEnd, 0) : min($relativeEnd, $len);
    $count = min($final - $from, $len - $to);
    $direction = 1;
    if ($from < $to && $to < ($from + $count)) {
      $direction = -1;
      $from += $count - 1;
      $to += $count - 1;
    }
    while ($count > 0) {
      if ( isset($array[$from]) ) {
        $array[ $to ] = $array[ $from ];
      }else{
        unset($array[ $to ]);
      }
      $from += $direction;
      $to += $direction;
      $count--;
    }
    return $array;
}
