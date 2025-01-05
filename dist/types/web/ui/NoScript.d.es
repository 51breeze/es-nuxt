package web.ui;
import web.components.Component;
import {NoScript} from 'nuxt-runtime-compoments'
@Define(slot, default)
declare class NoScript extends Component implements web.ui.NuxtBaseGlobalProps{
    title?: string,
    body?: boolean,
    renderPriority?:string|number
}