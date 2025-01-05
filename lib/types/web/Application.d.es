package web{
    import web.components.Page;
    import '#es-vue-web-application-style';
    
    declare class Application extends Page{

        getNuxtApp():nuxt.NuxtApp;
        getVueApp():vue.App;

        @Removed
        mount(el:string | Node):void

        @Removed
        unmount():void;
    }
}