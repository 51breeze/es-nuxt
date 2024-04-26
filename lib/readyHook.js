import path from 'path';
import fs from 'fs';
import esVitePlugin  from "es-vite-plugin";
import merge from "lodash/merge";
import {resolveFiles, normalizePlugin} from '@nuxt/kit';

const vitePlugins = [];
function createCkeditorOptimizeDeps(rootDir=process.cwd()){
    const optimizeDeps = [];
    const root = path.join(rootDir, 'node_modules/@ckeditor/vite-plugin-ckeditor5');
    if( fs.existsSync(root) ){
        const ckeditor5Plugin = require('@ckeditor/vite-plugin-ckeditor5');
        const commonjsPlugin = require('@rollup/plugin-commonjs');
        vitePlugins.push(ckeditor5Plugin({
            theme: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
        }));
        vitePlugins.push( commonjsPlugin({
            include:/color-convert[\\\\\/](\w+)\.js/
        }));
        const dirs = fs.readdirSync( path.dirname(root) );
        const excludes = ['ckeditor5-theme-lark','vite-plugin-ckeditor5','ckeditor5-vue'];
        const deps = dirs.filter( dir=>!excludes.includes(dir) ).map( dir=>'@ckeditor/'+dir );
        optimizeDeps.push( ...deps );
    }
    return optimizeDeps;
}


export default function(esConfig={}){
    const cwd = esConfig.cwd || process.cwd();
    const workspace = esConfig.workspace && path.isAbsolute(esConfig.workspace) ? esConfig.workspace : path.join(cwd, esConfig.workspace||'src');
    const plugins = esConfig.plugins || [];
    const clientPlugins = plugins.filter( plugin=>{
        const name = (plugin.name || plugin.plugin).toString();
        return name.toLowerCase()==='es-nuxt';
    });

    const serverPlugins = plugins.filter( plugin=>{
        return !clientPlugins.includes(plugin);
    });

    if( clientPlugins.length>1 ){
        console.error(`Plugin the "es-nuxt" can only be instantiated once, but it is configured more than once.`)
    }else if( !clientPlugins.length ){
        throw new Error('Missing the "es-nuxt" plugin.')
    }

    return (nuxt)=>{

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
            nuxtApp.mainComponent = path.resolve(workspace, './App.es')
        });

        nuxt.hook("app:templatesGenerated", (nuxtApp)=>{
            const template = nuxtApp.templates.find( temp=>temp.filename==="routes.mjs")
            const fullPath = template.dst || resolve(nuxt.options.buildDir, template.filename);
            const resolveComponent = [
                `const __$resolveComponent = (m)=>{`,
                `   return typeof m === 'function' && m.__vccOpts ? m.__vccOpts : m;`,
                `};`
            ].join('\r\n');
            let code = nuxt.vfs[fullPath];
            code = resolveComponent +'\r\n'+ code.replace(/import[\s+]?\([\s+]?([\"\'])([^\1]*?)\1[\s+]?\)\.then[\s+]?\(.*?\)/g, (all, a, file)=>{
                return `import("${file}").then(m=>__$resolveComponent(m.default || m))`
            });
            nuxt.vfs[fullPath] = code;
        });

        function extendTransform(transform){
            return function(code,id,opts){
                if( /\.es(\?|$)/i.test(id) ){
                    return;
                }
                return transform.call(this,code,id,opts);
            }
        }

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
                            env:{
                                NODE_ENV:config.mode,
                                platform:ctx.isServer ? 'server' : 'client',
                                PLATFORM:ctx.isServer ? 'server' : 'client',
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
                    plugin.transform=extendTransform(plugin.transform);
                }
            });
        });

        nuxt.hook("app:resolve", async(app)=>{
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
                const id = await plg.resolveId(plugin.src);
                if(!id)return;
                let source = await plg.load(plugin.src, {});
                if(source && typeof source ==='object' ){
                    source = source.code;
                }
                if(!source || typeof source !=='string'){
                    source = fs.readFileSync(plugin.src);
                }
                const result = await plg.transform(source, plugin.src, {});
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
            const map = {};
            const spread = (list)=>{
                if( !Array.isArray(list) )return;
                list.forEach( route=>{
                    routePages.add(route.file)
                    map[route.file.toLowerCase().replace(/\.(\w+)$/i,'')] = route;
                    spread(route.children.slice(0));
                    route.children = [];
                });
            };
            spread(pages);
            const tree = {};
            Object.entries(map).forEach( ([key, route]=item)=>{
                const pid = path.dirname(key);
                if( map[pid] ){
                    map[pid].children.push(route)
                }else{
                    tree[key] = route;
                }
            });
            pages.splice(0, pages.length, ...Array.from( Object.values(tree) ) )
        })

        nuxt.hook("prerender:routes", async({ routes })=>{
            if(nuxt.options.dev || !nuxt._nitro.options.static || nuxt.options.router.options.hashMode){
                return;
            }
            routes.clear();
            const process = async ()=>{
                const task = async (vitePlugin)=>{
                    const pages = Array.from(routePages.values()).map( file=> (async (file)=>{
                        const result = await vitePlugin.getDoucmentRoutes(file);
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
    }
}