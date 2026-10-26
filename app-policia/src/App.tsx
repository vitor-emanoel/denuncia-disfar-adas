import { useState, useEffect } from 'react';
import { IonApp } from '@ionic/react';
import Dashboard from './pages/Dashboard';
import {
  Report,
  ReportStatus,
  socket,
  fetchReports,
  createReport,
  updateReportStatus,
} from './data';

/**
 * Aplicação Central Policial.
 * Conecta via WebSocket ao backend e sincroniza denúncias em tempo real.
 */
export default function App() {
  const [reports, setReports] = useState<Report[]>([]);
  const [connected, setConnected] = useState<boolean>(socket.connected);

  useEffect(() => {
    // 1. Carrega dados iniciais via REST
    fetchReports().then((data) => {
      if (data && data.length > 0) {
        setReports(data);
      }
    });

    // 2. Monitoramento de conexão WebSocket
    function onConnect() {
      setConnected(true);
    }
    function onDisconnect() {
      setConnected(false);
    }

    // 3. Recebimento de carga inicial via socket (caso enviada pelo servidor)
    function onInitialReports(data: Report[]) {
      setReports(data);
    }

    // 4. Recebimento de NOVA denúncia enviada pelo App da Vítima
    function onNewReport(report: Report) {
      setReports((prev) => {
        // Evita duplicidade se já constar na lista
        if (prev.some((r) => r.id === report.id)) return prev;
        return [report, ...prev];
      });
    }

    // 5. Atualização de status da ocorrência (sincronizada entre viaturas)
    function onUpdateStatus({ id, status }: { id: number; status: ReportStatus }) {
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('initial_reports', onInitialReports);
    socket.on('new_report', onNewReport);
    socket.on('update_report_status', onUpdateStatus);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('initial_reports', onInitialReports);
      socket.off('new_report', onNewReport);
      socket.off('update_report_status', onUpdateStatus);
    };
  }, []);

  /**
   * Adiciona um novo chamado via API do servidor (que emitirá o WebSocket).
   */
  const handleAddReport = async (report: Report) => {
    setReports((prev) => [report, ...prev]);
    await createReport(report);
  };

  /**
   * Atualiza a situação do atendimento e sincroniza no servidor.
   */
  const handleUpdateStatus = async (id: number, status: ReportStatus) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    await updateReportStatus(id, status);
  };

  return (
    <IonApp>
      <Dashboard
        reports={reports}
        connected={connected}
        onAddReport={handleAddReport}
        onUpdateStatus={handleUpdateStatus}
      />
    </IonApp>
  );
}
