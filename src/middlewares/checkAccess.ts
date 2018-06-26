import * as express from "express";
import { ConfigInterface } from "../ConfigInterface";

export const checkAccess = (globalConfig: ConfigInterface): express.RequestHandler => (request, response, next) => {
    if (!globalConfig.secret) {
        next();
    }

    if (request.headers['x-authorization'] !== globalConfig.secret) {
        return response.status(403).json({ code: -1, message: "Forbidden" }).send();
    }

    next();
}
