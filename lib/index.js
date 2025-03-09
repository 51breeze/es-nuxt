import {getOptions as _getOptions, Plugin} from "./core/Plugin";
import pkg from "../package.json";
const defaultConfig={
    dependency:{
        excludes:[
            /(^|[\/\\\\])axios([\/\\\\]|$)/i,
        ]
    },
    ui:{
        module:"esm"
    },
    hmrHandler:'import.meta.hot',
    vue:{
        makeOptions:{
            file:true,
            ssrCtx:true,
            async:{
                //none ssr nossr all
                mode:'none',
            }
        }
    }
}

function plugin(options={}){
    return new Plugin(
        pkg.esconfig.scope,
        pkg.version,
        getOptions(options)
    )
}

function getOptions(...options){
    return _getOptions(defaultConfig, ...options)
}

export {Plugin, getOptions};

export default plugin;