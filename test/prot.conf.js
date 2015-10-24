// conf.js
exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['e2e/scenarios.js'],
    baseUrl: 'http://localhost:9000',
    capabilities: {
        browserName: 'firefox'
    }
}
