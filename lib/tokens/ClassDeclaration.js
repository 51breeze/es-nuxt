import ClassBuilder from '@easescript/es-vue/lib/core/ClassBuilder.js'
import ESXClassBuilder from '@easescript/es-vue/lib/core/ESXClassBuilder.js'
import Namespace from 'easescript/lib/core/Namespace';
export default function(ctx, stack){
    if(stack.module === stack.compilation.mainModule && stack.compilation.modules.size===1){
        const Application = Namespace.globals.get("web.Application");
        if(stack.isModuleForWebComponent(stack.module) || Application.is(stack.module)){
            const builder = new ESXClassBuilder(stack);
            return builder.create(ctx);
        }
    }
    const builder = new ClassBuilder(stack)
    return builder.create(ctx);
}