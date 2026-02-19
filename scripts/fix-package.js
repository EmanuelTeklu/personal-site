import { readFileSync, writeFileSync } from 'fs';

const pkgPath = '/vercel/share/v0-project/package.json';
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

// Remove @tailwindcss/vite if present
if (pkg.dependencies?.['@tailwindcss/vite']) {
  const version = pkg.dependencies['@tailwindcss/vite'];
  delete pkg.dependencies['@tailwindcss/vite'];
  pkg.dependencies['@tailwindcss/postcss'] = version;
  console.log(`Replaced @tailwindcss/vite (${version}) with @tailwindcss/postcss`);
} else if (pkg.dependencies?.['@tailwindcss/postcss']) {
  console.log('@tailwindcss/postcss already present');
} else {
  pkg.dependencies['@tailwindcss/postcss'] = '^4.1.0';
  console.log('Added @tailwindcss/postcss');
}

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('package.json updated successfully');
console.log('Current dependencies:', JSON.stringify(pkg.dependencies, null, 2));
