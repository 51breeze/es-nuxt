import Class from "./../Class.js";
import {defineStore,createPinia,getActivePinia,setActivePinia} from "pinia";
import {watch as _watch} from "vue";
import {computed,ref,toRefs,markRaw} from "@vue/reactivity";
import System from "./../System.js";
import Reflect from "./../Reflect.js";
const _private = Class.getKeySymbols("7869e307");
function Store(){
    this.key='store';
    this.storeProxy=null;
    this.storeInstance=null;
    Object.defineProperty(this,_private,{
        value:{}
    });
}
Class.creator(Store,{
    m:513,
    ns:"web",
    name:"Store",
    private:_private,
    methods:{
        getInstances:{
            m:2336,
            value:function getInstances(){
                let dataset = System.getConfig('globals.webStoreInstances');
                if(!dataset){
                    System.setConfig('globals.webStoreInstances',dataset=new Map());
                }
                return dataset;
            }
        },
        _plugins:{
            m:2312,
            writable:true,
            value:[]
        },
        setPlugins:{
            m:800,
            value:function setPlugins(plugins){
                Store._plugins.push(...plugins);
            }
        },
        _getActivePinia:{
            m:2336,
            value:function _getActivePinia(){
                return System.getConfig('globals.store.pinia.active.instance') || getActivePinia();
            }
        },
        main:{
            m:800,
            value:function main(){
                System.registerOnceHook('application:created',(app)=>{
                    const nuxt = app.getAttribute('nuxtApp');
                    const pinia = nuxt.$pinia;
                    System.setConfig('globals.store.pinia.active.instance',pinia);
                    Store._plugins.forEach((plugin)=>{
                        pinia.use(plugin);
                    });
                });
            }
        },
        use:{
            m:800,
            value:function use(storeClass){
                let dataset = Store.getInstances();
                let instance = dataset.get(storeClass);
                if(!instance){
                    instance=new storeClass();
                    instance.create();
                    dataset.set(storeClass,instance);
                }
                return instance.storeProxy;
            }
        }
    },
    members:{
        key:{
            m:1032,
            writable:true
        },
        getOptions:{
            m:1056,
            value:function getOptions(){
                return {}
            }
        },
        getStorage:{
            m:1056,
            value:function getStorage(){
                return {}
            }
        },
        create:{
            m:1056,
            value:function create(){
                const descriptor = Reflect.getDescriptor(this);
                const states = this.getStorage();
                const getters = {}
                const actions = {}
                if(!descriptor){
                    return null;
                }
                const members = descriptor.members;
                console.log(members,"=========members===============");
                const bindMethods = {}
                const selfMethods = ['setState','getState','whenPropertyNotExists','getOptions','getStorage'];
                const selfProperties = ['storeInstance','key','storeProxy'];
                const publicMethods = ['patch','onAction','reset','subscribe','watch','dispose'];
                const _proxy = new Proxy(this,{
                    get:(target,key,receiver)=>{
                        if(descriptor.isPrivatePropertyKey(key)){
                            return this[key];
                        }
                        if(selfMethods.includes(key)){
                            if(bindMethods.hasOwnProperty(key)){
                                return bindMethods[key];
                            }
                            return bindMethods[key]=(this[key]).bind(this);
                        }else 
                        if(selfProperties.includes(key)){
                            return this[key];
                        }
                        const desc = descriptor.getMemberDescriptor(key);
                        if(desc){
                            if(desc.isProperty()){
                                if(desc.isPublic()){
                                    return store.$state[key];
                                }
                                return this[key];
                            }else 
                            if(desc.isAccessor()){
                                if(desc.getter){
                                    return desc.invokeGetter(this);
                                }else{
                                    throw new ReferenceError(`Store property the "${key}" is not readable.`);
                                }
                            }else 
                            if(desc.isMethod()){
                                if(bindMethods.hasOwnProperty(key)){
                                    return bindMethods[key];
                                }
                                return bindMethods[key]=Reflect.call(Store,desc.value,"bind",[this]);
                            }
                        }else{
                            key=String(key);
                            if(key === 'Symbol(Symbol.toStringTag)'){
                                return this.toString();
                            }else{
                                return this.whenPropertyNotExists(key);
                            }
                        }
                    },
                    set:(target,key,value)=>{
                        const desc = descriptor.getMemberDescriptor(key);
                        if(desc){
                            if(desc.isProperty()){
                                if(desc.isPublic()){
                                    store.$state[key]=value;
                                }else{
                                    this[key]=value;
                                }
                                return true;
                            }else 
                            if(desc.isAccessor()){
                                if(desc.setter){
                                    desc.invokeSetter(this,value);
                                    return true;
                                }
                            }
                            throw new ReferenceError(`Store property the "${key}" is not writable.`);
                        }else{
                            throw new ReferenceError(`Store properties the "${key}" is not exist.`);
                        }
                    }
                });
                members.forEach((desc)=>{
                    if(!desc.isPublic())
                    return 
                    if(desc.isProperty()){
                        if(!states.hasOwnProperty(desc.key)){
                            states[desc.key]=desc.value;
                        }
                    }else 
                    if(desc.isAccessor()){
                        if(desc.getter){
                            getters[desc.key]=desc.getter.bind(_proxy);
                        }
                    }else 
                    if(desc.isMethod()){
                        actions[desc.key]=Reflect.call(Store,desc.value,"bind",[_proxy]);
                    }
                });
                const pinia = Store._getActivePinia();
                const id = this.key + ':' + (descriptor.namespace ? descriptor.namespace + '.' + descriptor.className : descriptor.className);
                let setupOptions = {
                    state:()=>states,
                    getters:getters,
                    actions:actions
                }
                let store = null;
                let options = this.getOptions();
                const newStore = defineStore(id,setupOptions,options);
                store=newStore();
                this.storeInstance=store;
                this.storeProxy=new Proxy(store,{
                    set:(target,key,value)=>{
                        const desc = descriptor.getMemberDescriptor(key);
                        if(!desc){
                            throw new ReferenceError(`Store property the "${key}" 222 is not exist`);
                        }
                        if(!desc.isPublic()){
                            throw new ReferenceError(`Store ${desc.label} the "${key}" is not accessible`);
                        }
                        if(desc.isAccessor()){
                            if(desc.setter){
                                desc.invokeSetter(this,value);
                                return true;
                            }else{
                                throw new ReferenceError(`Store property the "${key}" is not writable.`);
                            }
                        }else 
                        if(desc.isProperty()){
                            if(desc.writable){
                                store.$state[key]=value;
                                return true;
                            }else{
                                throw new ReferenceError(`Store state the "${key}" is not writable.`);
                            }
                        }else{
                            throw new ReferenceError(`Store property the "${key}" is not writable`);
                        }
                    },
                    get:(target,key,receiver)=>{
                        if(key === "$id"){
                            return store[key];
                        }
                        if(publicMethods.includes(key)){
                            if(bindMethods.hasOwnProperty(key)){
                                return bindMethods[key];
                            }
                            return bindMethods[key]=(this[key]).bind(this);
                        }
                        const desc = descriptor.getMemberDescriptor(key);
                        if(!desc){
                            return this.whenPropertyNotExists(String(key));
                        }
                        if(!desc.isPublic()){
                            throw new ReferenceError(`Store ${desc.label} the "${key}" is not accessible`);
                        }
                        return store[key];
                    }
                });
            }
        },
        storeProxy:{
            m:1032,
            writable:true
        },
        storeInstance:{
            m:1032,
            writable:true
        },
        setState:{
            m:1056,
            value:function setState(name,value){
                this.storeInstance.$state[':' + name]=value;
            }
        },
        getState:{
            m:1056,
            value:function getState(name){
                return this.storeInstance.$state[':' + name];
            }
        },
        whenPropertyNotExists:{
            m:1056,
            value:function whenPropertyNotExists(key){
                throw new ReferenceError(`Store property the "${key}" is not exist.`);
            }
        },
        patch:{
            m:544,
            value:function patch(data){
                this.storeInstance.$patch(data);
            }
        },
        onAction:{
            m:544,
            value:function onAction(callback,always=false){
                return this.storeInstance.$onAction(callback,always);
            }
        },
        subscribe:{
            m:544,
            value:function subscribe(callback,options){
                this.storeInstance.$subscribe(callback);
            }
        },
        watch:{
            m:544,
            value:function watch(callback,options){
                return _watch(this.storeInstance.$state,callback,options);
            }
        },
        dispose:{
            m:544,
            value:function dispose(){
                this.storeInstance.$dispose();
            }
        },
        reset:{
            m:544,
            value:function reset(){
                this.storeInstance.$reset();
            }
        }
    }
});
Store.main();
export default Store;