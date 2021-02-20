/*!
 * pure-node
 * Copyright(c) 2021 Herudi (https://github.com/herudi)
 * MIT Licensed
 */

function buildParams(str) {
    if (str instanceof RegExp) return { params: {}, regex: str };
    let strReg = '/([^/]+?)';
    let pattern = str.replace(/\/:[a-z_-]+/g, strReg);
    let regex = new RegExp(`^${pattern}/?$`, 'i');
    let matches = str.match(/\:([a-z_-]+)/g);
    let params = matches ? matches.map((e) => e.substring(1)) : [];
    return { params, regex };
}
function addMiddleware(midds, notFound, handlers) {
    handlers = midds.concat(handlers);
    return (handlers = handlers.concat([notFound]));
}

class Router {
    constructor() {
        this.route = {};
        this.midds = [];
        this.get = this.addRoute.bind(this, 'GET');
        this.post = this.addRoute.bind(this, 'POST');
        this.put = this.addRoute.bind(this, 'PUT');
        this.patch = this.addRoute.bind(this, 'PATCH');
        this.delete = this.addRoute.bind(this, 'DELETE');
        this.head = this.addRoute.bind(this, 'HEAD');
        this.all = this.addRoute.bind(this, 'ALL');
        this.options = this.addRoute.bind(this, 'OPTIONS');
    }

    findHandlers(arr) {
        let ret = [];
        for (let i = 0; i < arr.length; i++) {
            if (Array.isArray(arr[i])) {
                ret = ret.concat(this.findHandlers(arr[i]));
            } else if (typeof arr[i] === 'function') {
                ret.push(arr[i]);
            }
        }
        return ret;
    }

    addRoute(method, path, ..._handlers) {
        let handlers = this.findHandlers(_handlers);
        if (path.includes('/:')) {
            if (!this.route[method]) {
                this.route[method] = [];
            }
            let { params, regex } = buildParams(path);
            this.route[method].push({ params, regex, handlers });
        } else {
            this.route[method + path] = { params: {}, regex: null, handlers };
        }
        return this;
    }

    findRoute(url, method, notFound) {
        let params = {}, handlers = [];
        if (this.route[method + url]) {
            let obj = this.route[method + url];
            if (obj.isMidds) {
                handlers = obj.handlers;
            } else {
                handlers = addMiddleware(this.midds, notFound, obj.handlers);
                this.route[method + url] = { isMidds: true, handlers };
            }
        } else {
            let routes = this.route[method] || [];
            let isNotFound = true;
            let j = 0;
            let matches = [];
            let obj = {};
            if (this.route['ALL']) {
                routes = routes.concat(this.route['ALL']);
            }
            for (let i = 0; i < routes.length; i++) {
                obj = routes[i];
                if (obj.regex && obj.regex.test(url)) {
                    isNotFound = false;
                    if (obj.isMidds) {
                        handlers = obj.handlers;
                    } else {
                        handlers = addMiddleware(this.midds, notFound, obj.handlers);
                        if (this.route[method] && this.route[method][i]) {
                            this.route[method][i] = { ...obj, isMidds: true,  handlers };
                        }
                    }
                    if (obj.params) {
                        matches = obj.regex.exec(url);
                        while (j < obj.params.length) {
                            params[obj.params[j]] = matches[++j] || null;
                        }
                    }
                    break;
                }
            }
            if (isNotFound) {
                handlers = addMiddleware(this.midds, notFound, []);
            }
        }
        
        return { params, handlers };
    }
}

module.exports = Router;