import path from "path";
import esConfig from './es.config';
import readyHook from '../lib/readyHook';

const optimizeDeps = [
    'vue','element-plus'
];

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    rootDir:__dirname,
    srcDir:"src/",
    extensions:['.es'],
    pages:true,
    dir:{
        pages:'pages',
        assets:'assets'
    },
    rootDir:__dirname,
    alias:{
        "element-plus":path.join(__dirname, 'node_modules', 'element-plus'),
    },
    css:[
        'element-plus/theme-chalk/base.css'
    ],
    hooks: {
       
        ready:(next)=>{
            readyHook(esConfig)(next)
        },

    },
    nitro:{
        output:{
            dir: path.join(__dirname, 'build')
        },
        devProxy:{
            "/api":{
                target:"http://127.0.0.1:8000",
                pathRewrite:{
                    "^/api":""
                }
            }
        }
    },
    vite:{
        optimizeDeps:{
            include: [...optimizeDeps],
        },
        server:{
            fs:{
                allow:['../../'],
            }
        },
        vue:{
            //exclude:[/\.es/]
        },
        plugins:[],
        build:{
            minify:false,
        }
    }

})
