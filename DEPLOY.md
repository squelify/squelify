# Deployment Guide

For release versioning read more at: <https://github.com/jscutlery/semver>

Squelify available in single production-ready docker image.

TODO

### Using pm2 for production

Example configuration `ecosystem.json`:

```json
{
  "$schema": "https://json.schemastore.org/pm2-ecosystem.json",
  "apps": [
    {
      "name": "squelify",
      "script": "./server/index.mjs",
      "interpreter": "node",
      "interpreter_args": "-r dotenv/config",
      "exec_mode": "cluster",
      "instances": -1,
      "env_production": {
        "NODE_ENV": "production",
        "PORT": "3278"
      }
    }
  ]
}
```
