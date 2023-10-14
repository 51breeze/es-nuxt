package web.ui;
import web.components.Component;
import {NuxtLoadingIndicator as LoadingIndicator} from "#app/components/nuxt-loading-indicator.js";
declare class LoadingIndicator extends Component{
    throttle?:number;
    duration?:number;
    height?:number;
    color?:string|boolean;
}

