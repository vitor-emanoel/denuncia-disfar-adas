import { useState, useEffect } from 'react';
import { IonApp } from '@ionic/react';
import Dashboard from './pages/Dashboard';
import LoginCentral from './pages/LoginCentral';
import {
  Report,
  ReportStatus,
  UserSession,
  socket,
  fetchReports,
  createReport,
  updateReportStatus,
} from './data';

const SESSION_STORAGE_KEY = 'central_policial_user';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [reports, setReports] = useState<Report[]>([]);
  const [connected, setConnected] = useState<boolean>(socket.connected);

  const handleLogin = (session: UserSession) => {
    setCurrentUser(session);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  useEffect(() => {
    if (!currentUser) return;

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
        if (prev.some((r) => r.id === report.id)) return prev;
        return [report, ...prev];
      });
    }

    // 5. Atualização de status da ocorrência (sincronizada entre viaturas)
    function onUpdateStatus({
      id,
      status,
      statusHistory,
    }: {
      id: number;
      status: ReportStatus;
      statusHistory?: any[];
    }) {
      setReports((prev) =>
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
  }, [currentUser]);

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
  const handleUpdateStatus = async (id: number, status: ReportStatus, notes?: string) => {
    const operatorName = currentUser?.name || 'Central Policial';
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    await updateReportStatus(id, status, operatorName, notes);
  };

  return (
    <IonApp>
      {!currentUser ? (
        <LoginCentral onLoginSuccess={handleLogin} />
      ) : (
        <Dashboard
          reports={reports}
          connected={connected}
          currentUser={currentUser}
          onLogout={handleLogout}
          onAddReport={handleAddReport}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </IonApp>
  );
}
