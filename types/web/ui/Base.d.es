package web.ui;
import web.components.Component;
import {Base} from 'nuxt-runtime-compoments'
@Define(slot, default)
declare class Base extends Component implements NuxtBaseGlobalProps{
    href?: string
    target?: string
}

declare interface NuxtBaseGlobalProps{
    accesskey?: string
    autocapitalize?: string
    autofocus?:boolean
    class?: string | {[key:string]:any} | any[]
    contenteditable?:boolean
    contextmenu?: string
    dir?: string
    draggable?: boolean
    enterkeyhint?: string
    exportparts?: string
    hidden?: boolean
    id?: string
    inputmode?: string
    is?: string
    itemid?: string
    itemprop?: string
    itemref?: string
    itemscope?: string
    itemtype?: string
    lang?: string
    nonce?: string
    part?: string
    slot?: string
    spellcheck?:boolean
    style?: string
    tabindex?: string
    title?: string
    translate?: string
}
