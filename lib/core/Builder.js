const Core = require('./Core');
const Polyfill = require('./Polyfill');
const Generator = require('es-javascript/core/Generator');
class Builder extends Core.Builder{

    constructor(compilation){
        super(compilation);
        this.defineMacros = [];
    }

    clear(){
        super.clear();
        this.defineMacros = [];
    }

    getModuleRoutes(module){
        const Page = this.compilation.getModuleById( 'web.components.Page' );
        return super.getModuleRoutes(module, Page && Page.is(module));
    }

    async getMacros(){

        const module = this.compilation.mainModule;
        const route = this.getModuleRoutes(module)[0];
        const gen = new Generator(this.compilation.file);
        const redirectAnnot = this.getModuleAnnotations(module, ['redirect'])[0];
        let redirect = null;
        if( redirectAnnot ){
            const args = redirectAnnot.getArguments();
            if( args[0] ){
                const value = String(args[0].value);
                const toModule = await this.compilation.loadTypeAsync( value );
                if( toModule ){
                    const redirectRoute = this.getModuleRoutes(toModule)[0];
                    if( redirectRoute ){
                        redirect = this.createRoutePath(redirectRoute);
                    }else{
                        console.error(`[es-nuxt] Redirect reference class is not a valid page-component the "${value}"`)
                    }
                }else if( value && value.includes('.') ){
                    console.error(`[es-nuxt] Redirect reference class is not exists. the "${value}"`)
                }else if( !value ){
                    console.error(`[es-nuxt] Redirect missing route-path params.`)
                }
            }
        }

        const metadataAnnot = this.getModuleAnnotations(module, ['metadata'])[0];
        const metadata = {};
        if( metadataAnnot ){
            metadataAnnot.getArguments().forEach( (item,index)=>{
                if( item.assigned ){
                    if( route && (item.key ==='path' || item.key ==='name')){
                        return;
                    }
                    if( redirect && item.key==='redirect'){
                        return;
                    }
                    metadata[item.key] = this.createToken(item.stack.right);
                }else if(index===0){
                    metadata.title = this.createToken(item.stack);
                }
            });
        }

        if( this.defineMacros.length>0 ){
            this.defineMacros.forEach( item=>{
                const [node, stack] = item;
                const target = node.type==="ExpressionStatement" ? node.expression : node;
                if(route && target.type==="CallExpression"){
                    const arg = target.arguments[0];
                    if( arg && arg.type==="ObjectExpression"){
                        arg.properties = arg.properties.filter( property=>{
                            if( property.type==='Property'){
                                const name = property.key.value;
                                if(metadata[name])return false
                                return !(name ==='path' || name ==='name' || redirect && name==='redirect');
                            }
                            return false;
                        });

                        for(let _m in metadata){
                            arg.properties.push( arg.createPropertyNode(_m, metadata[_m] ))
                        }

                        arg.properties.push( arg.createPropertyNode( 'path', route.path ) )
                        arg.properties.push( arg.createPropertyNode( 'name', route.name ) );
                        if(redirect){
                            arg.properties.push( arg.createPropertyNode( 'redirect', redirect) );
                        }
                    }
                }
                gen.make(node);
            });
        }else if(route){
            const properties = [
                this.createPropertyNode( 'path', route.path ),
                this.createPropertyNode( 'name', route.name )
            ];

            for(let _m in metadata){
                properties.push( this.createPropertyNode(_m, metadata[_m] ))
            }

            if(redirect){
                properties.push( this.createPropertyNode( 'redirect', redirect) );
            }

            const node = this.createStatementNode(
                this.createCalleeNode( 
                    this.createIdentifierNode('definePageMeta'), [
                        this.createObjectNode(properties)
                    ]
                )
            );
            gen.make(node);
        }

        return gen.toString();
    }

    isVueComponent(module){
        if( !module || !module.isModule || module.isDeclaratorModule)return false;
        if(this.stack.isModuleForWebComponent(module))return true;
        return super.isApplication(module);
    }

    isApplication(module){
       return false;
    }

    getPolyfillModule( id ){
        const version = this.getBuildVersion();
        if( version >=3 ){
            if( Polyfill.v3Modules.has(id) ){
                return Polyfill.v3Modules.get(id);
            }
        }else{
            if( Polyfill.v2Modules.has(id) ){
                return Polyfill.v2Modules.get(id);
            }
        }
        if( Polyfill.globals.has(id) ){
            return Polyfill.globals.get(id);
        }
        return super.getPolyfillModule( id );
    }
}
module.exports = Builder;