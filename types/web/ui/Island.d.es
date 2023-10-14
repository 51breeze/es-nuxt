package web.ui;
import web.components.Component;
import {NuxtIsLand as Island} from "#app/components/nuxt-island.js";
@Define(slot, fallback)
declare class Island extends Component{
    name: string;
    lazy?:boolean;
    props?:{[key:string]:any};
    context?:{[key:string]:any};
    source?:string;
}
