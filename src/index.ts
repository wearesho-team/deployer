import 'babel-polyfill';
import express from "express";
import bodyParser from "body-parser";
import fs from "fs";

import packageJson from "../package";
import * as data from "./data";
import * as middlewares from "./middlewares";
import * as routes from "./routes";
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
    .use(bodyParser.json())
    .use(middlewares.checkAccess(globalConfig))
    .post("/", routes.upgrade(globalConfig))
    .get("/monitoring", routes.monitoring(packageJson, globalConfig))
    .get("/status/:projectName", routes.status(globalConfig));

new EnvironmentController(globalConfig, app);

app.listen(globalConfig.port || process.env.DEPLOYER_PORT || 3000);
