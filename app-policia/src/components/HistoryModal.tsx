import React, { useState } from 'react';
import Button from './Button';
import Icon from './Icon';
import { Report } from '../data';

interface Props {
  report: Report;
  onClose: () => void;
}

export default function HistoryModal({ report, onClose }: Props) {
  const history = report.statusHistory || [
    {
      status: report.status,
      timestamp: report.date,
      by: 'Registro Inicial'
    }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-box">
            <Icon name="history" />
            <div>
              <h3>Histórico da Ocorrência #{report.id}</h3>
              <p>{report.reason}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Fechar">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="report-summary-box">
            <div>
              <span className="summary-lbl">Data do Acionamento:</span>
              <strong>{report.date}</strong>
            </div>
            <div>
              <span className="summary-lbl">Localização:</span>
              <p>{report.address}</p>
            </div>
            {report.notes && (
              <div>
                <span className="summary-lbl">Observações Operacionais:</span>
                <p className="summary-notes">{report.notes}</p>
              </div>
            )}
          </div>

          <h4 className="timeline-title">Linha do Tempo de Atendimento</h4>
          <div className="timeline-wrapper">
            {history.map((step, idx) => (
              <div key={idx} className="timeline-item">
                <div className={`timeline-dot dot-${step.status.toLowerCase().replace(/\s+/g, '-')}`} />
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className={`status status-${step.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {step.status}
                    </span>
                    <time className="timeline-time">{step.timestamp}</time>
                  </div>
                  <p className="timeline-by">Atualizado por: <strong>{step.by}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="primary" onClick={onClose}>
            Fechar Histórico
          </Button>
        </div>
      </div>
    </div>
  );
}
