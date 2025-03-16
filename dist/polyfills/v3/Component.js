/*
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */
///<import from='vue' name='Vue' namespaced />
///<import from='@vue/shared' name='shared' namespaced />
///<references from='Class' />
///<references from='System' />
///<references from='Reflect' />
///<references from='EventDispatcher' />
///<references from='Event' />
///<references from='web.events.ComponentEvent' name='ComponentEvent' />
///<namespaces name='web.components' />

function copyObject(target, deep){
    if( target && typeof target ==='object' ){
        if( Object.prototype.toString.call(target) === '[object Object]' ){
            var keys = Object.keys( target );
            var obj = {};
            for(var i=0;i<keys.length;i++){
                var name = keys[i];
                obj[ name ] = deep===true ? copyObject( target[ name ] ) : target[ name ];
            }
            return obj;
        }else if( Array.isArray(target) ){
            var items = [];
            for(var i=0; i<target.length;i++){
                items.push( deep===true ? copyObject(target[i]) : target[i] );
            }
            return items;
        }
    }
    return target;
}

const classKey = Class.key;
const privateKey = Symbol('private');
const hasOwn = Object.prototype.hasOwnProperty;
const createReactive = Vue.reactive;
const getCurrentInstance = Vue.getCurrentInstance;
const _createVNode = Vue.h;
const _resolveDirective = Vue.resolveDirective;
const nextTick = Vue.nextTick;
const isReactive = Vue.isReactive;
const emtyObject = Object.create(null);

function Component(props){
    if( !hasOwn.call(this, privateKey) ){
        EventDispatcher.call(this);
        const propsData = props ? Object.assign(Object.create(null),props) : Object.create(null);
        this[privateKey] = Object.create({
            initialized:false,
            instance:null,
            vueProps:null,
            vueContext:null,
            children:[],
            injecteds:[],
            renderCached:null,
            propsUpdating:false,
            provides:emtyObject,
            preventedProps:Object.create(null),
            propsData:Object.assign(Object.create(null),propsData),
            states:createReactive(propsData)
        });
    }
}

Component.prototype = Object.create(EventDispatcher.prototype);
Component.prototype.constructor = Component;

const proto = Component.prototype;
Object.defineProperty( proto, 'render', {value: function render(){
    return null
}});

Object.defineProperty( proto, 'app', {get:function app(){
    return System.getConfig('#global#application#instance#');
}});

Object.defineProperty( proto, 'store', {get:function store(){
    return this.app.store;
}});

Object.defineProperty( proto, 'locale', {get:function locale(){
    return this.app.locale;
}});

Object.defineProperty( proto, 'receivePropValue', {value: function receivePropValue(value,name){
    return Vue.unref(value);
}});

Object.defineProperty( proto, 'toValue', {value: function toValue(value){
    return Vue.unref(value);
}});

Object.defineProperty( proto, 'beforeReceiveProp', {value: function beforeReceiveProp(value,name){
    return this[privateKey].preventedProps[name] !== true;
}});

Object.defineProperty( proto, 'provide', {value:function provide(name, provider){
    if( typeof provider === "function" ){
        var provides = this[privateKey].provides;
        if(emtyObject===provides){
            this[privateKey].provides = provides = Object.create(null);
        }
        provides[name] = provider;
    }else{
        throw new Error(`Provider '${name}' must is function. give `+(typeof provider));
    }
}});

function injectFactor(name, from, defaultValue){
    var descriptor = Reflect.getDescriptor(this, name);
    if( !descriptor ){
        throw new Error(`Injector property '${name}' is not exists.`);
    }
    var provides = this[privateKey].provides;
    var value = void 0;
    from = from || name;
    if( from in provides ){
        value = provides[from];
        if( value && typeof value ==='function' ){
            value = value();
        }
    }else {
        const appContext = this[privateKey].instance.appContext;
        if( appContext.provides ){
            if( from in appContext.provides ){
                value = appContext.provides[from];
                if( value && typeof value ==='function' ){
                    value = value();
                }
            }
        }
    }

    if( value === void 0 && defaultValue !== void 0 ){
        value = defaultValue;
    }

    if( value !== void 0 ){
        value = this.receivePropValue(value, name);
        if(descriptor.isAccessor()){
            if(descriptor.setter){
                descriptor.invokeSetter(this,value);
            }else{
                throw new Error(`Injector property '${name}' is readonly.`);
            }
        }else if(descriptor.isMethod()){
            descriptor.invokeMethod(this, value);
        }else if(descriptor.isProperty()){
            descriptor.setPropertyValue(value)
        }
    }
    return value;
}

