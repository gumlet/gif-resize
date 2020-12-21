'use strict';
const execa = require('execa');
const gifsicle = require('gifsicle');
const isGif = require('is-gif');

module.exports = opts => async buf => {
	opts = Object.assign({
		resize_method: "lanczos3",
		optimizationLevel: 2,
		output_webp: false
	}, opts);

	if (!Buffer.isBuffer(buf)) {
		return Promise.reject(new TypeError('Expected a buffer'));
	}

	if (!isGif(buf)) {
		return Promise.resolve(buf);
	}

	const args = ['--no-warnings', '--no-app-extensions'];

	if (opts.interlaced) {
		args.push('--interlace');
	}

	if (opts.optimizationLevel) {
		args.push(`--optimize=${opts.optimizationLevel}`);
	}

	if (opts.colors) {
		args.push(`--colors=${opts.colors}`);
	}

	if (opts.resize_method) {
		args.push(`--resize-method=${opts.resize_method}`);
	}

	if (opts.gamma) {
		args.push(`--gamma=${opts.gamma}`);
	}

	if (opts.crop) {
		args.push(`--crop=${opts.crop[0]},${opts.crop[1]}+${opts.crop[2]}x${opts.crop[3]}`);
	}

	if (opts.flip_h) {
		args.push(`--flip-horizontal`);
	}

	if (opts.flip_v) {
		args.push(`--flip-vertical`);
	}

	if (opts.rotate) {
		if (opts.rotate == 90) args.push(`--rotate-90`);
		if (opts.rotate == 180) args.push(`--rotate-180`);
		if (opts.rotate == 270) args.push(`--rotate-270`);
	}

	if (opts.stretch && opts.width && opts.height) {
		args.push(`--resize=${opts.width}x${opts.height}`);
	}

	if (opts.width && !opts.stretch) {
		args.push(`--resize-width=${opts.width}`);
	}

	if (opts.height && !opts.stretch) {
		args.push(`--resize-height=${opts.height}`);
	}

	args.push('--output', "-");

	try {
		const gif_output = await execa(gifsicle, args, { input: buf, encoding: null });

		if (opts.output_webp) {
			const webp_output = await execa("gif2webp", ['-quiet', '-mt', '-metadata', 'none', '-q', '85', '-m', '2', '-lossy', '-o', '-', '--', '-'], { input: gif_output.stdout, encoding: null });
			return webp_output.stdout;
		} else {
			return gif_output.stdout;
		}
	} catch (error) {
		error.message = error.stderr || error.message;
		throw error;
	}
};
