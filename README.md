# Simple HTTP Deploy tool
It will change package version in docker-compose and run commands:
```bash
docker-compose -f custom.docker-compose.yml pull
docker-compose -f custom.docker-compose.yml up -d
```
Previous docker compose file will be saved as `{previousImageVersion}_{previousDockerComposeFilename}`

## Configuration
Configuration by environment variables:
- **DEPLOYER_PORT** - port that Express listen
- **DEPLOYER_CONFIG_PATH** - path to JSON file with projects config

JSON config file should contain array, each element have to implement [ConfigInterface](src/ConfigInterface.ts)

## Requesting

#### Request
POST / 

Content-Type: application/json

```json
{
  "name": "image-name",
  "tag": "docker-registry.private.com/image-name:1.0.0"
}
```

#### Response
1. Successful  
200
2. Configuration not found  
422
3. Invalid configuration 

500

Content-Type: application/json

```json
{
    "message": "Some error information"
}
```

## Author
[Alexander <horat1us> Letnikow](mailto:reclamme@gmail.com)

## License
MIT