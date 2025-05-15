if [ "$SKIP_DEVTOOLS_POSTINSTALL" = "true" ]; then
    echo "Skipping devtools postinstall script."
    exit 0
fi

if [ "$GITHUB_ACTIONS" = "true" ]; then
    echo "Running in GitHub Actions environment."
    # Only install if cache miss was reported by the cache action
    if [ "$PLAYWRIGHT_CACHE_HIT" != "true" ]; then
        echo "Playwright cache miss, installing dependencies and browsers..."
        npx playwright install-deps && npx playwright install
    else
        npx playwright install
        echo "Using cached Playwright browsers."
    fi
else
    echo "Not running in GitHub Actions environment."
    # 在这里放置不在 GitHub Actions 环境时要执行的命令
fi
