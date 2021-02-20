/*!
 * pure-node
 * Copyright(c) 2021 Herudi (https://github.com/herudi)
 * MIT Licensed
 */

const { CONTENT_TYPE, JSON_TYPE, TEXT_PLAIN_TYPE, FORM_URLENCODED_TYPE } = require("./constant");
const { parse: parsequery } = require('querystring');

function isTypeBodyPassed(header, _type) {
    return header[CONTENT_TYPE.toLowerCase()] && header[CONTENT_TYPE.toLowerCase()].indexOf(_type) !== -1;
}

function bodyParser(req, _, next) {
    const method = req.method;
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        const header = req.headers;
        if (isTypeBodyPassed(header, JSON_TYPE) ||
            isTypeBodyPassed(header, TEXT_PLAIN_TYPE) ||
            isTypeBodyPassed(header, FORM_URLENCODED_TYPE)) {
            let chunks = [];
            let error = null;
            req.on('data', (buf) => {
                try {
                    chunks.push(buf);
                } catch (err) {
                    error = err;
                }
            }).on('end', () => {
                if (error) return next(error);
                if (!chunks.length) return next();
                let str = Buffer.concat(chunks).toString();
                let body = undefined;
                try {
                    if (isTypeBodyPassed(header, JSON_TYPE)) {
                        body = JSON.parse(str);
                    } else if (isTypeBodyPassed(header, TEXT_PLAIN_TYPE)) {
                        body = str;
                    } else if (isTypeBodyPassed(header, FORM_URLENCODED_TYPE)) {
                        body = parsequery(str);
                    }
                } catch (err) {
                    return next(err);
                }
                req._body = body !== undefined;
                req.body = body || {};
                next();
            });
        } else next();
    } else next();
}

module.exports = bodyParser;