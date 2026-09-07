const { execFileSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const videosDir = path.join(projectRoot, 'videos');
const outputDir = path.join(projectRoot, 'public', 'videos');
const postersDir = path.join(outputDir, 'posters');

if (!fs.existsSync(postersDir)) {
  fs.mkdirSync(postersDir, { recursive: true });
}

const files = ['1.mp4', '2.mp4', '3.mp4', '4.mp4'];

console.log(`Using FFmpeg at: ${ffmpegPath}`);

files.forEach((file) => {
  const baseName = path.parse(file).name;
  const inputPath = path.join(videosDir, file);
  const outPoster = path.join(postersDir, `${baseName}-poster.webp`);
  const outMp4 = path.join(outputDir, `${baseName}.mp4`);

  const origSizeMB = (fs.statSync(inputPath).size / 1024 / 1024).toFixed(2);
  console.log(`\n========================================`);
  console.log(`Processing: ${file} (Original: ${origSizeMB} MB)`);

  // 1. Generate WebP Poster Frame at 1.0s (Scale to 720:1280 for crispness and speed)
  console.log(`-> Extracting high-res WebP poster...`);
  try {
    execFileSync(ffmpegPath, [
      '-y',
      '-ss', '00:00:01.000',
      '-i', inputPath,
      '-vframes', '1',
      '-vf', 'scale=720:1280:force_original_aspect_ratio=decrease',
      '-c:v', 'libwebp',
      '-quality', '82',
      outPoster
    ], { stdio: 'inherit' });
    const posterKb = (fs.statSync(outPoster).size / 1024).toFixed(1);
    console.log(`   ✓ Poster generated: ${baseName}-poster.webp (${posterKb} KB)`);
  } catch (err) {
    console.error(`   ✗ Error generating poster:`, err.message);
  }

  // 2. Compress to Web-Optimized H.264 MP4 (Universal browser playback, no audio, faststart)
  console.log(`-> Compressing H.264 MP4 (720x1280, CRF 28, faststart)...`);
  try {
    execFileSync(ffmpegPath, [
      '-y',
      '-i', inputPath,
      '-an', // Strip audio track completely
      '-vf', 'scale=720:1280:force_original_aspect_ratio=decrease',
      '-c:v', 'libx264',
      '-crf', '28',
      '-preset', 'fast',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      outMp4
    ], { stdio: 'inherit' });
    const mp4SizeMB = (fs.statSync(outMp4).size / 1024 / 1024).toFixed(2);
    const reduction = ((1 - fs.statSync(outMp4).size / fs.statSync(inputPath).size) * 100).toFixed(1);
    console.log(`   ✓ MP4 generated: ${baseName}.mp4 (${mp4SizeMB} MB, ${reduction}% reduction)`);
  } catch (err) {
    console.error(`   ✗ Error compressing MP4:`, err.message);
  }
});

console.log(`\n========================================`);
console.log(`All 4 videos and posters generated successfully!`);
