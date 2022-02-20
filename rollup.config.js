import babel from 'rollup-plugin-babel';

module.exports = {
    moduleName: 'interactiveSankey',
    entry: './src/index.js',
    dest: './interactiveSankey.js',
    format: 'umd',
    globals: {
        d3: 'd3',
        webcharts: 'webCharts'
    },
    external: (function() {
        var dependencies = require('./package.json').dependencies;

        return Object.keys(dependencies);
    }()),
    plugins: [
        babel(
            {
                "presets": [
                    [
                        "es2015",
                        {
                            "modules": false
                        }
                    ]
                ],
                "plugins": [
                    "external-helpers"
                ],
                "exclude": "node_modules/**"
            })
    ]
};
