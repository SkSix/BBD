const fs = require('fs');
const path = require('path');

// Function to generate gallery HTML
function generateGalleryHTML() {
    // Define the categories and their corresponding folders
    const categories = {
        'all': 'image/gallery',
        'wedding': 'image/gallery/wedding',
        'engagement': 'image/gallery/engagement',
        'pre-wedding': 'image/gallery/Pre_Wedding',
        'family': 'image/gallery/family'
    };
    
    // Create the gallery items array
    const galleryItems = [];
    
    // Process each category
    for (const [category, folderPath] of Object.entries(categories)) {
        // Skip 'all' category since it's just a placeholder
        if (category === 'all') continue;
        
        // Create the folder if it doesn't exist
        const fullPath = path.join(__dirname, folderPath);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
        
        // Read all files in the category folder
        const files = fs.readdirSync(fullPath);
        
        // Generate HTML for each image in this category
        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            const ext = path.extname(file).toLowerCase();
            
            // Only process image files
            if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                // Create gallery item HTML
                const galleryItem = `
                    <div class="gallery-item category-${category}" onclick="openLightbox('${filePath}', '${file}')">
                        <img src="${filePath}" alt="${file}">
                        <div class="gallery-overlay">
                            <i class="fas fa-expand"></i>
                            <span class="category-label">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                        </div>
                    </div>
                `;
                galleryItems.push(galleryItem);
            }
        });
    }
    
    // Generate final HTML
    const galleryHTML = `
        <div class="gallery-grid">
            ${galleryItems.join('\n')}
        </div>
    `;
    
    // Write to gallery-items.html
    fs.writeFileSync(path.join(__dirname, 'gallery-items.html'), galleryHTML);
    console.log('Gallery HTML generated successfully!');
}

// Watch for changes in all category folders
function watchGalleryDirectory() {
    // Define the categories and their corresponding folders
    const categories = {
        'wedding': 'image/gallery/wedding',
        'engagement': 'image/gallery/engagement',
        'Pre-Wedding': 'image/gallery/Pre-Wedding',
        'family': 'image/gallery/family'
    };
    
    // Watch each category folder
    for (const [category, folderPath] of Object.entries(categories)) {
        const fullPath = path.join(__dirname, folderPath);
        
        fs.watch(fullPath, (eventType, filename) => {
            if (eventType === 'change' || eventType === 'rename') {
                console.log(`Detected change in ${category} folder: ${filename}`);
                generateGalleryHTML();
            }
        });
    }
}

// Generate gallery on startup
console.log('Generating initial gallery...');
generateGalleryHTML();

// Start watching for changes
watchGalleryDirectory();
