import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Json } from '@/integrations/supabase/types';

// Event types for Nexia
export type NexiaEventType =
  // Clients
  | 'CLIENT_CREATED'
  | 'CLIENT_UPDATED'
  | 'CLIENT_DELETED'
  // Plannings
  | 'PLAN_CREATED'
  | 'PLAN_UPDATED'
  | 'PLAN_DELETED'
  // AI
  | 'IA_DIAGNOSIS_GENERATED'
  | 'IA_STRATEGY_GENERATED'
  | 'IA_TASKS_GENERATED'
  // Tasks
  | 'TASKS_SAVED_FROM_PLAN'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_COMPLETED'
  | 'TASK_REOPENED'
  | 'TASK_ARCHIVED'
  // Export
  | 'PLAN_EXPORTED_PDF';

export type EntityType = 'client' | 'plan' | 'task';

interface LogActivityParams {
  eventType: NexiaEventType;
  entityType: EntityType;
  entityId: string;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
}

interface LogActivityDirectParams extends LogActivityParams {
  workspaceId: string;
  userId: string;
}

// Direct function for use outside of React components
export async function logNexiaActivityDirect({
  workspaceId,
  userId,
  eventType,
  entityType,
  entityId,
  title,
  description,
  metadata = {},
}: LogActivityDirectParams) {
  try {
    const { error } = await supabase.from('activity_logs').insert([{
      workspace_id: workspaceId,
      user_id: userId,
      type: eventType,
      entity_type: entityType,
      entity_id: entityId,
      title,
      description,
      message: description, // Keep for backward compatibility
      metadata: metadata as Json,
    }]);

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// Hook for use within React components
export function useNexiaActivityLog() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();

  const logActivity = async ({
    eventType,
    entityType,
    entityId,
    title,
    description,
    metadata = {},
  }: LogActivityParams) => {
    if (!workspace || !user) {
      console.warn('Cannot log activity: no workspace or user');
      return;
    }

    await logNexiaActivityDirect({
      workspaceId: workspace.id,
      userId: user.id,
      eventType,
      entityType,
      entityId,
      title,
      description,
      metadata,
    });
  };

  return { logActivity };
}

// Helper functions for common logging scenarios
export function createClientLogParams(clientId: string, clientName: string): Omit<LogActivityParams, 'metadata'> {
  return {
    eventType: 'CLIENT_CREATED',
    entityType: 'client',
    entityId: clientId,
    title: 'Cliente criado',
    description: `O cliente "${clientName}" foi criado`,
  };
}

export function updateClientLogParams(clientId: string, clientName: string): Omit<LogActivityParams, 'metadata'> {
  return {
    eventType: 'CLIENT_UPDATED',
    entityType: 'client',
    entityId: clientId,
    title: 'Cliente atualizado',
    description: `O cliente "${clientName}" foi atualizado`,
  };
}

export function deleteClientLogParams(clientId: string, clientName: string): Omit<LogActivityParams, 'metadata'> {
  return {
    eventType: 'CLIENT_DELETED',
    entityType: 'client',
    entityId: clientId,
    title: 'Cliente excluído',
    description: `O cliente "${clientName}" foi excluído`,
  };
}

export function createPlanLogParams(planId: string, planName: string, clientName?: string): Omit<LogActivityParams, 'metadata'> {
  return {
    eventType: 'PLAN_CREATED',
    entityType: 'plan',
    entityId: planId,
    title: 'Planejamento criado',
    description: clientName 
      ? `O planejamento "${planName}" foi criado para o cliente "${clientName}"`
      : `O planejamento "${planName}" foi criado`,
  };
}

export function updatePlanLogParams(planId: string, planName: string): Omit<LogActivityParams, 'metadata'> {
  return {
    eventType: 'PLAN_UPDATED',
    entityType: 'plan',
    entityId: planId,
    title: 'Planejamento atualizado',
    description: `O planejamento "${planName}" foi atualizado`,
  };
}

export function diagnosisGeneratedLogParams(planId: string, planName: string): Omit<LogActivityParams, 'metadata'> {
  return {
    eventType: 'IA_DIAGNOSIS_GENERATED',
    entityType: 'plan',
    entityId: planId,
    title: 'Diagnóstico IA gerado',
    description: `Diagnóstico gerado por IA para o planejamento "${planName}"`,
  };
}

export function strategyGeneratedLogParams(planId: string, planName: string): Omit<LogActivityParams, 'metadata'> {
  return {
    eventType: 'IA_STRATEGY_GENERATED',
    entityType: 'plan',
    entityId: planId,
    title: 'Estratégia IA gerada',
    description: `Estratégia e tarefas geradas por IA para o planejamento "${planName}"`,
  };
}

export function tasksSavedLogParams(planId: string, planName: string, taskCount: number): Omit<LogActivityParams, 'metadata'> {
  return {
    eventType: 'TASKS_SAVED_FROM_PLAN',
    entityType: 'plan',
    entityId: planId,
    title: 'Tarefas salvas',
    description: `${taskCount} tarefas salvas do planejamento "${planName}"`,
  };
}

export function taskCompletedLogParams(taskId: string, taskTitle: string): Omit<LogActivityParams, 'metadata'> {
  return {
    eventType: 'TASK_COMPLETED',
    entityType: 'task',
    entityId: taskId,
    title: 'Tarefa concluída',
    description: `A tarefa "${taskTitle}" foi concluída`,
  };
}

export function taskReopenedLogParams(taskId: string, taskTitle: string): Omit<LogActivityParams, 'metadata'> {
  return {
    eventType: 'TASK_REOPENED',
    entityType: 'task',
    entityId: taskId,
    title: 'Tarefa reaberta',
    description: `A tarefa "${taskTitle}" foi reaberta`,
  };
}

export function taskArchivedLogParams(taskId: string, taskTitle: string): Omit<LogActivityParams, 'metadata'> {
  return {
    eventType: 'TASK_ARCHIVED',
    entityType: 'task',
    entityId: taskId,
    title: 'Tarefa arquivada',
    description: `A tarefa "${taskTitle}" foi arquivada`,
  };
}

export function taskStatusChangedLogParams(taskId: string, taskTitle: string, newStatus: string): Omit<LogActivityParams, 'metadata'> {
  const statusLabels: Record<string, string> = {
    todo: 'pendente',
    doing: 'em andamento',
    done: 'concluída',
    archived: 'arquivada',
  };
  
  return {
    eventType: 'TASK_STATUS_CHANGED',
    entityType: 'task',
    entityId: taskId,
    title: 'Status alterado',
    description: `A tarefa "${taskTitle}" foi marcada como ${statusLabels[newStatus] || newStatus}`,
  };
}
