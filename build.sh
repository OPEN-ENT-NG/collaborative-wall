#!/bin/bash

# If DEBUG env var is set to "true" then set -x to enable debug mode
if [ "$DEBUG" == "true" ]; then
	set -x
	EDIFICE_CLI_DEBUG_OPTION="--debug"
else
	EDIFICE_CLI_DEBUG_OPTION=""
fi

init() {
  me=`id -u`:`id -g`
  echo "DEFAULT_DOCKER_USER=$me" > .env

  # If CLI_VERSION is empty set to latest
  if [ -z "$CLI_VERSION" ]; then
    CLI_VERSION="latest"
  fi
  # Create a build.compose.yaml file from following template
  cat <<EOF > build.compose.yaml
services:
  edifice-cli:
    image: opendigitaleducation/edifice-cli:$CLI_VERSION
    user: "$DEFAULT_DOCKER_USER"
EOF
  # Copy /root/edifice from edifice-cli container to host machine
  docker compose -f build.compose.yaml create edifice-cli
  docker compose -f build.compose.yaml cp edifice-cli:/root/edifice ./edifice
  docker compose -f build.compose.yaml rm -fsv edifice-cli
  rm -f build.compose.yaml
  chmod +x edifice
  ./edifice version $EDIFICE_CLI_DEBUG_OPTION
}

# If called without arguments, run the full local build
if [ "$#" -eq 0 ]; then
  # Frontend
  cd frontend
  ./build.sh --no-docker clean init build
  cd ..

  # Create directory structure and copy frontend dist
  cd backend
  find ./src/main/resources/public/ -maxdepth 1 -type f -exec rm -f {} +
  cp -R ../frontend/dist/* ./src/main/resources/

  # Copy Files
  mv ./src/main/resources/img/* ./src/main/resources/public/img
  mv ./src/main/resources/*.html ./src/main/resources/view

  # Build .
  ./build.sh --no-docker clean build

  # Clean up - remove frontend/dist and backend/src/main/resources
  rm -rf ../frontend/dist
  exit 0
fi

if [ ! -e .env ]; then
  init
fi

for param in "$@"
do
  case $param in
    init)
      init
      ;;
    *)
      echo "Invalid argument : $param"
  esac
  if [ ! $? -eq 0 ]; then
    exit 1
  fi
done