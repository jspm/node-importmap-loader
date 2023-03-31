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

HAS_CHOMP=$(command -v chomp >/dev/null)
CHOMP_MSG="Please install cHOMP or ensure your version matches the chomp version within the .env file"

if $HAS_CHOMP; then
  CHOMP_LOADED_VERSION=$(command chomp --version)
  if [ "$CHOMP_LOADED_VERSION" != "$CHOMP_VERSION" ]; then
    npm install -g chomp@$CHOMP_VERSION
    echo 'chomp version updated globally'
  else
    echo "chomp version is up-to-date"
  fi
else
  echo $CHOMP_MSG
  exit 1
fi
