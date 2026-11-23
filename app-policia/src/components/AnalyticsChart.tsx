import React from 'react';
import Icon from '../components/Icon';
import { Report } from '../data';

interface Props {
  reports: Report[];
}

export default function AnalyticsChart({ reports }: Props) {
  const total = reports.length;
  const pending = reports.filter((r) => r.status === 'Pendente').length;
  const inProgress = reports.filter((r) => r.status === 'Em Atendimento').length;
  const completed = reports.filter((r) => r.status === 'Concluído').length;

  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;
  const inProgressPct = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Análise por tipo de ocorrência
  const reasonsMap: Record<string, number> = {};
  reports.forEach((r) => {
    // Extrai o nome da tipologia antes do hífen do código (ex: "Agressão física - Código Amarelo" -> "Agressão física")
    const cleanReason = (r.reason || 'Outro').split(' - ')[0].trim();
    reasonsMap[cleanReason] = (reasonsMap[cleanReason] || 0) + 1;
  });

  const sortedReasons = Object.entries(reasonsMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div className="analytics-title">
          <Icon name="chart" />
          <h3>Gráfico de Acompanhamento de Chamados</h3>
        </div>
        <span className="analytics-badge">{total} Ocorrências no Sistema</span>
      </div>

      {/* Cartões de Indicadores Rápidos (KPIs) */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-pending">
          <span className="kpi-label">Pendentes de Despacho</span>
          <div className="kpi-val-row">
            <strong className="kpi-value">{pending}</strong>
            <span className="kpi-percentage">{pendingPct}%</span>
          </div>
          <div className="kpi-progress-track">
            <div className="kpi-progress-bar bg-red" style={{ width: `${pendingPct}%` }} />
          </div>
        </div>

        <div className="kpi-card kpi-progress">
          <span className="kpi-label">Viaturas em Atendimento</span>
          <div className="kpi-val-row">
            <strong className="kpi-value">{inProgress}</strong>
            <span className="kpi-percentage">{inProgressPct}%</span>
          </div>
          <div className="kpi-progress-track">
            <div className="kpi-progress-bar bg-yellow" style={{ width: `${inProgressPct}%` }} />
          </div>
        </div>

        <div className="kpi-card kpi-completed">
          <span className="kpi-label">Atendimentos Concluídos</span>
          <div className="kpi-val-row">
            <strong className="kpi-value">{completed}</strong>
            <span className="kpi-percentage">{completedPct}%</span>
          </div>
          <div className="kpi-progress-track">
            <div className="kpi-progress-bar bg-green" style={{ width: `${completedPct}%` }} />
          </div>
        </div>
      </div>

      {/* Gráfico Visual de Barras Proporcionais */}
      <div className="chart-card">
        <div className="chart-heading">
          <h4>Distribuição por Status Atual</h4>
          <span className="chart-sub">Proporção operacional em tempo real</span>
        </div>

        <div className="multi-bar-container">
          <div
            className="multi-bar-segment seg-pending"
            style={{ width: `${pendingPct}%` }}
            title={`Pendentes: ${pending} (${pendingPct}%)`}
          >
            {pendingPct > 8 && <span>{pendingPct}%</span>}
          </div>
          <div
            className="multi-bar-segment seg-progress"
            style={{ width: `${inProgressPct}%` }}
            title={`Em Atendimento: ${inProgress} (${inProgressPct}%)`}
          >
            {inProgressPct > 8 && <span>{inProgressPct}%</span>}
          </div>
          <div
            className="multi-bar-segment seg-completed"
            style={{ width: `${completedPct}%` }}
            title={`Concluídos: ${completed} (${completedPct}%)`}
          >
            {completedPct > 8 && <span>{completedPct}%</span>}
          </div>
        </div>

        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color dot-red" />
            <span>Pendente ({pending})</span>
          </div>
          <div className="legend-item">
            <span className="legend-color dot-yellow" />
            <span>Em Atendimento ({inProgress})</span>
          </div>
          <div className="legend-item">
            <span className="legend-color dot-green" />
            <span>Concluído ({completed})</span>
          </div>
        </div>
      </div>

      {/* Gráfico Horizontal de Tipos de Ocorrência */}
      <div className="chart-card">
        <div className="chart-heading">
          <h4>Incidência por Natureza da Denúncia</h4>
          <span className="chart-sub">Classificação automática das agressões reportadas</span>
        </div>

        <div className="category-bars">
          {sortedReasons.map(([reason, count]) => {
            const pct = Math.round((count / (total || 1)) * 100);
            return (
              <div key={reason} className="cat-bar-item">
                <div className="cat-bar-info">
                  <span className="cat-bar-title">{reason}</span>
                  <span className="cat-bar-count">
                    {count} {count === 1 ? 'chamado' : 'chamados'} ({pct}%)
                  </span>
                </div>
                <div className="cat-bar-track">
                  <div className="cat-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
