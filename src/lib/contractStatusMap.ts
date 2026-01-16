/**
 * Mapeamento de status de contratos
 * 
 * O frontend usa labels em português para UX
 * O banco aceita apenas valores em inglês (CHECK CONSTRAINT)
 * 
 * Este módulo garante a conversão correta entre os dois
 */

// Status aceitos pelo CHECK CONSTRAINT do banco (demo_contracts_status_check)
export type DbContractStatus = 'draft' | 'sent' | 'signed' | 'active' | 'paused' | 'cancelled';

// Status exibidos na UI em português
export type UiContractStatus = 'Rascunho' | 'Enviado' | 'Assinado' | 'Ativo' | 'Pausado' | 'Cancelado';

// Mapeamento: UI (português) -> DB (inglês)
export const STATUS_UI_TO_DB: Record<UiContractStatus, DbContractStatus> = {
  'Rascunho': 'draft',
  'Enviado': 'sent',
  'Assinado': 'signed',
  'Ativo': 'active',
  'Pausado': 'paused',
  'Cancelado': 'cancelled',
};

// Mapeamento: DB (inglês) -> UI (português)
export const STATUS_DB_TO_UI: Record<DbContractStatus, UiContractStatus> = {
  'draft': 'Rascunho',
  'sent': 'Enviado',
  'signed': 'Assinado',
  'active': 'Ativo',
  'paused': 'Pausado',
  'cancelled': 'Cancelado',
};

// Status que entram no faturamento/recorrência (valores do DB)
export const ACTIVE_DB_STATUSES: DbContractStatus[] = ['active', 'signed'];

// Status que entram no faturamento/recorrência (valores da UI)
export const ACTIVE_UI_STATUSES: UiContractStatus[] = ['Ativo', 'Assinado'];

/**
 * Converte status da UI para o banco
 */
export function toDbStatus(uiStatus: string): DbContractStatus {
  const mapped = STATUS_UI_TO_DB[uiStatus as UiContractStatus];
  if (mapped) return mapped;
  
  // Se já é um status do banco, retorna como está
  if (Object.keys(STATUS_DB_TO_UI).includes(uiStatus)) {
    return uiStatus as DbContractStatus;
  }
  
  // Fallback para draft se status desconhecido
  console.warn(`Status desconhecido: ${uiStatus}, usando 'draft'`);
  return 'draft';
}

/**
 * Converte status do banco para a UI
 */
export function toUiStatus(dbStatus: string): UiContractStatus {
  const mapped = STATUS_DB_TO_UI[dbStatus as DbContractStatus];
  if (mapped) return mapped;
  
  // Se já é um status da UI, retorna como está
  if (Object.keys(STATUS_UI_TO_DB).includes(dbStatus)) {
    return dbStatus as UiContractStatus;
  }
  
  // Fallback para Rascunho se status desconhecido
  console.warn(`Status desconhecido: ${dbStatus}, usando 'Rascunho'`);
  return 'Rascunho';
}

/**
 * Verifica se um status (UI ou DB) é considerado ativo para faturamento
 */
export function isActiveStatus(status: string): boolean {
  const uiStatus = toUiStatus(status);
  return ACTIVE_UI_STATUSES.includes(uiStatus);
}
