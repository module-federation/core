#!/bin/bash

# Monitor CI status for PR 3736 every 30 seconds for 8 minutes
# Focus on checkout-install job and modernjs test failures

PR_NUMBER=3736
MONITORING_DURATION=480  # 8 minutes in seconds
CHECK_INTERVAL=30        # 30 seconds
START_TIME=$(date +%s)
END_TIME=$((START_TIME + MONITORING_DURATION))

echo "Starting CI monitoring for PR $PR_NUMBER at $(date)"
echo "Will monitor for $MONITORING_DURATION seconds (8 minutes)"
echo "Checking every $CHECK_INTERVAL seconds"
echo "Focusing on checkout-install job and modernjs test status"
echo "----------------------------------------"

# Function to check PR status
check_pr_status() {
    local current_time=$(date +%s)
    local elapsed=$((current_time - START_TIME))
    
    echo "[$(date '+%H:%M:%S')] Checking PR status (${elapsed}s elapsed)..."
    
    # Get PR status
    gh pr view $PR_NUMBER --json statusCheckRollup > /tmp/pr_status.json
    
    # Check if checkout-install job exists and get its status
    local checkout_status=$(cat /tmp/pr_status.json | jq -r '.statusCheckRollup[] | select(.name=="checkout-install") | .status')
    local checkout_conclusion=$(cat /tmp/pr_status.json | jq -r '.statusCheckRollup[] | select(.name=="checkout-install") | .conclusion')
    local checkout_url=$(cat /tmp/pr_status.json | jq -r '.statusCheckRollup[] | select(.name=="checkout-install") | .detailsUrl')
    
    if [[ "$checkout_status" != "null" && "$checkout_status" != "" ]]; then
        echo "  checkout-install job: $checkout_status"
        if [[ "$checkout_conclusion" != "null" && "$checkout_conclusion" != "" ]]; then
            echo "  checkout-install conclusion: $checkout_conclusion"
        fi
        echo "  Details: $checkout_url"
        
        # If job completed, check for modernjs-specific information
        if [[ "$checkout_status" == "COMPLETED" ]]; then
            echo "  ✓ checkout-install job completed with conclusion: $checkout_conclusion"
            
            # Try to get more details about the job
            if [[ "$checkout_conclusion" == "SUCCESS" ]]; then
                echo "  ✓ checkout-install job PASSED! Modernjs tests likely succeeded."
                return 0  # Success, stop monitoring
            elif [[ "$checkout_conclusion" == "FAILURE" ]]; then
                echo "  ✗ checkout-install job FAILED. Checking for modernjs test failures..."
                # Could add more specific log checking here if needed
                return 1  # Failed, but continue monitoring in case of retry
            fi
        fi
    else
        echo "  checkout-install job not found in current status"
    fi
    
    # Show summary of all jobs
    echo "  All jobs status:"
    cat /tmp/pr_status.json | jq -r '.statusCheckRollup[] | "    \(.name): \(.status) \(if .conclusion != null and .conclusion != "" then "(\(.conclusion))" else "" end)"'
    
    return 2  # Continue monitoring
}

# Initial status check
check_pr_status
initial_result=$?

if [[ $initial_result -eq 0 ]]; then
    echo "✓ checkout-install job already completed successfully!"
    exit 0
fi

# Monitor loop
while [[ $(date +%s) -lt $END_TIME ]]; do
    sleep $CHECK_INTERVAL
    
    check_pr_status
    result=$?
    
    if [[ $result -eq 0 ]]; then
        echo "✓ Status change detected: checkout-install job completed successfully!"
        echo "✓ Modernjs tests likely passed in CI environment"
        exit 0
    fi
    
    echo "----------------------------------------"
done

echo "Monitoring period completed (8 minutes elapsed)"
echo "Final status check..."
check_pr_status
final_result=$?

if [[ $final_result -eq 0 ]]; then
    echo "✓ checkout-install job completed successfully during monitoring period!"
else
    echo "ℹ checkout-install job still in progress or failed after 8 minutes of monitoring"
fi