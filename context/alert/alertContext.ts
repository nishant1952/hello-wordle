import { createContext } from 'react';

export interface Alert {
  id: string;
  msg: string;
  type: string;
}

export interface AlertContextType {
  alerts: Alert[];
  setAlert: (msg: string, type: string, timeout?: number) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export default AlertContext;