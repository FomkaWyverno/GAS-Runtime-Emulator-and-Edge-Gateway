import fs from 'fs';
import path from "path";

const walkDir = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walkDir(filePath);
        } else if (filePath.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf-8');
            // Замінюємо всі відносні .ts імпорти на .js у скомпільованих файлах
            content = content.replace(/(from\s+['"][^'"]+)\.ts(['"])/g, '$1.js$2');
            content = content.replace(/(import\s*\(\s*['"][^'"]+)\.ts(['"]\s*\))/g, '$1.js$2');
            fs.writeFileSync(filePath, content, 'utf-8');
            
            console.log(`✅ Fix imports for path: ${filePath}`);
        }
    }
};
console.log(`Start fix .ts imports to .js in dist.`);
walkDir('dist');
console.log('Successfully fixed .ts imports to .js in dist!');