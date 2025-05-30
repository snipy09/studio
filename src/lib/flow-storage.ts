
import type { Flow } from '@/lib/types';

const FLOW_STORAGE_KEY = 'userFlows_v1';

export function getAllStoredFlows(): Flow[] {
  if (typeof window === 'undefined') return [];
  try {
    const storedFlows = localStorage.getItem(FLOW_STORAGE_KEY);
    return storedFlows ? JSON.parse(storedFlows) : [];
  } catch (error) {
    console.error("Error reading flows from localStorage:", error);
    return [];
  }
}

export function getStoredFlowById(flowId: string): Flow | undefined {
  const flows = getAllStoredFlows();
  return flows.find(flow => flow.id === flowId);
}

export function saveAllStoredFlows(flows: Flow[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify(flows));
  } catch (error) {
    console.error("Error saving flows to localStorage:", error);
  }
}

export function saveStoredFlow(flowToSave: Flow): Flow[] {
  let flows = getAllStoredFlows();
  const existingIndex = flows.findIndex(f => f.id === flowToSave.id);
  if (existingIndex > -1) {
    flows[existingIndex] = { ...flowToSave, updatedAt: new Date().toISOString() };
  } else {
    flows.unshift({ ...flowToSave, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  saveAllStoredFlows(flows);
  return flows;
}

export function deleteStoredFlowById(flowId: string): Flow[] {
  let flows = getAllStoredFlows();
  flows = flows.filter(f => f.id !== flowId);
  saveAllStoredFlows(flows);
  return flows;
}
