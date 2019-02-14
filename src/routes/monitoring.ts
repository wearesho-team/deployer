import * as data from "../data";
import { Request, Response } from "express";

export const monitoring = (app: data.Meta, config: data.ConfigInterface) => (request: Request, response: Response) => {
    const begin = new Date().getTime();
    const details: data.Monitoring.DetailsInterface = {
        app,
        projects: config.projects.map((project) => project.name),
    };
    const data: data.Monitoring.ResponseInterface = {
        state: "ok",
        ms: {
            begin,
            total: 0,
        },
        details,
    };
    const end = new Date().getTime();
    data.ms.total = begin - end;
    response.status(200).json(response);
};
