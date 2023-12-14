#!/usr/bin/env groovy

pipeline {
  agent any

  stages {
    stage('Frontend') {
      steps {
        dir('frontend') {
          sh './build.sh clean init build'
        }
      }
    }
    
    stage('Backend') {
      steps {
        dir('backend') {
          sh 'mkdir -p ./src/main/resources/public/ || TRUE'
          sh 'cp -R ../frontend/dist/* ./src/main/resources/'
          sh 'mkdir -p ./src/main/resources/view'
          sh 'mv ./src/main/resources/*.html ./src/main/resources/view'
          sh 'cp -R ./src/main/resources/notify ./src/main/resources/view/notify'
          sh './build.sh clean build publish'
          sh 'rm -rf ../frontend/dist'
        }
      }
    }
  }
}