import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { loginCentral, UserSession } from '../data';

interface Props {
  onLoginSuccess: (session: UserSession) => void;
}

export default function LoginCentral({ onLoginSuccess }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const session = await loginCentral(username, password);
      if (session) {
        onLoginSuccess(session);
      } else {
        setError('Usuário ou senha incorretos. Tente central190 / 123 ou admin / admin');
      }
    } catch {
      setError('Erro ao autenticar. Verifique se o servidor backend está online.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="login-content">
        <main className="login-page">
          <div className="login-card">
            <div className="login-header">
              <div className="login-badge">
                <Icon name="shield" />
              </div>
              <h2>Central de Atendimento</h2>
              <p>Sistema Integrado de Despacho e Monitoramento de Emergências</p>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <label className="field field-full">
                <span>Usuário / Matrícula</span>
                <div className="input-with-icon">
                  <Icon name="user" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: central190 ou admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </label>

              <label className="field field-full">
                <span>Senha de Acesso</span>
                <div className="input-with-icon">
                  <Icon name="lock" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              </label>

              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="login-submit-btn"
              >
                {loading ? 'Validando credenciais...' : 'Acessar Central'}
              </Button>
            </form>

            <div className="login-hints">
              <p>Credenciais padrão para testes:</p>
              <code>central190 / 123</code> ou <code>admin / admin</code>
            </div>
          </div>
        </main>
      </IonContent>
    </IonPage>
  );
}
