#!/bin/bash

# set -x

: ${SERVER:=}
: ${TARGET:=/root}

if [[ "$SERVER" = "" ]]; then
  echo "missing environment variable 'SERVER'"
  exit 1
fi

ssh-keyscan -p 22 $SERVER >> ~/.ssh/known_hosts

rsync -avz --delete servers root@$SERVER:$TARGET/
rsync -avz --delete httpdocs root@$SERVER:$TARGET/
ssh -l root $SERVER "pkill python; cd $TARGET/servers/flask; pip install -r requirements.txt; python server.py &"
