import express from "express";
import * as data from "../data";
import * as helpers from "../helpers";
import * as eMonitoring from "express-monitoring";

interface DockerInfo {
    ContainerRunning: number;
    ContainerPaused: number;
    ContainerStopped: number;
    ServerVersion: string;
    ID: string;
    Images: number;
}

const DockerControl = async (): Promise<DockerInfo> => {
    let stdout: string;
    try {
        const output = await helpers.exec(`docker info --format '{{json .}}'`);
        stdout = output.stdout;
    } catch (error) {
        throw new eMonitoring.FailureError(
            error.stderr ? error.stderr : error.message,
            -1,
            undefined,
            "DockerInfoFailure"
        );
    }

    let info: { [ k: string ]: any };

    try {
        info = JSON.parse(stdout);
    } catch (error) {
        throw new eMonitoring.FailureError(
            `Error parsing 'docker info' output as JSON`,
            -2,
            {
                stdout,
            },
            "DockerInfoFormat"
        );
    }

    const details = {};

    [ "Container", "ContainersRunning", "ContainersPaused", "ContainersStopped", "ServerVersion", "Driver", "ID", "Images", ]
        .forEach((key) => details[ key ] = info[ key ]);

    return details as DockerInfo;
};

const AppControl = (app: data.Meta, config: data.ConfigInterface) => (): data.Monitoring.DetailsInterface => {
    const { name, version } = app;
    return (
        {
            app: { name, version, },
            projects: config.projects.map((project) => project.name),
        }
    );
};


export const monitoring = (app: data.Meta, config: data.ConfigInterface): express.RequestHandler => {
    const controls = {
        docker: DockerControl,
        app: AppControl(app, config),
    };
    const controller = new eMonitoring.Controller({ controls });
    return controller.full;
};
