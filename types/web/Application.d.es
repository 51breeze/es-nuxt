package web{
    import web.components.Page;
    declare class Application extends Page{

        constructor( options?:object );

        /**
        * 获取一个路由器的实例
        * @return web.components.Router;
        */
        get router():web.components.Router

        /**
        * 获取路由配置
        * return RouteConfig[];
        */
        get routes():web.components.RouteConfig[];

        /**
        * 获取一个语言包实例，通常为 i18n 这种实例对象
        * return object;
        */
        get locale():object

        /**
        * 获取一个全局数据存储实例，通常为 Store 这种实例对象
        * return object;
        */
        get store():object

        /**
        * 获取需要混入全局的方法
        * return object;
        */
        mixin(name:string, method:Function):this;
        provide(name:string, value:any):this;
        plugin( plugin:any ):this;

        /**
        * 挂载并显示整个应用的页面
        */
        mount(el:string | Node):void
        unmount():void;
    }
}