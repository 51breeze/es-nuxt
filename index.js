const fs = require("fs");
const path = require("path");
const Builder = require("./core/Builder");
const Core = require("./core/Core");
const {merge} = require("lodash");
const modules = new Map();
const dirname = path.join(__dirname,"tokens");
if( fs.existsSync(dirname) ){
    fs.readdirSync( dirname ).forEach( (filename)=>{
        const info = path.parse( filename );
        modules.set(info.name, require( path.join(dirname,filename) ) );
    });
}

const defaultOptions={
    dependences:{
        excludes:[/(^|[\/\\\\])axios([\/\\\\]|$)/i]
    },
    hmrHandler:'import.meta.hot',
    vueOptions:{
        __asyncSetup:{
            mode:'all'
        }
    },
    resolve:{
        mapping:{
            folder:{}
        }
    }
}

function normalizePath(pathname){
    return path.sep ==='\\' ? pathname.replace(/\\/g, '/') : pathname;
}

const shared = {};
const pkg = require("./package.json");
class EsNuxtPlugin extends Core.Plugin{

    constructor(complier,options){
        options = merge({}, defaultOptions,  options);
        super(complier, options);
        if( this.options.ssr ){
            this.platform = 'server';
            this.generatedCodeMaps = shared.code || (shared.code = new Map());
            this.generatedSourceMaps = shared.map || (shared.map = new Map());
        }

        if( this.options.hot ){
            this.options.crossDependenciesCheck = false;
        }

        this.name = pkg.name;
        this.version = pkg.version;
        const nuxtRootDir = options.nuxtRootDir || process.cwd();
        const folder = this.options.resolve.mapping.folder;
        if(!folder["nuxt-runtime-viewport"]){
            folder["nuxt-runtime-viewport"] = normalizePath(path.join(nuxtRootDir,'node_modules/nuxt/dist/pages/runtime/page'))
        }
        if(!folder["nuxt-runtime-compoments"]){
            folder["nuxt-runtime-compoments"] = normalizePath(path.join(nuxtRootDir,'node_modules/nuxt/dist/head/runtime/components'))
        }

        if( !complier.options.scanTypings ){
           // complier.loadTypes([require.resolve('./types/index.d.es')], {scope:'es-nuxt', inherits:['es-vue']});
        } 
    }

    getMacros(compilation){
       const builder = this.getBuilder(compilation);
       return builder.getMacros();
    }

    getBuilder( compilation, builderFactory=Builder){
        return super.getBuilder(compilation, builderFactory);
    }

    getTokenNode(name, flag=false){
        if( flag ){
            return super.getTokenNode(name,flag)
        }else{
            return modules.get(name) || super.getTokenNode(name);
        }
    }

    toString(){
        return pkg.name;
    }
}

EsNuxtPlugin.toString=function toString(){
    return pkg.name;
}

module.exports = EsNuxtPlugin;