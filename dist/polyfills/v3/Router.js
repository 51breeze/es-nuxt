/*
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */
///<import from='vue-router' name='_Router' namespaced />
///<namespaces name='web.components' />
if( !_Router.createRouter ){
    throw new TypeError(`'vue-router' requires a version 4.0 or later`);
}
function Router( options ){
    if( !this )return new Router(options);
    options = options || {};
    if( options.mode ==='hash' ){
        options.history = _Router.createWebHashHistory();
    }else if( options.mode ==='memory' ){
        options.history = _Router.createMemoryHistory();
    }else{
        options.history = _Router.createWebHistory();
    }
    this.instance = _Router.createRouter(options);
}
var members=[
    'currentRoute',
    'addRoute',
    'removeRoute',
    'hasRoute',
    'getRoutes',
    'resolve',
    'options',
    'push',
    'replace',
    'go',
    'back',
    'forward',
    'beforeEach',
    'beforeResolve',
    'afterEach',
    'onError',
    'install'
];
for(var i=0;i<members.length;i++){
    var _key = members[i];
    if( _key ==='currentRoute'){
        Object.defineProperty(Router.prototype, _key, {
            get:function currentRoute(){
                const currentRoute = this.instance.currentRoute;
                if( currentRoute && currentRoute.__v_isRef){
                    return currentRoute.value;
                }
                return currentRoute;
            }
        });
    }else{
        Object.defineProperty(Router.prototype, _key, {
            value:(function(name){
                var invoke = function(){return this.instance[ name ].apply(this.instance, Array.from(arguments) );}
                Object.defineProperty(invoke, 'name', {
                    value:name
                });
                return invoke;
            }(_key))
        });
    }
}
Router.prototype.constructor = Router;