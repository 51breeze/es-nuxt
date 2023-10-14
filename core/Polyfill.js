const path = require("path");
const Polyfill = require('es-javascript/core/Polyfill')
const v2Modules = new Map();
//Polyfill.createEveryModule(v2Modules, path.join(__dirname,"../","polyfill/v2"));

const v3Modules = new Map();
Polyfill.createEveryModule(v3Modules, path.join(__dirname,"../","polyfill/v3") );

const globals = new Map();
Polyfill.createEveryModule(globals, path.join(__dirname,"../","polyfill/global") );

module.exports={
    path:path.join(__dirname,"../","polyfill"),
    globals,
    v3Modules,
    v2Modules,
}