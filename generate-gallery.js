const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size'); // Use the new package

// This recursive function is good, let's keep it.
function getFilesRecursively(directory) {
    let files = [];
    try {
        const items = fs.readdirSync(directory, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(directory, item.name);
            if (item.isDirectory()) {
                files = [...files, ...getFilesRecursively(fullPath)];
            } else {
                files.push(fullPath);
            }
        }
    } catch (error) {
        // It's okay if a category directory doesn't exist, just log a warning.
        console.warn(`Warning: Could not read directory ${directory}: ${error.message}`);
    }
    return files;
}

function generateGalleryData() {
    console.log("Starting gallery data generation...");

    const categories = {
        'wedding': 'image/gallery/wedding',
        'haldi': 'image/gallery/haldi',
        'pre-wedding': 'image/gallery/pre_wedding',
        'portrait': 'image/gallery/portrait'
    };

    const allGalleryData = {};

    for (const [category, folderPath] of Object.entries(categories)) {
        console.log(`Processing category: ${category}`);
        allGalleryData[category] = [];
        const imageFiles = getFilesRecursively(folderPath);

        imageFiles.forEach(imagePath => {
            const ext = path.extname(imagePath).toLowerCase();
            if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                return; // Skip non-image files
            }

            try {
                // Get image dimensions
                const dimensions = sizeOf(imagePath);
                
                // Create a clean, relative path for browser use (e.g., 'image/gallery/wedding/photo.jpg')
                const relativePath = path.relative(__dirname, imagePath).replace(/\\/g, '/');

                // Determine the couple's name for sub-folders
                let coupleName = '';
                if (category === 'pre-wedding' || category === 'haldi') {
                    // Assumes structure is 'image/gallery/category/COUPLE_NAME/image.jpg'
                    const parts = relativePath.split('/');
                    if (parts.length > 3) {
                        coupleName = parts[3].replace(/x/gi, ' & ').trim();
                    }
                }

                // Add all data to our object
                allGalleryData[category].push({
                    src: relativePath,
                    width: dimensions.width,
                    height: dimensions.height,
                    couple: coupleName || 'General',
                    alt: coupleName ? `${coupleName} - ${category}` : category
                });

            } catch (err) {
                console.warn(`Skipping corrupted or unreadable file: ${imagePath}`);
            }
        });
    }

    try {
        // Write all the collected data to a single JSON file.
        fs.writeFileSync('gallery-data.json', JSON.stringify(allGalleryData, null, 2));
        console.log('✅ Successfully generated gallery-data.json');
    } catch (error) {
        console.error('❌ Error writing gallery-data.json:', error.message);
    }
}

// Run the generation function
generateGalleryData();