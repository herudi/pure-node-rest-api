/*!
 * pure-node
 * Copyright(c) 2021 Herudi (https://github.com/herudi)
 * MIT Licensed
 */

const Router = require('./router');
const http = require('http');
const { parse: parseurl } = require('url');
const { parse: parsequery } = require('querystring');
const { CONTENT_TYPE, CONTENT_LENGTH, JSON_TYPE, CHARSET_UTF8, OCTET_TYPE } = require('./constant');
const bodyParser = require('./bodyParser');

function addResponse(res) {
    res.status = function (code) {
        this.statusCode = code;
        return this;
    };
    res.json = function (data) {
        data = JSON.stringify(data);
        let header = {};
        let code = res.statusCode;
        header[CONTENT_TYPE] = JSON_TYPE + CHARSET_UTF8;
        header[CONTENT_LENGTH] = '' + Buffer.byteLength(data);
        res.writeHead(code, header);
        res.end(data);
    };
    res.send = function (data) {
        if (typeof data === 'string') {
            this.end(data);
        } else if (typeof data.pipe === 'function') {
            this.setHeader(CONTENT_TYPE, this.getHeader(CONTENT_TYPE) || OCTET_TYPE);
            data.pipe(this);
        } else if (Buffer.isBuffer(data)) {
            this.setHeader(CONTENT_TYPE, this.getHeader(CONTENT_TYPE) || OCTET_TYPE);
            this.end(data);
        } else if (typeof data === 'object') {
            this.json(data);
        } else {
            res.end(data || http.STATUS_CODES[this.statusCode]);
        }
    };
}

function addRequest(req, url, params) {
    req.originalUrl = req.originalUrl || req.url;
    req.params = params;
    req.path = url.pathname;
    req.query = parsequery(url.query);
    req.search = url.search;
    req._body = false;
    req.body = {};
}

class Pure extends Router {
    constructor() {
        super();
        this._onError = (err, req, res, next) => {
            let code = err.code || err.status || err.statusCode || 500;
            if (typeof code !== 'number') code = 500;
            res.statusCode = code;
            res.end(err.message || 'Something went wrong')
        }
        this._on404 = (req, res, next) => {
            res.statusCode = 404;
            res.end(`Route ${req.method}${req.url} not found`);
        }
        this.lookup = this.lookup.bind(this);
    }

    onError(fn) {
        this._onError = fn;
        return this;
    }

    on404(fn) {
        this._on404 = fn;
        return this;
    }

    use(...args) {
        let arg = args[0];
        if (args.length === 1 && typeof arg === 'function') {
            this.midds.push(arg);
        } else {
            this.midds = this.midds.concat(this.findHandlers(args));
        }
        return this;
    }

    lookup(req, res) {
        const url = parseurl(req.url);
        const obj = this.findRoute(url.pathname, req.method, this._on404);
        let i = 0;
        let next = (err) => {
            if (err) return this._onError(err, req, res, next);
            try {
                obj.handlers[i++](req, res, next);
            } catch (error) {
                next(error);
            }
        };
        addResponse(res);
        addRequest(req, url, obj.params);
        if (req.method === 'GET' || req.method === 'HEAD') next();
        else bodyParser(req, res, next);
    }

    listen(port = 3000, ...args) {
        const server = http.createServer();
        server.setTimeout(0);
        server.on('request', this.lookup);
        server.listen(port, ...args);
    }
}

module.exports = Pure;