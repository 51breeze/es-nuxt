
package nuxt{

    declare type NuxtMeta = {
        htmlAttrs?: string,
        headAttrs?: string,
        bodyAttrs?: string,
        headTags?: string,
        bodyScriptsPrepend?: string,
        bodyScripts?: string
    };

    declare interface ResourceMeta {
        src?: string;
        file: string;
        css?: string[];
        assets?: string[];
        isEntry?: boolean;
        isDynamicEntry?: boolean;
        sideEffects?: boolean;
        imports?: string[];
        dynamicImports?: string[];
        module?: boolean;
        resourceType?: 'audio' | 'document' | 'embed' | 'fetch' | 'font' | 'image' | 'object' | 'script' | 'style' | 'track' | 'worker' | 'video';
        mimeType?: string;
    }

    declare type Record<K, T> = {
        [key:string]: T
    };

    declare interface ModuleDependencies {
        scripts: Record<string, ResourceMeta>;
        styles: Record<string, ResourceMeta>;
        preload: Record<string, ResourceMeta>;
        prefetch: Record<string, ResourceMeta>;
    }

    declare interface SSRContext {
        renderResourceHints?: Function;
        renderScripts?: Function;
        renderStyles?: Function;
        modules?: Set<string>;
        _registeredComponents?: Set<string>;
        _requestDependencies?: ModuleDependencies;
        [key: string]: any;
    }

    declare type RuntimeConfigNamespace = Record<string, any>;
    declare interface PublicRuntimeConfig extends RuntimeConfigNamespace {}

    declare interface NitroRuntimeConfigApp {
        baseURL: string;
        [key: string]: any;
    }

    declare interface NitroRouteConfig {
        cache?: any;
        headers?: Record<string, string>;
        redirect?: string | {
            to: string,
            statusCode?: any
        };
        prerender?: boolean;
        proxy?:any;
        isr?: number | boolean;
        cors?: boolean;
        swr?: boolean | number;
    }


    declare interface NitroRuntimeConfig {
        app: NitroRuntimeConfigApp;
        nitro: {
            envPrefix?: string,
            routeRules?: {
                [path: string]: NitroRouteConfig
            }
        };
        [key: string]: any;
    }


    declare interface RuntimeConfig extends RuntimeConfigNamespace {
        app: NitroRuntimeConfigApp;
        nitro?: {
            envPrefix?: string,
            routeRules?: {
                [path: string]: NitroRouteConfig
            }
        };
        _public: PublicRuntimeConfig;
    }

    declare interface NuxtSSRContext extends SSRContext {
        url: string;
        event: any;
        runtimeConfig: RuntimeConfig;
        noSSR: boolean;
        /** whether we are rendering an SSR error */
        error?: boolean;
        nuxt: NuxtApp;
        payload: NuxtPayload;
        /** This is used solely to render runtime config with SPA renderer. */
        config?: Record<string, any>;
        teleports?: Record<string, string>;
        renderMeta?: () => Promise<NuxtMeta> | NuxtMeta;
        islandContext?: any;
        /** @internal */
        _renderResponse?: any;
        /** @internal */
        _payloadReducers: Record<string, (data: any) => any>;
    }

    declare type HookResult = Promise<void> | void;
    declare type AppRenderedContext = {
        ssrContext: NuxtSSRContext,
        renderResult: any
    };
    declare interface RuntimeNuxtHooks {
        [key:string]:Function
    }


    declare interface NuxtPayload {
        path?: string;
        serverRendered?: boolean;
        prerenderedAt?: number;
        data: Record<string, any>;
        state: Record<string, any>;
        config?:{[key:string]:any};
        error?: Error | {
            url: string,
            statusCode: number,
            statusMessage: string,
            message: string,
            description: string,
            data?: any
        } | null;
        _errors: Record<string,any>;
        [key: string]: any;
    }

    declare type InferCallback = (...args)=>any;

    declare class Hookable{
        constructor();
        hook(name: string, function_: InferCallback, options?: {
            allowDeprecated?: boolean
        }): () => void;
        hookOnce(name: string, function_: InferCallback): () => void;
        removeHook(name: string, function_: InferCallback): void;
        deprecateHook(name: string, deprecated:any): void;
        deprecateHooks(deprecatedHooks:any): void;
        addHooks(configHooks:any): () => void;
        removeHooks(configHooks:any): void;
        removeAllHooks(): void;
        callHook(name: string, ...args): Promise<any>;
        callHookParallel(name: string, ...args): Promise<any[]>;
        callHookWith(caller: InferCallback, name: string, ...args): any;
        beforeEach(function_:InferCallback): () => void;
        afterEach(function_:InferCallback): () => void;
    }


    declare interface NuxtApp {
        vueApp: {[key:string]:any};
        globalName: string;
        versions: Record<string, string>;
        hooks: Hookable[];
        hook(name: string, function_: InferCallback, options?: {
            allowDeprecated?: boolean
        }): () => void;
        callHook(name: string, ...args): Promise<any>;
        runWithContext<T=any>(fn: T):any | Promise<any>;
        [key: string]: any;
        /** @internal */
        _asyncDataPromises: Record<string, Promise<any>>;
        /** @internal */
        _asyncData: Record<string, {
            data:any,
            pending:boolean,
            error: any,
            status: any
        }>;
        /** @internal */
        _middleware: {
            global: any[],
            named: Record<string, any>
        };
        /** @internal */
        _observer?: {
            observe: (element: any, callback: () => void) => () => void
        };
        /** @internal */
        _payloadCache?: Record<string, Promise<Record<string, any>> | Record<string, any>>;
        /** @internal */
        _appConfig: {[key:string]:any};
        /** @internal */
        _route: any;
        /** @internal */
        _islandPromises?: Record<string, Promise<any>>;
        /** @internal */
        _payloadRevivers: Record<string, (data: any) => any>;
        $config: RuntimeConfig;
        isHydrating?: boolean;
        deferHydration: () => () => void | Promise<void>;
        ssrContext?: NuxtSSRContext;
        payload: NuxtPayload;
        provide: (name: string, value: any) => void;
    }

    declare const NuxtPluginIndicator = "__nuxt_plugin";

    declare interface PluginMeta {
        name?: string;
        enforce?: 'pre' | 'default' | 'post';
        /**
        * This allows more granular control over plugin order and should only be used by advanced users.
        * It overrides the value of `enforce` and is used to sort plugins.
        */
        order?: number;
    }
    declare interface ResolvedPluginMeta {
        name?: string;
        parallel?: boolean;
    }
    declare interface Plugin{
        @Callable
        constructor(nuxt:NuxtApp): Promise<any>;
        meta?: ResolvedPluginMeta;
        [key:string]:any;
    }

    declare function NextPlugin(nuxt:NuxtApp): void | Promise<void> | Promise<{
        provide?: {[key:string]}
    }> | {
        provide?: {[key:string]}
    };

    declare interface ObjectPlugin extends PluginMeta {
        hooks?: any;
        setup?: any;
        /**
        * Execute plugin in parallel with other parallel plugins.
        *
        * @default false
        */
        parallel?: boolean;
    }
   
    declare interface CreateOptions {
        vueApp: NuxtApp['vueApp'];
        ssrContext?: NuxtApp['ssrContext'];
        globalName?: NuxtApp['globalName'];
    }

    declare interface AsyncDataOptions{
        server?: boolean;
        lazy?: boolean;
        default?: () => any;
        transform?:any;
        pick?: any;
        watch?: any;
        immediate?: boolean;
    }
    declare interface AsyncDataExecuteOptions {
        _initial?: boolean;
        /**
        * Force a refresh, even if there is already a pending request. Previous requests will
        * not be cancelled, but their result will not affect the data/pending state - and any
        * previously awaited promises will not resolve until this new request resolves.
        */
        dedupe?: boolean;
    }
    declare interface AsyncData<T=any>{
        data: vue.Ref<T>;
        pending: vue.Ref<boolean>;
        refresh: (opts?: AsyncDataExecuteOptions) => Promise<void>;
        execute: (opts?: AsyncDataExecuteOptions) => Promise<void>;
        error: vue.Ref<any>;
        status:vue.Ref<any>;
    }

    declare interface CookieOptions{
        decode?(value: string):{[key:string]:any};
        encode?(value:object):string;
        default?():any;
        watch?: boolean | 'shallow';
    }

    declare interface NuxtError extends Error {}


    declare type OpenOptions = {
        target: '_blank' | '_parent' | '_self' | '_top',
        windowFeatures?: any
    };

    declare interface NavigateToOptions {
        replace?: boolean;
        redirectCode?: number;
        external?: boolean;
        open?: OpenOptions;
    }

    declare interface ReloadNuxtAppOptions {
        /**
        * Number of milliseconds in which to ignore future reload requests
        *
        * @default {10000}
        */
        ttl?: number;
        /**
        * Force a reload even if one has occurred within the previously specified TTL.
        *
        * @default {false}
        */
        force?: boolean;
        /**
        * Whether to dump the current Nuxt state to sessionStorage (as `nuxt:reload:state`).
        *
        * @default {false}
        */
        persistState?: boolean;
        /**
        * The path to reload. If this is different from the current window location it will
        * trigger a navigation and add an entry in the browser history.
        *
        * @default {window.location.pathname}
        */
        path?: string;
    }

    declare interface MergeHead {
        base?: {};
        link?: {};
        meta?: {};
        style?: {};
        script?: {};
        noscript?: {};
        htmlAttrs?: {};
        bodyAttrs?: {};
    }

    declare interface MetaObject {
        title?: string
        titleTemplate?: string | ((title?: string) => string)
        base?: Record<string, any>
        link?: Record<string, any>[]
        meta?: Record<string, any>[]
        style?: Record<string, any>[]
        script?: Record<string, any>[]
        noscript?: Record<string, any>[]
        htmlAttrs?: Record<string, any>
        bodyAttrs?: Record<string, any>
    }

    declare interface PageMeta {
        [key: string]: any;
        /**
        * Validate whether a given route can validly be rendered with this page.
        *
        * Return true if it is valid, or false if not. If another match can't be found,
        * this will mean a 404. You can also directly return an object with
        * statusCode/statusMessage to respond immediately with an error (other matches
        * will not be checked).
        */
        validate?: (route: any) => boolean | Promise<boolean> | NuxtError | Promise<NuxtError>;
        /**
        * Where to redirect if the route is directly matched. The redirection happens
        * before any navigation guard and triggers a new navigation with the new
        * target location.
        */
        redirect?: any;
        /**
        * Aliases for the record. Allows defining extra paths that will behave like a
        * copy of the record. Allows having paths shorthands like `/users/:id` and
        * `/u/:id`. All `alias` and `path` values must share the same params.
        */
        alias?: string | string[];
        pageTransition?: any;
        layoutTransition?: any;
        key?: false | string | ((route: any) => string);
        keepalive?: boolean | any;
        /** You may define a name for this page's route. */
        name?: string;
        /** You may define a path matcher, if you have a more complex pattern than can be expressed with the file name. */
        path?: string;
        /** Set to `false` to avoid scrolling to top on page navigations */
        scrollToTop?: boolean;
    }

    declare function RouteMiddleware(to: web.components.Route, from: web.components.Route):NavigationGuard | void;
    declare function NavigationGuard(to: web.components.Route, from: web.components.Route, next: NavigationGuardNext): NavigationGuardReturn | Promise<NavigationGuardReturn>;
    declare function NavigationGuardNext():void;
    declare function NavigationGuardNext(error:Error):void;
    declare function NavigationGuardNext(location:web.components.RouterLocation):void;
    declare function NavigationGuardNext(valid:boolean):void;
    declare function NavigationGuardNext(cb:NavigationGuardNextCallback):void;
    declare type NavigationGuardNextCallback = (vm: {[key:string]}) => any;
    declare type NavigationGuardReturn = void | Error | web.components.RouterLocation | boolean | NavigationGuardNextCallback;
}

