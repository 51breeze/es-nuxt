const Core = require('../Core');
class VueBuilder extends Core.VueBuilder{

    createVueUsingDependenceComponentsNode(flag=false){
        const module = this.module;
        const dependencies = this.builder.getDependencies(module);
        if( dependencies.length > 0 ){
            const ops = this.builder.getRawOptions();
            const resolve = ops && ops.component && ops.component.resolve ? ops.component.resolve : (name)=>name;
            const deps = this.dependenciesComponents;
            const Component = this.builder.getGlobalModuleById('web.components.Component');
            const Page = this.builder.getGlobalModuleById('web.components.Page');
            dependencies.forEach( dep=>{
                if( dep.isReferenceLocalComponent ){
                    deps.add(dep)
                }else if( Component !== dep && Page !== dep && this.stack.isModuleForWebComponent(dep) ){
                    deps.add(dep)
                }
            });
            if( deps.size > 0 ){
                const properties = []
                deps.forEach( com=>{
                    if( com.isReferenceLocalComponent ){
                        properties.push(
                            this.createPropertyNode( this.createLiteralNode( resolve(com.name, com, this.stack) ), this.createIdentifierNode(com.from) )
                        )
                    }else{
                        const name = this.getModuleReferenceName(com)
                        properties.push(
                            this.createPropertyNode( this.createLiteralNode( resolve(name, com, this.stack) ), this.createIdentifierNode(name) )
                        )
                    }
                });
                if( flag === true ){
                    return this.createObjectNode(properties);
                }
                return this.createPropertyNode( this.createIdentifierNode('components'), this.createObjectNode(properties) )
            }
        }
        return null;
    }

}
module.exports = VueBuilder;