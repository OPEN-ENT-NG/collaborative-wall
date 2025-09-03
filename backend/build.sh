#!/bin/bash

# Params
NO_DOCKER=""
for i in "$@"
do
case $i in
  --no-docker*)
  NO_DOCKER="true"
  shift
  ;;
  *)
  ;;
esac
done

MVN_OPTS="-Duser.home=/var/maven"

if [ ! -e node_modules ]
then
  mkdir node_modules
fi

case `uname -s` in
  MINGW* | Darwin*)
    USER_UID=1000
    GROUP_UID=1000
    ;;
  *)
    if [ -z ${USER_UID:+x} ]
    then
      USER_UID=`id -u`
      GROUP_GID=`id -g`
    fi
esac

# options
SPRINGBOARD="recette"
for i in "$@"
do
case $i in
    -s=*|--springboard=*)
    SPRINGBOARD="${i#*=}"
    shift
    ;;
    *)
    ;;
esac
done

init() {
  me=`id -u`:`id -g`
  echo "DEFAULT_DOCKER_USER=$me" > .env
}

clean () {
  echo "Cleaning..."
  if [ "$NO_DOCKER" = "true" ] ; then
    mvn clean
  else
    docker compose run --rm maven mvn $MVN_OPTS clean
  fi
  echo "Clean done!"
}

build () {
  if [ "$NO_DOCKER" = "true" ] ; then
    mvn install -DskipTests
  else
    docker compose run --rm maven mvn $MVN_OPTS install -DskipTests
  fi
}

test () {
  if [ "$NO_DOCKER" = "true" ] ; then
    mvn test
  else
    docker compose run --rm maven mvn $MVN_OPTS test
  fi
}

publish() {
  echo "Publishing..."
  if [ "$NO_DOCKER" = "true" ] ; then
    version=`mvn help:evaluate -Dexpression=project.version -q -DforceStdout`
    level=`echo $version | cut -d'-' -f3`
    case "$level" in
      *SNAPSHOT) export nexusRepository='snapshots' ;;
      *)         export nexusRepository='releases' ;;
    esac
    mvn -DrepositoryId=ode-$nexusRepository -DskipTests --settings /var/maven/.m2/settings.xml deploy
  else
    version=`docker compose run --rm maven mvn $MVN_OPTS help:evaluate -Dexpression=project.version -q -DforceStdout`
    level=`echo $version | cut -d'-' -f3`
    case "$level" in
      *SNAPSHOT) export nexusRepository='snapshots' ;;
      *)         export nexusRepository='releases' ;;
    esac

    docker compose run --rm  maven mvn $MVN_OPTS -DrepositoryId=ode-$nexusRepository -DskipTests --settings /var/maven/.m2/settings.xml deploy
  fi
}

watch () {
  docker compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "node_modules/gulp/bin/gulp.js watch --springboard=/home/node/$SPRINGBOARD"
}

for param in "$@"
do
  case $param in
    init)
      init
      ;;
    clean)
      clean
      ;;
    build)
      build
      ;;
    test)
      test
      ;;
    publish)
      publish
      ;;
    *)
      echo "Invalid argument : $param"
  esac
  if [ ! $? -eq 0 ]; then
    exit 1
  fi
done
