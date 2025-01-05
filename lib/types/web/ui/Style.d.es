package web.ui;
import web.components.Component;
import {Style} from 'nuxt-runtime-compoments'
@Define(slot, default)
declare class Style extends Component implements web.ui.NuxtBaseGlobalProps{
    type?:string,
    media?:string,
    nonce?:string,
    body?: boolean,
    renderPriority?:string|number
}