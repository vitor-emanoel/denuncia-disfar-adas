import { io, Socket } from 'socket.io-client';

/**
 * URL base da API do backend.
 * Pode ser ajustada para o IP da máquina na rede local caso testado em dispositivo físico.
 */
export const SERVER_URL = 'http://localhost:3001';
export const API_URL = `${SERVER_URL}/api/reports`;

/**
 * Tipos de status possíveis para o fluxo de atendimento.
 */
export type ReportStatus = 'Pendente' | 'Em Atendimento' | 'Concluído';

export interface StatusHistoryEntry {
  status: ReportStatus;
  timestamp: string;
  by: string;
}

/**
 * Estrutura de dados que representa um chamado de denúncia.
 */
export interface Report {
  id: number;
  date: string;
  status: ReportStatus;
  address: string;
  reason: string;
  mapsUrl: string;
  hasSharedLocation?: boolean;
  notes?: string;
  statusHistory?: StatusHistoryEntry[];
}

/**
 * Link direto para suporte via WhatsApp da Central Ligue 180.
 */
export const LIGUE_180_WHATSAPP =
  'https://wa.me/556196100180?text=Ol%C3%A1.%20Preciso%20de%20orienta%C3%A7%C3%A3o%20do%20Ligue%20180.';

/**
 * Sequência numérica digitada na calculadora para liberar o Canal Seguro de Atendimento.
 * Ao digitar "1 + 10 =" a tela de socorro é revelada.
 */
export const UNLOCK_SEQUENCE = '1+10';

/**
 * Instância Socket.IO para acompanhamento em tempo real do chamado da vítima.
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
 * Envia uma nova ocorrência para o backend da polícia.
 */
export async function sendReportToBackend(report: Report): Promise<boolean> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
    });
    return response.ok;
  } catch (err) {
    console.error('Erro ao conectar com o servidor policial:', err);
    return false;
  }
}

/**
 * Busca status e histórico de um chamado específico pelo ID/Protocolo.
 */
export async function fetchReportById(id: number): Promise<Report | null> {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Erro ao consultar protocolo:', err);
    return null;
  }
}

/**
 * Gerenciamento de histórico local de chamados enviados pelo dispositivo da mulher.
 */
const STORAGE_KEY = 'minhas_denuncias_salvas';

export function getSavedReports(): Report[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveReportLocally(report: Report): void {
  try {
    const current = getSavedReports();
    const filtered = current.filter((r) => r.id !== report.id);
    const updated = [report, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Erro ao salvar localmente:', e);
  }
}

export function updateSavedReportLocally(id: number, status: ReportStatus, statusHistory?: StatusHistoryEntry[]): void {
  try {
    const current = getSavedReports();
    const updated = current.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status,
          ...(statusHistory ? { statusHistory } : {}),
        };
      }
      return r;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Erro ao atualizar chamado local:', e);
  }
}
