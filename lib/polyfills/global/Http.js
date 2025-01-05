/*
 * EaseScript
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */

///<references from='Class' />
///<references from='EventDispatcher' />
///<export name='_Http' />
///<namespaces name='net' />
import { $fetch } from "ofetch";
const allowFields = {
    url:"url",
    baseUrl:'baseURL',
    params:'params',
    baseURL:"baseURL",
    data:"data",
    headers:"headers",
    header:"headers",
    method:"method",
    timeout:"timeout",
    dataType:"responseType",
    responseType:"responseType",
    sslVerify:"sslVerify",
    withCredentials:"credentials",
    credentials:"credentials",
    firstIpv4:"firstIpv4",
    enableHttp2:"enableHttp2",
    enableQuic:"enableQuic",
    enableCache:"enableCache",
    enableHttpDNS:"enableHttpDNS",
    httpDNSServiceId:"httpDNSServiceId",
    enableChunked:"enableChunked",
    forceCellularNetwork:"forceCellularNetwork",
    enableCookie:"enableCookie",
    cloudCache:"cloudCache",
    defer:"defer",
    cancelToken:'cancelToken',
    ignoreResponseError:'ignoreResponseError',
    signal:'signal',
    cache:'cache',
    mode:'mode',
}

const defaultConfig = {
    dataType:'json',
    responseType:'json',
    timeout: 60000,
    headers:{},
};

const hasOwn = Object.prototype.hasOwnProperty;
function makeConfig(config={}){
    const options = Object.create(null);
    Object.keys(config).map( key=>{
        if( hasOwn.call(allowFields,key) ){
            if(allowFields[key]){
                options[allowFields[key]] = config[key];
            }
        }else{
            const props = Object.keys(allowFields).join(',\r\n')
            throw new TypeError(`Http options field '${key}' is invalid. \r\n Available fields:\r\n${props}`);
        }
    });

    let {params, url='/', data, method="GET"} = options;
    options.method = method.toUpperCase();
    delete options.url;
    delete options.data;
    if( options.method==='GET' && data && typeof data ==="object" ){
        if(params && typeof params !=="object")params = {};
        params = Object.assign(params||{}, data)
        data = void 0;
    }
    options.body = data;
    options.params = params
    return {url, options};
}

function httpRequest(config){
    return new Promise((resolve, reject)=>{
        throwIfCancellationRequested(config);
        const {url, options} = makeConfig(config)
        const result = Object.create(null);
        const token = options.cancelToken instanceof CancelToken ? options.cancelToken : null;
        result.config = config;
        result.headers = null;
        result.status = null;
        result.cookies = null;
        result.error = null;
        result.data = null;
        let onCanceled = null;
        if(token){
            let requestTask = new AbortController().signal;
            onCanceled=(cancel)=>{
                requestTask.abort();
                requestTask = null;
                reject( cancel || new Cancel('canceled') );
            };
            token.subscribe( onCanceled );
        }
        options.onRequest=(context)=>{
            result.error = context.error;
            result.config.headers = context.options.headers;
        }
        options.onResponse=(context)=>{
            result.error = context.error;
            result.headers = Object.create(null);
            result.status = context.response.status;
            result.cookies = Object.create(null);
            context.response.headers.forEach( (value,key)=>{
                result.headers[key=key.trim()] = value = value.trim();
                if( key.toLowerCase()==='set-cookie' ){
                    value.split(';').forEach( (item)=>{
                        const [k, v] = item.trim().split('=');
                        result.cookies[k] = v;
                    })
                }
            });
        }

        $fetch(url, options).then((data)=>{
            throwIfCancellationRequested(options);
            result.data = data;
            resolve(result);
        }).catch( (error)=>{
            result.data = null;
            result.error = error;
            result.status = 500;
            resolve(result);
        }).finally(()=>{
            if (token) {
                token.unsubscribe(onCanceled);
            }
        });
    });
}

function throwIfCancellationRequested(config) {
    if (config && config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }
}

class Cancel{
    constructor(message){
        this.message = message;
    }
    toString() {
        return 'Cancel' + (this.message ? ': ' + this.message : '');
    }
}

class CancelToken{
    constructor(executor){
        if (typeof executor !== 'function') {
            throw new TypeError('executor must be a function.');
        }

        this.reason = null;
        let resolvePromise=null;
        this.promise = new Promise((resolve)=>{
            resolvePromise = resolve;
        });
    
        this.promise.then(cancel=>{
            if (!this._listeners)return;
            let i=0;
            let l = this._listeners.length;
            for (i; i < l; i++) {
                const listener = this._listeners[i];
                listener(cancel);
            }
            this._listeners = null;
        });

        const _this = this;
        this.promise.then=function(onfulfilled){
            var _resolve;
            var promise = new Promise((resolve)=>{
                _this.subscribe(resolve);
                _resolve = resolve;
            }).then(onfulfilled);
            promise.cancel=()=>{
                _this.unsubscribe(_resolve);
            };
            return promise;
        };

        executor((message)=>{
            if(this.reason)return;
            if(resolvePromise){
                this.reason = new Cancel(message);
                resolvePromise(this.reason);
            }
        });
    }

