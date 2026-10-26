import { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { UNLOCK_SEQUENCE } from '../data';

/**
 * Operadores aritméticos suportados na calculadora.
 */
type Op = '+' | '−' | '×' | '÷';

/**
 * Interface representativa das teclas do teclado da calculadora.
 */
interface Key {
  label: string;
  kind: 'digit' | 'operator' | 'action';
  value?: string;
  action?: () => void;
  className?: string;
}

/**
 * Formata números evitando estouro visual de casas decimais.
 */
const format = (n: number) =>
  Number.isFinite(n) ? Number(n.toPrecision(12)).toString() : 'Erro';

/**
 * Executa as operações aritméticas elementares.
 */
const compute = (a: number, b: number, op: Op) =>
  op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : b === 0 ? NaN : a / b;

/**
 * Componente da Calculadora Disfarçada.
 * Funciona como calculadora real no dia a dia. Ao digitar a sequência secreta "1 + 10 =",
 * aciona a abertura do Canal Seguro de Atendimento para a vítima.
 */
export default function Calculator({ onUnlock }: { onUnlock: () => void }) {
  const [display, setDisplay] = useState('0');
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [fresh, setFresh] = useState(false);
  const [typed, setTyped] = useState('');

  /**
   * Reseta a calculadora para o estado zero padrão.
   */
  const clear = () => {
    setDisplay('0');
    setAcc(null);
    setOp(null);
    setFresh(false);
    setTyped('');
  };

  /**
   * Trata a entrada de dígitos numéricos de 0 a 9.
   */
  const pressDigit = (d: string) => {
    setDisplay((cur) =>
      fresh || cur === '0' || cur === 'Erro' ? d : cur.length < 12 ? `${cur}${d}` : cur
    );
    setFresh(false);
    setTyped((t) => `${t}${d}`);
  };

  /**
   * Insere o ponto decimal no número atual.
   */
  const pressDecimal = () => {
    if (fresh || display === 'Erro') {
      setDisplay('0.');
      setFresh(false);
    } else if (!display.includes('.')) {
      setDisplay(`${display}.`);
    }
    setTyped((t) => `${t}.`);
  };

  /**
   * Trata a seleção de operadores matemáticos (+, -, *, /).
   */
  const pressOperator = (next: Op) => {
    const current = Number(display);
    if (acc === null || display === 'Erro') {
      setAcc(current);
    } else if (op && !fresh) {
      const result = compute(acc, current, op);
      setDisplay(format(result));
      setAcc(result);
    }
    setOp(next);
    setFresh(true);
    setTyped((t) => `${t}${next}`);
  };

  /**
   * Trata o clique no botão de igualdade.
   * Se a combinação digitada for "1+10", desbloqueia o canal seguro de emergência.
   */
  const pressEquals = () => {
    if (typed === UNLOCK_SEQUENCE) {
      onUnlock();
      setTyped('');
      return;
    }

    if (op && acc !== null && !fresh) {
      setDisplay(format(compute(acc, Number(display), op)));
      setAcc(null);
      setOp(null);
      setFresh(true);
    }
    setTyped('');
  };

  const keys: Key[] = [
    { label: 'AC', kind: 'action', action: clear, className: 'calculator-key-muted' },
    {
      label: '+/−',
      kind: 'action',
      action: () => {
        if (display !== '0' && display !== 'Erro') setDisplay(format(Number(display) * -1));
        setTyped('');
      },
      className: 'calculator-key-muted',
    },
    {
      label: '%',
      kind: 'action',
      action: () => {
        if (display !== 'Erro') setDisplay(format(Number(display) / 100));
        setTyped('');
      },
      className: 'calculator-key-muted',
    },
    { label: '÷', kind: 'operator', value: '÷' },
    { label: '7', kind: 'digit', value: '7' },
    { label: '8', kind: 'digit', value: '8' },
    { label: '9', kind: 'digit', value: '9' },
    { label: '×', kind: 'operator', value: '×' },
    { label: '4', kind: 'digit', value: '4' },
    { label: '5', kind: 'digit', value: '5' },
    { label: '6', kind: 'digit', value: '6' },
    { label: '−', kind: 'operator', value: '−' },
    { label: '1', kind: 'digit', value: '1' },
    { label: '2', kind: 'digit', value: '2' },
    { label: '3', kind: 'digit', value: '3' },
    { label: '+', kind: 'operator', value: '+' },
    { label: '0', kind: 'digit', value: '0' },
    { label: ',', kind: 'action', action: pressDecimal },
    { label: '=', kind: 'action', action: pressEquals, className: 'calculator-key-equals' },
  ];

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false} className="calculator-content">
        <main className="calculator-page">
          <section className="calculator-shell" aria-label="Calculadora">
            <div className="calculator-heading">
              <h1>Calculadora</h1>
              <span>Padrão</span>
            </div>

            <output aria-live="polite" className="calculator-display">
              {display.replace('.', ',')}
            </output>

            <div className="calculator-grid">
              {keys.map((key) => {
                const handler =
                  key.kind === 'digit'
                    ? () => pressDigit(key.value!)
                    : key.kind === 'operator'
                      ? () => pressOperator(key.value as Op)
                      : key.action;

                const cls = [
                  'calculator-key',
                  key.kind === 'operator' ? 'calculator-key-operator' : '',
                  key.kind === 'digit' && key.value === '0' ? 'calculator-key-zero' : '',
                  key.kind === 'action' ? key.className || '' : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <button key={key.label} className={cls} onClick={handler} type="button">
                    {key.label}
                  </button>
                );
              })}
            </div>
          </section>
        </main>
      </IonContent>
    </IonPage>
  );
}
