const fs = require('fs');
const path = require('path');

// Cria o diretório dist/public se não existir
const publicDir = path.join(__dirname, '..', 'dist', 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// Copia os arquivos da pasta public
const sourceDir = path.join(__dirname, 'public');
fs.readdirSync(sourceDir).forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(publicDir, file);
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copiado: ${file}`);
}); 