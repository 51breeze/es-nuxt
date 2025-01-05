/*
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */
///<import from='vue' name='Vue' namespaced />
///<references from='web.components.Component' />
///<references from='web.components.Router' />
///<references from='web.events.ComponentEvent' name='ComponentEvent' />
///<references from='EventDispatcher' />
///<references from='Reflect' />
///<references from='System' />
///<import from='${__filename}?callhook&action=config' name='__config'/>
///<import from='${__filename}?callhook&action=route' name='__routes' />
///<namespaces name='web' />

const hasOwn = Object.prototype.hasOwnProperty;
const privateKey = Symbol('private');
function Application( options ){
    Component.call(this);
    this[privateKey] = Object.create({
        _vueApp:null,
        _provides:Object.create(null),
        _mixins:Object.create(null),
        _plugins:[],
        _children:[],
        _options:options
    });
    System.setConfig('#global#application#instance#',this)
}

Application.prototype = Object.create( Component.prototype );
Application.prototype.constructor = Application;

Object.defineProperty(Application.prototype,'plugin',{value:function plugin( plugin ){
    plugin = Array.isArray(plugin) ? plugin : [plugin];
    this[privateKey]._plugins.push( ...plugin );
    return this;
}});

Object.defineProperty(Application.prototype,'provide',{value:function provide(name,value){
    this[privateKey]._provides[name] = value;
    return this;
}});

Object.defineProperty(Application.prototype,'mixin',{value:function mixin(name, method){
    this[privateKey]._mixins[name] = method;
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

Object.defineProperty(Application.prototype,'routes',{get:function routes(){
    return __routes;
}});

Object.defineProperty( Application.prototype, 'config', {get:function config(){
    return __config;
}});

Object.defineProperty(Application.prototype,'render',{value:function render(){
    //throw new Error('application render method must overwrite in subclass');
}});

Object.defineProperty(Application.prototype,'router',{get:function router(){
    const routes = this.routes;
    if( routes && routes.length === 0 )return null;
    const router = this[privateKey]._router;
    if( router )return router;
    return this[privateKey]._router = new Router({
        routes:this.routes
    });
}});

Object.defineProperty( Application.prototype, 'getAttribute', {value:function getAttribute(name){
    if(name==='instance' || name==='vueApp'){
        return this[privateKey]._vueApp;
    }
    return Component.prototype.getAttribute.call(this,name);
}});

Object.defineProperty(Application.prototype,'mount',{value:function mount(element){
    const target = this[privateKey];
    const mixins = target._mixins;
    const plugins = target._plugins;
    const options = target._options || {};
    const esInstance = this;
    const vccOpts = this.constructor.__vccOpts || {};
    const app = Vue.createApp({
        ...vccOpts,
        ...options,
        setup(...args){
            if( vccOpts.setup ){
                return vccOpts.setup.call(this, ...args);
            }else{
                return function(){
                    return esInstance.render(Vue.h);
                }
            }
        }
    });

    const globals = this.globals;
    if(globals){
        const globalProperties = app.config.globalProperties || (app.config.globalProperties = {});
        Object.assign(globalProperties, Object(globals));
    }

    target._vueApp = app;
    if( mixins ){
        app.mixin( mixins );
    }
    if( plugins && plugins.length > 0 ){
        plugins.forEach( plugin=> app.use( plugin ) );
    }

    const directives = this.directives;
    if( directives ){
        for(let name in directives){
            app.directive(name, directives[name]);
        }
    }

    const router =  this.router;
    if( router ){
        app.use( router );
    }
    const store = this.store;
    if( store ){
        app.provide('store', store);
    }
    const locale = this.locale;
    if( locale ){
        app.provide('locale', locale);
    }
    const provides = target._provides;
    for(var name in provides){
        app.provide(name, provides[name]);
    }

    System.invokeHook('application:created', this);
    app.mount( element );

}});

Object.defineProperty( Application.prototype, 'unmount', {value:function unmount(){
    const instance = this.getAttribute('app');
    if(instance)instance.unmount();
    return this;
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