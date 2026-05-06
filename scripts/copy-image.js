import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = 'C:\\Users\\tesla\\.gemini\\antigravity\\brain\\f06da8d3-6ec3-42cf-b198-71395e5bbd4a\\uploaded_image_1767477665124.jpg';
const dest = path.join(__dirname, 'src', 'assets', 'hero-sophie.jpg');

try {
    fs.copyFileSync(source, dest);
    console.log('✅ Image copiée avec succès vers:', dest);
} catch (error) {
    console.error('❌ Erreur lors de la copie:', error.message);
    process.exit(1);
}
