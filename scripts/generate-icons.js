const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon size configurations
const iconSizes = {
  pwa: [72, 96, 128, 144, 152, 192, 384, 512],
  appleTouchIcon: [57, 60, 72, 76, 114, 120, 144, 152, 180],
  favicon: [16, 32, 48],
  maskable: [192, 512]
};

// Design variants based on size
const getDesignVariant = (size) => {
  if (size >= 192) {
    return {
      includeFullText: true,
      includeLogo: true,
      includeSymbol: true,
      textContent: "KIRKLARELİ 112"
    };
  } else if (size >= 96) {
    return {
      includeFullText: false,
      includeLogo: true,
      includeSymbol: true,
      textContent: "112"
    };
  } else if (size >= 32) {
    return {
      includeFullText: false,
      includeLogo: true,
      includeSymbol: false,
      textContent: "112"
    };
  } else {
    return {
      includeFullText: false,
      includeLogo: false,
      includeSymbol: true,
      textContent: "112"
    };
  }
};

// Create SVG icon based on size and design variant
const createSVGIcon = (size, variant) => {
  const brandColor = '#b91c1c';
  const backgroundColor = '#ffffff';
  
  let svgContent = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${backgroundColor}" rx="${size * 0.1}"/>
  `;

  // Add emergency cross symbol
  if (variant.includeSymbol) {
    const crossSize = size * 0.3;
    const crossX = (size - crossSize) / 2;
    const crossY = (size - crossSize) / 2;
    const strokeWidth = size * 0.05;
    
    svgContent += `
      <g transform="translate(${crossX}, ${crossY})">
        <rect x="${crossSize * 0.4}" y="0" width="${crossSize * 0.2}" height="${crossSize}" fill="${brandColor}"/>
        <rect x="0" y="${crossSize * 0.4}" width="${crossSize}" height="${crossSize * 0.2}" fill="${brandColor}"/>
      </g>
    `;
  }

  // Add text
  if (variant.textContent) {
    const fontSize = variant.includeFullText ? size * 0.12 : size * 0.25;
    const textY = variant.includeSymbol ? size * 0.85 : size * 0.6;
    
    svgContent += `
      <text x="${size / 2}" y="${textY}" 
            font-family="Arial, sans-serif" 
            font-weight="bold" 
            font-size="${fontSize}" 
            fill="${brandColor}" 
            text-anchor="middle" 
            dominant-baseline="middle">
        ${variant.textContent}
      </text>
    `;
  }

  svgContent += '</svg>';
  return svgContent;
};

// Generate icons for a specific category
const generateIconCategory = async (category, sizes, outputDir) => {
  console.log(`Generating ${category} icons...`);
  
  for (const size of sizes) {
    const variant = getDesignVariant(size);
    const svgContent = createSVGIcon(size, variant);
    
    let filename;
    if (category === 'appleTouchIcon') {
      filename = `apple-touch-icon-${size}x${size}.png`;
    } else if (category === 'favicon') {
      filename = `favicon-${size}x${size}.png`;
    } else if (category === 'maskable') {
      filename = `maskable-${size}x${size}.png`;
    } else {
      filename = `icon-${size}x${size}.png`;
    }
    
    const outputPath = path.join(outputDir, filename);
    
    try {
      await sharp(Buffer.from(svgContent))
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${filename}`);
    } catch (error) {
      console.error(`✗ Failed to generate ${filename}:`, error.message);
    }
  }
};

// Main generation function
const generateAllIcons = async () => {
  console.log('🎨 Starting icon generation...\n');
  
  try {
    // Ensure output directories exist
    const baseDir = 'img/icons';
    const dirs = ['pwa', 'apple-touch', 'favicon', 'maskable'];
    
    for (const dir of dirs) {
      const fullPath = path.join(baseDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }
    
    // Generate all icon categories
    await generateIconCategory('pwa', iconSizes.pwa, path.join(baseDir, 'pwa'));
    await generateIconCategory('appleTouchIcon', iconSizes.appleTouchIcon, path.join(baseDir, 'apple-touch'));
    await generateIconCategory('favicon', iconSizes.favicon, path.join(baseDir, 'favicon'));
    await generateIconCategory('maskable', iconSizes.maskable, path.join(baseDir, 'maskable'));
    
    console.log('\n🎉 Icon generation completed successfully!');
    console.log('\nGenerated files:');
    console.log(`- PWA icons: ${iconSizes.pwa.length} files`);
    console.log(`- Apple Touch icons: ${iconSizes.appleTouchIcon.length} files`);
    console.log(`- Favicon icons: ${iconSizes.favicon.length} files`);
    console.log(`- Maskable icons: ${iconSizes.maskable.length} files`);
    
  } catch (error) {
    console.error('❌ Icon generation failed:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  generateAllIcons();
}

module.exports = {
  generateAllIcons,
  iconSizes,
  getDesignVariant,
  createSVGIcon
};