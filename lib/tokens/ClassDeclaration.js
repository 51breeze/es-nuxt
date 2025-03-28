import ClassBuilder from '@easescript/es-vue/lib/core/ClassBuilder.js'
import ESXClassBuilder from '@easescript/es-vue/lib/core/ESXClassBuilder.js'
import Namespace from 'easescript/lib/core/Namespace';
export default function(ctx, stack){
    if(stack.isModuleForWebComponent(stack.module) || Namespace.globals.get("web.Application").is(stack.module)){
        const builder = new ESXClassBuilder(stack);
        return builder.create(ctx);
    }
    const builder = new ClassBuilder(stack);
    return builder.create(ctx);
}