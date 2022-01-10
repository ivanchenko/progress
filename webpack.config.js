var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var ExtractTextPlugin = require('extract-text-webpack-plugin');


var ENV = 'develop';
var DEV_SERVER = false;


process.argv.forEach(function (arg) {
    if (arg.indexOf('webpack-dev-server') > -1) DEV_SERVER = true;
    if (arg === '-p') ENV = 'production';
});


var config = {
    entry: {
        content: ["./js/index.js", "./css/main.less"],
    },
    output: {
        path: path.join(__dirname, "/build"),
        publicPath: '/',
        filename: '[name].bundle.js',
    },
    watch: ENV === 'develop',
    watchOptions: {
        aggregateTimeOut: 100
    },
    resolve: {
        extensions: [".webpack.js", ".web.js", ".js", ".jsx", ".less"]
    },

    devtool: ENV === 'develop' ? 'none' : 'source-map',

    module: {
        rules: [{
            test: /\.jsx?$/,
            exclude: /(\/node_modules\/|\/js\/libs|\\node_modules\\|\\js\\libs)/,
            loader: 'babel-loader?cacheDirectory',
            query: {
                presets: ['es2015', 'react'],
                plugins: ['babel-plugin-transform-class-properties']
            }
        }, {
            test: /\.(css|less)$/i,
            loader: DEV_SERVER ?
                'style-loader!css-loader!less-loader?{"relativeUrls": "true", "javascriptEnabled": "true"}'
                :
                ExtractTextPlugin.extract('css-loader!less-loader?{"relativeUrls": "true", "javascriptEnabled": "true"}'),
        }, {
            test: /\.json$/,
            loader: 'json-loader'
        }, {
            test: /\.html$/,
            loader: "ejs-loader"
        }, {
            test: /\.(png|jpg|svg|gif)?$/,
            loader: 'url-loader?name=[path][name].[ext]',
            exclude: /\/fonts\//,
        }, {
            test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
            loader: 'url-loader?name=[path][name].[ext]&mimetype=image/svg+xml',
        }, {
            test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
            loader: 'url-loader?name=[path][name].[ext]&mimetype=application/font-woff',
        }, {
            test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
            loader: 'url-loader?name=[path][name].[ext]&mimetype=application/font-woff',
        }, {
            test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
            loader: 'url-loader?name=[path][name].[ext]&mimetype=application/octet-stream'
        }, {
            test: /\.(eot|otf)(\?v=\d+\.\d+\.\d+)?$/,
            loader: 'url-loader?name=[path][name].[ext]'
        },
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            'window.$': "jquery",
        }),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify(ENV)
            }
        }),
        new ExtractTextPlugin('[name].bundle.css'),
    ],
    devServer: {
        host: '127.0.0.1',
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    }
};


if (ENV === 'production') {
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                drop_console: true,
                unsafe: true
            },
            sourceMap: true
        })
    );

    // config.plugins.push(
    //     new RollbarSourceMapPlugin({
    //         accessToken: siteConfigs.get('rollbar:server'),
    //         version: COMMIT,
    //         publicPath: 'http://dev.joinposter.com/public'
    //     })
    // );
}


module.exports = config;
