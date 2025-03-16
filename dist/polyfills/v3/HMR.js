/*
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */
///<references from='Class' />
///<namespaces name='dev.tools' />
///<createClass value='false' />
///<import from='vue' name='Vue' namespaced />
const _createVNode = Vue.h;
const errorHook = ()=>{
    console.warn('[HMR] __VUE_HMR_RUNTIME__ is not defined.');
}
const Api = typeof __VUE_HMR_RUNTIME__ !== 'undefined' ?  __VUE_HMR_RUNTIME__ : {
    createRecord:errorHook,
    rerender:errorHook,
    reload:errorHook
};
const records = new Map();
const HMR={
    createRecord(id, vueComponent){
        if(!records.has(id)){
            records.set(id, vueComponent[Class.bindClassKey] || vueComponent)
        }
        return Api.createRecord(id, vueComponent);
    },
    rerender(id, vueComponent){
        const classModule = vueComponent[Class.bindClassKey] || vueComponent;
        const object = typeof classModule ==='function' ? classModule.prototype : classModule;
        const oldComponent = records.get(id);
        if(oldComponent && oldComponent!==classModule){
            const descriptors = Object.getOwnPropertyNames(object).map(key=>{
                if(key==='toString' || key==='constructor' || key==='render')return;
                const desc = Object.getOwnPropertyDescriptor(object, key);
                if(!desc.configurable)return;
                if(desc.get || (desc.value && typeof desc.value ==='function')){
                    return {key, desc}
                }
                return
            }).filter(Boolean);
            if(descriptors.length>0){
                const proto = oldComponent.prototype;
                descriptors.forEach(({key, desc})=>{
                    if(desc.get){
                        Object.defineProperty(proto, key, {
                            configurable:true,
                            get:desc.get
                        });
                    }else{
                        Object.defineProperty(proto, key, {
                            configurable:true,
                            value:desc.value
                        });
                    }
                });
            }
        }

        let render = object.render;
        if(render){
            Api.rerender(id, function(ctx, cached){
                ctx.setCacheForVNode(cached);
                return render.call(ctx, _createVNode)
            });
        }else{
            HMR.reload(id, vueComponent);
        }
    },
    reload(id, vueComponent){
        records.set(id, vueComponent[Class.bindClassKey] || vueComponent);
        Api.reload(id, vueComponent);
    }
}