import {applyPlugin} from "#app"
declare function applyPlugin(nuxtApp: nuxt.NuxtApp, plugin:any): Promise<void>;
import {applyPlugins} from "#app"
declare function applyPlugins(nuxtApp: nuxt.NuxtApp, plugins: Array<any>): Promise<void>;
import {defineNuxtPlugin} from "#app"
declare function defineNuxtPlugin(plugin: nuxt.ObjectPlugin | nuxt.NextPlugin | nuxt.Plugin):any;
import {definePayloadPlugin} from "#app"
declare function definePayloadPlugin(plugin: nuxt.ObjectPlugin | nuxt.NextPlugin | nuxt.Plugin):any;
import {isNuxtPlugin} from "#app"
declare function isNuxtPlugin(plugin: any): boolean;

import {useAppConfig} from "#app"
declare function useAppConfig(): {[key:string]:any};
/**
 * Ensures that the setup function passed in has access to the Nuxt instance via `useNuxt`.
 *
 * @param nuxt A Nuxt instance
 * @param setup The function to call
 */
import {callWithNuxt} from "#app"
declare function callWithNuxt<T extends (...args: any[]) => any>(nuxt: nuxt.NuxtApp, setup: T, args?: any[]):any;
import {useNuxtApp} from "#app"
declare function useNuxtApp(): nuxt.NuxtApp;
import {useRuntimeConfig} from "#app"
declare function useRuntimeConfig(): nuxt.RuntimeConfig;
import {defineAppConfig} from "#app"
declare function defineAppConfig<T extends {[key:string]:any}>(config:T ): T;
import {useAsyncData} from "#app"
declare function useAsyncData(handler: (ctx?: nuxt.NuxtApp) => Promise<any>, options?: nuxt.AsyncDataOptions): Promise<nuxt.AsyncData>;
import {useAsyncData} from "#app"
declare function useAsyncData(key: string, handler: (ctx?: nuxt.NuxtApp) => Promise<any>, options?: nuxt.AsyncDataOptions):Promise<nuxt.AsyncData>;
import {useLazyAsyncData} from "#app"
declare function useLazyAsyncData(handler: (ctx?: nuxt.NuxtApp) => Promise<any>, options?: nuxt.AsyncDataOptions): Promise<nuxt.AsyncData>;
import {useLazyAsyncData} from "#app"
declare function useLazyAsyncData(key: string, handler: (ctx?: nuxt.NuxtApp) => Promise<any>, options?: nuxt.AsyncDataOptions):Promise<nuxt.AsyncData>;
import {useNuxtData} from "#app"
declare function useNuxtData(key: string): {data:any};
import {useFetch} from "#app"
declare function useFetch(url:string, opts?:{[key:string]:any}): Promise<nuxt.AsyncData>;
import {useLazyFetch} from "#app"
declare function useLazyFetch(url:string, opts?:{[key:string]:any}): Promise<nuxt.AsyncData>;
import {useCookie} from "#app"
declare function useCookie(name: string, _opts?: nuxt.CookieOptions):{[key:string]:any};
import {useError} from "#app"
declare function useError():Error | {
    url: string,
    statusCode: number,
    statusMessage: string,
    message: string,
    description: string,
    data?: any
} | null;

