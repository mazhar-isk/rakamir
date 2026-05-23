import { resolveMock } from './mock/handlers';

try {
  console.log('Testing GET /products...');
  const res1 = resolveMock('GET', '/products');
  console.log('GET /products success:', !!res1);

  console.log('Testing GET /admin/products...');
  const res2 = resolveMock('GET', '/admin/products');
  console.log('GET /admin/products success:', !!res2);

  console.log('Testing GET /products/sweater-running-aeroglow...');
  const res3 = resolveMock('GET', '/products/sweater-running-aeroglow');
  console.log('GET /products/sweater-running-aeroglow success:', !!res3);

  console.log('Testing GET /products/iphone-15-pro...');
  const res4 = resolveMock('GET', '/products/iphone-15-pro');
  console.log('GET /products/iphone-15-pro success:', !!res4);

  console.log('Testing GET /products?category=fashion...');
  const res5 = resolveMock('GET', '/products?category=fashion');
  console.log('GET /products?category=fashion success:', !!res5);
  
  console.log('All tests passed successfully!');
} catch (error) {
  console.error('Error occurred during mock resolution:', error);
}
