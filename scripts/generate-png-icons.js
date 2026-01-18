// Simple PNG icon generator using Canvas API (for browser environment)
// This script can be run in browser console or embedded in HTML

const iconSizes = {
    pwa: [72, 96, 128, 144, 152, 192, 384, 512],
    appleTouchIcon: [57, 60, 72, 76, 114, 120, 144, 152, 180],
    favicon: [16, 32, 48],
    maskable: [192, 512]
};

function getDesignVariant(size) {
    if (size >= 192) {
        return {
            includeFullText: true,
            textContent: "KIRKLARELİ 112",
            fontSize: size * 0.12,
            crossSize: size * 0.3
        };
    } else if (size >= 96) {
        return {
            includeFullText: false,
            textContent: "112",
            fontSize: size * 0.25,
            crossSize: size * 0.35
        };
    } else if (size >= 32) {
        return {
            includeFullText: false,
            textContent: "112",
            fontSize: size * 0.2,
            crossSize: size * 0.4
        };
    } else {
        return {
            includeFullText: false,
            textContent: "112",
            fontSize: size * 0.3,
            crossSize: size * 0.5
        };
    }
}

function createPNGIcon(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const variant = getDesignVariant(size);
    const brandColor = '#b91c1c';
    const backgroundColor = '#ffffff';

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);

    // Add rounded corners (clipping)
    ctx.beginPath();
    const radius = size * 0.1;
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.clip();

    // Fill background again after clipping
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);

    // Draw emergency cross
    const crossSize = variant.crossSize;
    const crossX = (size - crossSize) / 2;
    const crossY = (size - crossSize) / 2;
    
    ctx.fillStyle = brandColor;
    
    // Vertical bar
    ctx.fillRect(
        crossX + crossSize * 0.4, 
        crossY, 
        crossSize * 0.2, 
        crossSize
    );
    
    // Horizontal bar
    ctx.fillRect(
        crossX, 
        crossY + crossSize * 0.4, 
        crossSize, 
        crossSize * 0.2
    );

    // Add text
    if (variant.textContent) {
        const textY = size * 0.85;
        
        ctx.fillStyle = brandColor;
        ctx.font = `bold ${variant.fontSize}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add subtle shadow for readability
        ctx.shadowColor = 'rgba(255,255,255,0.5)';
        ctx.shadowBlur = 1;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(variant.textContent, size / 2, textY);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    return canvas;
}

function generateAllPNGIcons() {
    const allIcons = [];
    
    // Generate PWA icons
    iconSizes.pwa.forEach(size => {
        const canvas = createPNGIcon(size);
        allIcons.push({
            canvas: canvas,
            filename: `icon-${size}x${size}.png`,
            category: 'pwa',
            size: size
        });
    });
    
    // Generate Apple Touch icons
    iconSizes.appleTouchIcon.forEach(size => {
        const canvas = createPNGIcon(size);
        allIcons.push({
            canvas: canvas,
            filename: `apple-touch-icon-${size}x${size}.png`,
            category: 'apple-touch',
            size: size
        });
    });
    
    // Generate Favicons
    iconSizes.favicon.forEach(size => {
        const canvas = createPNGIcon(size);
        allIcons.push({
            canvas: canvas,
            filename: `favicon-${size}x${size}.png`,
            category: 'favicon',
            size: size
        });
    });
    
    // Generate Maskable icons
    iconSizes.maskable.forEach(size => {
        const canvas = createPNGIcon(size);
        allIcons.push({
            canvas: canvas,
            filename: `maskable-${size}x${size}.png`,
            category: 'maskable',
            size: size
        });
    });
    
    return allIcons;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateAllPNGIcons,
        createPNGIcon,
        iconSizes,
        getDesignVariant
    };
}

// Auto-run in browser
if (typeof window !== 'undefined') {
    console.log('PNG Icon Generator loaded. Run generateAllPNGIcons() to create icons.');
}