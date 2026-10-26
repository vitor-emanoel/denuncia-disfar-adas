import React from 'react';
import { createRoot } from 'react-dom/client';
import { setupIonicReact } from '@ionic/react';

/* Estilos essenciais do Ionic Framework */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Variáveis de tema e estilos globais customizados */
import './theme/variables.css';
import './styles.css';

import App from './App';

/* Inicialização do Ionic com modo Material Design fixado para consistência visual */
setupIonicReact({ mode: 'md' });

/* Ponto de montagem da árvore React na raiz do DOM */
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
