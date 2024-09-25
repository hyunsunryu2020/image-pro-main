const CopyPlugin = require('copy-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const commonConfig = {
	images: {
		unoptimized: true,
	},
	reactStrictMode: false,
	output: 'standalone',

	webpack: (config, options) => {
		config.resolve.extensions.push('.ts', '.tsx');
		config.resolve.fallback = { fs: false };

		config.plugins.push(new NodePolyfillPlugin(), new CopyPlugin({
			patterns: [{
				from: './node_modules/onnxruntime-web/dist/ort-wasm.wasm',
				to: 'static/chunks',
			}, {
				from: './node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm',
				to: 'static/chunks',
			}, {
				from: './model',
				to: 'static/chunks/pages',
			}, {
				from: './src/data',
				to: 'static/data',
			}],
		}));

		// mode = "development"
		if (options.dev) {
			config.devServer = {
				hot: true,
				open: true,
				headers: {
					'Cross-Origin-Opener-Policy': 'same-origin',
					'Cross-Origin-Embedder-Policy': 'credentialless',
				},
			};
		}

		return config;
	},
};

module.exports = commonConfig;