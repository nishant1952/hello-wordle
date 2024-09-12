'use client';
import React, { useReducer, ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import AlertContext, { Alert } from './alertContext';
import alertReducer from './alertReducer';

interface AlertStateProps {
  children: ReactNode;
}

const AlertState: React.FC<AlertStateProps> = ({ children }) => {
  const initialState: Alert[] = [];
  const [state, dispatch] = useReducer(alertReducer, initialState);

  const setAlert = (msg: string, type: string, timeout = 2000) => {
    const id = uuid();
	console.log('set alert called');
    dispatch({
      type: 'SET_ALERT',
      payload: { id, msg, type },
    });
    setTimeout(() => dispatch({ type: 'REMOVE_ALERT', payload: id }), timeout);
  };

  return (
    <AlertContext.Provider
      value={{
        alerts: state,
        setAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export default AlertState;