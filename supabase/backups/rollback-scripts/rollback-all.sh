#!/bin/bash

# ============================================================================
# MASTER ROLLBACK SCRIPT - SUPABASE RLS IMPLEMENTATION
# Generated: 2025-01-19
# Purpose: Complete rollback of all RLS changes to restore original state
# ============================================================================

set -e  # Exit on any error

echo "============================================================================"
echo "SUPABASE RLS ROLLBACK - MASTER SCRIPT"
echo "Generated: 2025-01-19"
echo "WARNING: This will rollback ALL RLS changes and restore original state"
echo "============================================================================"

# Configuration
BACKUP_DIR="supabase/backups/2025-01-19-pre-rls"
ROLLBACK_DIR="supabase/backups/rollback-scripts"
LOG_FILE="rollback_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log messages
log_message() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1" | tee -a "$LOG_FILE"
}

# Function to check if Supabase CLI is available
check_supabase_cli() {
    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI not found. Please install it first."
        echo "Install with: npm install -g supabase"
        exit 1
    fi
    log_success "Supabase CLI found"
}

# Function to confirm rollback
confirm_rollback() {
    echo ""
    echo -e "${RED}⚠️  CRITICAL WARNING ⚠️${NC}"
    echo "This script will:"
    echo "  1. DISABLE RLS on 9 critical tables (users, user_sessions, etc.)"
    echo "  2. RESTORE all 24 SECURITY DEFINER functions to INSECURE state"
    echo "  3. ROLLBACK any schema changes made during RLS implementation"
    echo "  4. REMOVE any new policies created during implementation"
    echo ""
    echo "This will restore the ORIGINAL INSECURE state with known vulnerabilities!"
    echo ""
    read -p "Are you absolutely sure you want to proceed? (type 'ROLLBACK' to confirm): " confirmation
    
    if [ "$confirmation" != "ROLLBACK" ]; then
        log_message "Rollback cancelled by user"
        exit 0
    fi
    
    echo ""
    log_warning "User confirmed rollback. Proceeding..."
}

# Function to create backup of current state before rollback
create_pre_rollback_backup() {
    log_message "Creating pre-rollback backup of current state..."
    
    CURRENT_BACKUP_DIR="supabase/backups/pre-rollback-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$CURRENT_BACKUP_DIR"
    
    # Export current RLS status
    log_message "Backing up current RLS status..."
    supabase db remote commit --message "Pre-rollback backup" || log_warning "Could not create remote commit"
    
    # Export current schema
    if command -v pg_dump &> /dev/null; then
        log_message "Creating schema dump..."
        pg_dump --schema-only --no-owner --no-privileges "$DATABASE_URL" > "$CURRENT_BACKUP_DIR/current_schema.sql" 2>/dev/null || log_warning "Could not create schema dump"
    fi
    
    log_success "Pre-rollback backup created in $CURRENT_BACKUP_DIR"
}

# Function to execute SQL file
execute_sql_file() {
    local sql_file="$1"
    local description="$2"
    
    log_message "Executing: $description"
    log_message "File: $sql_file"
    
    if [ ! -f "$sql_file" ]; then
        log_error "SQL file not found: $sql_file"
        return 1
    fi
    
    # Execute using Supabase CLI
    if supabase db reset --db-url "$DATABASE_URL" --force 2>/dev/null; then
        log_message "Using supabase db reset method"
        supabase db push --db-url "$DATABASE_URL" --include "$sql_file" 2>&1 | tee -a "$LOG_FILE"
    else
        # Fallback to psql if available and DATABASE_URL is set
        if [ -n "$DATABASE_URL" ] && command -v psql &> /dev/null; then
            log_message "Using psql fallback method"
            psql "$DATABASE_URL" -f "$sql_file" 2>&1 | tee -a "$LOG_FILE"
        else
            log_warning "Please execute the following SQL file manually:"
            log_warning "$sql_file"
            echo ""
            echo "Press Enter when you have executed the file..."
            read -r
        fi
    fi
    
    if [ $? -eq 0 ]; then
        log_success "$description completed"
        return 0
    else
        log_error "$description failed"
        return 1
    fi
}

# Function to validate rollback
validate_rollback() {
    log_message "Validating rollback results..."
    
    # Check if validation queries can be run
    if [ -n "$DATABASE_URL" ] && command -v psql &> /dev/null; then
        log_message "Running validation queries..."
        
        # Create validation script
        cat > "validate_rollback.sql" << 'EOF'
-- Validation queries for rollback
\echo 'Checking RLS status for critical tables...'
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status,
    CASE 
        WHEN tablename IN ('users', 'user_sessions', 'user_performance', 'ai_model_configs', 
                          'api_rate_limits', 'auth_session_monitoring', 'contact_embeddings',
                          'real_time_presence', 'system_logs') 
        THEN 'Should be DISABLED'
        ELSE 'Should be ENABLED'
    END as expected_status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'user_sessions', 'user_performance', 'ai_model_configs',
    'api_rate_limits', 'auth_session_monitoring', 'contact_embeddings', 
    'real_time_presence', 'system_logs', 'meeting_participants'
  )
