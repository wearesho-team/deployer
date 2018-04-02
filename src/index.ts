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

const executeScripts = async (commands: Array<string> | undefined): Promise<void> => {
    if (!commands) {
        return;
    }
    if (!Array.isArray(commands)) {
        throw new Error("Commands should be an array");
    }
    for (const command in commands) {
        try {
            console.log(command);
            await exec(command);
        }
        catch (error) {
            if (error.stderr) {
                throw new Error(error.stderr);
            }
            throw error;
        }
    }
};

app.get("/", (request, response) => {
    response.json({
        name: packageJson.name,
        version: packageJson.version,
    });
});

app.post("/", jsonParser, async (request: Request, response: Response): Promise<Response> => {
    if (globalConfig.secret && request.headers['x-authorization'] !== globalConfig.secret) {
        return response.status(403).json({code: -1, message: "Forbidden"}).send();
    }

    const body: UpdateInterface = request.body;
    if (!body.name || !body.tag) {
        return response.status(422).json({code: 101, message: "Missing name or tag in body"}).send();
    }

    const config: ConfigEntity | undefined = globalConfig.projects.find((config) => config.name === body.name);
    if (!config) {
        console.warn(`Can not find project with name ${body.name}`);
        return response.status(422).json({code: 102, message: `${body.name} deploy does not exist`}).send();
    }
    console.log(`Begin deploy ${body.name}`);

    if (!fs.existsSync(config.path)) {
        console.error(`File ${config.path} does not exist`);
        return response.status(501).json({code: 201, message: "Compose file does not exist"}).send();
    }
    const yaml = fs.readFileSync(config.path).toString();
    const previousTagRegExp = new RegExp(`image:\\s+".*${body.name}:(\\d+\\.\\d+\\.\\d+)\\"`, "g");
    const match = yaml.match(previousTagRegExp);

    if (!match || !match.length) {
        return response.status(501).json({code: 202, message: `Can not find image name in docker-compose file`}).send();
    }
    const newYaml = yaml.replace(previousTagRegExp, `image: "${body.tag}"`);
    const previousVersion = match[0];

    fs.renameSync(config.path, `${config.path}_${previousVersion}`);
    fs.writeFileSync(config.path, newYaml);

    try {
        config.beforeDeploy && console.log("Executing beforeDeploy");
        await executeScripts(config.beforeDeploy);
    }
    catch (error) {
        console.error(error);
        return response.status(500).json({code: 301, message: "BeforeDeploy Error"}).send();
    }

    try {
        await exec(`docker-compose -f ${config.path} up -d`);
    }
    catch (error) {
        console.error(error.stderr ? error.stderr : error);
        return response.status(500).json({code: 302, message: "DockerDeploy Error"}).send();
    }

    try {
        config.afterDeploy && console.log("Executing afterDeploy");
        await executeScripts(config.afterDeploy);
    }
    catch (error) {
        console.error(error);
        return response.status(500).json({code: 303, message: "AfterDeploy Error"}).send();
    }

    return response.json({code: 0, message: "Successful", from: previousVersion, to: body.tag,}).send();
});

app.listen(globalConfig.port || process.env.DEPLOYER_PORT || 3000);
