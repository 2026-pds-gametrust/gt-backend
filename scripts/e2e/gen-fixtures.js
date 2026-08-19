/** Gera as fixtures binarias usadas pelos testes Playwright do frontend-web. */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const out = process.argv[2] || path.join(__dirname, '../../../frontend-web/e2e/fixtures');

(async () => {
  const jpeg = await sharp({
    create: { width: 1200, height: 900, channels: 3, background: { r: 30, g: 90, b: 180 } },
  })
    .jpeg({ quality: 80 })
    .toBuffer();
  fs.writeFileSync(path.join(out, 'listing-photo.jpg'), jpeg);

  const mp4 = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x20]),
    Buffer.from('ftypisom'),
    Buffer.from([0x00, 0x00, 0x02, 0x00]),
    Buffer.from('isomiso2avc1mp41'),
  ]);
  fs.writeFileSync(path.join(out, 'listing-video.mp4'), mp4);

  console.log(`jpeg ${jpeg.length}B | mp4 ${mp4.length}B -> ${out}`);
})();
