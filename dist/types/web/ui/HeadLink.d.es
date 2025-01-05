package web.ui;
import web.components.Component;
import {Link as HeadLink} from 'nuxt-runtime-compoments'
declare class HeadLink extends Component implements web.ui.NuxtBaseGlobalProps{
    body?: boolean
    renderPriority?:string|number
    as?:string
    crossorigin?: string
    disabled?: boolean
    fetchpriority?: string
    href?: string
    hreflang?: string
    imagesizes?: string
    imagesrcset?: string
    integrity?: string
    media?: string
    prefetch?:boolean
    referrerpolicy?: string
    rel?: string
    sizes?: string
    type?: string
}