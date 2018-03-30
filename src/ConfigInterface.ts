export interface ConfigEntity {
    name: string; // Project name. Will be used in HTTP request
    path: string; // Absolute path to docker-compose.yml file
}

export interface ConfigInterface {
    version: number; // Configuration version, now always = 1
    secret: string; // Value, that should be sent in X-Authorization header. If undefined, authorization will be ignored
    projects: Array<ConfigEntity>;
}
