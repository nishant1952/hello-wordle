import React from 'react';
import { GameBoardProps } from './types';

const GameBoard: React.FC<GameBoardProps> = ({
  inputs,
  inputStatus,
  columns,
  rows,
  inputsRef,
  activeRow,
  handleInput,
  handleKeyUp
}) => {
  return (
    <div
      className="inputs"
      ref={inputsRef}
      onClick={(e) => {
        const target = e.target as HTMLInputElement;
        if (target.tagName === 'INPUT') {
          const index = Array.from(inputsRef.current?.children || []).indexOf(target);
          const rowIndex = Math.floor(index / columns);
          if (rowIndex === activeRow) {
            target.focus();
          }
        }
      }}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 80px)`,
        gap: '2px',
      }}
    >
      {inputs.map((input, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={input}
          onChange={handleInput}
          onKeyUp={handleKeyUp}
          className={`input ${
            inputStatus[index] === 'match'
              ? 'input-match'
              : inputStatus[index] === 'semi'
              ? 'input-semi'
              : inputStatus[index] === 'mismatch'
              ? 'input-mismatch'
              : 'input-unattempted'
          }`}
          inputMode="text"
          style={{
            width: '80px',
            height: '80px',
            textAlign: 'center',
          }}
        />
      ))}
    </div>
  );
};

export default GameBoard;