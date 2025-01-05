package web.components{
    import web.components.Component
    declare class Viewport extends Component{
        name?:string;
        transition?:any;
        keepalive?:any;
        route?:any;
        pageKey?:string | ((route: any) => string);
    }
}