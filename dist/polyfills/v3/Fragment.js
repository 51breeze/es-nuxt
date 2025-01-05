/*
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */
///<import from='vue' name='Vue' namespaced />
///<namespaces name='web.components' />
///<createClass value='false' />

function makeChild(value){
    if( Array.isArray(value) ){
        return Vue.h(Vue.Fragment,value.map(child=>makeChild(child)));
    }else if( Vue.isVNode(value) ){
        return value;
    }else if( typeof value === 'function' && '__vccOpts' in value){
        return Vue.h(value)
    }else if(value != null){
        return Vue.h(Vue.Text,Vue.toDisplayString(value))
    }else{
        return Vue.h(Vue.Comment,'value is empty.');
    }
}

const Fragment = Vue.defineComponent({
    name:'es-Fragment',
    props: ['value'],
    setup(props, context) {
        return () => {
            if(context.slots && context.slots.default){
                return Vue.renderSlot(context.slots, 'default')
            }
            return makeChild(Vue.unref(props.value));
        };
    }
});