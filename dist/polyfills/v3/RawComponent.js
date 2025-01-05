/*
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */
///<import from='vue' name='Vue' namespaced />
///<references from='System' />
///<references from='EventDispatcher' />
///<references from='Event' />
///<references from='web.events.ComponentEvent' name='ComponentEvent' />
///<namespaces name='web.components' />
///<export name='Component' />
///<createClass value='false' />

const privateKey = Symbol('private');
const hasOwn = Object.prototype.hasOwnProperty;

const getCurrentInstance = Vue.getCurrentInstance;
const createReactive = Vue.reactive;
const _createVNode = Vue.h;
const _resolveDirective = Vue.resolveDirective;
function Component(){}
function getPrivateObject(target){
    return target[privateKey] || (target[privateKey] = Object.create(null));
}
const methods = {
    receivePropValue(value,name){
        return value;
    },
    beforeReceiveProp(value,name){
        return true
    },
    provide(name, provider){
    
    },
    inject(name, from, defaultValue){
    
    },
    reactive(name, value, initValue){
        const isWrite = arguments.length === 2;
        const dataset = getPrivateObject(this);
        const states = dataset.states || (dataset.states = createReactive(Object.create(null)));
        if( !isWrite && initValue ){
            if( !hasOwn.call(states, name) ){
                states[name] = typeof initValue==='function' ? initValue.call(this) : initValue;
            }
        }
        if( !isWrite ){
            return states[name];
        }else{
            states[name] = value;
            return value;
        }
    },
    forceUpdate(){
        this.$forceUpdate();
    },
    observable(object){
        return createReactive(object);
    },
    slot(name,fallback){
        const slots = this.$slots;
        if( hasOwn.call(slots,name) ){
            return slots[name];
        }
        if( fallback && typeof fallback === "function" ){
            return fallback;
        }
        return ()=>[];
    },
    hasSlot(name){
        return hasOwn.call(this.$slots, name);
    },
    element(){
        return this.$el;
    },
    parent(){
        return this.$parent;
    },
    children(){
        let children = this.$slots.default;
        if( typeof children ==='function'){
            children = children();
        }
        return children || [];
    },
    getConfig(){
        return {...this.$attrs};
    },
    getParentComponent( filter ){
        return this.parent;
    },
    createVNode(name,config,children){
        return _createVNode(name, config, children);
    },
    getRefs(name){
        const refs = this[privateKey].refs;
        if( refs && hasOwn.call(refs,name)){
            return refs[name];
        }
        return this.proxy.$refs[name];
    },
    setRefNode(name, node, isArray){
        const target = this[privateKey].refs || (this[privateKey].refs=Object.create(null));
        if( isArray ){
            if( !hasOwn.call(target,name) ){
                target[name]=[ node ];
            }else if( target[name].indexOf(node) < 0 ){
                target[name].push( node );
            }
        }else{
            target[name] = node;
        }
    },
    addEventListener(type, listener,useCapture,priority,reference){
        return EventDispatcher.prototype.addEventListener.call(this,type,listener,useCapture,priority,reference);
    },
    dispatchEvent(event){
        return EventDispatcher.prototype.dispatchEvent.call(this,event);
    },
    removeEventListener(type, listener){
        return EventDispatcher.prototype.removeEventListener.call(this,type, listener);
    },
    hasEventListener(type, listener){
        return EventDispatcher.prototype.hasEventListener.call(this,type, listener);
    },
    on(type, listener){
        const target = getPrivateObject(this)
        const dataset = target.listeners || (target.listeners={});
        const arr = dataset[type] || (dataset[type]=[]);
        if( arr.indexOf(listener) < 0  ){
            arr.push(listener);
        }
    },
    off(type, listener){
        const target = getPrivateObject(this);
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
    },
    emit(type){
        const target = getPrivateObject(this);
        const listeners = target.listeners;
        const args = Array.from(arguments);
        if( listeners ){
            type = String(type);
            const items = listeners[type];
            if( items ){
                items.forEach( listener=>listener.apply(this,args) );
            }
        }
        this.$emit.apply(this, args);
    },
    watch(name, callback, options){
        return this.$watch(name, callback, options); 
    },
    nextTick(callback){
        return this.$nextTick(callback);
    },
    getAttribute(name){
        if( name==='instance'){
            return this.proxy._;
        }
        if( name in this.proxy ){
            return this.proxy[name];
        }
        return this['$'+name];
    },
    getBindEventValue(e,name){
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
    },
    invokeHook(...args){
        return System.invokeHook(...args);
    }
}


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

function setupLifecycleHooks(comInstance){
    for(var i=0;i<registerLifecycleHook.length;i++){
        const name = registerLifecycleHook[i];
        const registerHook = Vue[name];
        if( registerHook ){
            registerHook((function(name){
                return function(){
                    if( comInstance.hasEventListener(HookMaps[name]) ){
                        comInstance.dispatchEvent( new ComponentEvent(HookMaps[name]) );
                    }
                    if( typeof comInstance[name] === 'function' ){
                        comInstance[name]();
                    }
                }
            }(name)));
        }
    }
}


Object.defineProperty( Component, 'setupLifecycleHooks', {value:setupLifecycleHooks});

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
                dire = new config.directiveClass( context );
                directiveClassMaps[name] = dire;
            }
        }else{
            dire = config.directiveClass;
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

Object.defineProperty( Component, 'createComponent', {value:function createComponent(constructor, options, beforeUpdateInvokes=null){
   // options.mixins=[  options.extends ]

    options.extends = options.extends.__vccOpts;
//    const methods = options.extends.methods;
//    for(let key in methods){
//        options.methods[key] = methods[key];
//    }

    options.setup = function(rawProps){
        const target = getCurrentInstance();
        const {...props} = rawProps;
        constructor.call(target, props);
        if( beforeUpdateInvokes && beforeUpdateInvokes.length > 0 ){
            Vue.onBeforeUpdate(()=>{
                beforeUpdateInvokes.forEach( invoke=>{
                    invoke.call(target);
                });
            });
        }
        return target;
    }
    Component.defineComponent(constructor, options);
    return constructor;
}});

Object.defineProperty( Component, 'defineComponent', {value:function defineComponent(target, options){
    Object.defineProperty(target, '__vccOpts', {
        enumerable:false,
        configurable:true,
        writable:true,
        value:options
    });
}})

Component.defineComponent(Component, {methods});

Object.keys(methods).forEach( key=>{
    Component.prototype[key] = methods[key];
});
Component.prototype.onInitialized = function(){};

System.registerHook('polyfills:value',function(value, property, className){
    if( property ==="size" ){
        if(value ==="mini")return 'small'
        if(value==='medium')return 'default';
    }
    return value;
},-500);