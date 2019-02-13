import * as data from "../data";
import * as helpers from "../helpers";
import { Request, Response } from "express";
import fs from "fs";

enum ResponseCode {
    success = 0,
    composeNotExists = 201,
}

enum ResponseMessage {
    composeNotExists = "Compose file does not exist",
    dockerError = "Docker Error",
    success = "Successful",
}

function formatResponse(code: ResponseCode | number, message: ResponseMessage, containers: Array<data.Container> = []) {
    return {
        code,
        message,
        containers,
    }
}

export const status = (globalConfig: data.ConfigInterface) => (request: Request, response: Response) => {
    const { projectName } = request.params;

    const config: data.ConfigEntity | undefined = globalConfig.projects.find((config) => config.name === projectName);
    if (!config) {
        return response.status(404);
    }

    if (!fs.existsSync(config.path)) {
        console.error(`File ${config.path} does not exist`);
        return response.status(501).json(formatResponse(ResponseCode.composeNotExists, ResponseMessage.composeNotExists)).send();
    }
    const command = `docker-compose -f ${config.path} ps`;

    const { stderr, stdout, code } = helpers.exec(command);
    if (code) {
        console.error(`Error while cheching ${projectName} status: ${stderr}`);
        return response.status(503).json(formatResponse(code, ResponseMessage.dockerError));
    }

    const containers = helpers.parseDockerComposePs(stdout);
    return response.status(200).json(formatResponse(ResponseCode.success, ResponseMessage.success, containers));
}
