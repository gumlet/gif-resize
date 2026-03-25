
import path from "node:path";
import getPixels from "get-pixels";
import gifResize from "../src/index";
import { test, expect } from "vitest";
import { promises as fsPromises } from "node:fs";


const readFileAsync = fsPromises.readFile;

const getPixelsAsync = async (buffer, type = "image/gif") => {
  return new Promise((resolve, reject) => {
    getPixels(buffer, type, (err, pixels) => {
      if(err){
        reject(err);
      } else{
        resolve(pixels);
      }
    })
  });
}


test('Default optimize', async () => {
  const buf = await readFileAsync(path.join(__dirname, 'test_images', 'avocado.gif'));
  const data = await gifResize()(buf);
  expect(data.length).toBeLessThan(buf.length);
  expect(isGif(data)).toBe(true);
});

test('resize width to 300 px', async () => {
  const buf = await readFileAsync(path.join(__dirname, 'test_images', 'avocado.gif'));
  const data = await gifResize({
    width: 300
  })(buf);
  const diff = compare(await getPixelsAsync(Buffer.from(data)),
    await getPixelsAsync(await readFileAsync(path.join(__dirname, 'test_images', 'avocado_300.gif'))));

  expect(diff).toBeGreaterThan(0.99);
});

test('resize height to 300 px', async () => {
  const buf = await readFileAsync(path.join(__dirname, 'test_images', 'avocado.gif'));
  const data = await gifResize({
    height: 300
  })(buf);
  const diff = compare(await getPixelsAsync(Buffer.from(data)),
    await getPixelsAsync(await readFileAsync(path.join(__dirname, 'test_images', 'avocado_300.gif'))));

  expect(diff).toBeGreaterThan(0.99);
});

test('crop image', async () => {
	const buf = await readFileAsync(path.join(__dirname, 'test_images', 'avocado.gif'));
	const data = await gifResize({
		crop: [200, 300, 100, 100]
  })(buf);
  const diff = compare(await getPixelsAsync(Buffer.from(data)),
    await getPixelsAsync(await readFileAsync(path.join(__dirname, 'test_images', 'avocado_crop.gif'))));

  expect(diff).toBeGreaterThan(0.99);
});

test('flip horizontally', async () => {
	const buf = await readFileAsync(path.join(__dirname, 'test_images', 'avocado.gif'));
	const data = await gifResize({
		flip_h: true
  })(buf);
  const diff = compare(await getPixelsAsync(Buffer.from(data)),
    await getPixelsAsync(await readFileAsync(path.join(__dirname, 'test_images', 'avocado_flip_h.gif'))));

  expect(diff).toBeGreaterThan(0.99);
	// fs.writeFileSync(__dirname + '/test_images/avocado_flip_h.gif', data);
});

test('flip vertically', async () => {
	const buf = await readFileAsync(path.join(__dirname, 'test_images', 'avocado.gif'));
	const data = await gifResize({
		flip_v: true
  })(buf);
  const diff = compare(await getPixelsAsync(Buffer.from(data)),
    await getPixelsAsync(await readFileAsync(path.join(__dirname, 'test_images', 'avocado_flip_v.gif'))));

  expect(diff).toBeGreaterThan(0.99);
});

test('Interlaced output', async () => {
	const buf = await readFileAsync(path.join(__dirname, 'test_images', 'avocado.gif'));
	const data = await gifResize({
    interlaced: true
  })(buf);
  const diff = compare(await getPixelsAsync(Buffer.from(data)),
    await getPixelsAsync(await readFileAsync(path.join(__dirname, 'test_images', 'avocado_interlaced.gif'))));

  expect(diff).toBeGreaterThan(0.99);
});

test('rotate', async () => {
	const buf = await readFileAsync(path.join(__dirname, 'test_images', 'avocado.gif'));
	const data = await gifResize({
    rotate: 90
  })(buf);
});


test('reduce colors', async () => {
	const buf = await readFileAsync(path.join(__dirname, 'test_images', 'avocado.gif'));
	const data = await gifResize({
    colors: 100
  })(buf);
});

test('change resize method', async () => {
	const buf = await readFileAsync(path.join(__dirname, 'test_images', 'avocado.gif'));
	const data = await gifResize({
		resize_method: "mix",
    width: 200
  })(buf);
});

test('gamma correction applied', async () => {
	const buf = await readFileAsync(path.join(__dirname, 'test_images', 'avocado.gif'));
	const data = await gifResize({
		gamma: 2.2,
    width: 200
  })(buf);
});

test('Non-binary buffer is returned as is', async () => {
  const buf = Buffer.from('string');
  const data = await gifResize()(buf);
  expect(data.toString()).toBe("string");
});

test('throws error when wrong parameter passed', async () => {
	const buf = await readFileAsync(path.join(__dirname, 'test_images', 'avocado.gif'));

  await expect(gifResize({
    width: "simple"
  })(buf)).rejects.toThrow(/‘--resize-fit-width’ expects a nonnegative integer/);
});

test('throws error when non-buffer is passed', async () => {
  await expect(gifResize({
    width: "simple"
  })("only_string")).rejects.toThrow(/Expected a buffer/);
});


function compare(arr1, arr2){
  if(JSON.stringify(arr1.shape) !== JSON.stringify(arr2.shape)){
    return 0;
  }
  let delta = 0;
  for (let i = 0; i < arr1.data.length; i++){
    delta = delta + Math.abs(arr1.data[i] - arr2.data[i]);
  }
  var maxDiff = 255 * arr1.data.length;

  return 1 - 100 * delta / maxDiff;
}

function isGif(buffer) {
	if (!buffer || buffer.length < 3) {
		return false;
	}

	return buffer[0] === 0x47
		&& buffer[1] === 0x49
		&& buffer[2] === 0x46;
}