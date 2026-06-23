const EXAMPLE_PROMPTS = [
  'I want a phone under $500',
  'Budget laptop for a student',
  'Wireless headphones for travel',
  'Premium Apple devices',
];

export default function PreferenceForm({ preferences, onChange, onSubmit, loading }) {
  return (
    <form className="preference-form" onSubmit={onSubmit}>
      <label htmlFor="preferences">What are you looking for?</label>
      <textarea
        id="preferences"
        value={preferences}
        onChange={(e) => onChange(e.target.value)}
        placeholder='e.g. "I want a phone under $500 with a good camera"'
        rows={3}
        disabled={loading}
      />
      <div className="preference-form__actions">
        <button type="submit" disabled={loading || !preferences.trim()}>
          {loading ? 'Finding recommendations...' : 'Get Recommendations'}
        </button>
      </div>
      <div className="preference-form__examples">
        <span>Try:</span>
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="example-chip"
            onClick={() => onChange(prompt)}
            disabled={loading}
          >
            {prompt}
          </button>
        ))}
      </div>
    </form>
  );
}
