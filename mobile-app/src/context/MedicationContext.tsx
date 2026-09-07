import { createContext, useContext, useState, type ReactNode } from 'react';
import { api } from '../api/client';

export interface Medication {
  _id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
  deactivatedAt?: string;
  active: boolean;
}

interface MedicationInput {
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
}

interface MedicationContextType {
  medications: Medication[];
  isLoading: boolean;
  fetchMedications: () => Promise<void>;
  addMedication: (data: MedicationInput) => Promise<void>;
  updateMedication: (id: string, data: Partial<MedicationInput>) => Promise<void>;
  deactivateMedication: (id: string) => Promise<void>;
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

export function MedicationProvider({ children }: { children: ReactNode }) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchMedications() {
    setIsLoading(true);
    try {
      const { data } = await api.get('/medications');
      setMedications(data);
    } finally {
      setIsLoading(false);
    }
  }

  async function addMedication(newMed: MedicationInput) {
    const { data } = await api.post('/medications', newMed);
    setMedications((prev) => [data, ...prev]);
  }

  async function updateMedication(id: string, updates: Partial<MedicationInput>) {
    const { data } = await api.patch(`/medications/${id}`, updates);
    setMedications((prev) => prev.map((med) => (med._id === id ? data : med)));
  }

  async function deactivateMedication(id: string) {
    const { data } = await api.delete(`/medications/${id}`);
    setMedications((prev) => prev.map((med) => (med._id === id ? data : med)));
  }

  return (
    <MedicationContext.Provider
      value={{
        medications,
        isLoading,
        fetchMedications,
        addMedication,
        updateMedication,
        deactivateMedication,
      }}
    >
      {children}
    </MedicationContext.Provider>
  );
}

export function useMedications() {
  const context = useContext(MedicationContext);
  if (!context) throw new Error('useMedications must be used within MedicationProvider');
  return context;
}