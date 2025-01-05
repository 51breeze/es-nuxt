module.exports = function(ctx,stack){
    const CallExpression = ctx.plugin.getTokenNode('CallExpression', true);
    const node = CallExpression(ctx,stack);
    if(node && stack.callee.isIdentifier ){
        switch( stack.callee.value() ){
            case 'definePageMeta':
                ctx.builder.defineMacros.push([ctx.createStatementNode(node, stack), stack]);
                return null;
        }
    }
    return node;
}