import ProductCard from './ProductCard';

export default function ProductList({ products, recommendedIds = [] }) {
  const recommendedSet = new Set(recommendedIds);

  return (
    <section className="product-list">
      <h2>All Products</h2>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            highlighted={recommendedSet.has(product.id)}
          />
        ))}
      </div>
    </section>
  );
}
