import 'babel-polyfill';

import express from "express";
const bodyParser = require("body-parser");
const fs = require("fs");

const packageJson = require("../package.json");
const jsonParser = bodyParser.json();

import * as data from "data";
import * as middlewares from "middlewares";
import * as routes from "routes";
import { EnvironmentController } from './controllers/EnvironmentController';

const configFilePath = process.env.DEPLOYER_CONFIG_PATH || "./config.json";
if (!fs.existsSync(configFilePath)) {
    throw new Error(`Can not find configuration file: ${configFilePath}`);
}
const globalConfig: data.ConfigInterface = require(configFilePath);
if (globalConfig.version !== 1) {
    throw new Error(`Unexpected configuration version: ${globalConfig.version}, expected 1`);
}

const app = express()
    .get("/", (request, response) => {
        response.json({
            name: packageJson.name,
            version: packageJson.version,
        });
    })
    .use(jsonParser)
    .use(middlewares.checkAccess(globalConfig))
    .post("/", jsonParser, routes.upgrade)
    .get("/status/:projectName", routes.status);

new EnvironmentController(globalConfig, app);

app.listen(globalConfig.port || process.env.DEPLOYER_PORT || 3000);