import {useRouter} from "#app"
declare function useRouter(): web.components.Router;
import {useRoute} from "#app"
declare function useRoute(): web.components.Route;
import {useRequestHeaders} from "#app"
declare function useRequestHeaders(include: any[]): {
    [key:string]: string
};
import {useRequestHeaders} from "#app"
declare function useRequestHeaders(): nuxt.Record<string, string>
import {useRequestEvent} from "#app"
declare function useRequestEvent(nuxtApp?: nuxt.NuxtApp): any;
import {useRequestURL} from "#app"
declare function useRequestURL(): URL;
import {useRequestFetch} from "#app"
declare function useRequestFetch(): any;
import {useState} from "#app"
declare function useState<T>(key?: string, init?:() => T): T;
import {useState} from "#app"
declare function useState<T>(init?: () => T ):T;
import {useHead} from "#app"
declare function useHead(options:nuxt.MetaObject): any;
import {useHeadSafe} from "@unhead/vue"
declare function useHeadSafe(input:nuxt.MetaObject):any;
import {useServerHead} from "@unhead/vue"
declare function useServerHead(options:nuxt.MetaObject):any;
import {useServerHeadSafe} from "@unhead/vue"
declare function useServerHeadSafe(input:nuxt.MetaObject):any;
import {useSeoMeta} from "#app"
declare function useSeoMeta(options:nuxt.Record<string, any>):any;
import {useServerSeoMeta} from "#app"
declare function useServerSeoMeta(options:nuxt.Record<string, any>): any;
/**
 * Allows full control of the hydration cycle to set and receive data from the server.
 *
 * @param key a unique key to identify the data in the Nuxt payload
 * @param get a function that returns the value to set the initial data
 * @param set a function that will receive the data on the client-side
 */
