package web.ui{
    import web.components.Component
    import web.components.Page
    declare class Link extends Component{
        exact?:boolean;
        activeClass?:string;
        exactActiveClass?:string;
        ariaCurrentValue?:'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
        append?:boolean;
        replace?:boolean;
        tag?:string;
        @Hook('compiling:create-route-path')
        to?:string | Page | annotation.IRouter;
        event?:string[];
        //nuxt props
        href?: any;
        external?: boolean;
        custom?: boolean;
        target?: '_blank' | '_parent' | '_self' | '_top';
        rel?: string | null;
        noRel?: boolean;
        prefetch?: boolean;
        noPrefetch?: boolean;
    }
}