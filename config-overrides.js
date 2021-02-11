
const rewireInlinSource = require('react-app-rewire-inline-source-plugin');
const {
	override,
	removeModuleScopePlugin
} = require('customize-cra');

module.exports = function override (config, env) {
    config = rewireInlinSource(config);
    removeModuleScopePlugin()(config);
    return config;
}