Object.defineProperty( proto, 'inject', {value:function inject(name, from, defaultValue){
    if( !this[privateKey].initialized ){
        this[privateKey].injecteds.push([name, from, defaultValue]);
        return null;
    }
    return injectFactor.call(this, name, from, defaultValue);
}});

Object.defineProperty( proto, 'reactive', {value:function reactive(name, value, initValue){
    const isWrite = arguments.length === 2;
    const states = this[privateKey].states;
    if( !isWrite && initValue ){
        if( !hasOwn.call(states, name) ){
            states[name] = typeof initValue==='function' ? initValue.call(this) : initValue;
        }
    }
    if( !isWrite ){
        return states[name];
    }else{
        if( !this[privateKey].propsUpdating ){
            const rawProps = this[privateKey].rawProps;
            if( rawProps && hasOwn.call(rawProps,name) ){
                this[privateKey].preventedProps[name] = true;
            }
        }
        states[name] = value;
        return value;
    }
}});

Object.defineProperty( proto, 'reference', {value:function reference(value, shallowFlag=true){
    return shallowFlag ? Vue.shallowRef(value) : Vue.ref(value)
}});

Object.defineProperty( proto, 'forceUpdate', {value:function forceUpdate(){
    const target = this[privateKey].instance;
    if( target ){
        target.proxy.$forceUpdate();
    }
}});

Object.defineProperty( proto, 'observable', {value:function observable(object){
    return createReactive(object);
}});

Object.defineProperty( proto, 'slot', {value:function slot(name,fallback){
    const target = this[privateKey].instance;
    if( target ){
        const slots = target.proxy.$slots;
        if( hasOwn.call(slots,name) ){
            let result = slots[name];
            if( result ){
                if( typeof result !== "function" ){
                    return Vue.withCtx(()=>result)
                }else{
                    return result
                }
            }
        }
    }
    if( fallback && typeof fallback === "function" ){
        return Vue.withCtx(fallback);
    }
    return ()=>[];
}});

Object.defineProperty( proto, 'renderSlot', {value:function renderSlot(name='default',props={},fallback=null){
    const target = this[privateKey].instance;
    if( target ){
        return Vue.renderSlot(target.proxy.$slots, name, props, fallback)
    }
    return Vue.renderSlot({}, name, props, fallback);
}});

Object.defineProperty(proto, 'hasSlot', {value:function hasSlot(name='default'){
    const target = this[privateKey].instance;
    return target ? hasOwn.call(target.proxy.$slots, name) : false;
}});

Object.defineProperty( proto, 'element', {get:function element(){
    const target = this[privateKey].instance;
    return target ? target.proxy.$el : null;
}});

Object.defineProperty( proto, 'parent', {get:function parent(){
    var target = this[privateKey].instance;
    return (target && target.parent) || null;
}});

Object.defineProperty( proto, 'children', {get:function children(){
    return this[privateKey].children;
}});

Object.defineProperty( proto, 'getParentComponent', {value:function getParentComponent( filter ){
    var parent = this.parent;
    var isFn = typeof filter === 'function';
    while( parent ){
        parent = parent[privateKey] || parent;
        if( isFn ){
            if( filter( parent ) ){
                return parent;
            }
        }else if( filter === true ){
            if(parent instanceof Component){
                return parent;
            }
        }else{
            return parent;
        }
        parent = parent.parent;
    }
    return null;
}});

function normalizeVNode(value){
    const type = typeof value;
    if(value == null || type === "boolean"){
        return Vue.createVNode(Vue.Comment);
    }else if( Array.isArray(value) ){
        return Vue.createVNode(Vue.Fragment, null, value.map(normalizeVNode) );
    }else if( Vue.isVNode(value) ){
        return value;
    }else if( type === 'function' && '__vccOpts' in value){
        return Vue.createVNode(value)
    }else if( type === 'object'){
        return Vue.createVNode(value);
    }else{
        return Vue.createVNode(Vue.Text, null, Vue.toDisplayString(value), 1)
    }
}

