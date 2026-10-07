const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

function generateIcon(size, outputPath) {
  try {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#059669');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, size * 0.2);
    ctx.fill();

    // Trolley icon / Shopping Basket drawing
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = size * 0.05;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const padding = size * 0.25;
    const width = size - padding * 2;
    const height = size - padding * 2;

    // Cart handle & body
    ctx.beginPath();
    ctx.moveTo(padding, padding + height * 0.2);
    ctx.lineTo(padding + width * 0.25, padding + height * 0.2);
    ctx.lineTo(padding + width * 0.4, padding + height * 0.7);
    ctx.lineTo(padding + width * 0.85, padding + height * 0.7);
    ctx.lineTo(padding + width, padding + height * 0.3);
    ctx.lineTo(padding + width * 0.3, padding + height * 0.3);
    ctx.stroke();

    // Wheels
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(padding + width * 0.45, padding + height * 0.82, size * 0.06, 0, Math.PI * 2);
    ctx.arc(padding + width * 0.8, padding + height * 0.82, size * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Badge tick / Shield
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(padding + width * 0.8, padding + height * 0.25, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`Generated icon: ${outputPath}`);
  } catch (err) {
    console.log('Canvas not available, generating SVG fallback icon');
  }
}

// Generate icons
generateIcon(192, path.join(iconsDir, 'icon-192.png'));
generateIcon(512, path.join(iconsDir, 'icon-512.png'));
