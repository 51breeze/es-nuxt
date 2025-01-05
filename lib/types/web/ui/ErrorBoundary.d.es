package web.ui;
import web.components.Component;
import {NuxtErrorBoundary as ErrorBoundary} from "#app/components/nuxt-error-boundary.js";
@Define(slot, error)
declare class ErrorBoundary extends Component{
   addEventListener?(type:'error',listener: (event?:any)=>void):this
}