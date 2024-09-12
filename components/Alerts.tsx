import React, { useContext } from 'react';
import AlertContext from '../context/alert/alertContext';

const Alerts: React.FC = () => {
  const alertContext = useContext(AlertContext);

  // Check if context is undefined
  if (!alertContext) {
    return null; // Or handle the case where the context is not provided
  }

  const alertStyles: Record<string, string> = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700',
    danger: 'bg-red-100 border-red-500 text-red-700',
  };

  const iconStyles: Record<string, string> = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle',
    danger: 'fas fa-exclamation-circle',
  };

  return (
    alertContext.alerts.length > 0 &&
    alertContext.alerts.map((alert) => (
      <div
        key={alert.id}
        className={`p-4 mb-4 rounded-lg border-l-4 ${
          alertStyles[alert.type]
        } flex items-center`}
        role='alert'
      >
        <i className={`${iconStyles[alert.type]} mr-3`} />
        <span>{alert.msg}</span>
      </div>
    ))
  );
};

export default Alerts;
