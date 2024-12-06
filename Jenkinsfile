#!/usr/bin/env groovy

pipeline {
  agent any
    stages {
      stage("Initialization") {
        steps {
          script {
            def version = sh(returnStdout: true, script: 'cd backend && docker compose run --rm maven mvn $MVN_OPTS help:evaluate -Dexpression=project.version -q -DforceStdout')
            buildName "${env.GIT_BRANCH.replace("origin/", "")}@${version}"
          }
        }
      }
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
          sh 'find ./src/main/resources/public/ -maxdepth 1 -type f -exec rm -f {} +'
                    sh 'cp -R ../frontend/dist/* ./src/main/resources/'
                    sh 'mv ./src/main/resources/img/* ./src/main/resources/public/img'
                    sh 'mv ./src/main/resources/*.html ./src/main/resources/view'
                    sh './build.sh init clean build publish'
                    sh 'rm -rf ../frontend/dist'
                }
            }
        }
    }
    post {
        cleanup {
            sh 'cd backend && docker-compose down && cd ../frontend && docker-compose down'
        }
    }
}

