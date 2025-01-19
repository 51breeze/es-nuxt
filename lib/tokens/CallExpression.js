import * as tokens from "@easescript/transform/lib/tokens";
export default function CallExpression(ctx,stack){
    if(stack.callee.isIdentifier ){
        switch( stack.callee.value() ){
            case 'definePageMeta':
                let pp = stack.getParentStack(p=>p.isProgram||p.isBlockStatement);
                if(pp.isProgram){
                    return null;
                }  
        }
    }
    return tokens.CallExpression(ctx,stack);
}