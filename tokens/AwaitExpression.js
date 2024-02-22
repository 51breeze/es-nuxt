module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.argument = node.createToken( stack.argument );
    const module = stack.module;
    const pageComponent = stack.getModuleById('web.components.Page');
    if( pageComponent.is(module) ){
        const parent = stack.getParentStack((parent)=>{
            return parent.isFunctionExpression || parent.isMethodDefinition || parent.isClassDeclaration
        });

        const method = parent.getParentStack( parent=>{
            return parent.isMethodDefinition || parent.isClassDeclaration
        });
        if( method && method.isMethodDefinition && method.static ){
            return node;
        }

        if( parent.isFunctionExpression ){
            const context = ctx.getParentByType((parent)=>{
                return ['FunctionExpression','FunctionDeclaration','ArrowFunctionExpression','MethodDefinition'].includes(parent.type)
            }, true);

            if( context ){

                const callback = ctx.createArrowFunctionNode([], node.argument)
                const withAsyncContext = ctx.createCalleeNode(
                    ctx.createMemberNode([
                        ctx.createThisNode(), 
                        ctx.createIdentifierNode('withAsyncContext')
                    ]),
                    [
                        callback
                    ]
                );

                const vars = ['_promise', '_restore', '_result'].map( name=>{
                    name = ctx.genUniVarRefs(name, context);
                    context.body.body.push(
                        ctx.createDeclarationNode(
                            'let', 
                            [
                                ctx.createDeclaratorNode( 
                                    ctx.createIdentifierNode(name), 
                                    ctx.createLiteralNode(null)
                                )
                            ] 
                        )
                    )
                    return ctx.createIdentifierNode(name);
                });

                const arrayPattern = ctx.createNode('ArrayPattern');
                arrayPattern.elements = vars.slice(0,2);

                const awaitExpression = ctx.createNode('AwaitExpression')
                awaitExpression.argument = vars[0];
                return ctx.createParenthesNode(
                    ctx.createAssignmentNode(
                    arrayPattern, 
                    ctx.createSequenceNode([
                        withAsyncContext,
                        ctx.createAssignmentNode(vars[2], awaitExpression),
                        ctx.createCalleeNode(vars[1]),
                        vars[2]
                    ])
                ));
            }
        }
    }

    return node;
 }