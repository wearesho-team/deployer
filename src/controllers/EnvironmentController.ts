import * as express from "express";
import * as path from "path";
import * as fs from "fs";
import { ConfigInterface, ConfigEntity } from "../ConfigInterface";
import { DotEnvEditor } from "../helpers/DotEnvEditor";

export class EnvironmentController {
    protected globalConfig: ConfigInterface;

    constructor(globalConfig: ConfigInterface, app: express.Express) {
        this.globalConfig = globalConfig;
        app
            .get("/env/:name", this.fetchProject, this.validate, this.get)
            .put("/env/:name", this.fetchProject, this.validate, this.put);
    }

    public get: express.RequestHandler = async (request: express.Request & { project: ConfigEntity, envFile: string, }, response): Promise<void> => {
        const map = await DotEnvEditor.parse(request.envFile);
        const value = map.get(request.params.name);

        console.log(`${request.envFile} ${request.params.name} viewed by ${request.ip}`);

        if (value === undefined) {
            response.status(404).send();
            return;
        }

        response.status(200).json({
            key: request.params.name,
            value,
        });
    }

    public put: express.RequestHandler = async (request: express.Request & { project: ConfigEntity, envFile: string, }, response, next): Promise<void> => {
        if (!request.body || !request.body.value) {
            response.status(400).json({
                code: 1006,
                message: "Missing required body param: value",
            });
            return;
        }

        const backUpFile = `${request.envFile}.${new Date().toISOString()}`;
        fs.copyFileSync(request.envFile, backUpFile);

        const map = await DotEnvEditor.parse(request.envFile);
        const previousValue = map.get(request.params.name);
        map.set(request.params.name, request.body.value);
        DotEnvEditor.save(map, request.envFile);

        console.log(`${request.envFile} modified by ${request.ip}. Backup saved as ${backUpFile}`);
        response.status(202).json({
            key: request.params.name,
            value: request.body.value,
            previousValue,
        });
    }

    public validate: express.RequestHandler = (request: express.Request & { project: ConfigEntity, envFile: string }, response, next) => {
        if (!request.params.name) {
            return response.status(400).json({
                code: 1001,
                message: "Missing required parameter: name"
            });
        }

        const envFilePath = request.project.envPath;
        if ("string" !== typeof envFilePath) {
            response.status(422).json({
                code: 1007,
                message: `Project ${request.project.name} does not configured to process environment configuration`,
            });
            return;
        }

        if (!fs.existsSync(envFilePath)) {
            return response
                .status(422)
                .json({
                    code: 1005,
                    message: `Environment file does not exists in project ${request.project.name}`,
                });
        }

        request.envFile = envFilePath;
        next();
    }

    public fetchProject: express.RequestHandler = (request: express.Request & { project: ConfigEntity }, response, next) => {
        const projectName = request.headers['x-project'];

        if (!projectName) {
            return response
                .status(400)
                .json({
                    code: 1002,
                    message: "Missing required header X-Project",
                });
        }

        const project = this.globalConfig.projects.find((project: ConfigEntity) => project.name === projectName);
        if (!project) {
            return response
                .status(422)
                .json({
                    code: 1003,
                    message: `Project ${projectName} can not be found`,
                });
        }

        request.project = project;

        next();
    }
}
