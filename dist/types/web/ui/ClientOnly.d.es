package web.ui;
import web.components.Component;
import ClientOnly from "#app/components/client-only.js";
@Define(slot, fallback)
declare class ClientOnly extends Component{
    fallbackTag?: any;
    fallback?: any;
    placeholder?: any;
    placeholderTag?: any;
}