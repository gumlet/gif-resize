const fs = require("fs"),
  path = require("path"),
  isGif = require("is-gif"),
  crypto = require("crypto"),
  getPixels = require("get-pixels"),
  gifResize = require("../src/index"),
  sizeOf = require("image-size");

const {
  promisify
} = require('util');

const readFileAsync = promisify(fs.readFile);
const getPixelsAsync = async function (buffer, type = "image/gif") {
  return new Promise((resolve, reject) => {
    getPixels(buffer, type, function (err, pixels) {
      if (err) {
        reject(err);
      } else {
        resolve(pixels);
      }
    })
  });
}


test('Default optimize', async () => {
  let buf = await readFileAsync(__dirname + '/test_images/avocado.gif');
  const data = await gifResize()(buf);
  expect(data.length).toBeLessThan(buf.length);
  expect(isGif(data)).toBe(true);
});

test('resize width to 100 px and height to 200 px', async () => {
  const buf = await readFileAsync(__dirname + '/test_images/avocado.gif');
  const wantedWidth = 100;
  const wantedHeight = 200;

  const data = await gifResize({
    stretch: true,
    width: wantedWidth,
    height: wantedHeight,
  })(buf);

  const { width, height } = sizeOf(data);

  expect(width).toBe(wantedWidth);
  expect(height).toBe(wantedHeight);
});

test('resize width to 300 px', async () => {
  let buf = await readFileAsync(__dirname + '/test_images/avocado.gif');
  const data = await gifResize({
    width: 300
  })(buf);
  let diff = compare(await getPixelsAsync(data),
    await getPixelsAsync(await readFileAsync(__dirname + "/test_images/avocado_300.gif")));

  expect(diff).toBeGreaterThan(0.99);
});

test('resize height to 300 px', async () => {
  let buf = await readFileAsync(__dirname + '/test_images/avocado.gif');
  const data = await gifResize({
    height: 300
  })(buf);
  let diff = compare(await getPixelsAsync(data),
    await getPixelsAsync(await readFileAsync(__dirname + "/test_images/avocado_300.gif")));

  expect(diff).toBeGreaterThan(0.99);
});

test('crop image', async () => {
  let buf = await readFileAsync(__dirname + '/test_images/avocado.gif');
  const data = await gifResize({
    crop: [200, 300, 100, 100]
  })(buf);
  let diff = compare(await getPixelsAsync(data),
    await getPixelsAsync(await readFileAsync(__dirname + "/test_images/avocado_crop.gif")));

  expect(diff).toBeGreaterThan(0.99);
});

test('flip horizontally', async () => {
  let buf = await readFileAsync(__dirname + '/test_images/avocado.gif');
  const data = await gifResize({
    flip_h: true
  })(buf);
  let diff = compare(await getPixelsAsync(data),
    await getPixelsAsync(await readFileAsync(__dirname + "/test_images/avocado_flip_h.gif")));

  expect(diff).toBeGreaterThan(0.99);
  // fs.writeFileSync(__dirname + '/test_images/avocado_flip_h.gif', data);
});

test('flip vertically', async () => {
  let buf = await readFileAsync(__dirname + '/test_images/avocado.gif');
  const data = await gifResize({
    flip_v: true
  })(buf);
  let diff = compare(await getPixelsAsync(data),
    await getPixelsAsync(await readFileAsync(__dirname + "/test_images/avocado_flip_v.gif")));

  expect(diff).toBeGreaterThan(0.99);
});

test('Interlaced output', async () => {
  let buf = await readFileAsync(__dirname + '/test_images/avocado.gif');
  const data = await gifResize({
    interlaced: true
  })(buf);
  let diff = compare(await getPixelsAsync(data),
    await getPixelsAsync(await readFileAsync(__dirname + "/test_images/avocado_interlaced.gif")));

  expect(diff).toBeGreaterThan(0.99);
});

test('rotate', async () => {
  let buf = await readFileAsync(__dirname + '/test_images/avocado.gif');
  const data = await gifResize({
    rotate: 90
  })(buf);
});


test('reduce colors', async () => {
  let buf = await readFileAsync(__dirname + '/test_images/avocado.gif');
  const data = await gifResize({
    colors: 100
  })(buf);
});

test('change resize method', async () => {
  let buf = await readFileAsync(__dirname + '/test_images/avocado.gif');
  const data = await gifResize({
    resize_method: "mix",
    width: 200
  })(buf);
});

test('gamma correction applied', async () => {
  let buf = await readFileAsync(__dirname + '/test_images/avocado.gif');
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
  let buf = await readFileAsync(__dirname + '/test_images/avocado.gif');

  expect(gifResize({
    width: "simple"
  })(buf)).rejects.toThrowError(/‘--resize-fit-width’ expects a nonnegative integer/);
});

test('throws error when non-buffer is passed', async () => {
  expect(gifResize({
    width: "simple"
  })("only_string")).rejects.toThrowError(/Expected a buffer/);
});


function compare(arr1, arr2) {
  if (JSON.stringify(arr1.shape) != JSON.stringify(arr2.shape)) {
    return 0;
  }
  let delta = 0;
  for (var i = 0; i < arr1.data.length; i++) {
    delta = delta + Math.abs(arr1.data[i] - arr2.data[i]);
  }
  var maxDiff = 255 * arr1.data.length;

  return 1 - 100 * delta / maxDiff;
}
