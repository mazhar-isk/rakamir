import { resolveMock } from './mock/handlers';
import { Product } from './types';

try {
  console.log('Fetching mock products...');
  const res = resolveMock('GET', '/products?per_page=100');
  if (!res) {
    console.error('Failed to resolve mock for /products');
    process.exit(1);
  }

  const paginated = res.data as any;
  const products = paginated.data as Product[];
  console.log(`Resolved ${products.length} products successfully.`);

  products.forEach((p) => {
    // Check required fields
    if (!p.id) console.error(`Product slug "${p.slug}" is missing id!`);
    if (!p.name) console.error(`Product ID "${p.id}" is missing name!`);
    if (!p.price && p.price !== 0) console.error(`Product ID "${p.id}" is missing price!`);
    if (!p.category) console.error(`Product ID "${p.id}" is missing category!`);
    if (!p.categories) console.error(`Product ID "${p.id}" is missing categories!`);
    
    // Check categories structure
    if (p.categories) {
      p.categories.forEach((cat, idx) => {
        if (!cat) console.error(`Product ID "${p.id}" has null category at index ${idx}!`);
        else if (!cat.id || !cat.name || !cat.slug) {
          console.error(`Product ID "${p.id}" has invalid category structure:`, cat);
        }
      });
    }
  });

  console.log('Deep validation completed.');
} catch (error) {
  console.error('Deep validation threw an error:', error);
}
