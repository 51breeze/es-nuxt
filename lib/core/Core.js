const Plugin = require('es-vue/index');
const Builder = require('es-vue/core/Builder');
const Polyfill = require('es-vue/core/Polyfill');
const VueTemplate = require('es-vue/core/vue/VueTemplate');
const VueJsxV3 = require('es-vue/core/vue/VueJsxV3');
const VueRawBuilder = require('es-vue/core/vue/VueRawBuilder');
const VueBuilder = require('es-vue/core/vue/VueBuilder');
const JSXClassBuilder = require('es-vue/core/JSXClassBuilder');
const JSXTransform = require('es-vue/core/JSXTransform');
const JSXTransformV3 = require('es-vue/core/JSXTransformV3');
const JSXTransformV3Optimize = require('es-vue/core/JSXTransformV3Optimize');
const {Constant,Token} = require('es-vue/core/Core');
const ClassBuilder = require('es-vue/core/ClassBuilder');
module.exports={
    Plugin,
    Builder,
    Polyfill,
    Constant,
    Token,
    ClassBuilder,
    JSXClassBuilder,
    JSXTransform,
    VueTemplate,
    VueBuilder,
    VueRawBuilder,
    VueJsxV3,
    JSXTransformV3,
    JSXTransformV3Optimize
}