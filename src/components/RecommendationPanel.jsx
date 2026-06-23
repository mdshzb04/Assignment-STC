import ProductCard from './ProductCard';

export default function RecommendationPanel({ recommendations, explanation, source }) {
  if (!recommendations?.length) {
    return null;
  }

  return (
    <section className="recommendation-panel">
      <div className="recommendation-panel__header">
        <h2>Recommended for You</h2>
        {source && (
          <span className={`source-badge source-badge--${source}`}>
            {source === 'anthropic' ? 'AI powered' : 'Local match'}
          </span>
        )}
      </div>
      <p className="recommendation-panel__explanation">{explanation}</p>
      <div className="product-grid product-grid--compact">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} highlighted />
        ))}
      </div>
    </section>
  );
}
