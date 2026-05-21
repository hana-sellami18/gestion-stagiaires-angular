pipeline {
    agent any

    environment {
        IMAGE_NAME = 'asm-frontend'
        IMAGE_TAG  = '1.0'
        CONTAINER_NAME = 'asm-frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '>>> Récupération du code Angular depuis GitHub'
                checkout scm
            }
        }

        stage('Verify Files') {
            steps {
                echo '>>> Vérification des fichiers essentiels'
                sh 'ls -la'
                sh 'cat package.json | head -20'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '>>> Construction de l\'image Docker Angular (Node + Nginx)'
                sh 'docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .'
            }
        }

        stage('Verify Image') {
            steps {
                echo '>>> Vérification de l\'image construite'
                sh 'docker images ${IMAGE_NAME}:${IMAGE_TAG}'
            }
        }

        stage('Stop Old Container') {
            steps {
                echo '>>> Arrêt de l\'ancien conteneur frontend (si existant)'
                sh 'docker stop ${CONTAINER_NAME} || true'
                sh 'docker rm ${CONTAINER_NAME} || true'
            }
        }

        stage('Deploy New Container') {
            steps {
                echo '>>> Démarrage du nouveau conteneur frontend'
                sh '''
                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        --network asm-network \
                        -p 4200:80 \
                        --restart unless-stopped \
                        ${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '>>> Vérification que le conteneur tourne'
                sh 'sleep 5'
                sh 'docker ps | grep ${CONTAINER_NAME}'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline frontend terminée avec succès !'
            echo '🌐 Application disponible sur http://localhost:4200'
        }
        failure {
            echo '❌ Pipeline frontend échouée — consulter les logs ci-dessus'
        }
    }
}
