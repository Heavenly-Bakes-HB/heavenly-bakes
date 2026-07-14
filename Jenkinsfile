pipeline {

    agent any

    environment {
        DOCKER_HUB = "sherbia"
        BACKEND_IMAGE = "${DOCKER_HUB}/heavenly-backend"
        FRONTEND_IMAGE = "${DOCKER_HUB}/heavenly-frontend"
    }

    stages {

        stage('Checkout Source') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend Image') {
            steps {
                sh '''
                docker build -t $BACKEND_IMAGE:latest ./backend
                '''
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh '''
                docker build -t $FRONTEND_IMAGE:latest ./frontend
                '''
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: '415c5874-5e1c-4e00-bba8-1531bf3fc78e',
                    usernameVariable: 'DOCKER_USERNAME',
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {

                    sh '''
                    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
                    '''
                }
            }
        }

        stage('Push Backend Image') {
            steps {
                sh '''
                docker push $BACKEND_IMAGE:latest
                '''
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh '''
                docker push $FRONTEND_IMAGE:latest
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                docker compose down
                docker compose up -d 
                '''
            }
        }

    }

    post {

        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed.'
        }

    }

}