pipeline {
    agent any

    stages {
        stage('Pull code') {
            steps {
                sh 'git reset --hard'
                sh 'git pull origin master'
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Restart PM2') {
            steps {
                sh 'pm2 restart all || pm2 start ecosystem.config.js'
            }
        }
    }
}
