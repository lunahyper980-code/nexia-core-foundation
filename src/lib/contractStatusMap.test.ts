import { describe, it, expect } from 'vitest';
import {
  STATUS_UI_TO_DB,
  STATUS_DB_TO_UI,
  ACTIVE_DB_STATUSES,
  ACTIVE_UI_STATUSES,
  toDbStatus,
  toUiStatus,
  isActiveStatus,
  type DbContractStatus,
  type UiContractStatus,
} from './contractStatusMap';

describe('contractStatusMap', () => {
  describe('STATUS_UI_TO_DB mapping', () => {
    it('should map all UI statuses to DB statuses', () => {
      expect(STATUS_UI_TO_DB['Rascunho']).toBe('draft');
      expect(STATUS_UI_TO_DB['Enviado']).toBe('sent');
      expect(STATUS_UI_TO_DB['Assinado']).toBe('signed');
      expect(STATUS_UI_TO_DB['Ativo']).toBe('active');
      expect(STATUS_UI_TO_DB['Pausado']).toBe('paused');
      expect(STATUS_UI_TO_DB['Cancelado']).toBe('cancelled');
    });

    it('should have 6 UI status mappings', () => {
      expect(Object.keys(STATUS_UI_TO_DB)).toHaveLength(6);
    });
  });

  describe('STATUS_DB_TO_UI mapping', () => {
    it('should map all DB statuses to UI statuses', () => {
      expect(STATUS_DB_TO_UI['draft']).toBe('Rascunho');
      expect(STATUS_DB_TO_UI['sent']).toBe('Enviado');
      expect(STATUS_DB_TO_UI['signed']).toBe('Assinado');
      expect(STATUS_DB_TO_UI['active']).toBe('Ativo');
      expect(STATUS_DB_TO_UI['paused']).toBe('Pausado');
      expect(STATUS_DB_TO_UI['cancelled']).toBe('Cancelado');
    });

    it('should have 6 DB status mappings', () => {
      expect(Object.keys(STATUS_DB_TO_UI)).toHaveLength(6);
    });
  });

  describe('Bidirectional mapping consistency', () => {
    it('should have matching keys and values in both directions', () => {
      // Every UI status should map to a DB status that maps back to the same UI status
      Object.entries(STATUS_UI_TO_DB).forEach(([uiStatus, dbStatus]) => {
        expect(STATUS_DB_TO_UI[dbStatus]).toBe(uiStatus);
      });

      // Every DB status should map to a UI status that maps back to the same DB status
      Object.entries(STATUS_DB_TO_UI).forEach(([dbStatus, uiStatus]) => {
        expect(STATUS_UI_TO_DB[uiStatus as UiContractStatus]).toBe(dbStatus);
      });
    });
  });

  describe('toDbStatus', () => {
    it('should convert UI status to DB status', () => {
      expect(toDbStatus('Rascunho')).toBe('draft');
      expect(toDbStatus('Enviado')).toBe('sent');
      expect(toDbStatus('Assinado')).toBe('signed');
      expect(toDbStatus('Ativo')).toBe('active');
      expect(toDbStatus('Pausado')).toBe('paused');
      expect(toDbStatus('Cancelado')).toBe('cancelled');
    });

    it('should return the same value if already a DB status', () => {
      expect(toDbStatus('draft')).toBe('draft');
      expect(toDbStatus('sent')).toBe('sent');
      expect(toDbStatus('signed')).toBe('signed');
      expect(toDbStatus('active')).toBe('active');
      expect(toDbStatus('paused')).toBe('paused');
      expect(toDbStatus('cancelled')).toBe('cancelled');
    });

    it('should fallback to draft for unknown status', () => {
      expect(toDbStatus('unknown')).toBe('draft');
      expect(toDbStatus('')).toBe('draft');
    });
  });

  describe('toUiStatus', () => {
    it('should convert DB status to UI status', () => {
      expect(toUiStatus('draft')).toBe('Rascunho');
      expect(toUiStatus('sent')).toBe('Enviado');
      expect(toUiStatus('signed')).toBe('Assinado');
      expect(toUiStatus('active')).toBe('Ativo');
      expect(toUiStatus('paused')).toBe('Pausado');
      expect(toUiStatus('cancelled')).toBe('Cancelado');
    });

    it('should return the same value if already a UI status', () => {
      expect(toUiStatus('Rascunho')).toBe('Rascunho');
      expect(toUiStatus('Enviado')).toBe('Enviado');
      expect(toUiStatus('Assinado')).toBe('Assinado');
      expect(toUiStatus('Ativo')).toBe('Ativo');
      expect(toUiStatus('Pausado')).toBe('Pausado');
      expect(toUiStatus('Cancelado')).toBe('Cancelado');
    });

    it('should fallback to Rascunho for unknown status', () => {
      expect(toUiStatus('unknown')).toBe('Rascunho');
      expect(toUiStatus('')).toBe('Rascunho');
    });
  });

  describe('ACTIVE_STATUSES', () => {
    it('should have correct DB active statuses', () => {
      expect(ACTIVE_DB_STATUSES).toContain('active');
      expect(ACTIVE_DB_STATUSES).toContain('signed');
      expect(ACTIVE_DB_STATUSES).toHaveLength(2);
    });

    it('should have correct UI active statuses', () => {
      expect(ACTIVE_UI_STATUSES).toContain('Ativo');
      expect(ACTIVE_UI_STATUSES).toContain('Assinado');
      expect(ACTIVE_UI_STATUSES).toHaveLength(2);
    });

    it('should have matching active statuses in both formats', () => {
      const mappedDbStatuses = ACTIVE_UI_STATUSES.map(
        (ui) => STATUS_UI_TO_DB[ui]
      );
      expect(mappedDbStatuses.sort()).toEqual([...ACTIVE_DB_STATUSES].sort());
    });
  });

  describe('isActiveStatus', () => {
    it('should return true for active UI statuses', () => {
      expect(isActiveStatus('Ativo')).toBe(true);
      expect(isActiveStatus('Assinado')).toBe(true);
    });

    it('should return true for active DB statuses', () => {
      expect(isActiveStatus('active')).toBe(true);
      expect(isActiveStatus('signed')).toBe(true);
    });

    it('should return false for inactive UI statuses', () => {
      expect(isActiveStatus('Rascunho')).toBe(false);
      expect(isActiveStatus('Enviado')).toBe(false);
      expect(isActiveStatus('Pausado')).toBe(false);
      expect(isActiveStatus('Cancelado')).toBe(false);
    });

    it('should return false for inactive DB statuses', () => {
      expect(isActiveStatus('draft')).toBe(false);
      expect(isActiveStatus('sent')).toBe(false);
      expect(isActiveStatus('paused')).toBe(false);
      expect(isActiveStatus('cancelled')).toBe(false);
    });

    it('should return false for unknown statuses', () => {
      expect(isActiveStatus('unknown')).toBe(false);
      expect(isActiveStatus('')).toBe(false);
    });
  });

  describe('CHECK CONSTRAINT compatibility', () => {
    // These are the ONLY values accepted by demo_contracts_status_check
    const VALID_DB_STATUSES = ['draft', 'sent', 'signed', 'active', 'paused', 'cancelled'];

    it('all toDbStatus outputs should be valid for the CHECK CONSTRAINT', () => {
      const allUiStatuses: UiContractStatus[] = [
        'Rascunho', 'Enviado', 'Assinado', 'Ativo', 'Pausado', 'Cancelado'
      ];

      allUiStatuses.forEach((uiStatus) => {
        const dbStatus = toDbStatus(uiStatus);
        expect(VALID_DB_STATUSES).toContain(dbStatus);
      });
    });

    it('fallback status should be valid for the CHECK CONSTRAINT', () => {
      const fallbackStatus = toDbStatus('invalid-status');
      expect(VALID_DB_STATUSES).toContain(fallbackStatus);
    });
  });
});
