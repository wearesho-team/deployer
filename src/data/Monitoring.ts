import { Meta } from "./Meta";

export namespace Monitoring {
    export interface DetailsInterface {
        app: Meta;
        projects: Array<string>;
    }

    /**
     * @link https://github.com/Horat1us/yii2-monitoring
     * @link https://yii2monitoring.docs.apiary.io/#reference/0/single-control/execute-control
     */
    export interface ResponseInterface {
        state: "ok";
        ms: {
            begin: number;
            total: number;
        };
        details: Monitoring.DetailsInterface;
    }
}
