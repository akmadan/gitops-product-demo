#!/bin/bash

# GitHub Actions Secrets Setup Helper
# This script helps configure required secrets in GitHub repository

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI not found. Please install it from https://cli.github.com"
        exit 1
    fi
    print_success "GitHub CLI found"
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl not found. Please install it from https://kubernetes.io/docs/tasks/tools/"
        exit 1
    fi
    print_success "kubectl found"
    
    if ! gh auth status &> /dev/null; then
        print_error "Not authenticated with GitHub. Run 'gh auth login' first"
        exit 1
    fi
    print_success "Authenticated with GitHub"
}

# Set kubeconfig secrets
setup_kubeconfig_secrets() {
    print_header "Setting Up Kubeconfig Secrets"
    
    local environments=("dev" "qa" "preprod" "prod-na" "prod-eu" "prod-apac")
    
    for env in "${environments[@]}"; do
        echo ""
        print_info "Setting up kubeconfig for $env environment"
        print_info "Provide the kubeconfig path for $env cluster (or press Enter to skip)"
        
        read -p "Kubeconfig path for $env: " kubeconfig_path
        
        if [ -z "$kubeconfig_path" ]; then
            print_warning "Skipping $env kubeconfig"
            continue
        fi
        
        if [ ! -f "$kubeconfig_path" ]; then
            print_error "File not found: $kubeconfig_path"
            continue
        fi
        
        # Encode kubeconfig to base64
        local encoded=$(cat "$kubeconfig_path" | base64)
        
        # Set GitHub secret
        echo "$encoded" | gh secret set KUBE_CONFIG_${env^^} --body-file -
        
        print_success "Set KUBE_CONFIG_${env^^}"
    done
}

# Set ArgoCD secrets
setup_argocd_secrets() {
    print_header "Setting Up ArgoCD Secrets"
    
    echo ""
    print_info "Enter ArgoCD credentials"
    print_info "Get these from: kubectl -n argocd get secret argocd-initial-admin-secret"
    
    read -sp "ArgoCD Username: " argocd_username
    echo ""
    read -sp "ArgoCD Password: " argocd_password
    echo ""
    
    if [ -z "$argocd_username" ] || [ -z "$argocd_password" ]; then
        print_error "ArgoCD credentials are required"
        return 1
    fi
    
    echo "$argocd_username" | gh secret set ARGOCD_USERNAME --body-file -
    echo "$argocd_password" | gh secret set ARGOCD_PASSWORD --body-file -
    
    print_success "Set ARGOCD_USERNAME"
    print_success "Set ARGOCD_PASSWORD"
    
    # Set ArgoCD server URLs
    echo ""
    print_info "Setting ArgoCD server URLs for each environment"
    
    local environments=("dev" "qa" "preprod" "prod-na" "prod-eu" "prod-apac")
    
    for env in "${environments[@]}"; do
        echo ""
        read -p "ArgoCD server URL for $env (e.g., argocd.example.com): " server_url
        
        if [ -z "$server_url" ]; then
            print_warning "Skipping ArgoCD server URL for $env"
            continue
        fi
        
        echo "$server_url" | gh secret set ARGOCD_SERVER_${env^^} --body-file -
        print_success "Set ARGOCD_SERVER_${env^^}"
    done
}

# Set Slack webhook
setup_slack_webhook() {
    print_header "Setting Up Slack Webhook (Optional)"
    
    echo ""
    print_info "Slack webhook is optional for notifications"
    read -p "Do you want to configure Slack notifications? (y/n): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Skipping Slack webhook setup"
        return
    fi
    
    print_info "Create a Slack webhook:"
    print_info "1. Go to https://api.slack.com/apps"
    print_info "2. Create New App or select existing one"
    print_info "3. Enable 'Incoming Webhooks'"
    print_info "4. Create New Webhook to Workspace"
    print_info "5. Copy the webhook URL"
    
    echo ""
    read -sp "Slack Webhook URL: " slack_webhook
    echo ""
    
    if [ -z "$slack_webhook" ]; then
        print_warning "Skipping Slack webhook"
        return
    fi
    
    echo "$slack_webhook" | gh secret set SLACK_WEBHOOK --body-file -
    print_success "Set SLACK_WEBHOOK"
}

