import {Plugin as BasePlugin, getOptions} from "@easescript/es-vue/lib/index";
import * as tokens from "../tokens";
import {MakeCode} from "./MakeCode";
import merge from "lodash/merge";
import Utils from "easescript/lib/core/Utils";
import path from "path"
class Plugin extends BasePlugin{
    #makeCode = null;
    constructor(name, version, options={}){
        options.transform = options.transform || (options.transform={});
        options.transform.tokens = merge({}, tokens, options.transform.tokens);
        const imports = options.resolve.imports;
        const nuxtRootDir = options.nuxtRootDir || process.cwd();
        if(!imports["nuxt-runtime-viewport"]){
            imports["nuxt-runtime-viewport"] = Utils.normalizePath(path.join(nuxtRootDir,'node_modules/nuxt/dist/pages/runtime/page'))
        }
        if(!imports["nuxt-runtime-compoments"]){
            imports["nuxt-runtime-compoments"] = Utils.normalizePath(path.join(nuxtRootDir,'node_modules/nuxt/dist/head/runtime/components'))
        }
        super(name, version, options)
    }

    get makeCode(){
        let makeCode = this.#makeCode;
        if(makeCode===null){
            this.#makeCode = makeCode = new MakeCode(this);
        }
        return makeCode;
    }

    async callHook(compilation, query={}){
        if(!this.initialized){
            await this.beforeStart(compilation.compiler);
        }
        if(query.action==='macros'){
            return await this.makeCode.getMacros(compilation, query);
        }
        return await super.callHook(compilation, query);
    }
}

export {getOptions, Plugin};

export default Plugin