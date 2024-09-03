package web.components;
import web.components.Component;
declare class Page extends Component{
    
    useAsyncData<T=Record>(
        route: string | annotation.IRouter, 
        options?: nuxt.AsyncDataOptions & {
            params?:Record, 
            data?:Record,
            method?:string
        },
        key?:string
    ): Promise<nuxt.AsyncData<T>>;

    useHead(options:nuxt.MetaObject): void;

    getUseAsyncData<T=Record>(route:string | annotation.IRouter):nuxt.AsyncData<T>

    getNuxtApp():nuxt.NuxtApp;

    config():Record

}