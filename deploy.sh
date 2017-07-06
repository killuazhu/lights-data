#!/bin/bash

# set -x

: ${SERVER:=}
: ${TARGET:=/root}

if [[ "$SERVER" = "" ]]; then
  echo "missing environment variable 'SERVER'"
  exit 1
fi

ssh-keygen -R $SERVER
ssh-keyscan -p 22 $SERVER >> ~/.ssh/known_hosts

rsync -avz --delete servers root@$SERVER:$TARGET/
rsync -avz --delete httpdocs root@$SERVER:$TARGET/

ssh -l root $SERVER << EOF

set -ex

# Install Pip dependency if needed
if ! pip --version; then
  curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
  python3 get-pip.py
fi

cd $TARGET/servers/flask;
pip install -r requirements.txt;

# Kill existing process
if pgrep python3; then
  pkill python3;
fi

# Start new process
screen -d -m /bin/bash -c "python3 server.py &> server.log"
EOF
