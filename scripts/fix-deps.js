import { readFileSync, writeFileSync } from 'fs';
const pkgPath = new URL('../package.json', import.meta.url).pathname;
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

// Replace @vitejs/plugin-react with @vitejs/plugin-react-swc
delete pkg.devDependencies['@vitejs/plugin-react'];
delete pkg.devDependencies['react-refresh'];
pkg.devDependencies['@vitejs/plugin-react-swc'] = '^4.3.0';

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('Updated package.json - swapped plugin-react for plugin-react-swc');
console.log('New devDependencies:', JSON.stringify(pkg.devDependencies, null, 2));
