import Class from "./../Class.js";
import {createElementVNode,renderSlot,openBlock,createElementBlock} from "vue";
import Component from "./../web/components/Component.js";
const __hoisted_0__ = createElementVNode("div",null,"=========List Component===",-1);
const __hoisted_1__ = {
    sss:"ss"
}
function List(){
    Component.call(this,arguments[0]);
}
Class.creator(List,{
    m:513,
    ns:"components",
    name:"List",
    inherit:Component,
    members:{
        render:{
            m:1056,
            value:function render(){
                return (openBlock(),createElementBlock("div",__hoisted_1__,[
                    __hoisted_0__,
                    createElementVNode("div",null,[
                        renderSlot(this.getAttribute("slots"),"default",{})
                    ])
                ]));
            }
        }
    }
});
export default Component.createComponent(List,{
    name:"es-List"
});