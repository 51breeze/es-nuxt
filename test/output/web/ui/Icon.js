import "element-plus/es/components/icon/style/css";
import ElIcon from "element-plus/es/components/icon/index";
import  *  as Vue from "vue";
import  *  as ElementPlusIconsVue from "@element-plus/icons-vue";
import System from "./../../System.js";
System.registerOnceHook('application:created', (app)=>{
    app = app.getAttribute('vueApp');
    Object.keys(ElementPlusIconsVue).forEach( key=>{
        const com = ElementPlusIconsVue[key];
        app.component(com.name||key, com);
    });
});
const hasOwn = Object.prototype.hasOwnProperty;
function _resolveComponent(name){
    if( ElementPlusIconsVue ){
        if( hasOwn.call(ElementPlusIconsVue, name) ){
            return ElementPlusIconsVue[name];
        }
        let key = name.toLowerCase();
        if( hasOwn.call(ElementPlusIconsVue, key) ){
            return ElementPlusIconsVue[key];
        }
        key = name.slice(0,1).toUpperCase()+name.slice(1);
        if( hasOwn.call(ElementPlusIconsVue, key) ){
            return ElementPlusIconsVue[key];
        }
    }
    return Vue.resolveComponent(name);
}
function resolveComponent(name){
    name = String(name).trim();
    const value = _resolveComponent(name);
    if(!value){
        console.error(`[ES-VUE] The '${name}' icon component was not resolved`)
        return Vue.createCommentVNode(`icon '${name}' not resolved`)
    }
    return Vue.h(value);
}
const Icon = Vue.defineComponent({
    name:'es-icon',
    props: {
        size:{type:[Number, String]},
        color:{type:String},
        name:{type:String}
    },
    setup(props, context) {
        let {size,color,name} = Vue.toRefs(props);
        name = Vue.unref(name);
        return (_ctx, _cache) => {
            return Vue.h(ElIcon, {...context.attrs,size:Vue.unref(size),color:Vue.unref(color)}, {
                default:Vue.withCtx(()=>{
                    if(name && !_ctx.$slots.default ){
                        return [resolveComponent(name)];
                    }else {
                        let children = null;
                        if( typeof _ctx.$slots.default === 'function' ){
                            children =  _ctx.$slots.default();
                        }else if( Array.isArray(_ctx.$slots.default) ){
                            children = _ctx.$slots.default;
                        }else{
                            children = [_ctx.$slots.default];
                        }
                        if( Array.isArray(children) && children.length>0){
                            return children.map( child=>{
                                if(typeof child === 'string'){
                                    return resolveComponent(child)
                                }else if(Vue.isVNode(child)){
                                    if(child.type===Vue.Text && typeof child.children === 'string'){
                                        return resolveComponent(child.children)
                                    }else if(typeof child.type ==='string'){
                                        return resolveComponent(child.type)
                                    }
                                }
                                return child;
                            })
                        }
                    }
                    return []
                })
            });
        };
    }
});
export default Icon;