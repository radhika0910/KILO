const fs = require('fs');
const path = require('path');

const source = "C:\\Users\\bhoya\\.gemini\\antigravity\\brain\\7b8da54c-d228-4cda-ad6c-48d3918440a8\\kilo_nanobanana_logo_1778864508673.png";
const destBase = "c:\\Users\\bhoya\\OneDrive\\Desktop\\PersonalProjects\\weighttracker\\assets\\images";

const files = ['logo.png', 'icon.png', 'adaptive-icon.png', 'splash-icon.png'];

try {
    files.forEach(file => {
        const dest = path.join(destBase, file);
        fs.copyFileSync(source, dest);
        console.log(`Successfully copied to ${dest}`);
    });
} catch (err) {
    console.error('Error copying file:', err);
    process.exit(1);
}