# Verify secrets
verify_secrets() {
    print_header "Verifying Configured Secrets"
    
    local secrets=$(gh secret list --limit 100)
    
    local required_secrets=(
        "KUBE_CONFIG_DEV"
        "KUBE_CONFIG_QA"
        "ARGOCD_USERNAME"
        "ARGOCD_PASSWORD"
        "ARGOCD_SERVER_DEV"
    )
    
    local all_configured=true
    
    for secret in "${required_secrets[@]}"; do
        if echo "$secrets" | grep -q "$secret"; then
            print_success "✓ $secret"
        else
            print_warning "✗ $secret (optional)"
            all_configured=false
        fi
    done
    
    if [ "$all_configured" = true ]; then
        print_success "All required secrets are configured!"
    else
        print_warning "Some secrets are missing. The workflow may fail without them."
    fi
    
    echo ""
    echo "All configured secrets:"
    gh secret list --limit 100 | grep -E "KUBE_CONFIG|ARGOCD|SLACK" || print_warning "No workflow secrets found"
}

# Setup environments
setup_github_environments() {
    print_header "Setting Up GitHub Environments"
    
    print_info "GitHub Environments help protect production deployments"
    print_info "This is an optional step - you can configure manually in Settings > Environments"
    
    echo ""
    read -p "Do you want to create GitHub environments? (y/n): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Skipping GitHub environments setup"
        return
    fi
    
    print_info "Note: GitHub environment creation via CLI is not yet supported"
    print_info "Please set up manually:"
    print_info "1. Go to Settings > Environments"
    print_info "2. Create these environments: development, qa, production"
    print_info "3. For production: Add required reviewers"
}

# Display summary
display_summary() {
    print_header "Setup Complete!"
    
    cat << EOF

${GREEN}Next Steps:${NC}

1. ${BLUE}Update GitHub Repository${NC}
   - Push these changes to your repository:
   ${YELLOW}git add .github/workflows/${NC}
   ${YELLOW}git commit -m "Add ArgoCD deployment pipeline"${NC}
   ${YELLOW}git push${NC}

2. ${BLUE}Verify Workflow Runs${NC}
   - Go to Actions tab in GitHub
   - Trigger workflow manually or push to develop/main branch

3. ${BLUE}Monitor First Deployment${NC}
   - Check workflow logs for any errors
   - Verify applications are syncing in ArgoCD

4. ${BLUE}Configure GitHub Environments (Recommended)${NC}
   - Settings > Environments
   - Add required reviewers for 'production' environment
   - Set branch protection rules for 'main' branch

${BLUE}Documentation:${NC}
   - See .github/workflows/DEPLOYMENT_GUIDE.md for detailed setup
   - See README.md for project overview

${BLUE}Useful Commands:${NC}
   # Test workflow locally
   ${YELLOW}act -j validate-manifests${NC}
   
   # View all secrets
   ${YELLOW}gh secret list${NC}
   
   # View workflow status
   ${YELLOW}gh run list -w argo-deployment.yml${NC}

EOF
}

# Main menu
main_menu() {
    print_header "GitHub Actions - Argo CD Deployment Setup"
    
    echo ""
    echo "This script will help you configure secrets required for the ArgoCD deployment pipeline."
    echo ""
    
    while true; do
        echo ""
        echo "Setup Options:"
        echo "1. Setup all secrets (recommended)"
        echo "2. Setup Kubeconfig secrets only"
        echo "3. Setup ArgoCD secrets only"
        echo "4. Setup Slack webhook"
        echo "5. Verify configured secrets"
        echo "6. Setup GitHub Environments"
        echo "7. Exit"
        echo ""
        read -p "Select option (1-7): " option
        
        case $option in
            1)
                setup_kubeconfig_secrets
                setup_argocd_secrets
                setup_slack_webhook
                verify_secrets
                ;;
            2)
                setup_kubeconfig_secrets
                ;;
            3)
                setup_argocd_secrets
                ;;
            4)
                setup_slack_webhook
                ;;
            5)
                verify_secrets
                ;;
            6)
                setup_github_environments
                ;;
            7)
                display_summary
                exit 0
                ;;
            *)
                print_error "Invalid option. Please try again."
                ;;
        esac
    done
}

# Entry point
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    check_prerequisites
    main_menu
fi
