/**
 * Mapeamento de status de contratos - MODO SIMPLES
 * 
 * O CHECK CONSTRAINT do banco (demo_contracts_status_check) aceita APENAS:
 * - 'Assinado'
 * - 'Pendente'  
 * - 'Cancelado'
 * 
 * Este módulo garante que apenas esses valores sejam persistidos.
 * A UI pode exibir labels mais amigáveis, mas o banco recebe apenas os 3 valores acima.
 */

// ============================================
// TIPOS
// ============================================

// Status aceitos pelo CHECK CONSTRAINT do banco (demo_contracts_status_check)
export type DbContractStatus = 'Assinado' | 'Pendente' | 'Cancelado';

// Labels para exibição na UI (mapeados para os status do banco)
export type UiContractLabel = 
  | 'Rascunho'     // -> Pendente
  | 'Enviado'      // -> Pendente
  | 'Assinado'     // -> Assinado
  | 'Cancelado';   // -> Cancelado

// ============================================
// CONSTANTES
// ============================================

// Valores válidos do banco (para validação)
export const VALID_DB_STATUSES: DbContractStatus[] = ['Assinado', 'Pendente', 'Cancelado'];

// Status que entram no faturamento/recorrência
export const ACTIVE_DB_STATUSES: DbContractStatus[] = ['Assinado'];

// ============================================
// MAPEAMENTOS
// ============================================

// UI Label -> DB Status
const LABEL_TO_DB: Record<string, DbContractStatus> = {
  'Rascunho': 'Pendente',
  'Enviado': 'Pendente',
  'Assinado': 'Assinado',
  'Ativo': 'Assinado',       // Legado - mapeia para Assinado
  'Pausado': 'Pendente',     // Legado - mapeia para Pendente
  'Cancelado': 'Cancelado',
  'Pendente': 'Pendente',
};

// DB Status -> UI Label padrão (para exibição quando não há contexto)
const DB_TO_LABEL: Record<DbContractStatus, UiContractLabel> = {
  'Assinado': 'Assinado',
  'Pendente': 'Rascunho',    // Pendente exibe como Rascunho por padrão
  'Cancelado': 'Cancelado',
};

// ============================================
// FUNÇÕES
// ============================================

/**
 * Converte qualquer status (UI ou legado) para o valor aceito pelo banco.
 * SEMPRE retorna um dos 3 valores válidos: 'Assinado', 'Pendente', 'Cancelado'
 */
export function toDbStatus(status: string): DbContractStatus {
  // Se já é um status válido do banco, retorna como está
  if (VALID_DB_STATUSES.includes(status as DbContractStatus)) {
    return status as DbContractStatus;
  }
  
  // Tenta mapear do label da UI
  const mapped = LABEL_TO_DB[status];
  if (mapped) return mapped;
  
  // Fallback para Pendente se status desconhecido
  console.warn(`[contractStatusMap] Status desconhecido: "${status}", usando 'Pendente'`);
  return 'Pendente';
}

/**
 * Converte status do banco para label da UI.
 */
export function toUiStatus(dbStatus: string): UiContractLabel {
  // Se é um status válido do banco, converte para label
  if (VALID_DB_STATUSES.includes(dbStatus as DbContractStatus)) {
    return DB_TO_LABEL[dbStatus as DbContractStatus];
  }
  
  // Se já é um label válido da UI, retorna como está
  if (['Rascunho', 'Enviado', 'Assinado', 'Cancelado'].includes(dbStatus)) {
    return dbStatus as UiContractLabel;
  }
  
  // Fallback para Rascunho
  return 'Rascunho';
}

/**
 * Verifica se um status é considerado ativo para faturamento/métricas
 */
export function isActiveStatus(status: string): boolean {
  const dbStatus = toDbStatus(status);
  return ACTIVE_DB_STATUSES.includes(dbStatus);
}

/**
 * Verifica se um status é válido para o banco
 */
export function isValidDbStatus(status: string): boolean {
  return VALID_DB_STATUSES.includes(status as DbContractStatus);
}
