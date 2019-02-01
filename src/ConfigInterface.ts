export interface TimeLimitRule {
    from: string; // format HH:MM:SS
    to: string; // format HH:MM:SS
    allow: boolean;
}

export interface ConfigEntity {
    name: string; // Project name. Will be used in HTTP request
    path: string; // Absolute path to docker-compose.yml file

    envPath?: string; // Absolute path to environment file, optional

    beforeDeploy?: Array<string>; // Commands that will be executed before executing `docker-compose up`
    afterDeploy?: Array<string>; // Commands that will be executed after successful execution `docker-compose up`

    /**
     * Time limits rules.
     * If no rules specified updates available any moment.
     * If specified only `allow=false` rules, updates will be available any moment
     * except specified.
     * If specified at least one rule `allow=true` updates will be available 
     * only time specified in this rules expect specified in `allow=false` rules.
     */
    time?: Array<TimeLimitRule>;
}

export interface ConfigInterface {
    version: number; // Configuration version, now always = 1
    secret: string; // Value, that should be sent in X-Authorization header. If undefined, authorization will be ignored
    port?: number; // Port to be listened by process. Can be set be environment variable (DEPLOYER_PORT). Defaults - 3000
    projects: Array<ConfigEntity>;
}
