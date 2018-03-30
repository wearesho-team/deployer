const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const packageJson = require("../package.json");
const jsonParser = bodyParser.json();

import {ConfigEntity, ConfigInterface} from "./ConfigInterface";
import {UpdateInterface} from "./UpdateInterface";
import {Request, Response} from "express";

const configFilePath = process.env.DEPLOYER_CONFIG_PATH || "./config.json";
if (!fs.existsSync(configFilePath)) {
    throw new Error(`Can not find configuration file: ${configFilePath}`);
}
const globalConfig: ConfigInterface = require(configFilePath);
if (globalConfig.version !== 1) {
    throw new Error(`Unexpected configuration version: ${globalConfig.version}, expected 1`);
}

const app = express();

app.get("/", (request, response) => {
    response.json({
        name: packageJson.name,
        version: packageJson.version,
    });
});

app.post("/", jsonParser, async (request: Request, response: Response) => {
    if (globalConfig.secret && request.headers['x-authorization'] !== globalConfig.secret) {
        return response.status(403).send();
    }

    const body: UpdateInterface = request.body;

    const config: ConfigEntity = globalConfig.projects.find((config) => config.name === body.name);
    if (!config) {
        return response.status(422).send();
    }

    if (!fs.existsSync(config.path)) {
        return response.status(500).json({"message": `File ${config.path} does not exist`}).send();
    }
    const yaml = fs.readFileSync(config.path).toString();
    const previousTagRegExp = new RegExp(`image:\\s+".*${body.name}:(\\d+\\.\\d+\\.\\d+)\\"`, "g");
    const match = yaml.match(previousTagRegExp);

    if (!match) {
        return response.status(500).json({"message": `Can not find image name in docker-compose file`}).send();
    }
    const newYaml = yaml.replace(previousTagRegExp, `image: "${body.tag}"`);

    fs.renameSync(config.path, `${config.path}_${match[1]}`);
    fs.writeFileSync(config.path, newYaml);

    try {
        await exec(`docker-compose -f ${config.path} up -d`);
    }
    catch (error) {
        console.error(error.stderr);
        return response.status(500).json({"message": "Docker Error"}).send();
    }

    response.send();
});

app.listen(process.env.DEPLOYER_PORT || 3000);
