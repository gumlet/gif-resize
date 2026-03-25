# gif-resize

[![Build Status](https://github.com/gumlet/gif-resize/workflows/Node%20CI/badge.svg)](https://github.com/gumlet/gif-resize/actions)

> Nodejs plugin for [Gifsicle](https://www.lcdf.org/gifsicle/)


## Install

```
$ npm install @gumlet/gif-resize
```

## Usage

```js
import gifResize from '@gumlet/gif-resize'
import fs from 'node:fs';

const buf = fs.readFileSync("avocado.gif");
gifResize({
	width: 200
})(buf).then(data => {
	console.log("'data' contains processed GIF.");
});
```

## API

### gifResize([options])(buffer)

Returns a promise for a buffer.

### options

Type: `Object`

##### width

Type: `number`

Resize GIF to given width in pixels. It maintains aspect ratio.

##### height

Type: `number`

Resize GIF to given height in pixels. It maintains aspect ratio.

##### stretch

Type: `boolean`

If this is set, and `width` and `height` both are provided, the GIF will be resized such that it exactly matches the dimensions provided. It won't match the aspect ratio.

##### interlaced

Type: `boolean`<br>
Default: `false`

Interlace gif for progressive rendering.

##### timeout

Type: `number`<br>
Default: `0`

This is process timeout in milliseconds. If set to positive number, it will throw timeout error after that many milliseconds.

##### optimizationLevel

Type: `number`<br>
Default: `2`

Select an optimization level between `1` and `3`.

> The optimization level determines how much optimization is done; higher levels take longer, but may have better results.

1. Stores only the changed portion of each image.
2. Also uses transparency to shrink the file further.
3. Try several optimization methods (usually slower, sometimes better results)

##### colors

Type: `number`

Reduce the number of distinct colors in each output GIF to num or less. Num must be between 2 and 256.

##### resize_method

Type: `string`
Default: `lanczos3`

Set the method used to resize images. The `sample` method runs very quickly, but when shrinking images, it produces noisy results. The `mix` method is somewhat slower, but produces better-looking results. The default method is currently `mix`.

Gifsicle also supports more complex resamplers, including Catmull-Rom cubic resampling (`catrom`), the Mitchell-Netravali filter (`mitchell`), a 2-lobed Lanczos filter (`lanczos2`), and a 3-lobed Lanczos filter (`lanczos3`). These filters are slower still, but can give sharper, better results.

##### gamma

Type: `number`

Set the gamma correction to gamma, which can be a real number or ‘srgb’.

##### crop

Type: `array`

Crop box in format `[left, top, width, height]`.

##### flip_h

Type: `boolean`

Flips GIF horizontally.

##### flip_v

Type: `boolean`

Flips GIF vertically.

##### rotate

Type: `number`

Rotates GIF image. Valid values are `90`, `180` and `270`. All other values are silently ignored.


### buffer

Type: `Buffer`

Buffer to optimize / resize.


## License

MIT © [Gumlet](https://github.com/gumlet)
