/*
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */
///<references from='web.components.Page' />
///<references from='web.events.ComponentEvent' name='ComponentEvent' />
///<references from='System' />
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
    System.setConfig('#global#application#instance#',this);
    const globals = this.globals;
    const {vueApp} = useNuxtApp();
    this[privateKey] = {vueApp};
    if(globals){
        const dataset = vueApp.config.globalProperties || (vueApp.config.globalProperties={});
        Object.keys(globals).forEach(key=>{
            if(Object.prototype.hasOwnProperty.call(dataset, key)){
                console.warn(`[ex-nuxt] global properties the '${key}' already exists. maybe affect references of the "vue.config.globalProperties"`)
            }
            dataset[key] = globals[key];
        });
    }
    const directives = this.directives;
    if(directives){
        Object.keys(directives).forEach( key=>{
            if( vueApp.directive(key) ){
                console.error(`[ex-nuxt] global directives the '${key}' already exists.`)
            }else{
                vueApp.directive(key, directives[key]);
            }
        });
    }
    console.log("==========application:created===========")
    System.invokeHook('application:created', this);
}

Application.prototype = Object.create( Page.prototype );
Object.defineProperty(Application.prototype,'constructor',{value:Application})

Object.defineProperty(Application.prototype,'getNuxtApp',{value:function getNuxtApp(){
    return useNuxtApp();
}});

Object.defineProperty(Application.prototype,'getVueApp',{value:function getVueApp(){
    const {vueApp} = this[privateKey];
    return vueApp;
}});

Object.defineProperty(Application.prototype,'plugin',{value: async function plugin( plugin ){
    await applyPlugin(useNuxtApp(), plugin);
    return this;
}});

Object.defineProperty(Application.prototype,'provide',{value:function provide(name,value){
    const {vueApp} = this[privateKey];
    vueApp.provide(name, value);
    return this;
}});

Object.defineProperty(Application.prototype,'mixin',{value:function mixin(name, method){
    const {vueApp} = this[privateKey];
    vueApp.mixin({[name]:method});
    return this;
}});

Object.defineProperty(Application.prototype,'locale',{get:function locale(){
    return null;
}});

Object.defineProperty(Application.prototype,'store',{get:function store(){
    return null;
}});

Object.defineProperty(Application.prototype,'globals',{get:function globals(){
    return null;
}});

Object.defineProperty(Application.prototype,'directives',{get:function directives(){
    return null;
}});

Object.defineProperty( Application.prototype, 'config', {get:function config(){
    return useRuntimeConfig();
}});

Object.defineProperty(Application.prototype,'routes',{get:function routes(){
    const router = this.router;
    return router ? router.getRoutes() : [];
}});

Object.defineProperty(Application.prototype,'router',{get:function router(){
   return unref(useRouter());
}});

Object.defineProperty( Application.prototype, 'getAttribute', {value:function getAttribute(name){
    if(name==='nuxtApp'){
        return this.getNuxtApp();
    }
    if(name==='instance' || name==='vueApp'){
        return this.getVueApp();
    }
    return Page.prototype.getAttribute.call(this,name);
}});

Object.defineProperty( Application.prototype, 'mount', {value:function mount(){
   throw new SyntaxError('Application.mount method already removed. in the "es-nuxt" plugin')
}});

Object.defineProperty( Application.prototype, 'unmount', {value:function unmount(){
    throw new SyntaxError('Application.unmount method already removed. in the "es-nuxt" plugin')
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