#!/usr/bin/env groovy

pipeline {
    agent any

    environment {
        NPM_TOKEN = credentials('npm-token')
        TIPTAP_PRO_TOKEN = credentials('tiptap-pro-token')
    }
    
    stages {
      stage("Initialization") {
        steps {
          script {
            def version = sh(returnStdout: true, script: 'cd backend && docker run --rm -u `id -u`:`id -g` --env MAVEN_CONFIG=/var/maven/.m2 -w /usr/src/maven -v ./:/usr/src/maven -v ~/.m2:/var/maven/.m2  opendigitaleducation/mvn-java8-node20:latest mvn -Duser.home=/var/maven help:evaluate -Dexpression=project.version -DforceStdout -q')
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
        stage('Build image') {
            steps {
                sh 'cd backend && ./edifice image --rebuild=false'
            }
        }
    }
    post {
        cleanup {
            sh 'cd backend && (docker-compose down || true) && cd ../frontend && (docker-compose down || true)'
        }
    }
}

