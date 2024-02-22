const path = require('path');
const Compiler = require("easescript/lib/core/Compiler");

Compiler.buildTypesManifest(
    [path.resolve('./types/index.d.es')], 
    {
        name:'es-nuxt', 
        inherits:['es-vue','es-javascript']
    },
    path.join(__dirname,'../types'),
    {compilerOptions:{
        debug:true,
        configFileName:null,
        cwd:path.join(__dirname, '../')
    }}
);