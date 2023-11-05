/*
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */
///<references from='web.components.Page' />
///<references from='web.events.ComponentEvent' name='ComponentEvent' />
///<references from='System' />
///<import from='element-plus/theme-chalk/base.css' />
///<namespaces name='web' />
///<createClass value='false' />
import {useNuxtApp, applyPlugin, useRuntimeConfig} from '#app/nuxt';
import { useRouter } from '#app/composables/router'
import { unref } from 'vue'

const isServer = !!process.server;
System.env.ssr = isServer;
if( isServer ){
    System.env.setPlatform('EsNuxt', '0.0.1');
}

const privateKey = Symbol('private');
function Application(options){
    Page.call(this, options);
}

Application.prototype = Object.create( Page.prototype );
Object.defineProperty(Application.prototype,'constructor',{value:Application})

Object.defineProperty(Application.prototype,'getNuxtApp',{value:function getNuxtApp(){
    return useNuxtApp();
}});

Object.defineProperty(Application.prototype,'getRuntimeConfig',{value:function getRuntimeConfig(){
    return useRuntimeConfig();
}});

Object.defineProperty(Application.prototype,'plugin',{value: async function plugin( plugin ){
    await applyPlugin(useNuxtApp(), plugin);
    return this;
}});

Object.defineProperty(Application.prototype,'provide',{value:function provide(name,value){
    const {vueApp} = useNuxtApp();
    vueApp.provide(name, value);
    return this;
}});

Object.defineProperty(Application.prototype,'mixin',{value:function mixin(name, method){
    const app = this.app;
    app.mixin({[name]:method});
    return this;
}});

Object.defineProperty(Application.prototype,'locale',{get:function locale(){
    return null;
}});

Object.defineProperty(Application.prototype,'store',{get:function store(){
    return null;
}});

Object.defineProperty(Application.prototype,'directives',{get:function directives(){
    return null;
}});

Object.defineProperty(Application.prototype,'routes',{get:function routes(){
    const router = this.router;
    return router ? router.getRoutes() : [];
}});

Object.defineProperty(Application.prototype,'router',{get:function router(){
   return unref(useRouter());
}});

Object.defineProperty( Application.prototype, 'unmount', {value:function unmount(){
   
}});

Object.defineProperty( Application.prototype, 'invokeHook', {value:function invokeHook(...args){
    if(args[0] ==='component:beforeRender'){
        if( !this[privateKey].componentBeforeRenderHookFlag ){
            this[privateKey].componentBeforeRenderHookFlag = true;
            const items = args.slice(1);
            const hook = (e)=>{
                items.forEach( fn=>{
                    if(typeof fn ==='function'){
                        fn.call(this, e)
                    }
                });
            }
            this.addEventListener('componentInitialized',hook);
            this.addEventListener(ComponentEvent.BEFORE_UPDATE, hook);
        }
        return true;
    }
    return System.invokeHook(...args);
}});