import { useState } from 'react';
import Header from './components/layout/Header';
import PatientForm from './components/form/PatientForm';
import ResultsDashboard from './components/results/ResultsDashboard';
import { usePrediction } from './hooks/usePrediction';

function App() {
  const [view, setView] = useState('form'); // 'form' | 'results'
  const [patientData, setPatientData] = useState(null);
  const { predict, result, loading, error, reset } = usePrediction();

  const handleSubmit = async (data) => {
    setPatientData(data);
    const success = await predict(data);
    if (success) setView('results');
  };

  const handleNewEvaluation = () => {
    reset();
    setPatientData(null);
    setView('form');
  };

  const title =
    view === 'form' ? 'Evaluación de Riesgo de Ictus' : 'Resultado de la Evaluación';

  return (
    <div className="app">
      <Header title={title} subtitle="Sistema de Predicción de Riesgo de Ictus" />
      <main className="app__main">
        {view === 'form' ? (
          <PatientForm onSubmit={handleSubmit} loading={loading} error={error} />
        ) : (
          <ResultsDashboard
            result={result}
            patientData={patientData}
            onNewEvaluation={handleNewEvaluation}
          />
        )}
      </main>
    </div>
  );
}

export default App;
