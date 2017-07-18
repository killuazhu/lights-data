#!/bin/bash

set -e

BASEDIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

installDep() {
  # Install Pip dependency if needed
  if ! pip --version > /dev/null; then
    curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
    python3 get-pip.py
  fi

  cd $BASEDIR/servers/flask;
  pip install -q -r requirements.txt;
}

running() {
  # Kill existing process
  if pgrep -fal "server.py" > /dev/null; then
    echo "Website is running"
  else
    echo "Website is not running"
  fi
}

stop() {
  # Kill existing process
  if pgrep -fal "server.py" > /dev/null; then
    echo "Stopping existing website"
    pkill -fal "server.py";
  fi
}

start() {
  stop

  cd $BASEDIR/servers/flask;
  python3 server.py &> server.log &
  echo "Website is running at http://0.0.0.0:44555. Replace 0.0.0.0 to your server's IP"
  echo "Log is written to file $BASEDIR/servers/flask/server.log"
}
