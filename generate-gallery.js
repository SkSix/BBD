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

    // Create symbolic links for necessary files
    const filesToLink = ['index.html', 'gallery.html', 'package.json', 'vercel.json'];
    filesToLink.forEach(file => {
        const srcPath = path.join(__dirname, file);
        const destPath = path.join(distDir, file);
        if (fs.existsSync(srcPath)) {
            try {
                // Remove existing file if it exists
                if (fs.existsSync(destPath)) {
                    fs.unlinkSync(destPath);
                }
                // Create symbolic link
                fs.symlinkSync(srcPath, destPath, 'file');
            } catch (error) {
                console.log(`Error creating symlink for ${file}: ${error.message}`);
            }
        }
    });

    // Create symbolic link for image directory
    try {
        const imageSrc = path.join(__dirname, 'image');
        const imageDest = path.join(distDir, 'image');
        if (fs.existsSync(imageSrc)) {
            if (fs.existsSync(imageDest)) {
                fs.unlinkSync(imageDest);
            }
            fs.symlinkSync(imageSrc, imageDest, 'dir');
        }
    } catch (error) {
        console.log(`Error creating symlink for image directory: ${error.message}`);
    }

    // Write gallery-items.html to dist directory
    fs.writeFileSync(path.join(distDir, 'gallery-items.html'), galleryHTML);
    console.log('Gallery HTML generated successfully!');
    console.log('Symbolic links created in dist directory');
}

// Generate gallery once for deployment
console.log('Generating gallery for deployment...');
generateGalleryHTML();
console.log('Gallery generation complete!');
