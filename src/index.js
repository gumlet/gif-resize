'use strict';
const execa = require('execa');
const gifsicle = require('gifsicle');
const isGif = require('is-gif');

function get_args(opts) {
	opts = Object.assign({
		resize_method: "lanczos3",
		optimizationLevel: 2
	}, opts);

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

	if (opts.lossy) {
		args.push(`--lossy=${opts.lossy}`);
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
		if(opts.rotate == 90) args.push(`--rotate-90`);
		if(opts.rotate == 180) args.push(`--rotate-180`);
		if(opts.rotate == 270) args.push(`--rotate-270`);
	}

	if(opts.width){
		if(!opts.stretch){
			args.push(`--resize-fit-width=${opts.width}`);
		} else {
			args.push(`--resize-width=${opts.width}`);
		}
	}

	if(opts.height){
		if(!opts.stretch){
			args.push(`--resize-fit-height=${opts.height}`);
		} else {
			args.push(`--resize-height=${opts.height}`);
		}
	}

	args.push('--output', "-");
	return args;
}

module.exports = opts => async buf => {
	if (!Buffer.isBuffer(buf)) {
		return Promise.reject(new TypeError('Expected a buffer'));
	}

	if (!isGif(buf)) {
		return Promise.resolve(buf);
	}

	try {
		const args = get_args(opts);
		const gif_output = await execa(gifsicle, args, {input: buf, encoding: null});
		return gif_output.stdout;
	} catch (error) {
		error.message = error.stderr || error.message;
		throw error;
	}
};

module.exports.sync = opts => buf => {
	if (!Buffer.isBuffer(buf)) {
		throw new TypeError('Expected a buffer');
	}

	if (!isGif(buf)) {
		return buf;
	}

	try {
		const args = get_args(opts);
		const gif_output = execa.sync(gifsicle, args, {input: buf, encoding: null});
		return gif_output.stdout;
	} catch (error) {
		error.message = error.stderr || error.message;
		throw error;
	}
};
