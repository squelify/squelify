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

## Unikraft Commands

```sh
# List down all the available applications in the registry
kraft pkg ls --apps --all --update

# Run the application locally
kraft run --rm -p 3278:3278 -n squelify -v $(pwd)/sqdata:/srv/sqdata --arch x86_64 --plat qemu

# Attach a volume to the instance `squelify-y1xmz` to the path /srv/sqdata by volume name.
kraft cl vol create --size 10Mi
kraft cl vol ls
kraft cl inst stop squelify-y1xmz
kraft cl vol at vol-cabnh --to squelify-y1xmz --at /srv/sqdata
kraft cl inst start squelify-y1xmz

kraft cl deploy --metro sin0 -p 443:3278 . -M 256M -e TURSO_DATABASE_URL="libsql://DBNAME.turso.io?authToken='TOKEN'"
kraft cl inst ls
kraft cl svc ls
kraft cl inst get squelify-y1xmz
kraft cl inst logs squelify-y1xmz
kraft cl inst remove squelify-y1xmz

kraft cl image ls
```
