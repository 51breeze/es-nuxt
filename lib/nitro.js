import { resolve, dirname, join, relative} from 'pathe';
import { hash } from 'ohash';
import { globby } from 'globby';
import { watch } from 'chokidar';
import {withLeadingSlash, withBase, withoutTrailingSlash} from 'ufo';

const PREFIX = "\0virtual:";
const GLOB_SCAN_PATTERN = "**/*.{es,ease}";
const httpMethodRegex = /\.(connect|delete|get|head|options|patch|post|put|trace)$/;
const WILDCARD_PATH_RE = /\/\*\*.*$/;

function unique(arr) {
    return [...new Set(arr)];
}

function getImportId(p, lazy) {
    return (lazy ? "_lazy_" : "_") + hash(p).slice(0, 6);
}

function extendMiddlewareWithRuleOverlaps(handlers2, routeRules) {
    const rules = Object.entries(routeRules);
    for (const [path, rule] of rules) {
        if (!rule.cache) {
            const isNested = rules.some(
                ([p, r]) => r.cache && WILDCARD_PATH_RE.test(p) && path.startsWith(p.replace(WILDCARD_PATH_RE, ""))
            );
            if (!isNested) {
                continue;
            }
        }
        for (const [index, handler] of handlers2.entries()) {
            if (!handler.route || handler.middleware) {
                continue;
            }
            if (handler.route === path) {
                break;
            }
            if (!WILDCARD_PATH_RE.test(handler.route)) {
                continue;
            }
            if (!path.startsWith(handler.route.replace(WILDCARD_PATH_RE, ""))) {
                continue;
            }
            handlers2.splice(index, 0, {
                ...handler,
                route: path
            });
            break;
        }
    }
}

function virtual(modules, cache = {}) {
  const _modules = /* @__PURE__ */ new Map();
  for (const [id, mod] of Object.entries(modules)) {
    cache[id] = mod;
    _modules.set(id, mod);
    _modules.set(resolve(id), mod);
  }
  return {
    name: "virtual",
    resolveId(id, importer) {
      if (id in modules) {
        return PREFIX + id;
      }
      if (importer) {
        const importerNoPrefix = importer.startsWith(PREFIX) ? importer.slice(PREFIX.length) : importer;
        const resolved = resolve(dirname(importerNoPrefix), id);
        if (_modules.has(resolved)) {
          return PREFIX + resolved;
        }
      }
      return null;
    },
    async load(id) {
      if (!id.startsWith(PREFIX)) {
        return null;
      }
      const idNoPrefix = id.slice(PREFIX.length);
      if (!_modules.has(idNoPrefix)) {
        return null;
      }
      let m = _modules.get(idNoPrefix);
      if (typeof m === "function") {
        m = await m();
      }
      cache[id.replace(PREFIX, "")] = m;
      return {
        code: m,
        map: null
      };
    }
  };
}

function handlers(nitro, exts=[]) {
    const getHandlers = () => [
      ...nitro.scannedHandlers,
      ...exts,
      ...nitro.options.handlers,
    ];
    return virtual(
      {
        "#internal/nitro/virtual/server-handlers": () => {
          const handlers2 = getHandlers();
          if (nitro.options.serveStatic) {
            handlers2.unshift({
              middleware: true,
              handler: "#internal/nitro/static"
            });
          }
          if (nitro.options.renderer) {
            handlers2.push({
              route: "/**",
              lazy: true,
              handler: nitro.options.renderer
            });
          }
          extendMiddlewareWithRuleOverlaps(handlers2, nitro.options.routeRules);
          const imports = unique(
            handlers2.filter((h) => !h.lazy).map((h) => h.handler)
          );
          const lazyImports = unique(
            handlers2.filter((h) => h.lazy).map((h) => h.handler)
          );
          const handlersMeta = getHandlers().filter((h) => h.route).map((h) => {
            return {
              route: h.route,
              method: h.method
            };
          });
          const code = `
  ${imports.map((handler) => `import ${getImportId(handler)} from '${handler}';`).join("\n")}
  
  ${lazyImports.map(
            (handler) => `const ${getImportId(handler, true)} = () => import('${handler}');`
          ).join("\n")}
  
  export const handlers = [
  ${handlers2.map(
            (h) => `  { route: '${h.route || ""}', handler: ${getImportId(
              h.handler,
              h.lazy
            )}, lazy: ${!!h.lazy}, middleware: ${!!h.middleware}, method: ${JSON.stringify(
              h.method
            )} }`
          ).join(",\n")}
  ];
  
  export const handlersMeta = ${JSON.stringify(handlersMeta, null, 2)}
    `.trim();
          return code;
        }
      },
      nitro.vfs
    );
}

