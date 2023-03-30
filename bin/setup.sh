#!/bin/sh

if [ ! -f .env ]; then
  cp .env_starter .env
  echo "created .env file from .env_starter"
  export $(grep -v '^#' .env | xargs)
else
  export $(grep -v '^#' .env | xargs)
fi

HAS_NVM=$(command -v nvm >/dev/null)

# Check to see if Homebrew, Go, and Pre-commit are installed, and install it if it is not
if $HAS_NVM; then
  if [ "$NODE_ENV" == "local" ]; then
    . ~/.nvm/nvm.sh install
  else
    nvm i
  fi
  echo 'node version is up-to-date'
else
  echo "Please install NVM or ensure your version matches the .nvmrc file"
  exit 1
fi

HAS_BUN=$(command -v bun >/dev/null)
BUN_MSG="Please install bun or ensure your version matches the bun version within the .env file"

if $HAS_BUN; then
  BUN_LOADED_VERSION=$(command bun --version)
  if [ "$BUN_LOADED_VERSION" != "$BUN_VERSION" ]; then
    read -r -p "bun versions are out of snyc. Run 'npm install -g bun@${BUN_VERSION}'? [Y/n]" response
    response=${response,,}
    if [ $response = "y" ] || [ -z $response ]; then
      npm install -g bun@$BUN_VERSION
      echo 'pnpm version updated globally'
    else
      echo $BUN_MSG
      exit 1
    fi;
  else
    echo "bun version is up-to-date"
  fi
else
  echo $BUN_MSG
  exit 1
fi
