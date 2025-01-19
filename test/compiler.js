const Compiler = require("easescript/lib/core/Compiler");
const Diagnostic = require("easescript/lib/core/Diagnostic");
const Compilation = require("easescript/lib/core/Compilation");
const path =require("path");

let plugin = require("../dist/index");
plugin = plugin.default || plugin

class Creator {
    constructor(options){
        const compiler = new Compiler(Object.assign({
            debug:false,
            diagnose:false,
            autoLoadDescribeFile:true,
            workspace:path.join(__dirname,"./src"),
            parser:{
                locations:true
            }
        },options || {}));

        this._compiler = compiler;
        this.plugin = plugin({
            emitFile:true,
            module:'esm',
            outExt:'.js',
            outDir:'test/.output',
            mode:'development',
            srcCSS:false,
            sourceMaps:true,
            useAbsolutePathImport:true,
            vue:{
                optimize:true,
            },
            metadata:{
                env:process.env,
                //platform:'server'
            }
        });
    }

    get compiler(){
        return this._compiler;
    }

    factor(file,source){
        return new Promise( async(resolved,reject)=>{
            const compiler = this.compiler;
            await compiler.initialize();
            let compilation = null;
            try{
                const compilation=file ? await compiler.createCompilation(file) : new Compilation( compiler );
                await compilation.parserAsync(source);
                if(compilation.stack){
                    resolved(compilation);
                }else{
                    reject({compilation,errors:compiler.errors});
                }
            }catch(error){
                console.log( error )
                reject({compilation,errors:[error]});
            }
        });
    }

    build(compilation){
        this.plugin.run(compilation);
    }
}

exports.Diagnostic = Diagnostic;
exports.Creator=Creator;