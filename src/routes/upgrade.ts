import * as helpers from "../helpers";
import { ConfigEntity, ConfigInterface } from "../data/ConfigInterface";
import { UpdateInterface } from "../data/UpdateInterface";
import { Request, Response } from "express";

const fs = require("fs")

export const upgrade = (globalConfig: ConfigInterface) => async (request: Request, response: Response): Promise<Response> => {
    const body: UpdateInterface = request.body;
    if (!body.name || !body.tag) {
        return response.status(422).json({ code: 101, message: "Missing name or tag in body" }).send();
    }

    const config: ConfigEntity | undefined = globalConfig.projects.find((config) => config.name === body.name);
    if (!config) {
        console.warn(`Can not find project with name ${body.name}`);
        return response.status(422).json({ code: 102, message: `${body.name} deploy does not exist` }).send();
    }
    console.log(`Begin deploy ${body.name}`);

    if (!fs.existsSync(config.path)) {
        console.error(`File ${config.path} does not exist`);
        return response.status(501).json({ code: 201, message: "Compose file does not exist" }).send();
    }
    if (config.time) {
        try {
            if (!helpers.checkTime(helpers.getCurrentTime(), config.time)) {
                return response.status(503).json({ code: 403, message: "Update not available" }).send();
            }
        } catch (error) {
            return response.status(501).json({ code: 203, message: error.message }).send();
        }
    }
    const yaml = fs.readFileSync(config.path).toString();
    const previousTagRegExp = new RegExp(`image:\\s+".*${body.name}:(\\d+\\.\\d+\\.\\d+)\"`, "g");
    const match = yaml.match(previousTagRegExp);

    if (!match || !match.length) {
        return response.status(501).json({ code: 202, message: `Can not find image name in docker-compose file` }).send();
    }
    const newYaml = yaml.replace(previousTagRegExp, `image: "${body.tag}"`);
    const previousVersion = match[0].match(/:(\d+\.\d+\.\d+)"/)[1];

    fs.renameSync(config.path, `${config.path}_${previousVersion}`);
    fs.writeFileSync(config.path, newYaml);

    try {
        config.beforeDeploy && console.log("Executing beforeDeploy");
        await helpers.executeScripts(config.beforeDeploy);
    }
    catch (error) {
        console.error(error);
        return response.status(500).json({ code: 301, message: "BeforeDeploy Error" }).send();
    }

    try {
        await helpers.exec(`docker-compose -f ${config.path} up -d`);
    }
    catch (error) {
        console.error(error.stderr ? error.stderr : error);
        return response.status(500).json({ code: 302, message: "DockerDeploy Error" }).send();
    }

    try {
        config.afterDeploy && console.log("Executing afterDeploy");
        await helpers.executeScripts(config.afterDeploy);
    }
    catch (error) {
        console.error(error);
        return response.status(500).json({ code: 303, message: "AfterDeploy Error" }).send();
    }

    return response.json({ code: 0, message: "Successful", from: previousVersion, to: body.tag, }).send();
};
