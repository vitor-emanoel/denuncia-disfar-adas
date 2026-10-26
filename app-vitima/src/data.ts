/**
 * URL base da API do backend.
 * Pode ser ajustada para o IP da máquina na rede local caso testado em dispositivo físico.
 */
export const API_URL = 'http://localhost:3001/api/reports';

/**
 * Estrutura de dados que representa um chamado de denúncia.
 */
export interface Report {
  id: number;
  date: string;
  status: 'Pendente' | 'Em Atendimento' | 'Concluído';
  address: string;
  reason: string;
  mapsUrl: string;
  hasSharedLocation?: boolean;
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
    // Retorna true permitindo que a usuária não fique bloqueada se estiver sem conexão no momento
    return false;
  }
}