Object.defineProperty( proto, 'createVNode', {value:function createVNode(name,config,children){
    if(arguments.length===1){
        return normalizeVNode(name);
    }
    if(Array.isArray(children) && children.length===1 ){
        const type = typeof children[0];
        if(type ==='number' || type==='string' || type==='boolean'){
            children = children[0];
        }
    }
    return _createVNode(name, config, children);
}});

Object.defineProperty( proto, 'getRefs', {value:function getRefs(name, toArray=false){
    const refs = this[privateKey].refs;
    let vnode = null;
    if( refs && hasOwn.call(refs,name)){
        vnode = refs[name];
    }else{
        const target = this[privateKey].instance;
        vnode = target ? target.proxy.$refs[name] : null;
        if( Array.isArray(vnode) ){
            vnode = vnode.map( node=>getCompnentInstanceByVNode(node) );
        }else{
            vnode = getCompnentInstanceByVNode(vnode);
        }
    }
    if( toArray && !Array.isArray(vnode) ){
        return vnode ? [vnode] : [];
    }
    return vnode;
}});

Object.defineProperty( proto, 'setRefNode', {value:function setRefNode(name, node, isArray){
    const target = this[privateKey].refs || (this[privateKey].refs=Object.create(null));
    node = getCompnentInstanceByVNode(node);
    if( isArray ){
        if(node){
            if( !hasOwn.call(target,name) ){
                target[name]=[ node ];
            }else if( target[name].indexOf(node) < 0 ){
                target[name].push( node );
            }
        }
    }else{
        target[name] = node;
    }
}});

Object.defineProperty( proto, 'addEventListener', {value:function addEventListener(type, listener,useCapture,priority,reference){
    return EventDispatcher.prototype.addEventListener.call(this,type,listener,useCapture,priority,reference);
}});

Object.defineProperty( proto, 'dispatchEvent', {value:function dispatchEvent(event){
    return EventDispatcher.prototype.dispatchEvent.call(this,event);
}});

Object.defineProperty( proto, 'removeEventListener', {value:function removeEventListener(type, listener){
    return EventDispatcher.prototype.removeEventListener.call(this,type, listener);
}});

Object.defineProperty( proto, 'hasEventListener', {value:function hasEventListener(type, listener){
    return EventDispatcher.prototype.hasEventListener.call(this,type, listener);
}});

Object.defineProperty( proto, 'getCacheForVNode', {value:function getCacheForVNode(){
    const target = this[privateKey];
    if(!target.renderCached){
        target.renderCached  = [];
    }
    return target.renderCached;
}});

Object.defineProperty( proto, 'setCacheForVNode', {value:function setCacheForVNode(cached){
    const target = this[privateKey];
    return target.renderCached=cached;
}});

Object.defineProperty( proto, 'on', {value:function on(type, listener){
    const target = this[privateKey];
    const dataset = target.listeners || (target.listeners={});
    const arr = dataset[type] || (dataset[type]=[]);
    if( arr.indexOf(listener) < 0  ){
        arr.push(listener);
    }
}});

Object.defineProperty( proto, 'off', {value:function off(type, listener){
    const target = this[privateKey];
    const dataset = target.listeners;
    if( dataset ){
        const arr = dataset[type];
        if( arr ){
            if( listener ){
                const index = arr.indexOf(listener);
                if( index >= 0 ){
                    arr.splice(index,1);
                }
            }else{
                arr.length = 0;
            }
        }
    }
}});

Object.defineProperty( proto, 'emit', {value:function emit(type){
    const target = this[privateKey].instance;
    const listeners = this[privateKey].listeners;
    if( target ){
        const args = Array.from(arguments);
        if( listeners ){
            type = String(type);
            const items = listeners[type];
            if( items ){
                items.forEach( listener=>listener.apply(this,args) );
            }
        }
        target.proxy.$emit.apply(this, args);
    }
}});

