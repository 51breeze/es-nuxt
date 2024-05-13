package web.components;
import web.components.Component;
declare class Page extends Component{
    
    useAsyncData<T=any>(
        route: string | annotation.IRouter, 
        options?: nuxt.AsyncDataOptions & {
            params?:nuxt.Record<string, any>, 
            data?:nuxt.Record<string, any>,
            method?:string
        },
        key?:string
    ): Promise<nuxt.AsyncData<T>>;

    useHead(options:nuxt.MetaObject): void;

    getUseAsyncData<T=any>(route:string | annotation.IRouter):nuxt.AsyncData<T>

    getNuxtApp():nuxt.NuxtApp;

    config():{[key:string]:any}

}