    throwIfRequested() {
        if (this.reason) {
            throw this.reason;
        }
    }

    subscribe(listener) {
        if (this.reason) {
            listener(this.reason);
            return;
        }
        
        if (this._listeners) {
            this._listeners.push(listener);
        } else {
            this._listeners = [listener];
        }
    }

    unsubscribe(listener) {
        if (!this._listeners) {
            return;
        }
        let index = this._listeners.indexOf(listener);
        if (index !== -1) {
            this._listeners.splice(index, 1);
        }
    }

    static source() {
        let cancel;
        let token = new CancelToken((c)=>{
            cancel = c;
        });
        return {
            token: token,
            cancel: cancel
        };
    };
}

class HttpInterceptorManager{
    constructor(){
        this.handlers = [];
    }
    use(fulfilled, rejected, options) {
        const old = this.handlers.find( hand=>{
            return hand.fulfilled === fulfilled || hand.rejected === rejected;
        });
        if( old ){
            if(old.fulfilled === fulfilled){
                if( !rejected )return this.handlers.length-1;
                fulfilled = null;
            }
            if(old.rejected === rejected){
                if( !fulfilled )return this.handlers.length-1;
                rejected = null;
            }
        }
        if( fulfilled || rejected ){
            this.handlers.push({
                fulfilled: fulfilled,
                rejected: rejected,
                synchronous: options ? options.synchronous : false,
                runWhen: options ? options.runWhen : null
            });
        }
        return this.handlers.length - 1;
    }
    eject(id) {
        if (this.handlers[id]) {
            this.handlers[id] = null;
        }
    }
    forEach(fn) {
        this.handlers.forEach((h)=>{
            if (h !== null) {
                fn(h);
            }
        });
    };
}

class _Http{

    static create(config){
        return new _Http(config);
    }
    static isCancel(value){
        return value && value instanceof Cancel;
    }
    static all(values){
        return Promise.all(values);
    }
    static spread(callback){
        return function wrap(args) {
            return callback.apply(null, args);
        };
    }

    constructor(config={}){
        this.config = Object.assign( Object.create(null), defaultConfig, config );
        this.interceptors={
            request:new HttpInterceptorManager(),
            response:new HttpInterceptorManager(),
        }
    }

    request(config={}){
        config = Object.assign( Object.create(null), this.config, config );
        const requestInterceptorChain = [];
        let synchronous = true;
        this.interceptors.request.forEach((interceptor)=>{
            if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
                return;
            }
            synchronous = synchronous && interceptor.synchronous;
            requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
        });

        const responseInterceptorChain = [];
        this.interceptors.response.forEach((interceptor)=>{
            responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
        });

        let promise = null;
        if(!synchronous) {
            let chain = [httpRequest, undefined];
            chain.unshift(...requestInterceptorChain);
            chain.push(...responseInterceptorChain);
            promise = Promise.resolve(config);
            while (chain.length) {
                promise = promise.then(chain.shift(), chain.shift());
            }
            return promise;
        }

        let newConfig = config;
        while(requestInterceptorChain.length){
            const onFulfilled = requestInterceptorChain.shift();
            const onRejected = requestInterceptorChain.shift();
            try {
                newConfig = onFulfilled(newConfig);
            } catch (error) {
                onRejected(error);
                break;
            }
        }

        try {
            promise = httpRequest(newConfig);
        } catch (error) {
            return Promise.reject(error);
        }
        while (responseInterceptorChain.length) {
            promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
        }
        return promise;
    }

    get(url, config={}){
        return this.request({...config, url, method:'GET'})
    }

    delete(url, config={}){
        return this.request({...config, url, method:'DELETE'})
    }

    head(url, config={}){
        return this.request({...config, url, method:'HEAD'})
    }

    post(url, data, config={}){
        return this.request({...config, url, data, method:'POST'})
    }

    put(url, data, config={}){
        return this.request({...config, url, data, method:'PUT'})
    }

    patch(url, data, config={}){
        return this.request({...config, url, data, method:'OPTIONS'})
    }
}

_Http.HttpInterceptorManager = HttpInterceptorManager;
_Http.CancelToken = CancelToken;
_Http.Cancel = Cancel;