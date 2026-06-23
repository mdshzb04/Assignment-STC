import { useEffect, useMemo, useState } from 'react';
import { fetchProducts, fetchRecommendations } from './api/recommendations';
import PreferenceForm from './components/PreferenceForm';
import ProductList from './components/ProductList';
import RecommendationPanel from './components/RecommendationPanel';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [preferences, setPreferences] = useState('');
  const [recommendedIds, setRecommendedIds] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const data = await fetchProducts();
        if (!cancelled) setProducts(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const recommendedProducts = useMemo(
    () => products.filter((product) => recommendedIds.includes(product.id)),
    [products, recommendedIds],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await fetchRecommendations(preferences);
      setRecommendedIds(result.recommendedIds ?? []);
      setExplanation(result.explanation ?? '');
      setSource(result.source ?? null);
    } catch (err) {
      setError(err.message);
      setRecommendedIds([]);
      setExplanation('');
      setSource(null);
    } finally {
      setLoading(false);
    }
  }

  if (productsLoading) {
    return (
      <div className="app">
        <p className="loading-message">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Product Recommendation System</h1>
        <p>
          Browse our catalog and tell us what you need. AI will recommend the best
          matches from the list below.
        </p>
      </header>

      <main className="app-main">
        <PreferenceForm
          preferences={preferences}
          onChange={setPreferences}
          onSubmit={handleSubmit}
          loading={loading}
        />

        {error && <p className="error-message">{error}</p>}

        <RecommendationPanel
          recommendations={recommendedProducts}
          explanation={explanation}
          source={source}
        />

        <ProductList products={products} recommendedIds={recommendedIds} />
      </main>
    </div>
  );
}

export default App;
