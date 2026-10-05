/** Export the same geometry used by MirrorSoulMark into native launcher assets.
 * Run in a Node environment providing sharp; no runtime dependency is needed.
 */
/* global __dirname */
const { Buffer } = require('node:buffer');
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const mark = require('../assets/brand/mirrorsoul-mark.json');
const destination = path.join(__dirname, '../assets/brand');
const paths = fill => mark.layers.map(layer => `<path d="${layer.path}" fill="${fill || layer.fill}"/>`).join('');
const symbol = paths();
const svg = (size, content) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${content}</svg>`;
const placed = (size, offset, width, content) => svg(size, `<svg x="${offset}" y="${offset}" width="${width}" height="${width}" viewBox="${mark.viewBox}">${content}</svg>`);
// Keep every visible pixel inside the central 66dp circle of a 108dp layer.
const transparent = placed(1024, 224, 576, symbol);
const icon = svg(1024, `<rect width="1024" height="1024" fill="${mark.background}"/><svg x="128" y="128" width="768" height="768" viewBox="${mark.viewBox}">${symbol}</svg>`);
const monochrome = placed(1024, 224, 576, paths('#FFFFFF'));

async function main() {
  await fs.mkdir(destination, { recursive: true });
  await fs.writeFile(path.join(destination, 'mirrorsoul-mark.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="${mark.viewBox}">${symbol}</svg>`);
  await sharp(Buffer.from(svg(1024, `<svg width="1024" height="1024" viewBox="${mark.viewBox}">${symbol}</svg>`))).png().toFile(path.join(destination, 'mirrorsoul-mark.png'));
  await sharp(Buffer.from(icon)).removeAlpha().png().toFile(path.join(destination, 'mirrorsoul-app-icon.png'));
  await sharp(Buffer.from(transparent)).png().toFile(path.join(destination, 'mirrorsoul-adaptive-foreground.png'));
  await sharp(Buffer.from(monochrome)).png().toFile(path.join(destination, 'mirrorsoul-adaptive-monochrome.png'));
  await sharp(Buffer.from(transparent)).resize(64, 64).png().toFile(path.join(destination, 'mirrorsoul-favicon.png'));
  console.log('MirrorSoul SVG and PNG assets exported.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
