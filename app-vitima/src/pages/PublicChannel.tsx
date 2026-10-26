import { FormEvent, useRef, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { Browser } from '@capacitor/browser';
import { Geolocation } from '@capacitor/geolocation';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { LIGUE_180_WHATSAPP, Report, formatNow, sendReportToBackend } from '../data';

/**
 * Propriedades esperadas pelo canal da mulher.
 */
interface Props {
  onBackToCalculator: () => void;
}

/**
 * Estrutura das coordenadas geográficas.
 */
interface Coords {
  latitude: number;
  longitude: number;
}

/**
 * Canal Seguro de Atendimento / Canal da Mulher.
 * Tela exibida imediatamente após a digitação da senha na calculadora.
 * Permite envio sigiloso da denúncia diretamente para o sistema policial,
 * captura de GPS exato e botões de pânico / saída rápida.
 */
export default function PublicChannel({ onBackToCalculator }: Props) {
  const contentRef = useRef<HTMLIonContentElement>(null);
  const [protocol, setProtocol] = useState('');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locationMessage, setLocationMessage] = useState('');
  const [sending, setSending] = useState(false);

  /**
   * Abre o canal oficial do Ligue 180 no WhatsApp.
   */
  const openWhatsApp = () => Browser.open({ url: LIGUE_180_WHATSAPP });

  /**
   * Saída rápida de emergência: substitui a tela imediatamente por um site neutro.
   */
  const quickExit = () => window.location.replace('https://www.google.com');

  /**
   * Captura as coordenadas de GPS do dispositivo.
   */
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

  /**
   * Processa e envia a denúncia para a central da polícia via backend.
   */
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

    const report: Report = {
      id,
      date: formatNow(),
      status: 'Pendente',
      address: `Localização exata compartilhada: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`,
      reason,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`,
      hasSharedLocation: true,
    };

    // Envio para o backend dos policiais
    await sendReportToBackend(report);

    setSending(false);
    setProtocol(String(id).slice(-6));
    contentRef.current?.scrollToTop(300);
  };

  /**
   * Reseta o formulário para um novo envio se necessário.
   */
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

          {/* Tela de Confirmação vs Formulário */}
          {protocol ? (
            <section className="public-confirmation" aria-live="polite">
              <span className="confirmation-mark">
                <Icon name="check" />
              </span>
              <span className="eyebrow">Denúncia enviada</span>
              <h1>Recebemos seu pedido de ajuda.</h1>
              <p>Sua denúncia e localização foram enviadas com prioridade para a equipe policial.</p>
              
              <div className="protocol">
                <span>Número do protocolo</span>
                <strong>#{protocol}</strong>
              </div>

              <div className="confirmation-actions">
                <Button variant="whatsapp" onClick={openWhatsApp}>
                  <Icon name="message" />
                  Falar com o Ligue 180 no WhatsApp
                </Button>
                <Button onClick={reset}>Fazer outra denúncia</Button>
                <Button onClick={onBackToCalculator}>Voltar à calculadora</Button>
              </div>
              <small>Se houver perigo iminente, ligue imediatamente para o 190.</small>
            </section>
          ) : (
            <>
              {/* Destaque Inicial com Discagem 190 */}
              <section className="public-hero">
                <div>
                  <span className="eyebrow">Canal seguro de atendimento</span>
                  <h1>Você não está sozinha.</h1>
                  <p>
                    Conte o que está acontecendo. Suas informações serão encaminhadas com total sigilo e rapidez para os
                    serviços de atendimento e segurança.
                  </p>
                </div>
                <div className="emergency-card">
                  <strong>Está em perigo agora?</strong>
                  <p>Não espere pelo formulário. Ligue imediatamente para a Polícia Militar.</p>
                  <a href="tel:190">Ligar para 190</a>
                </div>
              </section>

              {/* Seção Principal: Formulário e Painel de Ajuda */}
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
