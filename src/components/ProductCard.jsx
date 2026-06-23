export default function ProductCard({ product, highlighted = false }) {
  return (
    <article className={`product-card ${highlighted ? 'product-card--highlighted' : ''}`}>
      <div className="product-card__header">
        <h3>{product.name}</h3>
        <span className="product-card__price">${product.price}</span>
      </div>
      <p className="product-card__category">{product.category}</p>
      <p className="product-card__description">{product.description}</p>
      <div className="product-card__tags">
        {product.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
