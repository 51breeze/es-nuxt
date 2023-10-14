import ElIcon from 'element-plus/es/components/icon';
import "element-plus/theme-chalk/el-icon.css"
import {resolveComponent as _resolveComponent, defineComponent, h as _h} from 'vue';
import * as ElementPlusIconsVue from "@element-plus/icons-vue"

const hasOwn = Object.prototype.hasOwnProperty;
function resolveComponent(name){
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
    return _resolveComponent(name);
}

const Icon = defineComponent({
    name:'es-icon',
    props: {
        size:{type:[Number, String]},
        color:{type:String},
        name:{type:String}
    },
    setup(props) {
        const {size,color,name} = props;
        return (_ctx, _cache) => {
            const slots = {};
            if( name && !_ctx.$slots.default ){
                return _h(ElIcon, {size,color}, {
                    default:()=>_h( resolveComponent(name) ) 
                })
            }else {
                slots.default = ()=>{  
                    let children = [_ctx.$slots.default];
                    if( typeof _ctx.$slots.default === 'function' ){
                        children =  _ctx.$slots.default();  
                    }else if( Array.isArray(_ctx.$slots.default) ){
                        children = _ctx.$slots.default;
                    }
                    return children.map( child=>{
                        if( typeof child.type ==="string" ){
                            return _h( resolveComponent(child.type), child.props);
                        }else{
                            return child;
                        }
                    });
                };
            }
            return _h(ElIcon, {size,color}, slots);
        };
    }
});

export default Icon;