package web.ui;
import web.components.Component;
import {Body} from 'nuxt-runtime-compoments'
@Define(slot, default)
declare class Body extends Component implements web.ui.NuxtBaseGlobalProps{
    renderPriority?:string|number
}