import {useHydration} from "#app"
declare function useHydration<K extends string | number, T = nuxt.NuxtPayload>(key: K, get: () => T, set: (value: T) => void): void;

import {createNuxtApp} from "#app"
declare function createNuxtApp(options: nuxt.CreateOptions): nuxt.NuxtApp;
import {refreshNuxtData} from "#app"
declare function refreshNuxtData(keys?: string | string[]): Promise<void>;
import {clearNuxtData} from "#app"
declare function clearNuxtData(keys?: string | string[] | ((key: string) => boolean)): void;
import {showError} from "#app"
declare function showError(_err: string | Error | nuxt.NuxtError):nuxt.NuxtError;
import {clearError} from "#app"
declare function clearError(options?: {
    redirect?: string,
}):Promise<void>;
//import {isNuxtError} from "#app"
//declare function isNuxtError(err?: string | object):boolean;
import {createError} from "#app"
declare function createError(err: string | nuxt.NuxtError):nuxt.NuxtError;

/**
 * Preload a component or components that have been globally registered.
 *
 * @param components Pascal-cased name or names of components to prefetch
 */
import {preloadComponents} from "#app"
declare function preloadComponents(components: string | string[]):Promise<void>;
/**
 * Prefetch a component or components that have been globally registered.
 *
 * @param components Pascal-cased name or names of components to prefetch
 */
