const VueBuilder = require('./VueBuilder');
const Core = require('../Core');

class VueTemplate extends Core.VueTemplate{

    createClassNode(stack, childNodes){
        if( stack.jsxRootElement.isSkinComponent ){
            const obj = new Core.SkinClass(stack,this,'ClassDeclaration');
            return obj.create();
        }else{
            const obj = new VueBuilder(stack, this, 'ClassDeclaration');
            obj.templates.push( [childNodes, 1] );
            obj.templateRefMethods.push( ...this.templateRefMethods );
            return obj.create();
        }
    }

}
module.exports = VueTemplate;