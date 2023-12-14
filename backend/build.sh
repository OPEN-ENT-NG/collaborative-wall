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

# Nettoyage du dossier `backend`
function clean() {
  echo "Cleaning..."
  if [ "$NO_DOCKER" = "true" ] ; then
    gradle clean
  else
    docker-compose run --rm -u "$USER_UID:$GROUP_GID" gradle gradle clean
  fi
  echo "Clean done!"
}

function build() {
  echo "Building..."
  if [ "$NO_DOCKER" = "true" ] ; then
    gradle shadowJar install publishToMavenLocal
  else
    docker-compose run --rm -u "$USER_UID:$GROUP_GID" gradle gradle shadowJar install publishToMavenLocal
  fi
  echo "Build done!"
}

function publish() {
  echo "Publishing..."
  if [ -e "?/.gradle" ] && [ ! -e "?/.gradle/gradle.properties" ]
  then
    echo "odeUsername=$NEXUS_ODE_USERNAME" > "?/.gradle/gradle.properties"
    echo "odePassword=$NEXUS_ODE_PASSWORD" >> "?/.gradle/gradle.properties"
    echo "sonatypeUsername=$NEXUS_SONATYPE_USERNAME" >> "?/.gradle/gradle.properties"
    echo "sonatypePassword=$NEXUS_SONATYPE_PASSWORD" >> "?/.gradle/gradle.properties"
  fi
  if [ "$NO_DOCKER" = "true" ] ; then
    gradle publish
  else
    docker-compose run --rm -u "$USER_UID:$GROUP_GID" gradle gradle publish
  fi
  echo "Publish done!"
}

for param in "$@"
do
  case $param in
    clean)
      clean
      ;;
    build)
      build
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