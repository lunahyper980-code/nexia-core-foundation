import { describe, it, expect } from 'vitest';
import {
  STATUS_UI_TO_DB,
  STATUS_DB_TO_UI,
  ACTIVE_DB_STATUSES,
  ACTIVE_UI_STATUSES,
  toDbStatus,
  toUiStatus,
  isActiveStatus,
} from './contractStatusMap';

describe('contractStatusMap', () => {
  // Valores aceitos pelo CHECK CONSTRAINT do banco
  const VALID_DB_STATUSES = ['Assinado', 'Pendente', 'Cancelado'];

  describe('STATUS_UI_TO_DB mapping', () => {
    it('should map all UI statuses to valid DB statuses', () => {
      expect(STATUS_UI_TO_DB['Rascunho']).toBe('Pendente');
      expect(STATUS_UI_TO_DB['Enviado']).toBe('Pendente');
      expect(STATUS_UI_TO_DB['Assinado']).toBe('Assinado');
      expect(STATUS_UI_TO_DB['Ativo']).toBe('Assinado');
      expect(STATUS_UI_TO_DB['Pausado']).toBe('Pendente');
      expect(STATUS_UI_TO_DB['Cancelado']).toBe('Cancelado');
      expect(STATUS_UI_TO_DB['Pendente']).toBe('Pendente');
    });

    it('all mapped values should be valid for CHECK CONSTRAINT', () => {
      Object.values(STATUS_UI_TO_DB).forEach((dbStatus) => {
        expect(VALID_DB_STATUSES).toContain(dbStatus);
      });
    });
  });

  describe('STATUS_DB_TO_UI mapping', () => {
    it('should map all DB statuses to UI statuses', () => {
      expect(STATUS_DB_TO_UI['Assinado']).toBe('Assinado');
      expect(STATUS_DB_TO_UI['Pendente']).toBe('Pendente');
      expect(STATUS_DB_TO_UI['Cancelado']).toBe('Cancelado');
    });

    it('should have exactly 3 DB status mappings', () => {
      expect(Object.keys(STATUS_DB_TO_UI)).toHaveLength(3);
    });
  });

  describe('toDbStatus', () => {
    it('should convert UI statuses to valid DB statuses', () => {
      expect(toDbStatus('Rascunho')).toBe('Pendente');
      expect(toDbStatus('Enviado')).toBe('Pendente');
      expect(toDbStatus('Assinado')).toBe('Assinado');
      expect(toDbStatus('Ativo')).toBe('Assinado');
      expect(toDbStatus('Pausado')).toBe('Pendente');
      expect(toDbStatus('Cancelado')).toBe('Cancelado');
      expect(toDbStatus('Pendente')).toBe('Pendente');
    });

    it('should return the same value if already a valid DB status', () => {
      expect(toDbStatus('Assinado')).toBe('Assinado');
      expect(toDbStatus('Pendente')).toBe('Pendente');
      expect(toDbStatus('Cancelado')).toBe('Cancelado');
    });

    it('should fallback to Pendente for unknown status', () => {
      expect(toDbStatus('unknown')).toBe('Pendente');
      expect(toDbStatus('')).toBe('Pendente');
    });

    it('all outputs should be valid for CHECK CONSTRAINT', () => {
      const testInputs = [
        'Rascunho', 'Enviado', 'Assinado', 'Ativo', 
        'Pausado', 'Cancelado', 'Pendente', 'unknown', ''
      ];
      
      testInputs.forEach((input) => {
        const result = toDbStatus(input);
        expect(VALID_DB_STATUSES).toContain(result);
      });
    });
  });

  describe('toUiStatus', () => {
    it('should convert DB statuses to UI statuses', () => {
      expect(toUiStatus('Assinado')).toBe('Assinado');
      expect(toUiStatus('Pendente')).toBe('Pendente');
      expect(toUiStatus('Cancelado')).toBe('Cancelado');
    });

    it('should return the same value for valid UI statuses', () => {
      expect(toUiStatus('Rascunho')).toBe('Rascunho');
      expect(toUiStatus('Enviado')).toBe('Enviado');
      expect(toUiStatus('Ativo')).toBe('Ativo');
      expect(toUiStatus('Pausado')).toBe('Pausado');
    });

    it('should fallback to Pendente for unknown status', () => {
      expect(toUiStatus('unknown')).toBe('Pendente');
      expect(toUiStatus('')).toBe('Pendente');
    });
  });

  describe('ACTIVE_STATUSES', () => {
    it('should have correct DB active statuses', () => {
      expect(ACTIVE_DB_STATUSES).toContain('Assinado');
      expect(ACTIVE_DB_STATUSES).toHaveLength(1);
    });

    it('should have correct UI active statuses', () => {
      expect(ACTIVE_UI_STATUSES).toContain('Ativo');
      expect(ACTIVE_UI_STATUSES).toContain('Assinado');
      expect(ACTIVE_UI_STATUSES).toHaveLength(2);
    });
  });

  describe('isActiveStatus', () => {
    it('should return true for active statuses', () => {
      expect(isActiveStatus('Ativo')).toBe(true);
      expect(isActiveStatus('Assinado')).toBe(true);
    });

    it('should return false for inactive statuses', () => {
      expect(isActiveStatus('Rascunho')).toBe(false);
      expect(isActiveStatus('Enviado')).toBe(false);
      expect(isActiveStatus('Pausado')).toBe(false);
      expect(isActiveStatus('Cancelado')).toBe(false);
      expect(isActiveStatus('Pendente')).toBe(false);
    });

    it('should return false for unknown statuses', () => {
      expect(isActiveStatus('unknown')).toBe(false);
      expect(isActiveStatus('')).toBe(false);
    });
  });

  describe('CHECK CONSTRAINT compatibility', () => {
    it('toDbStatus should NEVER return a value outside the constraint', () => {
      // Test with many different inputs
      const inputs = [
        'Rascunho', 'Enviado', 'Assinado', 'Ativo', 'Pausado', 
        'Cancelado', 'Pendente', 'draft', 'active', 'signed',
        'invalid', '', undefined, null
      ];

      inputs.forEach((input) => {
        const result = toDbStatus(input as string);
        expect(VALID_DB_STATUSES).toContain(result);
      });
    });
  });
});
