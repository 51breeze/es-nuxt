import {MakeCode as BaseMakeCode} from "@easescript/es-vue/lib/core/MakeCode.js";
import {getModuleAnnotations, getModuleRoutes,getPageRoutePath,createCJSImports, createESMImports, getModuleRedirectNode} from "@easescript/transform/lib/core/Common";
import Token from "@easescript/transform/lib/core/Node";
import Generator from "@easescript/transform/lib/core/Generator";
import Namespace from "easescript/lib/core/Namespace";
import Utils from "easescript/lib/core/Utils";

class MakeCode extends BaseMakeCode{

    isPage(module){
        if(Utils.isModule(module) && module.file && module.isWebComponent()){
            const pageModule = Namespace.globals.get('web.components.Page')
            if(pageModule.is(module)){
                return true;
            }
            return super.isPage(module)
        }
        return false;
    }

    async getMacros(compilation){
        const ctx = this.plugin.context.makeContext(compilation);
        const module = compilation.mainModule;
        const route = this.getModuleRoute(ctx, module)[0];
        const gen = new Generator();
        const redirect = getModuleRedirectNode(ctx, module);
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
                    metadata[item.key] = ctx.createToken(item.stack.right);
                }else if(index===0){
                    metadata.title = ctx.createToken(item.stack);
                }
            });
        }

        let body = [];
        let definePageMetas = [];
        if(compilation.stack && Array.isArray(compilation.stack.externals)){
            definePageMetas = compilation.stack.externals.filter(stack=>!!(stack.isCallExpression && stack.callee.value() ==="definePageMeta"));
        }

        const createProperty = (properties, key, value)=>{
            properties.push(
                ctx.createProperty(
                    Token.is(key) ? key : ctx.createLiteral(key),
                    Token.is(value) ? value : ctx.createLiteral(value)
                )
            );
        }

        if(definePageMetas.length>0){
            definePageMetas.forEach( item=>{
                let node = ctx.createToken(item)
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
                        const routePath = getPageRoutePath(ctx, route)
                        createProperty(arg.properties, 'path', routePath);
                        createProperty(arg.properties, 'name', route.name);
                        if(redirect){
                            createProperty(arg.properties,'redirect',redirect);
                        }
                    }
                }
                body.push(ctx.createExpressionStatement(node));
            });
        }else if(route){
            const properties = [];
            const routePath = getPageRoutePath(ctx, route)
            createProperty(properties, 'path', routePath);
            createProperty(properties, 'name', route.name);
            for(let _m in metadata){
                createProperty(properties, _m, metadata[_m]);
            }
            if(redirect){
                createProperty(properties,'redirect',redirect)
            }
            body.push(ctx.createExpressionStatement(
                ctx.createCallExpression( 
                    ctx.createIdentifier('definePageMeta'),
                    [
                        ctx.createObjectExpression(properties)
                    ]
                )
            ));
        }

        ctx.createAllDependencies()
        let importNodes = null
        if(ctx.options.module==='cjs'){
            importNodes = createCJSImports(ctx, ctx.imports)
        }else{
            importNodes = createESMImports(ctx, ctx.imports)
        }
        if(importNodes){
            importNodes.forEach(item=>gen.make(item));
        }
        body.forEach(item=>gen.make(item));
        return gen.toString() || "//No defined macros";
    }
}


export {MakeCode};