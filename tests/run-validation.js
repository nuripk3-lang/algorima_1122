// PWA Icon System Validation Script
// This script validates that all icon files and configurations are correct

const fs = require('fs');
const path = require('path');

// Helper functions
const checkFileExists = (filePath) => {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
};

const checkDirectoryExists = (dirPath) => {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
};

// Test results
let passed = 0;
let failed = 0;
const results = [];

function test(name, condition, message = '') {
    if (condition) {
        console.log(`✅ ${name}`);
        passed++;
        results.push({ name, status: 'PASS' });
    } else {
        console.log(`❌ ${name}: ${message}`);
        failed++;
        results.push({ name, status: 'FAIL', message });
    }
}

console.log('🧪 Running PWA Icon System Validation...\n');

// Test 1: Directory Structure
console.log('📁 Testing Directory Structure:');
test('Base icons directory exists', checkDirectoryExists('img/icons'));
test('PWA icons directory exists', checkDirectoryExists('img/icons/pwa'));
test('Apple Touch icons directory exists', checkDirectoryExists('img/icons/apple-touch'));
test('Favicon directory exists', checkDirectoryExists('img/icons/favicon'));
test('Maskable icons directory exists', checkDirectoryExists('img/icons/maskable'));

// Test 2: PWA Icon Files
console.log('\n📱 Testing PWA Icon Files:');
const pwaIcons = [
    'img/icons/pwa/icon-72x72.jpg',
    'img/icons/pwa/icon-96x96.jpg',
    'img/icons/pwa/icon-128x128.jpg',
    'img/icons/pwa/icon-144x144.jpg',
    'img/icons/pwa/icon-152x152.jpg',
    'img/icons/pwa/icon-192x192.jpg',
    'img/icons/pwa/icon-384x384.jpg',
    'img/icons/pwa/icon-512x512.jpg'
];

pwaIcons.forEach(iconPath => {
    const size = iconPath.match(/(\d+)x\d+/)[1];
    test(`PWA icon ${size}x${size} exists`, checkFileExists(iconPath));
});

// Test 3: Apple Touch Icon Files
console.log('\n🍎 Testing Apple Touch Icon Files:');
const appleIcons = [
    'img/icons/apple-touch/apple-touch-icon-76x76.jpg',
    'img/icons/apple-touch/apple-touch-icon-120x120.jpg',
    'img/icons/apple-touch/apple-touch-icon-152x152.jpg',
    'img/icons/apple-touch/apple-touch-icon-180x180.jpg'
];

appleIcons.forEach(iconPath => {
    const size = iconPath.match(/(\d+)x\d+/)[1];
    test(`Apple Touch icon ${size}x${size} exists`, checkFileExists(iconPath));
});

// Test 4: Favicon Files
console.log('\n🌐 Testing Favicon Files:');
const faviconIcons = [
    'img/icons/favicon/favicon-16x16.jpg',
    'img/icons/favicon/favicon-32x32.jpg',
    'img/icons/favicon/favicon-48x48.jpg'
];

faviconIcons.forEach(iconPath => {
    const size = iconPath.match(/(\d+)x\d+/)[1];
    test(`Favicon ${size}x${size} exists`, checkFileExists(iconPath));
});

// Test 5: Maskable Icon Files
console.log('\n🤖 Testing Maskable Icon Files:');
const maskableIcons = [
    'img/icons/maskable/maskable-192x192.jpg',
    'img/icons/maskable/maskable-512x512.jpg'
];

maskableIcons.forEach(iconPath => {
    const size = iconPath.match(/(\d+)x\d+/)[1];
    test(`Maskable icon ${size}x${size} exists`, checkFileExists(iconPath));
});

// Test 6: Configuration Files
console.log('\n⚙️ Testing Configuration Files:');
test('manifest.json exists', checkFileExists('manifest.json'));
test('index.html exists', checkFileExists('index.html'));
test('browserconfig.xml exists', checkFileExists('browserconfig.xml'));

// Test 7: Manifest Content Validation
console.log('\n📋 Testing Manifest Content:');
try {
    const manifestContent = fs.readFileSync('manifest.json', 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    test('Manifest has name', !!manifest.name);
    test('Manifest has icons array', Array.isArray(manifest.icons));
    test('Manifest has at least 8 icons', manifest.icons.length >= 8);
    test('Manifest has maskable icons', manifest.icons.some(icon => icon.purpose === 'maskable'));
    test('Manifest has theme_color', !!manifest.theme_color);
    test('Manifest theme_color is correct', manifest.theme_color === '#b91c1c');
    
} catch (error) {
    test('Manifest JSON is valid', false, 'Could not parse manifest.json');
}

// Test 8: HTML Content Validation
console.log('\n🌐 Testing HTML Content:');
try {
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    
    test('HTML contains favicon links', htmlContent.includes('favicon-16x16.jpg'));
    test('HTML contains Apple Touch Icon links', htmlContent.includes('apple-touch-icon'));
    test('HTML contains Microsoft Tile config', htmlContent.includes('msapplication-TileImage'));
    test('HTML contains manifest link', htmlContent.includes('manifest.json'));
    
} catch (error) {
    test('HTML file is readable', false, 'Could not read index.html');
}

// Summary
console.log('\n📊 Test Summary:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📋 Total: ${passed + failed}`);

if (failed === 0) {
    console.log('\n🎉 All tests passed! PWA icon system is ready!');
    console.log('✅ You can now install the PWA on mobile devices with proper icons.');
    process.exit(0);
} else {
    console.log('\n⚠️ Some tests failed. Please check the issues above.');
    process.exit(1);
}