ORDER BY tablename;

\echo 'Checking SECURITY DEFINER function count...'
SELECT COUNT(*) as security_definer_functions
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND p.prosecdef = true;

\echo 'Checking core function existence...'
SELECT proname as function_name, prosecdef as is_security_definer
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname IN ('get_user_organization', 'get_user_role', 'is_session_valid')
ORDER BY proname;
EOF
        
        psql "$DATABASE_URL" -f "validate_rollback.sql" 2>&1 | tee -a "$LOG_FILE"
        rm -f "validate_rollback.sql"
        
        log_success "Validation queries executed - check output above"
    else
        log_warning "Cannot run automated validation. Please verify manually:"
        echo "  1. Check that 9 critical tables have RLS DISABLED"
        echo "  2. Check that SECURITY DEFINER functions work"
        echo "  3. Test application functionality"
        echo "  4. Verify meeting_participants table structure"
    fi
}

# Function to show post-rollback instructions
show_post_rollback_instructions() {
    echo ""
    echo "============================================================================"
    echo -e "${GREEN}ROLLBACK COMPLETED${NC}"
    echo "============================================================================"
    echo ""
    echo "⚠️  IMPORTANT: Your database is now in the original INSECURE state!"
    echo ""
    echo "Security vulnerabilities restored:"
    echo "  • 9 tables have RLS DISABLED (data not protected)"
    echo "  • 24 SECURITY DEFINER functions lack search_path (security risk)"
    echo "  • Original authentication bypasses are active"
    echo ""
    echo "Next steps:"
    echo "  1. Test application functionality thoroughly"
    echo "  2. Verify all features work as before RLS implementation"
    echo "  3. Check performance is back to normal"
    echo "  4. Monitor error logs for any issues"
    echo "  5. Consider re-implementing RLS with fixes for discovered issues"
    echo ""
    echo "Backup files location:"
    echo "  • Original backup: $BACKUP_DIR"
    echo "  • Rollback scripts: $ROLLBACK_DIR"  
    echo "  • Rollback log: $LOG_FILE"
    echo ""
    echo "If issues persist:"
    echo "  • Check the rollback log: $LOG_FILE"
    echo "  • Review backup files for manual restoration"
    echo "  • Contact support with log file and error details"
    echo ""
    echo "============================================================================"
}

# Main execution
main() {
    log_message "Starting Supabase RLS rollback process..."
    
    # Pre-flight checks
    check_supabase_cli
    
    # Check if backup files exist
    if [ ! -d "$BACKUP_DIR" ]; then
        log_error "Backup directory not found: $BACKUP_DIR"
        log_error "Cannot proceed without backup files"
        exit 1
    fi
    
    if [ ! -d "$ROLLBACK_DIR" ]; then
        log_error "Rollback scripts directory not found: $ROLLBACK_DIR"
        exit 1
    fi
    
    # Confirm with user
    confirm_rollback
    
    # Create pre-rollback backup
    create_pre_rollback_backup
    
    echo ""
    log_message "Starting rollback execution..."
    
    # Execute rollback scripts in order
    echo ""
    log_message "Step 1/3: Rolling back RLS policies and settings..."
    if ! execute_sql_file "$ROLLBACK_DIR/01-rollback-rls.sql" "RLS Rollback"; then
        log_error "RLS rollback failed. Check logs and fix before continuing."
        exit 1
    fi
    
    echo ""
    log_message "Step 2/3: Rolling back SECURITY DEFINER functions..."
    if ! execute_sql_file "$ROLLBACK_DIR/02-rollback-functions.sql" "Function Rollback"; then
        log_error "Function rollback failed. Check logs and fix before continuing."
        exit 1
    fi
    
    echo ""
    log_message "Step 3/3: Rolling back schema changes..."
    if ! execute_sql_file "$ROLLBACK_DIR/03-rollback-schemas.sql" "Schema Rollback"; then
        log_error "Schema rollback failed. Check logs and fix before continuing."
        exit 1
    fi
    
    echo ""
    log_message "All rollback scripts executed successfully"
    
    # Validate rollback
    echo ""
    validate_rollback
    
    # Show completion message
    show_post_rollback_instructions
    
    log_success "Rollback process completed successfully"
}

# Trap to handle interruptions
trap 'log_error "Rollback interrupted by user"; exit 1' INT TERM

# Run main function
main "$@"