Object.defineProperty( proto, 'watch', {value:function watch(name, callback, options){
    const target = this[privateKey].instance;
    if( target ){
        const segs = String(name).split('.');
        const first = segs[0].trim();
        const descriptor = Reflect.getDescriptor(this,first);
        options = options === true ? {deep:true} : options;
        if( descriptor ){
            if( descriptor.modifier === Reflect.MODIFIER_PRIVATE ){
                const _privateKey = descriptor.privateKey;
                name = ()=>{
                    var obj = this[_privateKey];
                    for (var i = 0; i < segs.length; i++) {
                        if (!obj) { return }
                        obj = obj[ segs[i] ];
                    }
                    return obj;
                };
            }
            const isProperty = (descriptor.type ===Reflect.MEMBERS_ACCESSOR && descriptor.get) || (descriptor.type === Reflect.MEMBERS_PROPERTY);
            if( !isProperty ){
                throw new Error(`Watching '${name}' is not member properties.`)
            }
            return target.proxy.$watch(name, callback, options);
        }else{
            throw new Error(`Watching property '${name}' is not exists.`)
        }
    }
    return null;
}});

Object.defineProperty( proto, 'nextTick', {value:function nextTick(callback){
    const target = this[privateKey].instance;
    if( target ){
        return target.proxy.$nextTick(callback);
    }
    return nextTick(callback);
}});

Object.defineProperty( proto, 'withAsyncContext', {value:function withAsyncContext(callback){
    let current = getCurrentInstance();
    let setCurrentInstance = this[privateKey].setCurrentInstance;
    if(!current){
        if(setCurrentInstance){
            setCurrentInstance();
        }
    }
    const [data, restore] = Vue.withAsyncContext(callback);
    const setNullInstance = restore();
    const reset = ()=>{
        if(reset.isCalled){
            return [restore, setNullInstance];
        }
        reset.isCalled = true;
        if((!current || current !== getCurrentInstance()) && this[privateKey].initializeDone){
            setNullInstance();
        }else{
            restore();
        }
        return [restore, setNullInstance];
    }
    if(shared.isPromise(data) && data.finally){
        data.finally(reset);
    }else{
        reset();
    }
    return [data, reset];
}});

Object.defineProperty(proto, 'withContext', {value:function withContext(callback){
    const [data] = this.withAsyncContext(callback);
    return data;
}})

Object.defineProperty( proto, 'getRoute', {value:function getRoute(){
    const target = this[privateKey].instance;
    return this.toValue(target && target.proxy['$route'] || null);
}});

Object.defineProperty( proto, 'getAttribute', {value:function getAttribute(name){
    if( name==='states'){
        return this[privateKey].states;
    }else if(name==='props'){
        return this[privateKey].vueProps;
    }else if(name==='context'){
        return this[privateKey].vueContext;
    }
    const target = this[privateKey].instance;
    if( name==='instance'){
        return target;
    }else if(name==='config'){
        return target.vnode.props;
    }
    if( target ){
        return target.proxy['$'+name];
    }
    return null;
}});

Object.defineProperty( proto, 'getBindEventValue', {value:function getBindEventValue(e,name){
    if( Event.isEvent(e) ){
        name = name || 'value';
        if( e.target && e.target.nodeType===1 ){
            return e.target[name];
        }else if( hasOwn.call(e,name) ){
            return e[name];
        }
        return null;
    }
    return e;
}});

Object.defineProperty( proto, 'invokeHook', {value:function invokeHook(...args){
    if(args[0]==='polyfills:props'){
        return System.dispatchHook(...args) || args[1];
    }
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
    }else if(args[0] ==='System::callMethod'){
        const method = System[String(args[1])];
        if( method && typeof method ==='function' ){
            return method.apply(System, args.slice(2));
        }
    }
    return System.invokeHook(...args);
}});

const HookMaps={
    'onBeforeUpdate':ComponentEvent.BEFORE_UPDATE,
    'onUpdated':ComponentEvent.UPDATED,
    'onBeforeMount':ComponentEvent.BEFORE_MOUNT,
    'onMounted':ComponentEvent.MOUNTED,
    'onBeforeUnmount':ComponentEvent.BEFORE_DESTROY,
    'onUnmounted':ComponentEvent.DESTROYED,
    'onActivated':ComponentEvent.ACTIVATED,
    'onDeactivated':ComponentEvent.DEACTIVATED,
    'onErrorCaptured':ComponentEvent.ERROR_CAPTURED,
    'onRenderTracked':ComponentEvent.RENDER_TRACKED,
    'onRenderTriggered':ComponentEvent.RENDER_TRIGGERED,
    'onServerPrefetch':ComponentEvent.SERVER_PREFETCH,
};

