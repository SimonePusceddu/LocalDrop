const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ensure assets directory exists
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Color scheme matching app.json adaptive icon background
const backgroundColor = '#667eea';

/**
 * Creates a solid color PNG image with optional text overlay
 * @param {number} width - Image width in pixels
 * @param {number} height - Image height in pixels
 * @param {string} filename - Output filename
 * @param {string} text - Optional text to overlay
 */
async function createPlaceholderIcon(width, height, filename, text = '') {
  try {
    // Create a solid color background
    const svg = `
      <svg width="${width}" height="${height}">
        <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
        ${text ? `
          <text
            x="50%"
            y="50%"
            font-family="Arial, sans-serif"
            font-size="${Math.floor(width / 8)}"
            font-weight="bold"
            fill="white"
            text-anchor="middle"
            dominant-baseline="middle"
          >${text}</text>
        ` : ''}
      </svg>
    `;

    const outputPath = path.join(assetsDir, filename);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`✓ Created ${filename} (${width}x${height})`);
  } catch (error) {
    console.error(`✗ Failed to create ${filename}:`, error.message);
    throw error;
  }
}

async function generateAllIcons() {
  console.log('Generating placeholder icons...\n');

  try {
    // Main app icon (1024x1024)
    await createPlaceholderIcon(1024, 1024, 'icon.png', 'LD');

    // Android adaptive icon foreground (108x108 minimum, using 512 for better quality)
    await createPlaceholderIcon(512, 512, 'adaptive-icon.png', 'LD');

    // Splash screen (1284x2778 - iPhone 14 Pro Max resolution)
    await createPlaceholderIcon(1284, 2778, 'splash.png', 'LocalDrop');

    // Web favicon (48x48)
    await createPlaceholderIcon(48, 48, 'favicon.png');

    console.log('\n✓ All placeholder icons generated successfully!');
    console.log(`\nAssets created in: ${assetsDir}`);
  } catch (error) {
    console.error('\n✗ Icon generation failed:', error.message);
    process.exit(1);
  }
}

// Run the generation
generateAllIcons();
