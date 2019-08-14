const appPath = process.cwd();
const path = require('path');
const paths = require('../utilities/paths');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const Webpack = require('webpack');
const GetClientEnvironment = require('../utilities/env');
const HappyPack = require('happypack');

const shouldUseSourceMap = true;
const publicPath = '/';

module.exports = function(env, isBuild, host, port) {
    process.env.PLATFORM = process.env.PLATFORM || 'desktop';
    const configExtensions = ['.ts', '.tsx', '.js', '.json'];
    const isEnvDevelopment = env === 'dev';
    const isEnvProduction = env === 'prod';
    process.env.NODE_ENV = isEnvProduction ? 'production' : 'development';
    const clientEnv = GetClientEnvironment(publicPath);
    /// Handle Platform
    const defaultExtensions = ['.ts', '.tsx', '.js', '.json'];

    defaultExtensions.forEach(extension => {
        configExtensions.unshift(`.${process.env.PLATFORM}${extension}`);
    });
    ///

    const getStyleLoaders = (cssOptions, preProcessor) => {
        const loaders = [
            isEnvDevelopment && require.resolve('style-loader'),
            isBuild && {
                loader: MiniCssExtractPlugin.loader
            },
            {
                loader: require.resolve('css-loader'),
                options: cssOptions
            },
            {
                // Options for PostCSS as we reference these options twice
                // Adds vendor prefixing based on your specified browser support in
                // package.json
                loader: require.resolve('postcss-loader'),
                options: {
                    // Necessary for external CSS imports to work
                    // https://github.com/facebook/create-react-app/issues/2677
                    ident: 'postcss',
                    plugins: () => [
                        require('postcss-flexbugs-fixes'),
                        require('postcss-preset-env')({
                            autoprefixer: {
                                flexbox: 'no-2009'
                            },
                            stage: 3
                        })
                    ],
                    sourceMap: isEnvProduction && shouldUseSourceMap
                }
            }
        ].filter(Boolean);
        if (preProcessor) {
            loaders.push({
                loader: require.resolve(preProcessor),
                options: {
                    sourceMap: isEnvProduction && shouldUseSourceMap
                }
            });
        }
        return loaders;
    };

    if (!isEnvDevelopment && !isEnvProduction) {
        isEnvDevelopment = true;
    }

    const config = {
        mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
        entry: [path.resolve(process.cwd(), 'packages/client/index.tsx')],
        output: {
            // There will be one main bundle, and one file per asynchronous chunk.
            // In development, it does not produce real files.
            filename: isBuild
                ? 'static/js/[name].[contenthash:8].js'
                : 'static/js/bundle.[hash:8].js',
            // There are also additional JS chunk files if you use code splitting.
            chunkFilename: isBuild
                ? 'static/js/[name].[contenthash:8].chunk.js'
                : 'static/js/[name].[hash:8].chunk.js',
            // We inferred the "public path" (such as / or /my-project) from homepage.
            // We use "/" in development.
            publicPath: publicPath,
            path: path.resolve(appPath, 'build')
        },
        // Enable sourcemaps for debugging webpack's output.
        devtool: isEnvDevelopment
            ? 'source-map'
            : isEnvProduction && 'cheap-module-source-map',

        resolve: {
            // Add '.ts' and '.tsx' as resolvable extensions.
            extensions: configExtensions
            // modules: [paths.appNodeModules, paths.ownNodeModules]
        },

        module: {
            rules: [
                {
                    oneOf: [
                        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
                        {
                            test: /\.js$/,
                            use: 'happypack/loader',
                            use: [require.resolve('babel-loader')]
                        },
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            loader: require.resolve('url-loader'),
                            options: {
                                limit: 10000,
                                name: 'static/media/[name].[hash:8].[ext]'
                            }
                        },
                        {
                            test: /\.(ts|tsx)$/,
                            loader: require.resolve('awesome-typescript-loader')
                        },
                        {
                            test: /\.css$/,
                            use: getStyleLoaders({
                                importLoaders: 1,
                                sourceMap: isEnvProduction && shouldUseSourceMap
                            })
                        },
                        {
                            loader: require.resolve('file-loader'),
                            // Exclude `js` files to keep "css" loader working as it injects
                            // its runtime that would otherwise be processed through "file" loader.
                            // Also exclude `html` and `json` extensions so they get processed
                            // by webpacks internal loaders.
                            exclude: [/\.(mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                            options: {
                                name: 'static/media/[name].[hash:8].[ext]'
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HappyPack({
                loaders: ['babel-loader']
            }),
            new Webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery'
            }),
            new Webpack.DefinePlugin(clientEnv.stringified),
            new Webpack.DefinePlugin({
                'require.specified': 'require.resolve'
            }),
            new HtmlWebpackPlugin(
                Object.assign(
                    {},
                    {
                        inject: false,
                        template: isBuild ? paths.assetsHtml : paths.appHtml
                    },
                    isBuild
                        ? {
                              filename: '_Assets.cshtml',
                              minify: {
                                  removeComments: true,
                                  collapseWhitespace: true,
                                  removeRedundantAttributes: true,
                                  useShortDoctype: true,
                                  removeEmptyAttributes: true,
                                  removeStyleLinkTypeAttributes: true,
                                  keepClosingSlash: true,
                                  minifyJS: true,
                                  minifyCSS: true,
                                  minifyURLs: true
                              }
                          }
                        : undefined
                )
            )
        ]
    };

    if (!isBuild) {
        config['entry'].unshift(
            `webpack-dev-server/client?http://${host}:${port}/`,
            'webpack/hot/dev-server'
        );

        config['plugins'].push(new Webpack.HotModuleReplacementPlugin());
    } else {
        config['plugins'].push(
            new MiniCssExtractPlugin({
                filename: 'static/css/[name].[contenthash:8].css',
                chunkFilename: 'static/css/[name].[contenthash:8].chunk.css'
            })
        );
    }

    if (isEnvProduction) {
        config['optimization'] = {
            // Keep the runtime chunk separated to enable long term caching
            // https://twitter.com/wSokra/status/969679223278505985
            runtimeChunk: true,
            splitChunks: {
                cacheGroups: {
                    lodash: {
                        test: /[\\/]node_modules[\\/](lodash)[\\/]/,
                        name: 'lodash',
                        chunks: 'all',
                        reuseExistingChunk: true
                    },
                    react: {
                        test: /[\\/]node_modules[\\/](react|react-dom|react-redux|react-router|react-router-dom|redux-act|redux-observable|recompose|redux|rxjs)[\\/]/,
                        name: 'react',
                        chunks: 'all',
                        reuseExistingChunk: true
                    },
                    core: {
                        test: /[\\/]node_modules[\\/](@iherb-backoffice)[\\/]/,
                        name: 'core',
                        chunks: 'all',
                        reuseExistingChunk: true
                    }
                }
            },
            minimize: isEnvProduction,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        parse: {
                            // we want terser to parse ecma 8 code. However, we don't want it
                            // to apply any minfication steps that turns valid ecma 5 code
                            // into invalid ecma 5 code. This is why the 'compress' and 'output'
                            // sections only apply transformations that are ecma 5 safe
                            // https://github.com/facebook/create-react-app/pull/4234
                            ecma: 8
                        },
                        compress: {
                            ecma: 5,
                            warnings: false,
                            // Disabled because of an issue with Uglify breaking seemingly valid code:
                            // https://github.com/facebook/create-react-app/issues/2376
                            // Pending further investigation:
                            // https://github.com/mishoo/UglifyJS2/issues/2011
                            comparisons: false,
                            // Disabled because of an issue with Terser breaking valid code:
                            // https://github.com/facebook/create-react-app/issues/5250
                            // Pending futher investigation:
                            // https://github.com/terser-js/terser/issues/120
                            inline: 2
                        },
                        mangle: {
                            safari10: true
                        },
                        output: {
                            ecma: 5,
                            comments: false,
                            // Turned on because emoji and regex is not minified properly using default
                            // https://github.com/facebook/create-react-app/issues/2488
                            ascii_only: true
                        }
                    },
                    // Use multi-process parallel running to improve the build speed
                    // Default number of concurrent runs: os.cpus().length - 1
                    parallel: true,
                    // Enable file caching
                    cache: true,
                    sourceMap: shouldUseSourceMap
                }),
                new OptimizeCSSAssetsPlugin({
                    cssProcessorOptions: {
                        parser: safePostCssParser,
                        map: shouldUseSourceMap
                            ? {
                                  // `inline: false` forces the sourcemap to be output into a
                                  // separate file
                                  inline: false,
                                  // `annotation: true` appends the sourceMappingURL to the end of
                                  // the css file, helping the browser find the sourcemap
                                  annotation: true
                              }
                            : false
                    }
                })
            ]
        };
    }

    return config;
};
