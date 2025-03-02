import "element-plus/es/components/select/style/css";
import _Select from "element-plus/es/components/select/index";
import  *  as Vue from "vue";
var Select = Object.assign({}, _Select);
const _setup = Select.setup;
Select.setup=function(props, ctx){
    if( props.size ){
        var value = props.size;
        if(value ==='mini')props.size='small';
        if(value==='medium')props.size='default';
    }
    return _setup(props, ctx)
}
export default Select;