/**
 * Mapeamento de status de contratos
 * 
 * O CHECK CONSTRAINT do banco (demo_contracts_status_check) aceita APENAS:
 * - 'Assinado'
 * - 'Pendente'  
 * - 'Cancelado'
 * 
 * Este módulo garante que apenas esses valores sejam persistidos
 */

// Status aceitos pelo CHECK CONSTRAINT do banco (demo_contracts_status_check)
// IMPORTANTE: O banco usa português, não inglês!
export type DbContractStatus = 'Assinado' | 'Pendente' | 'Cancelado';

// Status exibidos na UI (extensão do que o banco aceita para UX)
export type UiContractStatus = 
  | 'Rascunho' 
  | 'Enviado' 
  | 'Assinado' 
  | 'Ativo' 
  | 'Pausado' 
  | 'Cancelado'
  | 'Pendente';

// Mapeamento: UI -> DB (converte status da UI para valores aceitos pelo banco)
// Status que não existem no banco são mapeados para o mais próximo
export const STATUS_UI_TO_DB: Record<UiContractStatus, DbContractStatus> = {
  'Rascunho': 'Pendente',    // Rascunho -> Pendente (ainda não assinado)
  'Enviado': 'Pendente',     // Enviado -> Pendente (aguardando assinatura)
  'Assinado': 'Assinado',    // Assinado -> Assinado
  'Ativo': 'Assinado',       // Ativo -> Assinado (contrato em vigor)
  'Pausado': 'Pendente',     // Pausado -> Pendente (temporariamente suspenso)
  'Cancelado': 'Cancelado',  // Cancelado -> Cancelado
  'Pendente': 'Pendente',    // Pendente -> Pendente
};

// Mapeamento: DB -> UI (para exibição, mantém o valor original)
export const STATUS_DB_TO_UI: Record<DbContractStatus, UiContractStatus> = {
  'Assinado': 'Assinado',
  'Pendente': 'Pendente',
  'Cancelado': 'Cancelado',
};

// Status que entram no faturamento/recorrência (valores do DB)
export const ACTIVE_DB_STATUSES: DbContractStatus[] = ['Assinado'];

// Status que entram no faturamento/recorrência (valores da UI)
export const ACTIVE_UI_STATUSES: UiContractStatus[] = ['Ativo', 'Assinado'];

/**
 * Converte status da UI para o banco (respeitando o CHECK CONSTRAINT)
 */
export function toDbStatus(uiStatus: string): DbContractStatus {
  const mapped = STATUS_UI_TO_DB[uiStatus as UiContractStatus];
  if (mapped) return mapped;
  
  // Se já é um status válido do banco, retorna como está
  if (['Assinado', 'Pendente', 'Cancelado'].includes(uiStatus)) {
    return uiStatus as DbContractStatus;
  }
  
  // Fallback para Pendente se status desconhecido
  console.warn(`Status desconhecido: ${uiStatus}, usando 'Pendente'`);
  return 'Pendente';
}

/**
 * Converte status do banco para a UI
 */
export function toUiStatus(dbStatus: string): UiContractStatus {
  const mapped = STATUS_DB_TO_UI[dbStatus as DbContractStatus];
  if (mapped) return mapped;
  
  // Se já é um status da UI válido, retorna como está
  const validUiStatuses = ['Rascunho', 'Enviado', 'Assinado', 'Ativo', 'Pausado', 'Cancelado', 'Pendente'];
  if (validUiStatuses.includes(dbStatus)) {
    return dbStatus as UiContractStatus;
  }
  
  // Fallback para Pendente se status desconhecido
  console.warn(`Status desconhecido: ${dbStatus}, usando 'Pendente'`);
  return 'Pendente';
}

/**
 * Verifica se um status (UI ou DB) é considerado ativo para faturamento
 */
export function isActiveStatus(status: string): boolean {
  // Status ativos: Assinado ou Ativo
  return status === 'Assinado' || status === 'Ativo';
}
