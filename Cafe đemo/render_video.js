const { execFileSync } = require('child_process');
const path = require('path');

const dir = path.join('C:', 'Users', 'user', '.gemini', 'antigravity', 'scratch', 'bold-brew-coffee', 'assets');
const imgStart = path.join(dir, 'start-frame.jpg');
const outMp4 = path.join(dir, 'hero-scrub.mp4');
const outPoster = path.join(dir, 'hero-poster.jpg');
const outEnding = path.join(dir, 'hero-ending.jpg');

// Luxury Cinema 3-Stream Pipeline:
// 1. Crop at x=225 (w=512, h=288) to completely eliminate the harsh bright window stripe on the far left
// 2. Apply strong 3D spatio-temporal denoise (hqdn3d=8:6:10:8) + edge-preserving bilateral filter (sigmaS=3.5, sigmaR=0.09) to melt away all grainy white light noise on the metal phin and glass while keeping droplet edges crisp
// 3. Apply Luxury Warm Espresso & Champagne Gold highlight roll-off curves + soft studio vignette (vignette=angle=0.38) so highlights never blow out

const filterComplex = [
  "[0:v]crop=14:14:486:450,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*clip(1.3-(pow((X-7)/6.3,2)+pow((Y-7)/6.3,2)),0,1)'[drop_sm]",
  "[0:v]crop=18:18:484:472,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*clip(1.3-(pow((X-9)/8.3,2)+pow((Y-9)/8.3,2)),0,1)'[drop_md]",
  "[0:v]crop=20:20:518:451,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*clip(1.3-(pow((X-10)/9.3,2)+pow((Y-10)/9.3,2)),0,1)'[drop_lg]",
  "[0:v]crop=14:14:486:450,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*clip(1.3-(pow((X-7)/6.3,2)+pow((Y-7)/6.3,2)),0,1)'[drop_lf]",
  "[0:v]crop=18:18:484:472,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*clip(1.3-(pow((X-9)/8.3,2)+pow((Y-9)/8.3,2)),0,1)'[drop_rt2]",

  "[0:v]delogo=x=485:y=449:w=16:h=16,delogo=x=482:y=470:w=21:h=21,delogo=x=515:y=449:w=24:h=25[clean_bg]",

  "[clean_bg]split[bg_base][bg_for_crema]",
  "[bg_for_crema]crop=184:48:399:495,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*clip(1-pow((X-92)/90,6),0,1)*clip(sin(3.14159*Y/48)*1.3,0,1)'[crema_layer]",
  "[bg_base][crema_layer]overlay=x=399:y='495-11*(t/6)':format=auto[bg_rising]",

  // Center Stream
  "[bg_rising][drop_sm]overlay=x=486:y='434+(66-10*(t/6))*pow(mod(t*0.95,1),1.55)':format=auto[s1]",
  "[s1][drop_md]overlay=x=484:y='434+(66-10*(t/6))*pow(mod(t*0.95+0.45,1),1.55)':format=auto[s2]",

  // Right Stream
  "[s2][drop_lg]overlay=x=517:y='426+(72-10*(t/6))*pow(mod(t*0.85+0.20,1),1.60)':format=auto[s3]",
  "[s3][drop_rt2]overlay=x=518:y='426+(72-10*(t/6))*pow(mod(t*0.85+0.70,1),1.60)':format=auto[s4]",

  // Left Stream
  "[s4][drop_lf]overlay=x=460:y='412+(86-10*(t/6))*pow(mod(t*0.70+0.35,1),1.65)':format=auto[with_3streams]",

  // Luxury Cinema Denoise + Bilateral Satin Smoothing + Highlight Roll-off LUT + Studio Vignette
  "[with_3streams]crop=w=512:h=288:x=225:y='108+(t/6)*264',hqdn3d=8:6:10:8,bilateral=sigmaS=3.5:sigmaR=0.09,scale=1920:1080:flags=lanczos+accurate_rnd+full_chroma_int,curves=r='0/0 0.18/0.11 0.55/0.53 0.85/0.81 1/0.91':g='0/0 0.18/0.10 0.55/0.49 0.85/0.76 1/0.85':b='0/0 0.18/0.08 0.55/0.44 0.85/0.68 1/0.76',vignette=angle=0.38[out]"
].join(';');

console.log('Encoding luxury noise-free hero-scrub.mp4...');
execFileSync('ffmpeg', [
  '-loop', '1', '-t', '6', '-r', '25', '-i', imgStart,
  '-filter_complex', filterComplex,
  '-map', '[out]',
  '-c:v', 'libx264',
  '-t', '6',
  '-crf', '15',
  '-preset', 'fast',
  '-g', '8',
  '-keyint_min', '8',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  '-an',
  outMp4,
  '-y'
], { stdio: 'inherit' });

console.log('Extracting luxury hero-poster.jpg...');
execFileSync('ffmpeg', [
  '-ss', '0', '-i', outMp4,
  '-frames:v', '1', '-update', '1', '-q:v', '2',
  outPoster, '-y'
], { stdio: 'inherit' });

console.log('Extracting luxury hero-ending.jpg...');
execFileSync('ffmpeg', [
  '-sseof', '-0.1', '-i', outMp4,
  '-frames:v', '1', '-update', '1', '-q:v', '2',
  outEnding, '-y'
], { stdio: 'inherit' });

console.log('Done!');
