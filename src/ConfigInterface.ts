export interface ConfigEntity {
    name: string; // Project name. Will be used in HTTP request
    path: string; // Absolute path to docker-compose.yml file
}

export interface ConfigInterface {
    version: number;
    secret: string;
    projects: Array<ConfigEntity>;
}
