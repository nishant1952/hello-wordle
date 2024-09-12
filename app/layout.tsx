import React from 'react';
import AlertState from '../context/alert/AlertState';
import AlertComponent from '../components/AlertComponent';
import './globals.css';  // Make sure this line is present

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AlertState>
          <AlertComponent />
          {children}
        </AlertState>
      </body>
    </html>
  );
}