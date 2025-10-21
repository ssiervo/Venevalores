import './PredictionsView.css';

const mockContracts = [
  {
    id: 'oil-90',
    question: '¿Brent cerrará el mes por encima de 90 USD?',
    probability: 0.42,
    deadline: '2025-10-31',
  },
  {
    id: 'inflation',
    question: '¿Inflación mensual BCV < 2% en noviembre?',
    probability: 0.35,
    deadline: '2025-11-15',
  },
  {
    id: 'index',
    question: '¿IBC cerrará el trimestre con +8% o más?',
    probability: 0.58,
    deadline: '2025-12-29',
  },
];

export function PredictionsView() {
  return (
    <section className="predictions">
      <header>
        <h1>Mercado de predicciones</h1>
        <p>Practica probabilidades con fichas educativas. El ranking semanal premia la precisión y consistencia.</p>
      </header>

      <div className="predictions__grid">
        {mockContracts.map((contract) => (
          <article key={contract.id}>
            <h2>{contract.question}</h2>
            <p className="predictions__probability">{Math.round(contract.probability * 100)}% Probabilidad</p>
            <small>Cierre: {new Date(contract.deadline).toLocaleDateString('es-VE')}</small>
            <button type="button" className="btn-primary">
              Apostar tokens
            </button>
          </article>
        ))}
      </div>

      <aside className="predictions__aside">
        <h2>Tabla de posiciones</h2>
        <ol>
          <li>
            <strong>Ana</strong>
            <span>1240 pts · 8/10 aciertos</span>
          </li>
          <li>
            <strong>Carlos</strong>
            <span>1095 pts · 7/10 aciertos</span>
          </li>
          <li>
            <strong>María</strong>
            <span>1010 pts · 6/10 aciertos</span>
          </li>
        </ol>
      </aside>
    </section>
  );
}
