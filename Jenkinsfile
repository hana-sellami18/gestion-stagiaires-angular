pipeline {
    agent any
    environment {
        VM_HOST = '192.168.56.103'
        VM_USER = 'asm'
    }
    stages {
        stage('Deploy Frontend to VM') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'vm-asm-ssh', keyFileVariable: 'SSH_KEY')]) {
                    bat """
                        icacls "%SSH_KEY%" /inheritance:r
                        icacls "%SSH_KEY%" /grant:r SYSTEM:F
                        ssh -i "%SSH_KEY%" -o StrictHostKeyChecking=no ${VM_USER}@${VM_HOST} "cd ~/gestion-stagiaires-angular && git pull && cd ~ && docker-compose up -d --build frontend"
                    """
                }
            }
        }
        stage('Verify') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'vm-asm-ssh', keyFileVariable: 'SSH_KEY')]) {
                    bat """
                        icacls "%SSH_KEY%" /inheritance:r
                        icacls "%SSH_KEY%" /grant:r SYSTEM:F
                        ssh -i "%SSH_KEY%" -o StrictHostKeyChecking=no ${VM_USER}@${VM_HOST} "docker ps"
                    """
                }
            }
        }
    }
    post {
        success { echo "Frontend deploye avec succes sur http://${VM_HOST}" }
        failure { echo "Echec du deploiement frontend" }
    }
}
