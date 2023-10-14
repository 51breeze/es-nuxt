import path from 'path';
import fs from 'fs';
import esVitePlugin  from "es-vite-plugin";
import {merge} from "lodash";
import {resolveFiles, normalizePlugin} from '@nuxt/kit';
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
        })

        nuxt.hook("vite:extendConfig", (config,ctx)=>{
            const isDev = config.mode==="development";
            const options ={
                hot:isDev,
                watch:isDev,
                builder: merge({
                    options:{
                        ssr:!!ctx.isServer,
                        hot:isDev,
                        watch:isDev,
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
        });

        nuxt.hook("app:resolve", async(app)=>{
            const exists = {};
            app.plugins.forEach(plugin=>{
                exists[plugin.src] = true;
            });
            const NODE_ENV = nuxt.options.dev ? 'development' : 'production';
            const cache = {};
            const transformPlugin= (mode)=>{
                if(cache[mode])return cache[mode];
                const options = merge({}, clientPlugins[0], {
                    options:{
                        hot:false,
                        watch:false,
                        sourceMaps:false,
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

            for (const config of nuxt.options._layers.map((layer) => layer.config)) {
                const files = await resolveFiles(config.srcDir, `${config.dir?.plugins || "plugins"}/*{${nuxt.options.extensions.join(",")}}`);
                files.forEach( async (plugin)=>{
                    plugin = normalizePlugin(plugin);
                    if(!exists[plugin.src]){
                        app.plugins.push(plugin);
                        const result = await transformPlugin(plugin.mode).transform( fs.readFileSync(plugin.src), plugin.src, {});
                        nuxt.vfs[plugin.src] = result.code;
                    }
                })
            }
        })

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