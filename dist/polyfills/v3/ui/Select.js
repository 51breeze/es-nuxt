///<import from='element-plus/lib/components/select' name='_Select' />
///<import from='vue' name='Vue' namespaced />
///<namespaces name='web.ui' />
///<createClass value='false' />
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