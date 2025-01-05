package web.ui;
import web.components.Component;
import {Html} from 'nuxt-runtime-compoments'
@Define(slot, default)
declare class Html extends Component implements web.ui.NuxtBaseGlobalProps{
    renderPriority?:string|number
    manifest?: string
    version?: string
    xmlns?:string
}