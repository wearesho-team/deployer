export interface ConfigEntity {
    name: string; // Project name. Will be used in HTTP request
    path: string; // Absolute path to docker-compose.yml file

    envPath?: string; // Absolute path to environment file, optional

    beforeDeploy?: Array<string>; // Commands that will be executed before executing `docker-compose up`
    afterDeploy?: Array<string>; // Commands that will be executed after successful execution `docker-compose up`
}

export interface ConfigInterface {
    version: number; // Configuration version, now always = 1
    secret: string; // Value, that should be sent in X-Authorization header. If undefined, authorization will be ignored
    port?: number; // Port to be listened by process. Can be set be environment variable (DEPLOYER_PORT). Defaults - 3000
    projects: Array<ConfigEntity>;
}
