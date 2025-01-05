package web.ui;
import web.components.Component;
import {NuxtClientFallback as ClientFallback} from "#app/components/client-fallback.client.js";
@Define(slot, fallback)
declare class ClientFallback extends Component{
    uid?:string|number;
    fallbackTag?:string;
    fallback?:string;
    placeholder?:string;
    placeholderTag?:string;
    keepFallback?:boolean;
    addEventListener?(type:'ssr-error',listener: (event?:any)=>void):this
}
