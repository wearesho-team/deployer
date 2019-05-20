# Change Log

## 1.9.0
- Refactor `monitoring` route using [express-monitoring](https://www.npmjs.com/package/express-monitoring)
package to monitor application configuration and docker engine status.

## 1.2.0
- Add `beforeDeploy` and `afterDeploy` sections to project configuration. It can be null or string[] (array).
- Add `port` section to global configuration (loaded from JSON). 
If no port provided in JSON environment variable **DEPLOYER_PORT** will be used instead.
- Add detailed response types and unique code for each error type (see details in [README](./README.md))
