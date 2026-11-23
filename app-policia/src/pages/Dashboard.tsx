import { FormEvent, useRef, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { Browser } from '@capacitor/browser';
import Button from '../components/Button';
import Icon from '../components/Icon';
import AnalyticsChart from '../components/AnalyticsChart';
import HistoryModal from '../components/HistoryModal';
import { Report, ReportStatus, UserSession, formatNow } from '../data';

interface Props {
  reports: Report[];
  connected: boolean;
  currentUser: UserSession;
  onLogout: () => void;
  onAddReport: (report: Report) => void;
  onUpdateStatus: (id: number, status: ReportStatus, notes?: string) => void;
}

export default function Dashboard({
  reports,
  connected,
  currentUser,
  onLogout,
  onAddReport,
  onUpdateStatus
}: Props) {
  const contentRef = useRef<HTMLIonContentElement>(null);
  const [activeTab, setActiveTab] = useState<'reports' | 'analytics'>('reports');
  const [view, setView] = useState<'list' | 'create'>('list');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedReportForHistory, setSelectedReportForHistory] = useState<Report | null>(null);

  const pending = reports.filter((r) => r.status === 'Pendente').length;
  const inProgress = reports.filter((r) => r.status === 'Em Atendimento').length;
  const completed = reports.filter((r) => r.status === 'Concluído').length;

  const scrollTop = () => contentRef.current?.scrollToTop(300);

  const openCreate = () => {
    setSuccess('');
    setView('create');
    scrollTop();
  };

  const filteredReports = reports.filter((r) => {
    const matchesStatus = filterStatus === 'todos' || r.status === filterStatus;
    const matchesSearch =
      searchTerm === '' ||
      r.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(r.id).includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const street = String(data.get('street'));
    const number = String(data.get('number'));
    const complement = String(data.get('complement') || '');
    const neighborhood = String(data.get('neighborhood'));
    const reason = String(data.get('reason'));
    const code = String(data.get('code'));
    const notes = String(data.get('notes') || '');

    const address = `${street}, ${number}${complement ? `, ${complement}` : ''} - ${neighborhood}, Recife - PE`;

    onAddReport({
      id: Date.now(),
      date: formatNow(),
      status: 'Pendente',
      address,
      reason: `${reason} - ${code}`,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      notes,
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
              {/* Usuário Logado */}
              <div className="user-badge">
                <Icon name="user" />
                <div className="user-info">
                  <span className="user-name">{currentUser.name}</span>
                  <span className="user-role">{currentUser.role}</span>
                </div>
                <button
                  type="button"
                  className="btn-logout"
                  onClick={onLogout}
                  title="Sair da sessão"
                >
                  <Icon name="exit" />
                  Sair
                </button>
              </div>

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

          {/* Abas Superiores de Navegação */}
          <nav className="central-tabs-nav">
            <div className="central-tabs-container">
              <button
                type="button"
                className={`central-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('reports');
                  setView('list');
                }}
              >
                <Icon name="shield" />
                Fila de Ocorrências ({reports.length})
              </button>
              <button
                type="button"
                className={`central-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <Icon name="chart" />
                Gráficos & Métricas
              </button>
            </div>
          </nav>

          {/* Visualização de Gráficos e Acompanhamento */}
          {activeTab === 'analytics' ? (
            <section className="content" aria-label="Painel de gráficos">
              <AnalyticsChart reports={reports} />
            </section>
          ) : view === 'list' ? (
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

              {/* Cabeçalho da Listagem */}
              <div className="list-heading">
                <div>
                  <h2>Ocorrências Operacionais</h2>
                  <p>Acompanhe chamados recebidos em tempo real e atualize o andamento das viaturas.</p>
                </div>
                <div className="heading-actions">
                  <Button variant="primary" onClick={openCreate}>
                    <Icon name="plus" />
                    Abrir chamado manual
                  </Button>
                </div>
              </div>

              {/* Barra de Filtros e Busca */}
              <div className="filters-bar">
                <div className="search-box">
                  <Icon name="search" />
                  <input
                    type="text"
                    placeholder="Buscar por rua, bairro, tipologia ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button className="clear-search" onClick={() => setSearchTerm('')}>
                      ×
                    </button>
                  )}
                </div>

                <div className="status-filter-pills">
                  <button
                    className={`filter-pill ${filterStatus === 'todos' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('todos')}
                  >
                    Todos ({reports.length})
                  </button>
                  <button
                    className={`filter-pill filter-red ${filterStatus === 'Pendente' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('Pendente')}
                  >
                    Pendentes ({pending})
                  </button>
                  <button
                    className={`filter-pill filter-yellow ${filterStatus === 'Em Atendimento' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('Em Atendimento')}
                  >
                    Em Atendimento ({inProgress})
                  </button>
                  <button
                    className={`filter-pill filter-green ${filterStatus === 'Concluído' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('Concluído')}
                  >
                    Concluídos ({completed})
                  </button>
                </div>
              </div>

              {/* Lista de Chamados */}
              <div className="report-list">
                {filteredReports.length === 0 ? (
                  <div className="empty-state">
                    <Icon name="shield" />
                    <p>Nenhuma ocorrência encontrada para este filtro ou busca.</p>
                  </div>
                ) : (
                  filteredReports.map((report) => (
                    <article className="report-card" key={report.id}>
                      <div className="card-header">
                        <time dateTime={report.date}>{report.date}</time>
                        <div className="card-header-right">
                          <span className={`status status-${report.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {report.status}
                          </span>
                        </div>
                      </div>

                      <div className="address-row">
                        <div>
                          <span className="field-label">Endereço da ocorrência</span>
                          <address className="address-value">
                            {report.hasSharedLocation && (
                              <span className="gps-pill" title="Geolocalização obtida por GPS">
                                <Icon name="shield" /> GPS Exato
                              </span>
                            )}
                            {report.address}
                          </address>
                        </div>
                        <Button
                          variant="secondary"
                          onClick={() => Browser.open({ url: report.mapsUrl })}
                        >
                          <Icon name="mapPin" />
                          Abrir no Google Maps
                        </Button>
                      </div>

                      <div className="reason">
                        <div>
                          <span className="field-label">Tipificação informada</span>
                          <p className="reason-value">{report.reason}</p>
                        </div>

                        {report.notes && (
                          <div className="report-card-notes">
                            <span className="field-label">Observações</span>
                            <p>{report.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="actions">
                        <div className="actions-left">
                          <button
                            type="button"
                            className="btn-history-view"
                            onClick={() => setSelectedReportForHistory(report)}
                          >
                            <Icon name="history" />
                            Ver Histórico ({report.statusHistory?.length || 1})
                          </button>
                        </div>

                        <div className="actions-right">
                          {report.status === 'Pendente' && (
                            <Button
                              variant="secondary"
                              onClick={() => onUpdateStatus(report.id, 'Em Atendimento')}
                            >
                              Despachar viatura
                            </Button>
                          )}
                          {report.status === 'Em Atendimento' && (
                            <Button
                              variant="primary"
                              onClick={() => onUpdateStatus(report.id, 'Concluído')}
                            >
                              Concluir ocorrência
                            </Button>
                          )}
                          {report.status === 'Concluído' && (
                            <Button
                              variant="secondary"
                              onClick={() => onUpdateStatus(report.id, 'Em Atendimento')}
                            >
                              Reabrir atendimento
                            </Button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          ) : (
            /* Formulário de Abertura Manual */
            <section className="content" aria-label="Abertura de chamado">
              <header className="create-heading">
                <div>
                  <h2>Abertura de Ocorrência Manual</h2>
                  <p>Cadastro oficial para denúncias recebidas via rádio, telefone 190 ou presencialmente.</p>
                </div>
              </header>

              <form className="report-form" onSubmit={handleSubmit}>
                <div className="form-main">
                  <section className="form-section">
                    <div className="section-heading">
                      <span>1</span>
                      <div>
                        <h3>Endereço do local</h3>
                        <p>Informe o logradouro e complementos para a viatura.</p>
                      </div>
                    </div>
                    <div className="form-grid">
                      <label className="field field-wide">
                        <span>
                          Logradouro (Rua, Av., etc.) <b>*</b>
                        </span>
                        <input name="street" placeholder="Ex: Av. Governador Agamenon Magalhães" required />
                      </label>
                      <label className="field">
                        <span>
                          Número <b>*</b>
                        </span>
                        <input name="number" placeholder="Ex: 1200" required />
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
                      <li>Operador: {currentUser.name}</li>
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

          {/* Modal de Histórico */}
          {selectedReportForHistory && (
            <HistoryModal
              report={selectedReportForHistory}
              onClose={() => setSelectedReportForHistory(null)}
            />
          )}
        </main>
      </IonContent>
    </IonPage>
  );
}
