import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Icon from '../components/Icon';
import {
  Report,
  fetchReportById,
  getSavedReports,
  saveReportLocally,
  socket,
  ReportStatus,
  StatusHistoryEntry,
} from '../data';

interface Props {
  onBackToForm: () => void;
}

export default function StatusTracker({ onBackToForm }: Props) {
  const [savedReports, setSavedReports] = useState<Report[]>(() => getSavedReports());
  const [searchId, setSearchId] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Seleciona automaticamente o chamado mais recente, se existir
  useEffect(() => {
    if (savedReports.length > 0 && !selectedReport) {
      setSelectedReport(savedReports[0]);
    }
  }, [savedReports]);

  // Sincronização em tempo real via WebSocket quando houver atualização de status
  useEffect(() => {
    function onUpdateStatus({
      id,
      status,
      statusHistory,
    }: {
      id: number;
      status: ReportStatus;
      statusHistory?: StatusHistoryEntry[];
    }) {
      setSavedReports((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                ...(statusHistory ? { statusHistory } : {}),
              }
            : r
        )
      );

      setSelectedReport((curr) => {
        if (curr && curr.id === id) {
          return {
            ...curr,
            status,
            ...(statusHistory ? { statusHistory } : {}),
          };
        }
        return curr;
      });
    }

    socket.on('update_report_status', onUpdateStatus);
    return () => {
      socket.off('update_report_status', onUpdateStatus);
    };
  }, []);

  const handleSearchProtocol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setErrorMessage('');
    try {
      const found = await fetchReportById(Number(searchId.trim()));
      if (found) {
        setSelectedReport(found);
        saveReportLocally(found);
        setSavedReports(getSavedReports());
      } else {
        setErrorMessage('Nenhum chamado encontrado com este número de protocolo.');
      }
    } catch {
      setErrorMessage('Erro ao consultar servidor.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStepIndex = (status: ReportStatus) => {
    if (status === 'Pendente') return 1;
    if (status === 'Em Atendimento') return 2;
    if (status === 'Concluído') return 3;
    return 1;
  };

  const currentStep = selectedReport ? getStatusStepIndex(selectedReport.status) : 0;

  return (
    <div className="tracker-container">
      <div className="tracker-header">
        <div>
          <h2>Acompanhamento de Status</h2>
          <p>Consulte em tempo real o deslocamento das viaturas e o andamento da sua solicitação.</p>
        </div>
        <Button variant="secondary" onClick={onBackToForm}>
          Nova Denúncia
        </Button>
      </div>

      {/* Busca de Protocolo Manual */}
      <form onSubmit={handleSearchProtocol} className="tracker-search-form">
        <label className="field field-full">
          <span>Consultar por Protocolo / ID do Chamado</span>
          <div className="input-with-action">
            <Icon name="search" />
            <input
              type="text"
              placeholder="Digite o número do protocolo (Ex: 1732...)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Buscando...' : 'Consultar'}
            </Button>
          </div>
        </label>
      </form>

      {errorMessage && (
        <div className="tracker-error" role="alert">
          <span>!</span>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Abas dos chamados enviados deste dispositivo */}
      {savedReports.length > 0 && (
        <div className="my-reports-section">
          <span className="section-label">Minhas Denúncias Registradas neste Aparelho:</span>
          <div className="reports-chip-list">
            {savedReports.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`report-chip ${selectedReport?.id === item.id ? 'active' : ''}`}
                onClick={() => setSelectedReport(item)}
              >
                <div className="chip-header">
                  <strong>#{item.id}</strong>
                  <span className={`status-badge status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {item.status}
                  </span>
                </div>
                <span className="chip-date">{item.date}</span>
                <span className="chip-reason">{item.reason}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Detalhes do Chamado Selecionado */}
      {selectedReport ? (
        <div className="tracker-card">
          <div className="tracker-card-head">
            <div className="head-info">
              <span className="head-id">Protocolo #{selectedReport.id}</span>
              <h3>{selectedReport.reason}</h3>
              <time>{selectedReport.date}</time>
            </div>
            <div className={`status-pill status-${selectedReport.status.toLowerCase().replace(/\s+/g, '-')}`}>
              {selectedReport.status}
            </div>
          </div>

          {/* Stepper Visual de Status */}
          <div className="status-stepper">
            {/* Passo 1: Recebido */}
            <div className={`step-item ${currentStep >= 1 ? 'completed' : ''}`}>
              <div className="step-circle">
                {currentStep > 1 ? <Icon name="check" /> : 1}
              </div>
              <div className="step-text">
                <strong>Denúncia Recebida</strong>
                <span>Registrada na Central 190</span>
              </div>
            </div>

            <div className={`step-line ${currentStep >= 2 ? 'filled' : ''}`} />

            {/* Passo 2: Despacho */}
            <div className={`step-item ${currentStep >= 2 ? 'completed' : currentStep === 1 ? 'active' : ''}`}>
              <div className="step-circle">
                {currentStep > 2 ? <Icon name="check" /> : 2}
              </div>
              <div className="step-text">
                <strong>Viatura Despachada</strong>
                <span>Polícia em deslocamento</span>
              </div>
            </div>

            <div className={`step-line ${currentStep >= 3 ? 'filled' : ''}`} />

            {/* Passo 3: Conclusão */}
            <div className={`step-item ${currentStep >= 3 ? 'completed' : ''}`}>
              <div className="step-circle">
                {currentStep >= 3 ? <Icon name="check" /> : 3}
              </div>
              <div className="step-text">
                <strong>Atendimento Concluído</strong>
                <span>Equipe no local / Seguro</span>
              </div>
            </div>
          </div>

          {/* Mensagem Explicativa Conforme Status */}
          <div className={`status-alert-box alert-${selectedReport.status.toLowerCase().replace(/\s+/g, '-')}`}>
            <Icon name="shield" />
            <div>
              {selectedReport.status === 'Pendente' && (
                <>
                  <strong>Chamado aguardando despacho imediato</strong>
                  <p>A central de inteligência e despacho recebeu suas coordenadas e está alocando a equipe mais próxima.</p>
                </>
              )}
              {selectedReport.status === 'Em Atendimento' && (
                <>
                  <strong>Viatura Policial a Caminho!</strong>
                  <p>A viatura já foi despachada para o endereço indicado. Permaneça em local seguro se possível.</p>
                </>
              )}
              {selectedReport.status === 'Concluído' && (
                <>
                  <strong>Ocorrência Atendida</strong>
                  <p>Os policiais já prestaram atendimento no local. Mantenha os canais de apoio à disposição.</p>
                </>
              )}
            </div>
          </div>

          {/* Histórico Detalhado / Timeline da Denúncia */}
          <div className="timeline-section">
            <h4>Histórico de Evolução</h4>
            <div className="tracker-timeline">
              {(selectedReport.statusHistory || [
                {
                  status: selectedReport.status,
                  timestamp: selectedReport.date,
                  by: 'App Mulher (Registro)'
                }
              ]).map((entry, idx) => (
                <div key={idx} className="timeline-row">
                  <div className={`timeline-marker dot-${entry.status.toLowerCase().replace(/\s+/g, '-')}`} />
                  <div className="timeline-info">
                    <div className="timeline-top">
                      <span className="status-label">{entry.status}</span>
                      <time>{entry.timestamp}</time>
                    </div>
                    <span className="timeline-agent">Origem: {entry.by}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="tracker-empty">
          <Icon name="history" />
          <p>Nenhuma denúncia selecionada. Realize uma busca por protocolo acima ou envie um novo pedido de socorro.</p>
        </div>
      )}
    </div>
  );
}
