import path from 'path';
import fs from 'fs';
import esVitePlugin  from "es-vite-plugin";
import Compiler from "easescript/lib/core/Compiler";
import merge from "lodash/merge";
import {resolveFiles, normalizePlugin} from '@nuxt/kit';
import {scanHandlers, handlers, PREFIX, bindWatch} from './nitro.js';
import {getOptions} from '../dist/index.js';

const compile = Compiler.compiler();
const vitePlugins = [];
const resolveComponentCode = [
    `const __$resolveComponent = (m)=>{`,
    `   return typeof m === 'function' && m.__vccOpts ? m.__vccOpts : m;`,
    `};`
].join("\n");

function resolveComponent(code){
    let prefix = '';
    if(!code.startsWith('const __$resolveComponent')){
        prefix = resolveComponentCode + "\n";
    }
    code = code.replace(/import[\s+]?\([\s+]?([\"\'])([^\1]*?)\1[\s+]?\)(?!\.then)/g, (all, quotes, file)=>{
        return `import("${file}").then(m=>m.default || m)`
    });
    return prefix + code.replace(/import[\s+]?\([\s+]?([\"\'])([^\1]*?)\1[\s+]?\)\.then[\s+]?\((.*?)\)/g, (all, quotes, file, result)=>{
        if(result.startsWith('m=>__$resolveComponent')){
            return `import("${file}").then(${result})`
        }
        return `import("${file}").then(m=>__$resolveComponent(m.default || m))`
    });
}

function isExtensionFile(id){
    let file = id;
    if(id.includes('?')){
        let [sourceid] = file.split('?')
        file = sourceid;
    }
    if(file.endsWith('.vue')){
        file = file.slice(0, -4);
    }
    return compile.isExtensionFile(file);
}

function wrapup(callback, interceptor){
    return function(...args){
        if(interceptor(...args)){
            return;
        }
        return callback.call(this,...args);
    }
}

function createCkeditorOptimizeDeps(rootDir=process.cwd()){
    const optimizeDeps = [];
    const root = path.join(rootDir, 'node_modules/@ckeditor/vite-plugin-ckeditor5');
    if( fs.existsSync(root) ){
        const ckeditor5Plugin = require('@ckeditor/vite-plugin-ckeditor5');
        vitePlugins.push(ckeditor5Plugin({
            theme: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
        }));
        const dirs = fs.readdirSync( path.dirname(root) );
        const excludes = ['ckeditor5-theme-lark','vite-plugin-ckeditor5','ckeditor5-vue'];
        const deps = dirs.filter( dir=>!excludes.includes(dir) ).map( dir=>'@ckeditor/'+dir );
        optimizeDeps.push( ...deps );
    }
    return optimizeDeps;
}

export default function(nuxt){

    const cwd = compile.options.cwd || process.cwd();
    const plugins = compile.options.plugins || [];
    const clientPlugins = plugins.filter( plugin=>{
        const name = plugin.name.toString();
        return name.toLowerCase().includes('es-nuxt');
    });

    const serverPlugins = plugins.filter( plugin=>{
        return !clientPlugins.includes(plugin);
    });

    if( clientPlugins.length>1 ){
        console.error(`Plugin the "es-nuxt" can only be instantiated once, but it is configured more than once.`)
    }else if( !clientPlugins.length ){
        throw new Error('Missing the "es-nuxt" plugin.')
    }

    const clientPlugin = clientPlugins[0];
    const clientOptions =  getOptions(clientPlugin?.options||{});
    const formation = (file)=>{
        let opts = clientOptions.importFormation || {};
        let suffix = opts.ext && opts.ext.enabled ? opts.ext.suffix : null;
        let attrs = opts.query && opts.query.enabled ? opts.query.attrs : null;
        if(suffix || attrs){
            if(!compile.checkFileExt(file))return file;
            if(suffix){
                file = compile.resolveExtFormat(file, suffix);
            }
            if(attrs){
                let segs = [];
                Object.keys(attrs).forEach(key=>{
                    let value = attrs[key];
                    if(value == null || value==''){
                        segs.push(`${key}`)
                    }else{
                        segs.push(`${key}=${value}`)
                    }
                })
                return file + '?'+segs.join('&');
            }
        }
        return file;
    }

    const esVitePlugins = [];
    const optimizeDeps = nuxt.options.vite.optimizeDeps?.include ?? [];
    if (nuxt.options.vite.optimizeDeps) {
        nuxt.options.vite.optimizeDeps.include = [...optimizeDeps, ...createCkeditorOptimizeDeps(cwd)];
    } else {
        nuxt.options.vite.optimizeDeps = {
            include: createCkeditorOptimizeDeps(cwd)
        };
    }

    if(nuxt.options.vite.plugins){
        nuxt.options.vite.plugins.push(...vitePlugins)
    }else{
        nuxt.options.vite.plugins=vitePlugins;
    }

    nuxt.hook("app:templates", (nuxtApp)=>{
        const app = compile.resolveManager.resolveFile('App')
        if(app){
            nuxtApp.mainComponent = formation(app);
        }
    });

    let routes = null;
    nuxt.hook("app:templatesGenerated", (nuxtApp, changedTemplates)=>{
        const template = nuxtApp.templates.find( temp=>temp.filename==="routes.mjs");
        if(template){
            const fullPath = template.dst || resolve(nuxt.options.buildDir, template.filename);
            nuxt.vfs[fullPath] = resolveComponent(nuxt.vfs[fullPath])
            if(routes === nuxt.vfs[fullPath]){
                const index = changedTemplates.findIndex(temp=>temp.filename==="routes.mjs");
                changedTemplates.splice(index,1);
            }
            routes = nuxt.vfs[fullPath];
            const aliasPath = "#build/" + template.filename;
            nuxt.vfs[aliasPath] = nuxt.vfs[fullPath];
            if (process.platform === "win32") {
                nuxt.vfs[fullPath.replace(/\//g, "\\")] = nuxt.vfs[fullPath];
            }
        }
    });

    nuxt.hook("vite:configResolved", (config,ctx)=>{
        if( typeof config.server.hmr ==='object' ){
            config.server.hmr.server = null;
        }
        const isDev = config.mode==="development";
        const options ={
            hot:isDev,
            watch:isDev,
            builder: merge({
                options:{
                    ssr:!!ctx.isServer,
                    hot:isDev,
                    watch:isDev,
                    mode:isDev ? 'development' : 'production',
                    uiFully:!!isDev,
                    metadata:{
                        platform:ctx.isServer ? 'server' : 'client',
                        env:{
                            NODE_ENV:config.mode,
                        }
                    }
                }
            }, clientPlugins[0]),
            plugins:ctx.isServer ? [] : serverPlugins.map( plugin=>{
                plugin = Object.assign({}, plugin);
                const options = plugin.options = Object.assign({}, plugin.options || {});
                const output = options.output;
                options.mode = isDev ? 'development' : 'production';
                if( output && typeof output ==='object' ){
                    const dev = output.dev || output.prod;
                    const prod = output.prod || output.dev;
                    options.output = isDev ? dev : prod
                }
                return plugin;
            })
        }
        const plugin = esVitePlugin(options);
        if( !ctx.isServer ){
            esVitePlugins.push(plugin);
        }
        config.plugins.unshift(plugin);
        config.plugins.forEach( plugin=>{
            if( plugin.name==="vite:vue" ){
                plugin.transform = wrapup(plugin.transform, (code,id)=>isExtensionFile(id));
                plugin.resolveId = wrapup(plugin.resolveId, (id)=>isExtensionFile(id));
            }
        });
    });

    let _app = nuxt;
    nuxt.hook("app:resolve", async(app)=>{
        _app = app;
        if(app.layouts){
            Object.keys(app.layouts).forEach(key=>{
                app.layouts[key].file = formation(app.layouts[key].file)
            })
        }

        const NODE_ENV = nuxt.options.dev ? 'development' : 'production';
        const cache = {};
        const transformPlugin= (mode)=>{
            if(cache[mode])return cache[mode];
            const options = merge({}, clientPlugins[0], {
                options:{
                    hot:false,
                    watch:false,
                    sourceMaps:false,
                    mode:nuxt.options.dev ? 'development' : 'production',
                    uiFully:!!nuxt.options.dev,
                    metadata:{
                        env:{
                            NODE_ENV,
                            PLUGIN_MODE:mode,
                            PLATFORM:mode==='server' ? 'server' : 'client',
                            platform:mode==='server' ? 'server' : 'client',
                        }
                    }
                }
            });
            return cache[mode] = esVitePlugin({
                builder:options,
            });
        }
        const configs = nuxt.options._layers.map((layer) => layer.config).map( config=>resolveFiles(
            config.srcDir,
            `${config.dir?.plugins || "plugins"}/*{${nuxt.options.extensions.join(",")}}`
        ));
        const resolveResult = await Promise.allSettled(configs);
        const files = resolveResult.map(result=>result.status==='fulfilled' ? result.value : []).flat();
        const esPluginSource = new Map();
        files.forEach(file=>{
            let plugin = normalizePlugin(file);
            esPluginSource.set(plugin.src, plugin);
        });
        app.plugins.forEach(plugin=>{
            if(!esPluginSource.has(plugin.src)){
                esPluginSource.set(plugin.src, plugin);
            }
        });
        const doTransform = async(plugin)=>{
            const plg = transformPlugin(plugin.mode)
            let id = await plg.resolveId(plugin.src, 'nuxt:app:resolve:plugins');
            if(!id)return;
            let attrs = {};
            if(id.id && typeof id === 'object'){
                id = id.id
                attrs = id.attributes;
            }
            let source = await plg.load(id, attrs);
            if(source && typeof source ==='object' ){
                source = source.code;
            }
            const result = await plg.transform(source, id, attrs);
            if( result ){
                const code = typeof result ==='string' ? result : result.code;
                if(code){
                    nuxt.vfs[plugin.src] = code;
                    plugin.getContents=()=>code;
                }
            }else if(source){
                nuxt.vfs[plugin.src]=source;
                plugin.getContents=()=>source;
            }
        }
        await Promise.all(Array.from(esPluginSource.values()).map(plugin=>doTransform(plugin)));
    });

    const routePages = new Set()
    nuxt.hook("pages:extend", async (pages)=>{
        const pageExcludeRegular = clientPlugin.options?.pageExcludeRegular;
        const map = {};
        const spread = (list)=>{
            if( !Array.isArray(list) )return;
            list.forEach( route=>{
                if(route.file){
                    if(pageExcludeRegular && pageExcludeRegular.test(route.file)){
                        return false;
                    }
                    let meta = route.meta = route.meta || {};
                    let markedDynamic = meta['__nuxt_dynamic_meta_key'] = meta['__nuxt_dynamic_meta_key'] || new Set();
                    {
                        ["path", "name", "meta", "alias", "redirect"].forEach(key=>{
                            markedDynamic.add(key);
                        })
                    }
                    routePages.add(route.file)
                    map[route.file.toLowerCase().replace(/\.(\w+)$/i,'')] = route;
                    spread(route.children.slice(0));
                    route.children = [];
                }
            });
        };
        spread(pages);
        const tree = {};
        const files = [];
        Object.entries(map).forEach( ([key, route]=item)=>{
            files.push(route.file);
            const pid = path.dirname(key);
            if( map[pid] ){
                map[pid].children.push(route)
            }else{
                tree[key] = route;
            }
        });
        pages.splice(0, pages.length, ...Array.from( Object.values(tree) ) )
    })

    nuxt.hook("pages:resolved", async (pages)=>{
        const make = (pages)=>{
            if(Array.isArray(pages)){
                pages.forEach(page=>{
                    make(page.children);
                    if(page.file){
                        page.file = formation(page.file);
                    }
                })
            }
        }
        make(pages);
    });

    nuxt.hook("prerender:routes", async({ routes })=>{
        if(nuxt.options.dev || !nuxt._nitro.options.static || nuxt.options.router.options.hashMode){
            return;
        }
        const app = _app || nuxt.apps.default;
        const routeMaps = {};
        const normalizePath = (file)=>file.replace(/\\/g, '/');
        const spread = (list)=>{
            if( !Array.isArray(list) )return;
            list.forEach( route=>{
                routeMaps[normalizePath(route.file)] = route;
                spread(route.children);
            });
        };
        spread(app.pages);
        routes.clear();
        const process = async ()=>{
            const task = async (vitePlugin)=>{
                const pages = Array.from(routePages.values()).map( file=> (async (file)=>{
                    if(!compile.checkFileExt(file)){
                        const route = routeMaps[normalizePath(file)]
                        if(route){
                            routes.add( route.path );
                        }
                        return;
                    }
                    const result = await vitePlugin.getRoutes(file);
                    if( result && Array.isArray(result) ){
                        result.forEach( item=>{
                            let path = item.path;
                            let params = item.params||{};
                            if( path.includes(':') ){
                                const segments = path.split('/').map( seg=>{
                                    if( seg ){
                                        if( seg.charCodeAt(0) ===58 ){
                                            let key = seg.slice(1);
                                            let optional = false;
                                            if( seg.charCodeAt(seg.length-1) ===63 ){
                                                key = key.slice(0,-1);
                                                optional = true;
                                            }
                                            if( params[key] !== void 0 ){
                                                return params[key]
                                            }
                                            return optional ? null : 'null';
                                        }
                                    }   
                                    return seg;
                                });
                                while( segments.length > 0 && segments[segments.length-1]===null )segments.pop();
                                path = segments.join('/');
                            }
                            routes.add(path);
                        })
                    }
                })(file));

                await Promise.all(pages);
            }

            await Promise.all( esVitePlugins.map( plugin=>task(plugin) ) )
        }

        await process();

    });

    nuxt.hook("nitro:build:before", async(nitro)=>{
        nitro.hooks.hook('rollup:before', async(nitro, rollupConfig)=>{
            if(nitro.options.dev){
                bindWatch(nitro)
            }
            const id = "#internal/nitro/virtual/server-handlers";
            const index = rollupConfig.plugins.findIndex( plugin=>{
                if(plugin.name==='virtual' && typeof plugin.resolveId ==='function'){
                    return plugin.resolveId('#internal/nitro/virtual/server-handlers') === PREFIX+id
                }
            });
            if(index>=0){
                const results = await scanHandlers(nitro)
                rollupConfig.plugins.splice(index, 1, handlers(nitro, results))
            }
            checkRollupEsPlugin(nuxt, rollupConfig, clientPlugins);
        })
    });

    compile.on('onConfigChangeBefore',(event)=>{
        nuxt.callHook("restart");
    })
}

function checkRollupEsPlugin(nuxt, rollupConfig, clientPlugins){
    if(rollupConfig.plugins.some(plg=>plg.name.endsWith(':easescript'))){
        return;
    }
    const NODE_ENV = nuxt.options.dev ? 'development' : 'production';
    const options = merge({}, clientPlugins[0], {
        options:{
            hot:false,
            watch:false,
            sourceMaps:false,
            mode:nuxt.options.dev ? 'development' : 'production',
            uiFully:!!nuxt.options.dev,
            metadata:{
                env:{
                    NODE_ENV,
                    TARGET:'node',
                    PLATFORM:'server'
                }
            }
        }
    });
    rollupConfig.plugins.push(esVitePlugin({
        builder:options,
    }))
}