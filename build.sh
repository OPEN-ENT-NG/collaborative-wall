#!/bin/bash

if [ ! -e node_modules ]
then
  mkdir node_modules
fi

if [ -z ${USER_UID:+x} ]
then
  export USER_UID=1000
  export GROUP_GID=1000
fi

if [ "$1" == "clean" ]
then
  docker-compose run --rm -u "$USER_UID:$GROUP_GID" gradle gradle clean
fi
if [ $? -eq 0 ]
then
  docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "npm install && npm update entcore && node_modules/gulp/bin/gulp.js build" && docker-compose run --rm -u "$USER_UID:$GROUP_GID" gradle gradle shadowJar install publishToMavenLocal
fi
if [ $? -eq 0 ]
then
  if [ "$2" == "publish" ]
  then
    if [ -e "?/.gradle" ] && [ ! -e "?/.gradle/gradle.properties" ]
    then
      echo "odeUsername=$NEXUS_ODE_USERNAME" > "?/.gradle/gradle.properties"
      echo "odePassword=$NEXUS_ODE_PASSWORD" >> "?/.gradle/gradle.properties"
      echo "sonatypeUsername=$NEXUS_SONATYPE_USERNAME" >> "?/.gradle/gradle.properties"
      echo "sonatypePassword=$NEXUS_SONATYPE_PASSWORD" >> "?/.gradle/gradle.properties"
    fi
    docker-compose run --rm -u "$USER_UID:$GROUP_GID" gradle gradle publish
  fi
fi

