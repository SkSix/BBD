const fs = require('fs');
const path = require('path');

// Function to generate gallery HTML
function generateGalleryHTML() {
    // Define the categories and their corresponding folders
    const categories = {
        'wedding': 'image/gallery/wedding',
        'engagement': 'image/gallery/engagement',
        'pre-wedding': 'image/gallery/Pre_Wedding',
        'family': 'image/gallery/family'
    };
    
    // Create the gallery items array
    const galleryItems = [];
    
    // Process each category
    for (const [category, folderPath] of Object.entries(categories)) {
        try {
            // Read all files in the category folder
            const files = fs.readdirSync(folderPath);
            
            // Generate HTML for each image in this category
            files.forEach(file => {
                const filePath = path.join(folderPath, file);
                const ext = path.extname(file).toLowerCase();
                
                // Only process image files
                if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                    // Create gallery item HTML
                    // Use relative paths for images
                    const relativePath = filePath;
                    const galleryItem = `
                        <div class="gallery-item category-${category}" onclick="openLightbox('${relativePath}', '${file}')">
                            <img src="${relativePath}" alt="${file}">
                            <div class="gallery-overlay">
                                <i class="fas fa-expand"></i>
                                <span class="category-label">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                            </div>
                        </div>
                    `;
                    galleryItems.push(galleryItem);
                }
            });
        } catch (error) {
            console.log(`Warning: Could not read folder ${folderPath}: ${error.message}`);
        }
    }
    
    // Generate final HTML
    const galleryHTML = `
        <div class="gallery-grid">
            ${galleryItems.join('\n')}
        </div>
    `;
    
    // Create dist directory if it doesn't exist
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }

    // Copy image directory to dist
    const imageDir = path.join(__dirname, 'image');
    const imageDest = path.join(distDir, 'image');
    if (fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDest, { recursive: true });
        const subFiles = fs.readdirSync(imageDir);
        subFiles.forEach(subFile => {
            const subSrcPath = path.join(imageDir, subFile);
            const subDestPath = path.join(imageDest, subFile);
            
            if (fs.lstatSync(subSrcPath).isDirectory()) {
                // Copy directory contents
                fs.mkdirSync(subDestPath, { recursive: true });
                const subSubFiles = fs.readdirSync(subSrcPath);
                subSubFiles.forEach(subSubFile => {
                    const subSubSrcPath = path.join(subSrcPath, subSubFile);
                    const subSubDestPath = path.join(subDestPath, subSubFile);
                    
                    if (fs.lstatSync(subSubSrcPath).isDirectory()) {
                        // Copy sub-sub directories
                        fs.mkdirSync(subSubDestPath, { recursive: true });
                        const subSubSubFiles = fs.readdirSync(subSubSrcPath);
                        subSubSubFiles.forEach(subSubSubFile => {
                            const subSubSubSrcPath = path.join(subSubSrcPath, subSubSubFile);
                            const subSubSubDestPath = path.join(subSubDestPath, subSubSubFile);
                            
                            if (fs.lstatSync(subSubSubSrcPath).isDirectory()) {
                                // Copy sub-sub-sub directories
                                fs.mkdirSync(subSubSubDestPath, { recursive: true });
                                const subSubSubSubFiles = fs.readdirSync(subSubSubSrcPath);
                                subSubSubSubFiles.forEach(subSubSubSubFile => {
                                    const subSubSubSubSrcPath = path.join(subSubSubSrcPath, subSubSubSubFile);
                                    const subSubSubSubDestPath = path.join(subSubSubDestPath, subSubSubSubFile);
                                    fs.copyFileSync(subSubSubSubSrcPath, subSubSubSubDestPath);
                                });
                            } else {
                                // Copy file
                                fs.copyFileSync(subSubSubSrcPath, subSubSubDestPath);
                            }
                        });
                    } else {
                        // Copy file
                        fs.copyFileSync(subSubSrcPath, subSubDestPath);
                    }
                });
            } else {
                // Copy file
                fs.copyFileSync(subSrcPath, subDestPath);
            }
        });
    }

    // Copy other files to dist directory
    const files = fs.readdirSync(__dirname);
    files.forEach(file => {
        if (file !== 'dist' && !file.startsWith('.') && file !== 'image') {
            const srcPath = path.join(__dirname, file);
            const destPath = path.join(distDir, file);
            
            if (fs.lstatSync(srcPath).isDirectory()) {
                fs.mkdirSync(destPath, { recursive: true });
                const subFiles = fs.readdirSync(srcPath);
                subFiles.forEach(subFile => {
                    const subSrcPath = path.join(srcPath, subFile);
                    const subDestPath = path.join(destPath, subFile);
                    fs.copyFileSync(subSrcPath, subDestPath);
                });
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    });
    
    // Write gallery-items.html to dist directory
    fs.writeFileSync(path.join(distDir, 'gallery-items.html'), galleryHTML);
    console.log('Gallery HTML generated successfully!');
    console.log('Files copied to dist directory');
}

// Generate gallery once for deployment
console.log('Generating gallery for deployment...');
generateGalleryHTML();
console.log('Gallery generation complete!');
