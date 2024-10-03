import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  gameId: string | null;
  players: string[];
  isGameStarted: boolean;
  createGame: () => void;
  joinGame: (gameId: string) => void;
  makeGuess: (guess: string, row: number) => void;
  endGame: (result: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [isGameStarted, setIsGameStarted] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('gameCreated', (id: string) => {
      setGameId(id);
    });

    socket.on('gameJoined', ({ gameId, players }) => {
      setGameId(gameId);
      setPlayers(players);
    });

    socket.on('gameStart', () => {
      setIsGameStarted(true);
    });

    socket.on('guessResult', ({ guess, row }) => {
      // Handle guess result
    });

    socket.on('gameEnded', (result) => {
      // Handle game end
    });

    return () => {
      socket.off('gameCreated');
      socket.off('gameJoined');
      socket.off('gameStart');
      socket.off('guessResult');
      socket.off('gameEnded');
    };
  }, [socket]);

  const createGame = () => {
    if (socket) socket.emit('createGame');
  };

  const joinGame = (gameId: string) => {
    if (socket) socket.emit('joinGame', gameId);
  };

  const makeGuess = (guess: string, row: number) => {
    if (socket && gameId) socket.emit('makeGuess', { gameId, guess, row });
  };

  const endGame = (result: string) => {
    if (socket && gameId) socket.emit('gameOver', { gameId, result });
  };

  return (
    <SocketContext.Provider value={{ socket, gameId, players, isGameStarted, createGame, joinGame, makeGuess, endGame }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};