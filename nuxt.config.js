

import path from "path";
import esConfig from './es.config.js';
import ready from './lib/ready.js';

const optimizeDeps = [
    //'element-plus/es/components/icon/index',
    //'element-plus'
];

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    rootDir:__dirname,
    srcDir:"test/src/",
    extensions:['.es'],


    // pages:true,
    // dir:{
    //     pages:'pages',
    //     assets:'assets'
    // },

    modules:['@element-plus/nuxt'],

    //rootDir:__dirname,

    // alias:{
    //     "element-plus":path.join(__dirname, 'node_modules', 'element-plus'),
    // },
    css:[
       // 'element-plus/theme-chalk/index.css'
    ],

    hooks: {
        ready
    },
    // nitro:{
    //     output:{
    //         dir: path.join(__dirname, 'build')
    //     },
    //     devProxy:{
    //         "/api":{
    //             target:"http://127.0.0.1:8000",
    //             pathRewrite:{
    //                 "^/api":""
    //             }
    //         }
    //     }
    // },
    vite:{
        optimizeDeps:{
            include: [...optimizeDeps],
        },
        // server:{
        //     fs:{
        //         allow:['../../'],
        //     }
        // },
        // vue:{
        //     //exclude:[/\.es/]
        // },
        // plugins:[],
        // build:{
        //     minify:false,
        // }
    }

})
