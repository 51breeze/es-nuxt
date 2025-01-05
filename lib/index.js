import Plugin from "@easescript/es-vue/lib/core/Plugin";
import {getOptions} from "@easescript/transform/lib/index";
import pkg from "../package.json";
const defaultConfig={
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
    }
}

function plugin(options={}){
    return new Plugin(
        pkg.esconfig.scope,
        pkg.version,
        getOptions(defaultConfig, options)
    )
}
export default plugin;