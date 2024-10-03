'use client';
import React, { useState, useRef, useEffect, useContext } from 'react';
import AlertContext from '../context/alert/alertContext';
import { GameProps, InputStatus } from './types';
import { useGameLogic } from './useGameLogic';
import { useInputHandling } from './useInputHandling';
import GameBoard from './GameBoard';
import { useSocket } from './SocketContext';

const Game: React.FC<GameProps> = ({ rows, columns }) => {
  const totalInputs = rows * columns;
  const [inputs, setInputs] = useState<string[]>(Array(totalInputs).fill(''));
  const [inputStatus, setInputStatus] = useState<InputStatus[]>(Array(totalInputs).fill('unattempted'));
  const [activeRow, setActiveRow] = useState(0);
  const inputsRef = useRef<HTMLDivElement>(null);
  const [lastFocusedIndex, setLastFocusedIndex] = useState(0);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const alertContext = useContext(AlertContext);
  const { socket, gameId, players, isGameStarted, makeGuess, endGame: socketEndGame } = useSocket();

  if (!alertContext) {
    return <div>Context is not provided!</div>;
  }

  const { setAlert } = alertContext;

  const { finishGame, endGame } = useGameLogic(setIsGameFinished, setAlert, socketEndGame);

  const { handleInput, handleKeyUp } = useInputHandling(
    inputs,
    setInputs,
    inputsRef,
    activeRow,
    columns,
    setLastFocusedIndex,
    setActiveRow,
    inputStatus,
    setInputStatus,
    rows,
    finishGame,
    makeGuess
  );

  useEffect(() => {
    if (!socket) return;

    socket.on('guessResult', ({ guess, row, status }) => {
      const newStatus = [...inputStatus];
      for (let i = 0; i < columns; i++) {
        newStatus[row * columns + i] = status[i];
      }
      setInputStatus(newStatus);

      if (status.every((s: InputStatus) => s === 'match')) {
        finishGame();
      } else if (row < rows - 1) {
        setActiveRow(row + 1);
      } else {
        // Game over, no more rows
        socketEndGame('lose');
      }
    });

    socket.on('gameEnded', (result) => {
      setIsGameFinished(true);
      setAlert(result === 'win' ? 'You won!' : 'Game over!', result === 'win' ? 'success' : 'info');
    });

    return () => {
      socket.off('guessResult');
      socket.off('gameEnded');
    };
  }, [socket, inputStatus, columns, rows, finishGame, setAlert, socketEndGame]);

  useEffect(() => {
    if (!isGameStarted) return;

    const inputsDiv = inputsRef.current;
    if (!inputsDiv) return;

    const allEmpty = inputs.every(input => input === '');
    if (allEmpty) {
      (inputsDiv.children[0] as HTMLInputElement).focus();
    }

    const preventMouseFocusChange = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const activeRowStart = activeRow * columns;
      const activeRowEnd = activeRowStart + columns - 1;
      if (lastFocusedIndex >= activeRowStart && lastFocusedIndex <= activeRowEnd) {
        (inputsDiv.children[lastFocusedIndex] as HTMLInputElement).focus();
      }
    };

    document.addEventListener('mousedown', preventMouseFocusChange);
    document.addEventListener('touchstart', preventMouseFocusChange);

    return () => {
      document.removeEventListener('mousedown', preventMouseFocusChange);
      document.removeEventListener('touchstart', preventMouseFocusChange);
    };
  }, [inputs, lastFocusedIndex, activeRow, columns, isGameStarted]);

  if (!isGameStarted) {
    return <div>Waiting for opponent...</div>;
  }

  return (
    <div>
      <div className="container">
        <h2>Game ID: {gameId}</h2>
        <p>Players: {players.join(', ')}</p>
        <GameBoard
          inputs={inputs}
          inputStatus={inputStatus}
          columns={columns}
          rows={rows}
          inputsRef={inputsRef}
          activeRow={activeRow}
          handleInput={handleInput}
          handleKeyUp={handleKeyUp}
        />
      </div>
    </div>
  );
};

export default Game;