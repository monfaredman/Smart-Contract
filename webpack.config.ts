const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const Dotenv = require("dotenv-webpack");

module.exports = (env: any, argv: any) => {
  const isProduction = argv.mode === "production";

  return {
    mode: isProduction ? "production" : "development",
    entry: "./src/index.tsx",
    output: {
      filename: isProduction ? "[name].[contenthash].js" : "bundle.js",
      path: path.resolve(__dirname, "dist"),
      clean: true, // Clean the output directory before emit
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: "babel-loader",
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource", // Handle images and other assets
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
      alias: {
        "~": path.resolve(__dirname, "./"),
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        minify: isProduction
          ? {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            }
          : false,
      }),
      new Dotenv(),
    ],
    devServer: {
      historyApiFallback: true,
      static: {
        directory: path.join(__dirname, "public"),
      },
      hot: true,
      compress: true,
      port: 3000,
      // proxy: {
      //   "/api": {
      //     target: "http://127.0.0.1:2081",
      //     changeOrigin: true,
      //     pathRewrite: { "^/api": "" },
      //   },
      // },
    },
    optimization: isProduction
      ? {
          splitChunks: {
            chunks: "all",
          },
          runtimeChunk: {
            name: "runtime",
          },
        }
      : {},
  };
};
