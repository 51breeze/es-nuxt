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
        excludes:[
            /(^|[\/\\\\])axios([\/\\\\]|$)/i,
        ]
    },
    hmrHandler:'import.meta.hot',
    vueOptions:{
        __asyncSetup:{
            mode:'all'
        }
    },
    importSourceQuery:{
        enabled:true,
    },
    resolve:{
        imports:{},
        folders:{}
    }
}

function normalizePath(pathname){
    return path.sep ==='\\' ? pathname.replace(/\\/g, '/') : pathname;
}

const pkg = require("./package.json");
class EsNuxtPlugin extends Core.Plugin{

    constructor(complier,options){
        options = merge({}, defaultOptions,  options);
        options.projectConfigFile = false;
        options.pageDir = false;
        const imports = options.resolve.imports;
        const nuxtRootDir = options.nuxtRootDir || process.cwd();
        if(!imports["nuxt-runtime-viewport"]){
            imports["nuxt-runtime-viewport"] = normalizePath(path.join(nuxtRootDir,'node_modules/nuxt/dist/pages/runtime/page'))
        }
        if(!imports["nuxt-runtime-compoments"]){
            imports["nuxt-runtime-compoments"] = normalizePath(path.join(nuxtRootDir,'node_modules/nuxt/dist/head/runtime/components'))
        }
        imports['element-plus/es/components/*'] = 'element-plus/es/components/{basename}/index';
        imports['element-plus/lib/components/*'] = 'element-plus/es/components/{basename}/index';

        super(complier, options);
        if( this.options.ssr ){
            this.platform = 'server';
        }

        if( this.options.hot ){
            this.options.crossDependenciesCheck = false;
        }

        this.name = pkg.name;
        this.version = pkg.version;
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