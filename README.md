Light data for Mengbai
----------------------

[![Build Status](https://travis-ci.org/killuazhu/lights-data.svg?branch=master)](https://travis-ci.org/killuazhu/lights-data)

# Description

This website contains light data for Mengbai. Mengbai has selected [KingTable](https://github.com/RobertoPrevato/KingTable) to allow him do various kinds of filter on the data.

# CI/CD

Upon `master` branch merge, the website will be refreshed in live production site through TravisCI. A ssh keypair has been genearted and the public key is put into `authorized_users` file.

The ssh keypair are encrypted within `scrects.tar.enc` with Travis CLI command below

```sh
$ tar cvf secrets.tar foo bar
$ travis encrypt-file secrets.tar
```

The encrypted tar file is stored in this repo.

## Change to new target deployment server

1. Obtain the keypair from Kyle or Mengbai
1. Copy the public key to new server

    ```sh
    $ ssh-copy-id -i wmb-lights-data.key.pub root@<new-server>
    ```

1. Update server environment variable to Travis

    ```sh
    $ travis env set SERVER <new-server>
    ```

# Common Operations

## Populate data

1. Update [lights.json](/servers/flask/data/lights.json) with new data
1. [Create pull request](https://help.github.com/articles/creating-a-pull-request/) with updated file
1. Merge the pull request into master. Change should be automatically pushed to target server

## Add column

1. Add new column to [rhtml-lights.html](/servers/flask/templates/rhtml-lights.html#L18-L34)
1. Update [lights.json](/servers/flask/data/lights.json) to add new colume for each data entry.
1. [Create pull request](https://help.github.com/articles/creating-a-pull-request/) with updated file
1. Merge the pull request into master. Change should be automatically pushed to target server

## Remove colume
1. Remove column from [rhtml-lights.html](/servers/flask/templates/rhtml-lights.html#L18-L34)
1. [Create pull request](https://help.github.com/articles/creating-a-pull-request/) with updated file
1. Merge the pull request into master. Change should be automatically pushed to target server
