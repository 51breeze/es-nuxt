package web.ui;
import web.components.Component;
import {Meta} from 'nuxt-runtime-compoments'
@Define(slot, default)
declare class Meta extends Component implements web.ui.NuxtBaseGlobalProps{
    title?: string,
    body?: boolean,
    renderPriority?:string|number
    charset?: string,
    content?: string,
    httpEquiv?: string,
    name?:string,
}