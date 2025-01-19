import {MakeCode as BaseMakeCode} from "@easescript/es-vue/lib/core/MakeCode.js";
import {getModuleAnnotations, getModuleRoutes,createRoutePath} from "@easescript/transform/lib/core/Common";
import Token from "@easescript/transform/lib/core/Node";
import Generator from "@easescript/transform/lib/core/Generator";

class MakeCode extends BaseMakeCode{

    async getMacros(compilation){
        const module = compilation.mainModule;
        const route = this.getModuleRoute(module)[0];
        const gen = new Generator();
        const redirectAnnot = getModuleAnnotations(module, ['redirect'])[0];
        let redirect = null;
        if( redirectAnnot ){
            const args = redirectAnnot.getArguments();
            if( args[0] ){
                const value = String(args[0].value);
                const toModule = await compilation.loadTypeAsync( value );
                if( toModule ){
                    const redirectRoute = getModuleRoutes(toModule)[0];
                    if( redirectRoute ){
                        redirect = createRoutePath(redirectRoute);
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

        const metadataAnnot = getModuleAnnotations(module, ['metadata'])[0];
        const metadata = Object.create(null);
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

        let definePageMetas = [];
        if(compilation.stack && Array.isArray(compilation.stack.externals)){
            definePageMetas = compilation.stack.externals.filter(stack=>!!(stack.isCallExpression && stack.callee.value() ==="definePageMeta"));
        }

        const createProperty = (properties, key, value)=>{
            properties.push(
                this.createProperty(
                    Token.is(key) ? key : this.createLiteral(key),
                    Token.is(value) ? value : this.createLiteral(value)
                )
            );
        }

        if(definePageMetas.length>0){
            definePageMetas.forEach( item=>{
                let node = this.createToken(item)
                if(route){
                    const arg = node.arguments[0];
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
                            createProperty(arg.properties, _m, metadata[_m]);
                        }
                        createProperty(arg.properties, 'path', route.path);
                        createProperty(arg.properties, 'name', route.name);
                        if(redirect){
                            createProperty(arg.properties,'redirect',redirect);
                        }
                    }
                }
                gen.make(this.createExpressionStatement(node));
            });
        }else if(route){
            const properties = [];
            createProperty(properties, 'path', route.path);
            createProperty(properties, 'name', route.name);
            for(let _m in metadata){
                createProperty(properties, _m, metadata[_m]);
            }
            if(redirect){
                createProperty(properties,'redirect',redirect)
            }
            gen.make(this.createExpressionStatement(
                this.createCallExpression( 
                    this.createIdentifier('definePageMeta'),
                    [
                        this.createObjectExpression(properties)
                    ]
                )
            ));
        }
        return gen.toString() || "//No defined macros";
    }
}


export {MakeCode};