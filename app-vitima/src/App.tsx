import { useState } from 'react';
import { IonApp } from '@ionic/react';
import Calculator from './pages/Calculator';
import PublicChannel from './pages/PublicChannel';

/**
 * Identificadores das telas do app da vítima:
 * - 'calculator': Calculadora funcional (disfarce permanente)
 * - 'public': Canal Seguro de Atendimento para envio do chamado
 */
type Screen = 'calculator' | 'public';

/**
 * Componente principal do App da Vítima.
 * Mantém o fluxo estrito: Calculadora -> Canal Seguro -> Retorno à Calculadora.
 */
export default function App() {
  const [screen, setScreen] = useState<Screen>('calculator');

  return (
    <IonApp>
      {/* 1. Calculadora Disfarçada */}
      {screen === 'calculator' && (
        <Calculator onUnlock={() => setScreen('public')} />
      )}

      {/* 2. Canal Seguro de Atendimento */}
      {screen === 'public' && (
        <PublicChannel onBackToCalculator={() => setScreen('calculator')} />
      )}
    </IonApp>
  );
}
