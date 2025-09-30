"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "defaultPlaywrightConfig", {
    enumerable: true,
    get: function() {
        return defaultPlaywrightConfig;
    }
});
const _test = require("@playwright/test");
const defaultPlaywrightConfig = {
    testMatch: '{app,pages}/**/*.spec.{t,j}s',
    fullyParallel: true,
    forbidOnly: process.env.CI === 'true',
    retries: process.env.CI === 'true' ? 2 : 0,
    reporter: [
        [
            'list'
        ],
        [
            'html',
            {
                open: 'never'
            }
        ]
    ],
    use: {
        baseURL: 'http://127.0.0.1:3000',
        trace: 'on-first-retry'
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ..._test.devices['Desktop Chrome']
            }
        },
        {
            name: 'firefox',
            use: {
                ..._test.devices['Desktop Firefox']
            }
        },
        {
            name: 'webkit',
            use: {
                ..._test.devices['Desktop Safari']
            }
        }
    ],
    webServer: {
        command: process.env.CI === 'true' ? 'next start' : 'next dev',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: process.env.CI !== 'true'
    }
};

//# sourceMappingURL=default-config.js.map