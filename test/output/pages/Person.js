import "element-plus/es/components/option/style/css";
import "element-plus/es/components/button/style/css";
import Class from "./../Class.js";
import {useSeoMeta,useServerSeoMeta} from "#app";
import {createVNode,createTextVNode,createElementVNode,withCtx,openBlock,createElementBlock} from "vue";
import Page from "./../web/components/Page.js";
import ProfileStore from "./../stores/ProfileStore.js";
import System from "./../System.js";
import Component from "./../web/components/Component.js";
import {Meta as web_ui_Meta} from "D:/tools/es-nuxt/node_modules/nuxt/dist/head/runtime/components";
import web_ui_Icon from "./../web/ui/Icon.js";
import web_ui_Button from "element-plus/es/components/button/index";
import {ElOption as web_ui_Option} from "element-plus/es/components/select/index";
import web_ui_Select from "./../web/ui/Select.js";
import web_ui_Link from "./../web/ui/Link.js";
import List from "./../components/List.js";
import web_ui_ClientOnly from "#app/components/client-only.js";
const __hoisted_0__ = {
    content:"sfdsfdsfds"
}
const __hoisted_1__ = {
    name:"Plus"
}
const __hoisted_2__ = createTextVNode("button ",-1);
const __hoisted_3__ = ()=>[createTextVNode("sfsdf",-1)];
const __hoisted_4__ = {
    value:111
}
const __hoisted_5__ = ()=>[createTextVNode("Index",-1)];
const __hoisted_6__ = {
    to:"/"
}
const __hoisted_7__ = ()=>[createTextVNode("profile",-1)];
const __hoisted_8__ = ["to"];
const __hoisted_9__ = ()=>[createTextVNode("Address",-1)];
const __hoisted_10__ = {
    to:"/Address"
}
const __hoisted_11__ = ()=>[
    createElementVNode("div",null,"List children",-1)
];
const __hoisted_12__ = createElementVNode("div",null,"=======55559999===",-1);
const __hoisted_13__ = {
    fallback:"fallback"
}
const __hoisted_14__ = createElementVNode("div",null,"===6666 ==",-1);
const __hoisted_15__ = {
    class:"login-container"
}
const _private = Class.getKeySymbols("868cb650");
function Person(){
    Page.call(this,arguments[0]);
    Object.defineProperty(this,_private,{
        value:{
            lang:'sss'
        }
    });
    Object.defineProperties(this[_private],{
        data:{
            get:()=>this.reactive("data",void 0,()=>({
                name:'====222222222===='
            })),
            set:(value)=>this.reactive("data",value)
        },
        data2:{
            get:()=>this.reactive("data2",void 0,()=>({})),
            set:(value)=>this.reactive("data2",value)
        },
        data4:{
            get:()=>this.reactive("data4",void 0,()=>({})),
            set:(value)=>this.reactive("data4",value)
        }
    });
}
Class.creator(Person,{
    m:513,
    ns:"pages",
    name:"Person",
    private:_private,
    inherit:Page,
    members:{
        data:{
            m:2056,
            writable:true,
            value:{
                name:'====222222222===='
            }
        },
        onClick:{
            m:544,
            value:function onClick(e){
                console.log(e);
            }
        },
        lang:{
            m:2056,
            writable:true
        },
        onInitialized:{
            m:544,
            value:async function onInitialized(){
                await new Promise((resolve)=>{
                    setTimeout(resolve,1000);
                });
                console.log('----onInitialized----person');
                this[_private].data.name="===6666666-9999----";
                this.withContext(()=>{
                    useSeoMeta({
                        title:'EaseScript Nuxt'
                    });
                    useServerSeoMeta({
                        title:'EaseScript Nuxt'
                    });
                });
            }
        },
        data2:{
            m:2056,
            writable:true,
            value:{}
        },
        data4:{
            m:2056,
            writable:true,
            value:{}
        },
        render:{
            m:1056,
            value:function render(){
                console.log(ProfileStore.use().userId);
                var params = {
                    id:60
                }
                return (openBlock(),createElementBlock("div",__hoisted_15__,[
                    createVNode(web_ui_Meta,__hoisted_0__),
                    createElementVNode("h6",null,[createTextVNode(this[_private].data.name,1)]),
                    createVNode(web_ui_Button,null,{
                        default:withCtx(()=>[
                            createVNode(web_ui_Icon,__hoisted_1__),
                            __hoisted_2__
                        ]),
                        _:1
                    }),
                    createVNode(web_ui_Select,null,{
                        default:withCtx(()=>[
                            createVNode(web_ui_Option,__hoisted_4__,{
                                default:withCtx(__hoisted_3__),
                                _:1
                            })
                        ]),
                        _:1
                    }),
                    createVNode(web_ui_Link,__hoisted_6__,{
                        default:withCtx(__hoisted_5__),
                        _:1
                    }),
                    createVNode(web_ui_Link,{
                        to:System.createHttpRoute("/profile/<id?>/<name?>",Object.assign({
                            id:5,
                            name:"cid"
                        },params))
                    },{
                        default:withCtx(__hoisted_7__),
                        _:1
                    },8,__hoisted_8__),
                    createVNode(web_ui_Link,__hoisted_10__,{
                        default:withCtx(__hoisted_9__),
                        _:1
                    }),
                    __hoisted_14__,
                    createElementVNode("div",null,[createTextVNode("Load data: " + this[_private].data4.msg,1)]),
                    createVNode(List,null,{
                        default:withCtx(__hoisted_11__),
                        _:1
                    }),
                    createVNode(web_ui_ClientOnly,__hoisted_13__,{
                        fallback:withCtx(()=>[
                            __hoisted_12__
                        ]),
                        _:1
                    })
                ]));
            }
        }
    }
});
export default Component.createComponent(Person,{
    name:"es-Person"
});