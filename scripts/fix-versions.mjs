import { readFileSync, writeFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

// Downgrade Vite to v6 which is compatible with @tailwindcss/vite 4.x
pkg.devDependencies.vite = '^6.0.7';
pkg.devDependencies['@vitejs/plugin-react'] = '^4.4.1';
pkg.devDependencies.typescript = '~5.7.2';
pkg.devDependencies['@types/node'] = '^22.10.5';

// Pin tailwindcss versions
pkg.dependencies['@tailwindcss/vite'] = '^4.1.7';
pkg.dependencies.tailwindcss = '^4.1.7';

writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('Updated package.json with compatible versions');
console.log('vite:', pkg.devDependencies.vite);
console.log('@vitejs/plugin-react:', pkg.devDependencies['@vitejs/plugin-react']);
console.log('@tailwindcss/vite:', pkg.dependencies['@tailwindcss/vite']);
