import { Buffer } from "node:buffer";
import { ExecaError, execa } from "execa";
import gifsicle from "gifsicle";

export interface GifResizeOptions {
	/**
	 * Resize GIF to given width in pixels. It maintains aspect ratio.
	 */
	width?: number;
	/**
	 * Resize GIF to given height in pixels. It maintains aspect ratio.
	 */
	height?: number;
	/**
	 * If this is set, and width and height both are provided, the GIF will be resized such that it exactly matches the dimensions provided. It won't match the aspect ratio.
	 */
	stretch?: boolean;
	/**
	 * Resize GIF to given width in pixels. It maintains aspect ratio.
	 */
	interlaced?: boolean;
	/**
	 * Interlace gif for progressive rendering.
	 */
	timeout?: number;

	/**
	 * Lossy compression.
	 */
	lossy?: boolean;
	/**
	 * Select an optimization level between 1 and 3.
	 *
	 * The optimization level determines how much optimization is done; higher levels take longer, but may have better results.
	 *
	 * 1- Stores only the changed portion of each image.
	 * 2- Also uses transparency to shrink the file further.
	 * 3- Try several optimization methods (usually slower, sometimes better results)
	 */
	optimizationLevel?: number;
	/**
	 * Reduce the number of distinct colors in each output GIF to num or less. Num must be between 2 and 256.
	 */
	colors?: number;
	/**
	 * Default: lanczos3
	 *
	 * Set the method used to resize images. The sample method runs very quickly, but when shrinking images, it produces noisy results. The mix method is somewhat slower, but produces better-looking results. The default method is currently mix.
	 *
	 * Gifsicle also supports more complex resamplers, including Catmull-Rom cubic resampling (catrom), the Mitchell-Netravali filter (mitchell), a 2-lobed Lanczos filter (lanczos2), and a 3-lobed Lanczos filter (lanczos3). These filters are slower still, but can give sharper, better results.
	 */
	resize_method?: string;
	/**
	 * Set the gamma correction to gamma, which can be a real number or ‘srgb’.
	 */
	gamma?: number;
	/**
	 * Crop box in format [left, top, width, height].
	 */
	crop?: [number, number, number, number];
	/**
	 * Flips GIF horizontally.
	 */
	flip_h?: boolean;
	/**
	 * Flips GIF vertically.
	 */
	flip_v?: boolean;
	/**
	 * Resize GIF to given width in pixels. It maintains aspect ratio.
	 */
	rotate?: number;
}

export default (opts: GifResizeOptions) =>
	async (buf: Buffer): Promise<Buffer> => {
		opts = Object.assign(
			{
				resize_method: "lanczos3",
				optimizationLevel: 2,
				timeout: 0,
			},
			opts,
		);

		if (!Buffer.isBuffer(buf)) {
			return Promise.reject(new TypeError("Expected a buffer"));
		}

		if (!isGif(buf)) {
			return Promise.resolve(buf);
		}

		const args = ["--no-warnings", "--no-app-extensions"];

		if (opts.interlaced) {
			args.push("--interlace");
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
			args.push(
				`--crop=${opts.crop[0]},${opts.crop[1]}+${opts.crop[2]}x${opts.crop[3]}`,
			);
		}

		if (opts.flip_h) {
			args.push(`--flip-horizontal`);
		}

		if (opts.flip_v) {
			args.push(`--flip-vertical`);
		}

		if (opts.rotate) {
			if (opts.rotate === 90) args.push(`--rotate-90`);
			if (opts.rotate === 180) args.push(`--rotate-180`);
			if (opts.rotate === 270) args.push(`--rotate-270`);
		}

		if (opts.width) {
			if (!opts.stretch) {
				args.push(`--resize-fit-width=${opts.width}`);
			} else {
				args.push(`--resize-width=${opts.width}`);
			}
		}

		if (opts.height) {
			if (!opts.stretch) {
				args.push(`--resize-fit-height=${opts.height}`);
			} else {
				args.push(`--resize-height=${opts.height}`);
			}
		}

		args.push("--output", "-");

		try {
			const gif_output = await execa(gifsicle, args, {
				input: buf,
				encoding: "buffer",
				timeout: opts.timeout,
			});
			const { stdout } = gif_output;
			return Buffer.from(stdout.buffer, stdout.byteOffset, stdout.byteLength);
		} catch (error: unknown) {
			if (error instanceof ExecaError) {
				const stderr = (error as ExecaError<{ encoding: "buffer" }>).stderr;
				error.message = Buffer.from(stderr).toString("utf-8") || error.message;
			}
			throw error;
		}
	};

function isGif(buffer: Buffer) {
	if (!buffer || buffer.length < 3) {
		return false;
	}

	return buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
}
