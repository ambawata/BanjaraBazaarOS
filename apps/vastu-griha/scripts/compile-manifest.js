import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, '../assets');
const manifestPath = path.join(assetsDir, 'asset-manifest.json');

// Recursively find all metadata.json files
function getMetadataFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  
  const list = fs.readdirSync(dir);
  
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(getMetadataFiles(filePath));
    } else if (file === 'metadata.json') {
      results.push(filePath);
    }
  });
  
  return results;
}

try {
  console.log('Manifest Compiler: Compiling asset-manifest.json...');
  const metadataFiles = getMetadataFiles(assetsDir);
  const manifestData = [];
  
  metadataFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const meta = JSON.parse(content);
    
    // Extract category and folder name
    // E.g., assets/furniture/sofa-modern/metadata.json
    const parts = file.split(path.sep);
    const category = parts[parts.length - 3];
    const folder = parts[parts.length - 2];
    
    meta.category = category;
    meta.filename = folder; // Use folder name to locate SVGs dynamically
    
    manifestData.push(meta);
  });
  
  // Write to asset-manifest.json
  fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2), 'utf8');
  console.log(`Manifest Compiler: Successfully compiled manifest with ${manifestData.length} items to ${manifestPath}`);
} catch (error) {
  console.error('Manifest Compiler: Error compiling manifest:', error);
  process.exit(1);
}