const registerLifecycleHook = Object.keys( HookMaps );
function HOOK(){};
for(var i=0;i<registerLifecycleHook.length;i++){
    const name = registerLifecycleHook[i];
    Object.defineProperty(proto, name, {value:HOOK});
}

Object.defineProperty( proto, 'onInitialized', {value:HOOK});

function setupLifecycleHooks(comInstance){
    for(var i=0;i<registerLifecycleHook.length;i++){
        const name = registerLifecycleHook[i];
        const registerHook = Vue[name];
        if( registerHook ){
            registerHook((function(name, comInstance){
                return function(){

                    if('onBeforeUpdate' === name){
                        const refs = comInstance[privateKey].refs;
                        if(refs){
                            Object.keys(refs).forEach(key=>{
                                if(Array.isArray(refs[key])){
                                    refs[key].splice(0, refs[key].length);
                                }
                            })
                        }
                    }

                    if( comInstance.hasEventListener(HookMaps[name]) ){
                        comInstance.dispatchEvent( new ComponentEvent(HookMaps[name]) );
                    }
                    if( typeof comInstance[name] === 'function' ){
                        const setCurrentInstance = comInstance[privateKey].setCurrentInstance;
                        if(setCurrentInstance)setCurrentInstance();
                        comInstance[name]();
                    }
                }
            }(name, comInstance)));
        }
    }
}

function getCompnentInstanceByVNode(vNode){
    if( vNode ){
        const instance = vNode._;
        if( instance ){
            vNode = instance[privateKey] || vNode;
        }
    }
    return vNode;
}

Object.defineProperty( Component, 'setupLifecycleHooks', {value:setupLifecycleHooks});
Object.defineProperty( Component, 'getCompnentInstanceByVNode', {value:getCompnentInstanceByVNode});
Object.defineProperty( Component, 'setCompnentInstanceForVueInstance', {value:function bindVueInstance(esInstance,vueInstance){
    esInstance[privateKey].instance = vueInstance;
    vueInstance[privateKey] = esInstance;
}});

const directiveClassMaps={};
Object.defineProperty( Component, 'resolveDirective', {value:function resolveDirective(config,context){
    if( !config )return [function(){}];
    var name = config.name;
    var dire = name;
    if( config.directiveClass ){
        if( System.isClass( config.directiveClass ) ){
            if( hasOwn.call(directiveClassMaps, name) ){
                dire = directiveClassMaps[name];
            }else{
                const result = Reflect.getDescriptor(config.directiveClass, 'directive')
                if( result ){
                    if(result.isStatic()){
                        if(result.isAccessor()){
                            dire = result.invokeGetter(null);
                        }else if(result.isMethod()){
                            dire = result.invokeMethod();
                        }else{
                            let className = System.getQualifiedClassName(config.directiveClass)
                            throw new ReferenceError(`"${className}".directive is not getter or method on Component.resolveDirective`)
                        }
                    }
                }else{
                    dire = new config.directiveClass();
                }
                directiveClassMaps[name] = dire;
            }
        }else{
            const result = config.directiveClass.directive;
            if( result  ){
                dire = result;
            }else{
                dire = config.directiveClass;
            }
        }
    }else if( typeof dire === "string" ){
        dire = _resolveDirective( dire );
    }
    const items = [dire, config.value];
    if( config.arg ){
        items.push(config.arg);
    }
    if( config.modifier ){
        if( items.length===2){
            items.push('');
        }
        items.push(config.modifier);
    }
    return items;
}});

