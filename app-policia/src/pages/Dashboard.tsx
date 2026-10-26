import { FormEvent, useRef, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { Browser } from '@capacitor/browser';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { Report, ReportStatus, formatNow } from '../data';

/**
 * Propriedades esperadas pelo painel policial.
 */
interface Props {
  reports: Report[];
  connected: boolean;
  onAddReport: (report: Report) => void;
  onUpdateStatus: (id: number, status: ReportStatus) => void;
}

/**
 * Painel Administrativo e Operacional da Polícia.
 * Exibe as denúncias enviadas pelas mulheres em tempo real com indicador de conexão
 * via WebSocket, localização precisa no mapa e alteração de status de despacho de viatura.
 */
export default function Dashboard({ reports, connected, onAddReport, onUpdateStatus }: Props) {
  const contentRef = useRef<HTMLIonContentElement>(null);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [success, setSuccess] = useState('');

  const pending = reports.filter((r) => r.status === 'Pendente').length;
  const scrollTop = () => contentRef.current?.scrollToTop(300);

  const openCreate = () => {
    setSuccess('');
    setView('create');
    scrollTop();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const street = String(data.get('street'));
    const number = String(data.get('number'));
    const complement = String(data.get('complement') || '');
    const neighborhood = String(data.get('neighborhood'));
    const reason = String(data.get('reason'));
    const code = String(data.get('code'));

    const address = `${street}, ${number}${complement ? `, ${complement}` : ''} - ${neighborhood}, Recife - PE`;

    onAddReport({
      id: Date.now(),
      date: formatNow(),
      status: 'Pendente',
      address,
      reason: `${reason} - ${code}`,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
    });

    setSuccess('Chamado aberto com sucesso e adicionado à fila operacional.');
    setView('list');
    scrollTop();
  };

  return (
    <IonPage>
      <IonContent ref={contentRef} fullscreen>
        <main className="page">
          {/* Topbar da Central Policial */}
          <header className="topbar">
            <div className="brand">
              <div className="brand-mark">
                <Icon name="shield" />
              </div>
              <div>
                <h1>Central de Atendimento Policial</h1>
                <p>Monitoramento de denúncias e despacho de viaturas em tempo real</p>
              </div>
            </div>
            <div className="topbar-actions">
              {/* Indicador de Status da Conexão em Tempo Real */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: connected ? '#ecfdf5' : '#fef2f2',
                  color: connected ? '#065f46' : '#991b1b',
                  border: `1px solid ${connected ? '#a7f3d0' : '#fecaca'}`,
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: connected ? '#10b981' : '#ef4444',
                  }}
                />
                {connected ? 'Tempo Real Ativo' : 'Reconectando...'}
              </div>

              {/* Contador de Pendências */}
              <div className="pending-summary">
                <span className="summary-dot" />
                {pending} {pending === 1 ? 'Ocorrência Pendente' : 'Ocorrências Pendentes'}
              </div>
            </div>
          </header>

          {/* Alternância de Visualização */}
          {view === 'list' ? (
            <section className="content" aria-label="Lista de denúncias">
              {success && (
                <div className="success-message" role="status">
                  <span className="success-icon">
                    <Icon name="check" />
                  </span>
                  <div>
                    <strong>Chamado registrado</strong>
                    <p>{success}</p>
                  </div>
                  <button aria-label="Fechar aviso" className="dismiss" onClick={() => setSuccess('')}>
                    ×
                  </button>
                </div>
              )}

              <div className="list-heading">
                <div>
                  <h2>Fila de ocorrências recebidas</h2>
                  <p>Denúncias transmitidas pelas vítimas em tempo real via canal seguro.</p>
                </div>
                <div className="heading-actions">
                  <span className="report-total">{reports.length} ocorrências</span>
                  <Button variant="primary" onClick={openCreate}>
                    <Icon name="plus" />
                    Novo chamado manual
                  </Button>
                </div>
              </div>

              <div className="report-list">
                {reports.map((report) => (
                  <article className="report-card" key={report.id}>
                    <div className="card-header">
                      <time>{report.date}</time>
                      <span className={`status status-${report.status.toLowerCase().replace(' ', '-')}`}>
                        {report.status}
                      </span>
                    </div>

                    <div className="address-row">
                      <strong>{report.address}</strong>
                      <Button variant="primary" onClick={() => Browser.open({ url: report.mapsUrl })}>
                        Abrir no Google Maps
                      </Button>
                    </div>

                    <div className="reason">
                      <div>
                        <span>Natureza do chamado:</span> {report.reason}
                      </div>
                      {report.hasSharedLocation && (
                        <span className="shared-location-label">
                          <Icon name="check" /> Localização exata por satélite
                        </span>
                      )}
                    </div>

                    <div className="actions">
                      <Button
                        disabled={report.status !== 'Pendente'}
                        onClick={() => onUpdateStatus(report.id, 'Em Atendimento')}
                      >
                        {report.status === 'Pendente' ? 'Despachar viatura / Atender' : 'Em atendimento'}
                      </Button>
                      <Button
                        variant="success"
                        disabled={report.status === 'Concluído'}
                        onClick={() => onUpdateStatus(report.id, 'Concluído')}
                      >
                        {report.status === 'Concluído' ? 'Ocorrência finalizada' : 'Concluir chamado'}
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <section className="content create-content" aria-labelledby="create-title">
              <button className="back-button" onClick={() => setView('list')}>
                <Icon name="arrow" />
                Voltar para a fila
              </button>

              <div className="create-heading">
                <div>
                  <span className="eyebrow">Registro Operacional</span>
                  <h2 id="create-title">Abertura manual de ocorrência</h2>
                  <p>Cadastre uma denúncia recebida via rádio, 190 ou presencialmente.</p>
                </div>
                <span className="required-note">
                  <b>*</b> Campos obrigatórios
                </span>
              </div>

              <form className="report-form" onSubmit={handleSubmit}>
                <div className="form-main">
                  <section className="form-section">
                    <div className="section-heading">
                      <span>1</span>
                      <div>
                        <h3>Endereço do fato</h3>
                        <p>Informe o logradouro e referências com a maior precisão possível.</p>
                      </div>
                    </div>
                    <div className="form-grid">
                      <label className="field field-wide">
                        <span>
                          Logradouro <b>*</b>
                        </span>
                        <input name="street" placeholder="Ex.: Rua da Aurora" required />
                      </label>
                      <label className="field">
                        <span>
                          Número <b>*</b>
                        </span>
                        <input inputMode="numeric" name="number" placeholder="Ex.: 295" required />
                      </label>
                      <label className="field">
                        <span>Complemento</span>
                        <input name="complement" placeholder="Apto., bloco ou ponto de referência" />
                      </label>
                      <label className="field">
                        <span>
                          Bairro <b>*</b>
                        </span>
                        <select defaultValue="" name="neighborhood" required>
                          <option disabled value="">
                            Selecione o bairro
                          </option>
                          <option>Boa Vista</option>
                          <option>Boa Viagem</option>
                          <option>Casa Forte</option>
                          <option>Derby</option>
                          <option>Graças</option>
                          <option>Outro</option>
                        </select>
                      </label>
                      <label className="field">
                        <span>Município / UF</span>
                        <input disabled value="Recife / PE" readOnly />
                      </label>
                    </div>
                  </section>

                  <section className="form-section">
                    <div className="section-heading">
                      <span>2</span>
                      <div>
                        <h3>Tipificação da ocorrência</h3>
                        <p>Selecione a natureza da denúncia e nível de urgência.</p>
                      </div>
                    </div>
                    <div className="form-grid">
                      <label className="field">
                        <span>
                          Natureza da denúncia <b>*</b>
                        </span>
                        <select defaultValue="" name="reason" required>
                          <option disabled value="">
                            Selecione o tipo
                          </option>
                          <option>Agressão física</option>
                          <option>Ameaça</option>
                          <option>Violência psicológica</option>
                          <option>Violência sexual</option>
                          <option>Violência patrimonial</option>
                          <option>Descumprimento de medida protetiva</option>
                          <option>Outro motivo</option>
                        </select>
                      </label>
                      <label className="field">
                        <span>
                          Código de prioridade <b>*</b>
                        </span>
                        <select defaultValue="" name="code" required>
                          <option disabled value="">
                            Selecione o código
                          </option>
                          <option>Código Amarelo (Urgência)</option>
                          <option>Código Roxo (Risco Elevado)</option>
                          <option>Código Azul (Prioridade Padrão)</option>
                        </select>
                      </label>
                      <label className="field field-full">
                        <span>Observações operacionais para a viatura</span>
                        <textarea
                          name="notes"
                          placeholder="Detalhes relevantes sobre o autor, histórico ou acesso ao local."
                          rows={4}
                        />
                      </label>
                    </div>
                  </section>
                </div>

                <aside className="form-aside">
                  <div className="safety-card">
                    <span className="safety-icon">
                      <Icon name="shield" />
                    </span>
                    <h3>Despacho Oficial</h3>
                    <p>Ocorrências abertas são transmitidas instantaneamente para as viaturas do setor.</p>
                    <ul>
                      <li>Dados consolidados</li>
                      <li>Geolocalização validada</li>
                      <li>Encaminhamento prioritário</li>
                    </ul>
                  </div>
                  <div className="form-actions">
                    <Button variant="primary" type="submit">
                      Registrar ocorrência
                    </Button>
                    <Button onClick={() => setView('list')}>Cancelar</Button>
                  </div>
                </aside>
              </form>
            </section>
          )}
        </main>
      </IonContent>
    </IonPage>
  );
}