import {prefetchComponents} from "#app"
declare function prefetchComponents(components: string | string[]):Promise<void>;
import {preloadRouteComponents} from "#app"
declare function preloadRouteComponents(to: any, router?: any):Promise<void>;
import {onNuxtReady} from "#app"
declare function onNuxtReady(callback: () => any):void;
import {onBeforeRouteLeave} from "#app"
declare function onBeforeRouteLeave(guard: any):void;
import {onBeforeRouteUpdate} from "#app"
declare function onBeforeRouteUpdate(guard: any):void;
import {defineNuxtRouteMiddleware} from "#app"
declare function defineNuxtRouteMiddleware(middleware: nuxt.RouteMiddleware): nuxt.RouteMiddleware;
import {addRouteMiddleware} from "#app"
declare function addRouteMiddleware(name:string, middleware, opts?:any):void;
import {navigateTo} from "#app"
declare function navigateTo(to:any, options?: nuxt.NavigateToOptions):any;
/** This will abort navigation within a Nuxt route middleware handler. */
import {abortNavigation} from "#app"
declare function abortNavigation(err?: string | nuxt.NuxtError):boolean;
import {setPageLayout} from "#app"
declare function setPageLayout(layout: string):void;
import {setResponseStatus} from "#app"
declare function setResponseStatus(event: any, code?: number, message?: string): void;
import {clearNuxtState} from "#app"
declare function clearNuxtState(keys?: string | string[] | (key: string) => boolean ): void;
import {clearNuxtState} from "#app"
declare function clearNuxtState(): URL;
import {reloadNuxtApp} from "#app"
declare function reloadNuxtApp(options?: nuxt.ReloadNuxtAppOptions): void;

declare function definePageMeta(options:nuxt.PageMeta):void;

@Reference('es-vue/types/index.d.es');
@Reference('./web');
@Reference('es-vue/types/web/Application.d.es');
@Reference('./web/Application.d.es');