Object.defineProperty( Component, 'createComponent', {value:function createComponent(constructor,options={}){
    const hasTemplate = options.hasTemplate;
    const esHandle = options.esHandle || 'esInstance';
    const esPrivateKey = options.esPrivateKey;
    const ssrCtx = options.__ssrCtx;
    const ssrRender = options.__ssrRender;
    const asyncSetup = options.__async;
    const exportClass = options.__exportClass;
    const classDescriptor = Class.getClassDescriptor(constructor);
    options.props = options.props || {};
    if(ssrRender){
        //options.__ssrInlineRender = true;
    }

    if(classDescriptor){
        let inheritClass = classDescriptor;
        while(inheritClass && (inheritClass = inheritClass.inherit) && inheritClass !== Component ){
            if('__vccOpts' in inheritClass){
                const vccOpts = inheritClass.__vccOpts;
                if( vccOpts.props ){
                    Object.keys(vccOpts.props).forEach( key=>{
                        if(!hasOwn.call(options.props, key)){
                            options.props[key] = vccOpts.props[key];
                        }
                    })
                }
                inheritClass = Class.getClassDescriptor(inheritClass);
            }else{
                break;
            }
        }
    }

    let exposes = null;
    if(hasTemplate){
        exposes = Object.create(null);
        if( options.exposes ){
            Object.keys(options.exposes).forEach( name=>{
                exposes[name] = options.exposes[name]
            })
        }
        delete options.hasTemplate;
        delete options.esHandle;
        delete options.esPrivateKey;
        delete options.exposes;
    }
    delete options.__ssrRender;
    delete options.__ssrCtx;
    delete options.__exportClass;
    delete options.__async;
    const init=()=>{
        if( ssrCtx && !hasTemplate ){
            const ssrContext = Vue.useSSRContext();
            if(ssrContext){
                (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(ssrCtx);
            }
        }
        const vueInstance = getCurrentInstance();
        const originProps = vueInstance.props || {};
        const {...props} = originProps;
        const esInstance = options.props ? new constructor( props ) : new constructor();
        Component.setCompnentInstanceForVueInstance(esInstance, vueInstance);

        if(!hasTemplate && options.__hmrId){
            vueInstance.withProxy = esInstance;
        }

        const parent = esInstance.getParentComponent(true);
        const provides = parent ? parent[privateKey].provides : vueInstance.provides;
        const initialized = esInstance[privateKey].initialized;
        
        const [,setCurrentInstance] = Vue.withAsyncContext(()=>null);
        esInstance[privateKey].setCurrentInstance = setCurrentInstance;
        esInstance[privateKey].setNullInstance = setCurrentInstance();

        if(provides){
            const target = esInstance[privateKey].provides;
            for(let key in provides){
                if( !(key in target) ){
                    target[key] = provides[key];
                }
            }
        }

        if( !initialized ){
            let injecteds = esInstance[privateKey].injecteds;
            if(injecteds.length>0){
                injecteds = injecteds.splice(0, injecteds.length);
                injecteds.forEach( args=>{
                    injectFactor.call(esInstance,...args);
                });
            }
        }

        setupLifecycleHooks(esInstance);
        if( options.props ){
            esInstance[privateKey].rawProps = options.props;
            const propsData = props;
            for(let key in propsData){
                if(propsData[key]===void 0)continue;
                if( esInstance.beforeReceiveProp(propsData[key],key) ){
                    const value =esInstance.receivePropValue(propsData[key],key);
                    const descriptor = Reflect.getDescriptor(esInstance, key);
                    if( descriptor && descriptor.isMember){
                        if(descriptor.type === Reflect.MEMBERS_ACCESSOR && descriptor.modifier === Reflect.MODIFIER_PUBLIC){
                            const setter = descriptor.set;
                            if( setter ){
                                esInstance[privateKey].propsUpdating = true;
                                setter.call(esInstance, value);
                                esInstance[privateKey].propsUpdating = false;
                            }
                        }
                    }
                }
            }

            vueInstance.props = new Proxy(originProps,{
                get:function(target,name){
                    return target[name];
                },
                set:function(target,name,value){
                    if( esInstance.beforeReceiveProp(value,name) ){
                        target[name] = value;
                        esInstance[privateKey].propsUpdating = true;
                        esInstance[name] = esInstance[privateKey].propsData[name] = esInstance.receivePropValue(value,name);
                        esInstance[privateKey].propsUpdating = false;
                    }
                    return true;
                }
            });
        }

        if( !initialized ){
            esInstance[privateKey].initialized=true;
            esInstance.addEventListener(ComponentEvent.DESTROYED,()=>{
                if( parent ){
                    const children = parent.children;
                    const index =  Array.isArray(children) ? children.indexOf(esInstance) : -1;
                    if( index >= 0 ){
                        children.splice(index,1);
                    }
                }
            });
            esInstance.addEventListener(ComponentEvent.BEFORE_MOUNT,()=>{
                if( parent ){
                    const children = parent.children;
                    if( Array.isArray(children) && children.indexOf(this) < 0 ){
                        children.push( esInstance );
                    }
                }
            });
            if( esInstance.hasEventListener('componentInitialized') ){
                esInstance.dispatchEvent( new ComponentEvent( 'componentInitialized' ) );
            }
        }

        if( hasTemplate ){
            exposes[esHandle] = esInstance;
            if( esPrivateKey ){
                const descriptor = Reflect.getDescriptor(esInstance);
                exposes[esPrivateKey] = descriptor.privateKey;
            }
            return [esInstance, exposes, initialized];
        }else{
            return [esInstance, function(ctx, cached){
                esInstance.setCacheForVNode(cached)
                return esInstance.render(_createVNode);
            }, initialized];
        }
    }

    if(asyncSetup){
        options.setup = async(props, context)=>{
            try{
                const [esInstance, expose, initialized] = init();
                esInstance[privateKey].vueProps = props;
                esInstance[privateKey].vueContext = context;
                if( !initialized ){
                    await esInstance.onInitialized();
                    esInstance[privateKey].initializeDone = true;
                }
                return expose;
            }catch(e){
                console.error(e);
                return ()=>_createVNode('div', String(e.stack||e.message).replace(/[\r\n]+/g, '<br/>') );
            }
        }
    }else{
        options.setup = (props, context)=>{
            try{
                const [esInstance, expose, initialized] = init();
                esInstance[privateKey].vueProps = props;
                esInstance[privateKey].vueContext = context;
                if( !initialized ){
                    esInstance.onInitialized();
                    esInstance[privateKey].initializeDone = true;
                }
                return expose;
            }catch(e){
                console.error(e);
                return ()=>_createVNode('div', String(e.stack||e.message).replace(/[\r\n]+/g, '<br/>') );
            }
        }
    }
    Component.defineComponent(constructor, options);
    if(exportClass===false){
        return options;
    }
    return hasTemplate ? options : constructor;

}});

Object.defineProperty( Component, 'defineComponent', {value:function defineComponent(target, options={}){
    Object.defineProperty(target, '__vccOpts', {
        enumerable:false,
        configurable:true,
        writable:true,
        value:options
    });
    options[Class.bindClassKey] = target;
    return target;
}});

Object.defineProperty( Component, 'createHoistedVnode', {value:function createHoistedVnode(tag, attrs, children,scopeId=null){
    if(scopeId)Vue.pushScopeId(scopeId);
    let vnode = Vue.createElementVNode(tag, attrs, children, -1)
    if(scopeId)Vue.popScopeId();
    return vnode;
}});


function _normalVNode(value){
    if( Array.isArray(value) ){
        return Vue.h(Vue.Fragment, value.map(child=>_normalVNode(child)));
    }else if( Vue.isVNode(value) ){
        return value;
    }else if( typeof value === 'function' && '__vccOpts' in value){
        return Vue.h(value)
    }else if(value != null || typeof value==='boolean'){
        return Vue.createTextVNode(Vue.toDisplayString(value), 1)
    }else{
        return Vue.createCommentVNode(String(value), true)
    }
}

Object.defineProperty( Component, 'normalVNode', {value:function normalVNode(value){
    return _normalVNode(value)
}});

System.registerHook('polyfills:value',function(value, property, className){
    if( property ==="size" ){
        if(value ==="mini")return 'small'
        if(value==='medium')return 'default';
    }
    return value;
},-500);

System.registerHook('polyfills:props',function(props, className){
    if( className ==="web.ui.Button" ){
        if(props.type === 'text'){
            props.type = '';
            props.text = true;
        }
    }
    return props;
},-500);