package web.components;
import web.components.Component;
declare class Page extends Component{

    /**
    * 获取应用实例
    * 此访问器在子类中不可重写
    * @return object
    */
    final get app():{[key:string]:any}
    
    useAsyncData<T=any>(
        route: string | annotation.IRouter, 
        options?: nuxt.AsyncDataOptions & {
            params?:nuxt.Record<string, any>, 
            data?:nuxt.Record<string, any>,
            method?:string
        },
        key?:string
    ): Promise<nuxt.AsyncData<T>>;

    getUseAsyncData<T=any>(route:string | {url:string, params?:nuxt.Record<string, any>}):nuxt.AsyncData<T>

    getNuxtApp():nuxt.NuxtApp;
    getRuntimeConfig():{[key:string]:any}

    withAsyncContext(handler:()=>Promise<nuxt.AsyncData>):[Promise<nuxt.AsyncData>, ()=>void ]

}