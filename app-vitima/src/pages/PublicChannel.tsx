import { FormEvent, useRef, useState, useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { Browser } from '@capacitor/browser';
import { Geolocation } from '@capacitor/geolocation';
import Button from '../components/Button';
import Icon from '../components/Icon';
import StatusTracker from './StatusTracker';
import {
  LIGUE_180_WHATSAPP,
  Report,
  formatNow,
  sendReportToBackend,
  saveReportLocally,
  getSavedReports,
} from '../data';

interface Props {
  onBackToCalculator: () => void;
}

interface Coords {
  latitude: number;
  longitude: number;
}

export default function PublicChannel({ onBackToCalculator }: Props) {
  const contentRef = useRef<HTMLIonContentElement>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'status'>('form');
  const [protocol, setProtocol] = useState('');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locationMessage, setLocationMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    setSavedCount(getSavedReports().length);
  }, [protocol, activeTab]);

  const openWhatsApp = () => Browser.open({ url: LIGUE_180_WHATSAPP });

  const quickExit = () => window.location.replace('https://www.google.com');

  const requestLocation = async () => {
    setLocationMessage('Obtendo sua localização...');
    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      });
      setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      setLocationMessage('Localização obtida e pronta para envio.');
    } catch {
      setCoords(null);
      setLocationMessage('Não foi possível acessar a localização. Verifique a permissão do aparelho.');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!coords) {
      setLocationMessage('Permita o acesso à localização exata antes de enviar a denúncia.');
      return;
    }

    setSending(true);
    const data = new FormData(e.currentTarget);
    const reason = String(data.get('public-reason'));
    const id = Date.now();
    const date = formatNow();

    const report: Report = {
      id,
      date,
      status: 'Pendente',
      address: `Localização exata compartilhada: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`,
      reason,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`,
      hasSharedLocation: true,
      statusHistory: [
        {
          status: 'Pendente',
          timestamp: date,
          by: 'App Mulher (Denúncia enviada)'
        }
      ]
    };

    // Salva localmente no histórico da mulher
    saveReportLocally(report);

    // Envio para o backend dos policiais
    await sendReportToBackend(report);

    setSending(false);
    setProtocol(String(id));
    contentRef.current?.scrollToTop(300);
  };

  const reset = () => {
    setProtocol('');
    setCoords(null);
    setLocationMessage('');
  };

  return (
    <IonPage>
      <IonContent ref={contentRef} fullscreen>
        <main className="public-page">
          {/* Topbar com Retorno Discreto e Saída Rápida de Emergência */}
          <header className="public-topbar">
            <button
              className="public-brand"
              onClick={onBackToCalculator}
              title="Voltar para a Calculadora"
              type="button"
            >
              <span>
                <Icon name="shield" />
              </span>
              <strong>Rede Protege</strong>
            </button>
            <div className="public-topbar-actions">
              <button className="quick-exit" onClick={quickExit} type="button">
                <Icon name="exit" />
                Saída rápida
              </button>
            </div>
          </header>

          {/* Abas Superiores de Navegação no Canal da Mulher */}
          <nav className="vitima-nav-tabs">
            <button
              type="button"
              className={`vitima-tab-btn ${activeTab === 'form' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('form');
                reset();
              }}
            >
              <Icon name="shield" />
              Enviar Denúncia
            </button>
            <button
              type="button"
              className={`vitima-tab-btn ${activeTab === 'status' ? 'active' : ''}`}
              onClick={() => setActiveTab('status')}
            >
              <Icon name="history" />
              Acompanhar Status {savedCount > 0 && `(${savedCount})`}
            </button>
          </nav>

          {/* Alternância: Acompanhamento de Status vs Formulário */}
          {activeTab === 'status' ? (
            <section className="public-content-container">
              <StatusTracker onBackToForm={() => setActiveTab('form')} />
            </section>
          ) : protocol ? (
            <section className="public-confirmation" aria-live="polite">
              <span className="confirmation-mark">
                <Icon name="check" />
              </span>
              <span className="eyebrow">Denúncia enviada com sucesso</span>
              <h1>Recebemos seu pedido de ajuda.</h1>
              <p>Sua denúncia já foi transmitida para a Central Policial e viaturas estão sendo alertadas.</p>

              <div className="protocol">
                <span>Número do Protocolo</span>
                <strong>#{protocol}</strong>
              </div>

              <div className="confirmation-actions">
                <Button
                  variant="primary"
                  onClick={() => setActiveTab('status')}
                >
                  <Icon name="history" />
                  Acompanhar Status da Viatura em Tempo Real
                </Button>
                <Button onClick={reset}>
                  Fazer nova denúncia
                </Button>
                <Button onClick={onBackToCalculator}>
                  Voltar à Calculadora
                </Button>
              </div>

              <small>Guarde seu número de protocolo para consultas futuras no aplicativo.</small>
            </section>
          ) : (
            <>
              {/* Banner Informativo / Hero */}
              <section className="public-hero">
                <div>
                  <span className="hero-eyebrow">Canal Seguro de Atendimento</span>
                  <h1>Você não está sozinha. Peça ajuda discretamente.</h1>
                  <p>
                    Seus dados e coordenadas GPS serão transmitidos de forma sigilosa para as forças
                    de segurança.
                  </p>
                </div>
                <div className="hero-steps">
                  <div className="hero-step">
                    <span>1</span>
                    <div>
                      <strong>Selecione o tipo de violência</strong>
                      <p>Classifique o ocorrido para priorização do chamado.</p>
                    </div>
                  </div>
                  <div className="hero-step">
                    <span>2</span>
                    <div>
                      <strong>Compartilhe sua localização</strong>
                      <p>O GPS garantirá o envio exato da viatura.</p>
                    </div>
                  </div>
                  <div className="hero-step">
                    <span>3</span>
                    <div>
                      <strong>Acompanhe o deslocamento</strong>
                      <p>Veja o status em tempo real pelo seu protocolo.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Layout com Formulário e Suporte */}
              <section className="public-layout">
                <form className="public-form" onSubmit={handleSubmit}>
                  <div className="public-form-heading">
                    <div>
                      <h2>Faça sua denúncia</h2>
                      <p>
                        Preencha as informações essenciais. Campos com <b>*</b> são obrigatórios.
                      </p>
                    </div>
                    <span className="secure-label">
                      <Icon name="shield" /> Ambiente protegido
                    </span>
                  </div>

                  <div className="form-divider">
                    <span>Tipo da agressão</span>
                  </div>

                  <div className="form-grid">
                    <label className="field field-full">
                      <span>
                        Tipo de agressão <b>*</b>
                      </span>
                      <select defaultValue="" name="public-reason" required>
                        <option disabled value="">
                          Selecione o tipo
                        </option>
                        <option>Agressão física</option>
                        <option>Violência psicológica</option>
                        <option>Violência sexual</option>
                        <option>Violência patrimonial</option>
                        <option>Violência moral</option>
                        <option>Ameaça</option>
                        <option>Descumprimento de medida protetiva</option>
                        <option>Outro tipo de agressão</option>
                      </select>
                    </label>
                  </div>

                  <div className="form-divider">
                    <span>Localização exata</span>
                  </div>

                  <div className="form-grid">
                    <div className="location-share field-full">
                      <div>
                        <span className="location-icon">
                          <Icon name="shield" />
                        </span>
                        <div>
                          <strong>Compartilhar localização exata</strong>
                          <p>Sua posição por satélite será transmitida em tempo real para a viatura mais próxima.</p>
                        </div>
                      </div>
                      <button
                        className={`location-button ${coords ? 'location-button-active' : ''}`}
                        onClick={requestLocation}
                        type="button"
                      >
                        {coords ? <Icon name="check" /> : null}
                        {coords ? 'Localização exata adicionada' : 'Permitir localização exata'}
                      </button>
                      {locationMessage && (
                        <small className={coords ? 'location-success' : ''} role="status">
                          {locationMessage}
                        </small>
                      )}
                      {coords && (
                        <div className="coordinates-preview">
                          <span>Coordenadas</span>
                          <strong>
                            {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button disabled={!coords || sending} variant="primary" type="submit">
                    {sending
                      ? 'Enviando com segurança...'
                      : coords
                        ? 'Enviar denúncia para a polícia'
                        : 'Compartilhe a localização para enviar'}
                  </Button>
                </form>

                <aside className="help-panel">
                  <span className="help-icon">
                    <Icon name="message" />
                  </span>
                  <h2>Prefere conversar?</h2>
                  <p>O Ligue 180 oferece orientação e acolhimento confidencial para mulheres em situação de violência.</p>
                  <Button variant="whatsapp" onClick={openWhatsApp}>
                    <Icon name="message" />
                    Chamar no WhatsApp
                  </Button>
                  <div className="help-note">
                    <strong>Atendimento de emergência</strong>
                    <p>O WhatsApp não substitui o 190 em situações de risco imediato.</p>
                  </div>
                </aside>
              </section>
            </>
          )}
        </main>
      </IonContent>
    </IonPage>
  );
}
