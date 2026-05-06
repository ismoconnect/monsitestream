import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, 'src', 'assets', 'hero-sophie.jpg');
const destMobile = path.join(__dirname, 'src', 'assets', 'hero-sophie-mobile.jpg');

try {
    // Copier l'image pour la version mobile
    fs.copyFileSync(source, destMobile);
    console.log('✅ Image mobile créée avec succès:', destMobile);
    console.log('');
    console.log('📝 Note: Pour une vraie optimisation, utilisez un outil comme:');
    console.log('   - TinyPNG (https://tinypng.com)');
    console.log('   - Squoosh (https://squoosh.app)');
    console.log('   - ImageMagick pour redimensionner automatiquement');
    console.log('');
    console.log('💡 Taille recommandée pour mobile: 800x1200px (portrait)');
} catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
}
