const assert = require('assert');
const jwt = require('jsonwebtoken');
const logr = require('../config/config').logger;

let controller = {
    validateTokenLogin: (req, res, next) => {
        const auth = req.headers.authorization;
        logr.debug(auth);
        let token = undefined;
        let load = undefined;
        let expireDate = undefined;
        let currentDate = undefined;

        let isValid = true;
        if (auth) {
            token = auth.substring(7, auth.length);
            logr.info('Header is')
            logr.debug(token);
            load = jwt.decode(token);
            logr.debug(load);
            if (load) {
                expireDate = load.exp;
                currentDate = new Date().getTime() / 1000;
                logr.trace(`Id: ${load.id} has been retrieved`)
            } else{
                logr.warn("Token load is false");
                isValid = false;
            }
        }

        try {
            assert(typeof token == 'string', 'Not logged in');
            assert(isValid, 'Token is invalid');
            assert(currentDate < expireDate, 'Token has expired');
            next();
        } catch (error) {
            logr.trace(`Token is not valid`)
            const err = {
                status: 401,
                message: error.message
            }
            next(err);
        }
    }
}
module.exports = controller;