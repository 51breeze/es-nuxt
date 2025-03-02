import Class from "./../Class.js";
import {createElementVNode,createVNode,openBlock,createElementBlock} from "vue";
import Page from "./../web/components/Page.js";
import web_components_Component from "./../web/components/Component.js";
import Viewport from "./../web/components/Viewport.js";
const __hoisted_0__ = createElementVNode("div",null,"members/Index",-1);
function Members(){
    Page.call(this,arguments[0]);
}
Class.creator(Members,{
    m:513,
    ns:"pages",
    name:"Members",
    inherit:Page,
    members:{
        onMounted:{
            m:1056,
            value:function onMounted(){
                console.log('--onMounted--');
            }
        },
        render:{
            m:1056,
            value:function render(){
                return (openBlock(),createElementBlock("div",null,[
                    __hoisted_0__,
                    createVNode(Viewport)
                ]));
            }
        }
    }
});
export default web_components_Component.createComponent(Members,{
    name:"es-Members"
});