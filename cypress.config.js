const { defineConfig } = require('cypress')

module.exports = defineConfig({
  viewportWidth: 1366,
  viewportHeight: 768,
  video: false,
  projectId: '32qpmp',
  chromeWebSecurity: false,
  env: {
    AUDIT_API: 'http://10.202.41.134:9999/audit',
    LS_GTM_API: 'http://10.202.41.134:8901/receiver/gtm',
    LS_WS_API: 'http://10.202.41.134:8901/ws/SubmissionReceiver',
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    experimentalSessionAndOrigin: true,
    baseUrl: 'http://10.202.41.136',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
})
