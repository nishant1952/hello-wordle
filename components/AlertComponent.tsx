'use client';

import React, { useContext } from 'react';
import AlertContext from '../context/alert/alertContext';

const AlertComponent: React.FC = () => {
  const alertContext = useContext(AlertContext);

  if (!alertContext) {
    return null; // or some fallback UI
  }

  const { alerts } = alertContext;

  return (
    <div className="alert-container">
      {alerts.map((alert) => (
        <div key={alert.id} className={`alert alert-${alert.type}`}>
          {alert.msg}
        </div>
      ))}
    </div>
  );
};

export default AlertComponent;