Light data for Mengbai
----------------------

# Deploy

1. Copy all files in branch `easy-deploy` to a Linux server (Ubuntu 16.04 is preferred which should have `python3` installed by default)
2. Run `./start.sh` will start the process and serve website at `http://<ip>:44555`
3. To stop website and python process, run `./stop.sh`
4. To check if website is running, run `./running.sh`

# Common Operations

## Populate data

1. Update `servers/flask/data/lights.json` with new data
1. Run `./start.sh` to restart the process

## Add column

1. Add new column to `/servers/flask/templates/rhtml-lights.html` line 18 to 34.
1. Update `servers/flask/data/lights.json` to add new colume for each data entry.
1. Run `./start.sh` to restart the process

## Remove colume
1. Remove column from `/servers/flask/templates/rhtml-lights.html` line 18 to 34.
1. Run `./start.sh` to restart the process