async function scanHandlers(nitro) {
  const middleware = await scanMiddleware(nitro);
  const handlers = await Promise.all([
    scanServerRoutes(nitro, "api", "/api"),
    scanServerRoutes(nitro, "routes", "/")
  ]).then((r) => r.flat());
  return [
    ...middleware,
    ...handlers.filter((h, index, array) => {
      return array.findIndex(
        (h2) => h.route === h2.route && h.method === h2.method
      ) === index;
    })
  ]
}

async function scanMiddleware(nitro) {
  const files = await scanFiles(nitro, "middleware");
  return files.map((file) => {
    return {
      middleware: true,
      handler: file.fullPath
    };
  });
}

async function scanServerRoutes(nitro, dir, prefix = "/") {
  const files = await scanFiles(nitro, dir);
  return files.map((file) => {
    let route = file.path.replace(/\.[A-Za-z]+$/, "").replace(/\[\.{3}]/g, "**").replace(/\[\.{3}(\w+)]/g, "**:$1").replace(/\[(\w+)]/g, ":$1");
    route = withLeadingSlash(withoutTrailingSlash(withBase(route, prefix)));
    let method;
    const methodMatch = route.match(httpMethodRegex);
    if (methodMatch) {
      route = route.slice(0, Math.max(0, methodMatch.index));
      method = methodMatch[1];
    }
    route = route.replace(/\/index$/, "") || "/";
    return {
      handler: file.fullPath,
      lazy: true,
      middleware: false,
      route,
      method
    };
  });
}

async function scanPlugins(nitro) {
  const files = await scanFiles(nitro, "plugins");
  return files.map((f) => f.fullPath);
}

async function scanTasks(nitro) {
  const files = await scanFiles(nitro, "tasks");
  return files.map((f) => {
    const name = f.path.replace(/\/index$/, "").replace(/\.[A-Za-z]+$/, "").replace(/\//g, ":");
    return { name, handler: f.fullPath };
  });
}

async function scanModules(nitro) {
  const files = await scanFiles(nitro, "modules");
  return files.map((f) => f.fullPath);
}

async function scanFiles(nitro, name) {
    const files = await Promise.all(
      nitro.options.scanDirs.map((dir) => scanDir(nitro, dir, name))
    ).then((r) => r.flat());
    return files;
}

async function scanDir(nitro, dir, name) {
    const fileNames = await globby(join(name, GLOB_SCAN_PATTERN), {
        cwd: dir,
        dot: true,
        ignore: nitro.options.ignore,
        absolute: true
    });
    return fileNames.map((fullPath) => {
        return {
            fullPath,
            path: relative(join(dir, name), fullPath)
        };
    }).sort((a, b) => a.path.localeCompare(b.path));
}

function bindWatch(nitro) {
    const watchPatterns = nitro.options.scanDirs.flatMap((dir) => [
      join(dir, "api"),
      join(dir, "routes"),
      join(dir, "middleware", GLOB_SCAN_PATTERN),
      join(dir, "plugins"),
      join(dir, "modules")
    ]);
    const watchReloadEvents = /* @__PURE__ */ new Set(["add", "addDir", "unlink", "unlinkDir","change"]);
    const reloadWatcher = watch(watchPatterns, { ignoreInitial: true }).on(
      "all",
      (event) => {
        if (watchReloadEvents.has(event)) {
            nitro.hooks.callHook("rollup:reload")
        }
      }
    );
    nitro.hooks.hook("close", () => {
      reloadWatcher.close();
    });
}

export {
    PREFIX,
    bindWatch,
    handlers,
    virtual,
    scanHandlers,
    scanPlugins,
    scanTasks,
    scanModules
}