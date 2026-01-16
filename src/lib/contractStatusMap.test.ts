import { describe, it, expect } from 'vitest';
import {
  toDbStatus,
  toUiStatus,
  isActiveStatus,
  isValidDbStatus,
  VALID_DB_STATUSES,
  ACTIVE_DB_STATUSES,
  type DbContractStatus,
} from './contractStatusMap';

/**
 * Testes para o módulo contractStatusMap
 * 
 * O banco aceita APENAS: 'Assinado', 'Pendente', 'Cancelado'
 */
describe('contractStatusMap', () => {
  
  describe('VALID_DB_STATUSES', () => {
    it('deve conter exatamente os 3 status aceitos pelo banco', () => {
      expect(VALID_DB_STATUSES).toEqual(['Assinado', 'Pendente', 'Cancelado']);
    });
  });

  describe('ACTIVE_DB_STATUSES', () => {
    it('deve conter apenas Assinado como status ativo', () => {
      expect(ACTIVE_DB_STATUSES).toEqual(['Assinado']);
    });
  });

  describe('toDbStatus', () => {
    it('deve retornar Pendente para Rascunho', () => {
      expect(toDbStatus('Rascunho')).toBe('Pendente');
    });
    
    it('deve retornar Pendente para Enviado', () => {
      expect(toDbStatus('Enviado')).toBe('Pendente');
    });
    
    it('deve retornar Assinado para Assinado', () => {
      expect(toDbStatus('Assinado')).toBe('Assinado');
    });
    
    it('deve retornar Assinado para Ativo (legado)', () => {
      expect(toDbStatus('Ativo')).toBe('Assinado');
    });
    
    it('deve retornar Pendente para Pausado (legado)', () => {
      expect(toDbStatus('Pausado')).toBe('Pendente');
    });
    
    it('deve retornar Cancelado para Cancelado', () => {
      expect(toDbStatus('Cancelado')).toBe('Cancelado');
    });
    
    it('deve retornar Pendente para Pendente', () => {
      expect(toDbStatus('Pendente')).toBe('Pendente');
    });
    
    it('deve retornar Pendente para status desconhecido', () => {
      expect(toDbStatus('invalid')).toBe('Pendente');
      expect(toDbStatus('')).toBe('Pendente');
      expect(toDbStatus('xyz')).toBe('Pendente');
    });
    
    it('TODOS os retornos devem ser válidos para o CHECK CONSTRAINT', () => {
      const testInputs = [
        'Rascunho', 'Enviado', 'Assinado', 'Ativo', 
        'Pausado', 'Cancelado', 'Pendente', 
        'invalid', '', 'xyz', 'draft', 'sent'
      ];
      
      testInputs.forEach(input => {
        const result = toDbStatus(input);
        expect(VALID_DB_STATUSES).toContain(result);
      });
    });
  });

  describe('toUiStatus', () => {
    it('deve retornar Assinado para Assinado', () => {
      expect(toUiStatus('Assinado')).toBe('Assinado');
    });
    
    it('deve retornar Rascunho para Pendente', () => {
      expect(toUiStatus('Pendente')).toBe('Rascunho');
    });
    
    it('deve retornar Cancelado para Cancelado', () => {
      expect(toUiStatus('Cancelado')).toBe('Cancelado');
    });
    
    it('deve retornar o próprio valor se for um label válido', () => {
      expect(toUiStatus('Rascunho')).toBe('Rascunho');
      expect(toUiStatus('Enviado')).toBe('Enviado');
    });
    
    it('deve retornar Rascunho para status desconhecido', () => {
      expect(toUiStatus('invalid')).toBe('Rascunho');
    });
  });

  describe('isActiveStatus', () => {
    it('deve retornar true para Assinado', () => {
      expect(isActiveStatus('Assinado')).toBe(true);
    });
    
    it('deve retornar true para Ativo (mapeia para Assinado)', () => {
      expect(isActiveStatus('Ativo')).toBe(true);
    });
    
    it('deve retornar false para Pendente', () => {
      expect(isActiveStatus('Pendente')).toBe(false);
    });
    
    it('deve retornar false para Rascunho', () => {
      expect(isActiveStatus('Rascunho')).toBe(false);
    });
    
    it('deve retornar false para Cancelado', () => {
      expect(isActiveStatus('Cancelado')).toBe(false);
    });
  });

  describe('isValidDbStatus', () => {
    it('deve retornar true para status válidos do banco', () => {
      expect(isValidDbStatus('Assinado')).toBe(true);
      expect(isValidDbStatus('Pendente')).toBe(true);
      expect(isValidDbStatus('Cancelado')).toBe(true);
    });
    
    it('deve retornar false para labels da UI', () => {
      expect(isValidDbStatus('Rascunho')).toBe(false);
      expect(isValidDbStatus('Enviado')).toBe(false);
      expect(isValidDbStatus('Ativo')).toBe(false);
    });
    
    it('deve retornar false para valores inválidos', () => {
      expect(isValidDbStatus('invalid')).toBe(false);
      expect(isValidDbStatus('')).toBe(false);
    });
  });
  
  describe('Compatibilidade com demo_contracts_status_check', () => {
    it('toDbStatus NUNCA deve retornar valor fora do CHECK CONSTRAINT', () => {
      // Lista exaustiva de possíveis inputs
      const allPossibleInputs = [
        // Status válidos
        'Assinado', 'Pendente', 'Cancelado',
        // Labels da UI
        'Rascunho', 'Enviado',
        // Legados
        'Ativo', 'Pausado',
        // Inválidos
        '', 'null', 'undefined', 'draft', 'sent', 'signed', 'active',
        // Caso extremo
        '   ', 'ASSINADO', 'assinado'
      ];
      
      const validDbValues: DbContractStatus[] = ['Assinado', 'Pendente', 'Cancelado'];
      
      allPossibleInputs.forEach(input => {
        const result = toDbStatus(input);
        expect(validDbValues).toContain(result);
      });
    });
  });
});
