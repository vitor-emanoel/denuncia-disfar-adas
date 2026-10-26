import { io, Socket } from 'socket.io-client';

/**
 * URL base do servidor de ocorrências da polícia.
 */
export const SERVER_URL = 'http://localhost:3001';
export const API_URL = `${SERVER_URL}/api/reports`;

/**
 * Tipos de status possíveis para o fluxo de atendimento policial.
 */
export type ReportStatus = 'Pendente' | 'Em Atendimento' | 'Concluído';

/**
 * Estrutura de dados de uma ocorrência recebida.
 */
export interface Report {
  id: number;
  date: string;
  status: ReportStatus;
  address: string;
  reason: string;
  mapsUrl: string;
  hasSharedLocation?: boolean;
}

/**
 * Instância do cliente Socket.io para comunicação em tempo real.
 */
export const socket: Socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
});

/**
 * Formata data e hora atual no padrão brasileiro (DD/MM/AAAA - HH:mm).
 */
export function formatNow(): string {
  const now = new Date();
  return `${now.toLocaleDateString('pt-BR')} - ${now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

/**
 * Busca a lista inicial de ocorrências cadastradas no backend.
 */
export async function fetchReports(): Promise<Report[]> {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Falha ao obter relatórios');
    return await res.json();
  } catch (err) {
    console.error('Erro ao conectar ao backend:', err);
    return [];
  }
}

/**
 * Cria uma ocorrência manual diretamente pelo painel policial.
 */
export async function createReport(report: Report): Promise<boolean> {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    return res.ok;
  } catch (err) {
    console.error('Erro ao cadastrar chamado:', err);
    return false;
  }
}

/**
 * Atualiza o status de atendimento de uma ocorrência no servidor.
 */
export async function updateReportStatus(id: number, status: ReportStatus): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    return false;
  }
}
