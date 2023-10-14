const Core = require("../core/Core");
const VueTemplate = require("../core/vue/VueTemplate");;
const JSXTransform = Core.JSXTransform;
const VueJsxV3 =  Core.VueJsxV3;
const JSXTransformV3 = Core.JSXTransformV3;
const JSXTransformV3Optimize = Core.JSXTransformV3Optimize;
const privateKey = Symbol('privateKey')
function getTransform(root, ctx){
    let instances = ctx.plugin[privateKey] || (ctx.plugin[privateKey]=new Map());
    if( instances.has(root) ){
        return instances.get(root);
    }

    let obj = null
    if( ctx.builder.isBuildVueTemplateFormat(root) ){
        obj = new VueTemplate(root, ctx);
    }else if( ctx.builder.isBuildVueJsxFormat(root) ){
        obj = new VueJsxV3(root, ctx);
    }

    if( !obj ){
        const version = ctx.builder.getBuildVersion();
        if( version>=3 ){
            const optimize = ctx.plugin.options.optimize;
            if( optimize ){
                obj = new JSXTransformV3Optimize(root, ctx);
            }else{
                obj = new JSXTransformV3(root, ctx)
            }
        }else{
            obj = new JSXTransform(root, ctx);
        }
    }
    instances.set(root, obj);
    return obj;
}


module.exports = function(ctx, stack){
    const obj = getTransform( stack.jsxRootElement, ctx);
    return obj.create( stack, ctx);
};
