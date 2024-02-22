///<references from='web.components.Component' name='Component' />
///<references from='System' />
///<references from='net.Http' />
///<namespaces name='web.components' />
///<createClass value='false' />
import {useAsyncData as _useAsyncData} from "#app"
import { useRouter } from '#app/composables/router'
import {toRef as _toRef} from 'vue';
function Page(props){
    Component.call(this, props);
}
Page.prototype=Object.create(Component.prototype);

Object.defineProperty(Page.prototype,'constructor',{value:Page})

Object.defineProperty(Page.prototype,'getNuxtApp',{value:function getNuxtApp(){
    const instance = this.getAttribute('instance');
    if(instance)return instance.appContext.app.$nuxt;
    throw new Error("[es-nuxt] getNuxtApp unavailable");
}})

Object.defineProperty(Page.prototype,'getRuntimeConfig',{value:function getRuntimeConfig(){
    const instance = this.getNuxtApp();
    return instance.$config;
}})

function getRequestKey(route, options={}){
    let oparams = options.param || options.params;
    let params = oparams ? Object.assign({}, oparams) : {};
    let url = route;
    if( typeof route ==='object' ){
        url = route.url;
        params = Object.assign(params, route.param || route.params);
        if( route.default && typeof route.default ==='object' ){
            Object.keys(route.default).forEach( key=>{
                if( !(key in params) ){
                    params[key] = route.default[key];
                }
            })
        }
        url = System.createHttpRoute(url, params, true);
    }

    let [uri, _query] = url.split('?');
    let query = Object.keys(params).sort().map(key=>key+'='+String(params[key]));
    if(_query){
        query.unshift( _query )
    }
    if(query.length>0){
        return uri+'?'+query.join('&')
    }
    return uri;
}

Object.defineProperty(Page.prototype,'useAsyncData',{value:function useAsyncData(route, options={}, key=null){
    key = key || getRequestKey(route, options);
    const immediate = options.immediate;
    const data = _useAsyncData(key, async ()=>{
        return await System.createHttpRequest(Http, route, options)
    }, options);
    const isServer = import.meta.server;
    if(!isServer && immediate !== false){
        if( this.toValue(data.status) === 'idle' ){
            const asyncDataPromise = Promise.resolve(data.execute({_initial:true})).then(() => data);
            Object.assign(asyncDataPromise, data);
            return asyncDataPromise;
        }
    }
    return data;
}})

Object.defineProperty(Page.prototype,'getUseAsyncData',{value:function getUseAsyncData(route, options={}){
    const nuxt = this.getNuxtApp();
    if( route ){
        const url = getRequestKey(route, options)
        if (!(url in nuxt.payload.data)) {
            nuxt.payload.data[url] = null;
        }
        if(options.unref){
            return nuxt.payload.data[url];
        }
        return _toRef(nuxt.payload.data, url);
    }
    return nuxt.payload.data;
}})

Object.defineProperty(Page.prototype,'getRoute',{value:function getRoute(){
    const router = this.toValue(useRouter());
    return router ? this.toValue(router.currentRoute) : null;
}});