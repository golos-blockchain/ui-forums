const {
    override,
    removeModuleScopePlugin
} = require('customize-cra');

const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

function rewireInlinSourcePlugin(config) {
    let htmlWebpackPluginIndex = null;
    config.plugins.map((plugin, index) => {
        if (plugin.constructor.name === 'HtmlWebpackPlugin') {
            htmlWebpackPluginIndex = index;
        }
    });

    if (htmlWebpackPluginIndex !== null) {
        const htmlWebpackPlugin = config.plugins[htmlWebpackPluginIndex].constructor;
        config.plugins[htmlWebpackPluginIndex].options.inlineSource = '.(css)$';
        config.plugins.splice(htmlWebpackPluginIndex, 0, new HtmlWebpackInlineSourcePlugin(htmlWebpackPlugin));
    }

    return config;
}


module.exports = function override(config, env) {
    config = rewireInlinSourcePlugin(config);
    removeModuleScopePlugin()(config);
    return config;
}
