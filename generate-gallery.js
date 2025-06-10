const fs = require('fs');
const path = require('path');

// Function to get all files recursively from a directory
function getFilesRecursively(directory) {
    let files = [];
    
    try {
        const items = fs.readdirSync(directory, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(directory, item.name);
            
            if (item.isDirectory()) {
                // If it's a directory, recursively get files from it
                files = [...files, ...getFilesRecursively(fullPath)];
            } else {
                // If it's a file, add it to the files array
                files.push({
                    path: fullPath,
                    name: item.name,
                    relativePath: path.relative('image/gallery', fullPath).replace(/\\/g, '/')
                });
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${directory}:`, error.message);
    }
    
    return files;
}

// Function to generate gallery HTML
function generateGalleryHTML() {
    // Define the categories and their corresponding folders
    const categories = {
        'wedding': 'image/gallery/wedding',
        'haldi': 'image/gallery/haldi',
        'pre-wedding': 'image/gallery/pre_wedding',
        'portrait': 'image/gallery/portrait'
    };
    
    // Create the gallery items array
    const galleryItems = [];
    
    // Special handling for pre-wedding to include subdirectories
    const preWeddingBase = 'image/gallery/pre_wedding';
    let preWeddingDirs = [];
    
    try {
        preWeddingDirs = fs.readdirSync(preWeddingBase, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
    } catch (error) {
        console.error(`Error reading pre-wedding directory:`, error.message);
    }
    
    // Process each category
    for (const [category, folderPath] of Object.entries(categories)) {
        try {
            if (category === 'pre-wedding') {
                // Special handling for pre-wedding to include subdirectories
                preWeddingDirs.forEach(dir => {
                    const fullPath = path.join(folderPath, dir);
                    const files = getFilesRecursively(fullPath);
                    
                    // Extract couple name from directory name (replace 'x' with ' & ')
                    let coupleName = dir;
                    if (dir.endsWith('x')) {
                        coupleName = dir.slice(0, -1); // Remove trailing 'x' if present
                    }
                    coupleName = coupleName.replace(/x/g, ' & ').trim();
                    
                    // Generate HTML for each image in this pre-wedding subdirectory
                    files.forEach((file, fileIndex) => {
                        const ext = path.extname(file.name).toLowerCase();
                        
                        // Only process image files
                        if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                            const relativePath = path.join('image/gallery', file.relativePath).replace(/\\/g, '/');
                            const itemIndex = galleryItems.length; // Use current length as index
                            
                            const galleryItem = `
                                <div class="gallery-item category-pre-wedding" data-index="${itemIndex}" ${itemIndex >= 20 ? 'style="display: none;"' : ''} data-couple="${coupleName}" data-category="pre-wedding" onclick="openLightbox('${relativePath}', 'Pre-wedding - ${coupleName}')">
                                    <img src="${relativePath}" alt="Pre-wedding - ${coupleName}">
                                    <div class="gallery-overlay">
                                        <i class="fas fa-expand"></i>
                                        <span class="category-label">Pre-wedding - ${coupleName}</span>
                                    </div>
                                </div>
                            `;
                            galleryItems.push(galleryItem);
                        }
                    });
                });
            } else {
                // Standard processing for other categories
                const files = getFilesRecursively(folderPath);
                
                // Generate HTML for each image in this category
                files.forEach(file => {
                    const ext = path.extname(file.name).toLowerCase();
                    
                    // Only process image files
                    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                        const relativePath = path.join('image/gallery', file.relativePath).replace(/\\/g, '/');
                        let displayName = category.charAt(0).toUpperCase() + category.slice(1);
                        
                        // Special handling for haldi category
                        if (category === 'haldi') {
                            // Extract couple name from directory name (replace 'x' with ' & ')
                            let coupleName = path.dirname(file.relativePath).split(path.sep).pop();
                            if (coupleName.endsWith('x')) {
                                coupleName = coupleName.slice(0, -1); // Remove trailing 'x' if present
                            }
                            coupleName = coupleName.replace(/x/g, ' & ').trim();
                            displayName = `Haldi - ${coupleName}`;
                            
                            const galleryItem = `
                                <div class="gallery-item category-${category}" data-couple="${coupleName}" data-category="${category}" onclick="openLightbox('${relativePath}', '${displayName}')">
                                    <img src="${relativePath}" alt="${displayName}">
                                    <div class="gallery-overlay">
                                        <i class="fas fa-expand"></i>
                                        <span class="category-label">${displayName}</span>
                                    </div>
                                </div>
                            `;
                            galleryItems.push(galleryItem);
                        } else {
                            const galleryItem = `
                                <div class="gallery-item category-${category}" data-category="${category}" onclick="openLightbox('${relativePath}', '${displayName}')">
                                    <img src="${relativePath}" alt="${displayName}">
                                    <div class="gallery-overlay">
                                        <i class="fas fa-expand"></i>
                                        <span class="category-label">${displayName}</span>
                                    </div>
                                </div>
                            `;
                            galleryItems.push(galleryItem);
                        }
                    }
                });
            }
        } catch (error) {
            console.log(`Warning: Could not process folder ${folderPath}: ${error.message}`);
        }
    }
    
    // Process gallery items to ensure they have the correct structure
    const galleryWithLazyLoad = galleryItems.map((item, index) => {
        // For pre-wedding items, ensure they have the correct class and attributes
        if (item.includes('data-category="pre-wedding"')) {
            // Extract the existing attributes we want to keep
            const coupleMatch = item.match(/data-couple="([^"]+)"/);
            const couple = coupleMatch ? coupleMatch[1] : '';
            const onclickMatch = item.match(/onclick="([^"]+)"/);
            const onclick = onclickMatch ? onclickMatch[1] : '';
            const imgMatch = item.match(/<img[^>]+src="([^"]+)"[^>]*>/);
            const imgSrc = imgMatch ? imgMatch[1] : '';
            const altMatch = item.match(/alt="([^"]+)"/);
            const alt = altMatch ? altMatch[1] : '';
            
            // Rebuild the item with the correct structure
            return `
                <div class="gallery-item category-pre-wedding" data-index="${index}" data-couple="${couple}" data-category="pre-wedding" ${index >= 20 ? 'style="display: none;"' : ''} onclick="${onclick}">
                    <img src="${imgSrc}" alt="${alt}">
                    <div class="gallery-overlay">
                        <i class="fas fa-expand"></i>
                        <span class="category-label">${alt}</span>
                    </div>
                </div>
            `;
        }
        
        // For other items, extract the category and apply standard processing
        const categoryMatch = item.match(/category-(\w+)/);
        const category = categoryMatch ? categoryMatch[1] : '';
        
        // Create a proper class string with the category (lowercase and replace spaces with hyphens)
        const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-');
        const classStr = `gallery-item category-${normalizedCategory}`;
        
        // Replace the opening div with proper classes and data attributes
        return item
            .replace(/<div class="[^"]*"/, `<div class="${classStr}"`)
            .replace(/\s+category-[\w-]+"/, '"')
            .replace('<div class="gallery-item"', 
                   `<div class="gallery-item category-${normalizedCategory}" data-index="${index}" ${index >= 20 ? 'style="display: none;"' : ''}`);
    });

    // Generate final HTML with load more button
    const galleryHTML = `
        <div class="gallery-grid">
            ${galleryWithLazyLoad.join('\n')}
        </div>
        <div class="load-more-container" style="text-align: center; margin: 20px 0;">
            <button id="loadMoreBtn" class="load-more-btn" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #ffd700; border: none; border-radius: 5px; color: #333; font-weight: bold; display: ${galleryItems.length > 20 ? 'inline-block' : 'none'};">
                Load More
            </button>
        </div>
    `;
    
    // Create dist directory if it doesn't exist
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }
    
    // Write to gallery-items.html in both root and dist directories
    try {
        fs.writeFileSync('gallery-items.html', galleryHTML.trim());
        fs.writeFileSync(path.join(distDir, 'gallery-items.html'), galleryHTML.trim());
        console.log('Successfully generated gallery-items.html in both root and dist directories');
    } catch (error) {
        console.error('Error writing gallery files:', error.message);
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
        // Skip directories that shouldn't be copied
        if (['dist', 'node_modules', '.git', '.github', 'image'].includes(file) || 
            file.startsWith('.')) {
            return;
        }
        
        const srcPath = path.join(__dirname, file);
        const destPath = path.join(distDir, file);
        
        try {
            // If it's a directory, create it in dist
            if (fs.lstatSync(srcPath).isDirectory()) {
                if (!fs.existsSync(destPath)) {
                    fs.mkdirSync(destPath, { recursive: true });
                }
            } else {
                // If it's a file, copy it
                fs.copyFileSync(srcPath, destPath);
            }
        } catch (error) {
            console.warn(`Could not process ${srcPath}:`, error.message);
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
