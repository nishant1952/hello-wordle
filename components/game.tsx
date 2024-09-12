'use client';
import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import AlertContext from '../context/alert/alertContext';

interface GameProps {
  rows: number;
  columns: number;
}

const Game: React.FC<GameProps> = ({ rows, columns }) => {
  const totalInputs = rows * columns;
  const [inputs, setInputs] = useState<string[]>(Array(totalInputs).fill(''));
  const [inputStatus, setInputStatus] = useState<string[]>(Array(5).fill('unattempted'));
  const [activeRow, setActiveRow] = useState(0);
  const inputsRef = useRef<HTMLDivElement>(null);
  const [lastFocusedIndex, setLastFocusedIndex] = useState(0);
  const wordOfTheRound = 'ALIVE' ;
  const charsArray = wordOfTheRound.split('');
  const [isGameFinished, setIsGameFinished] = useState(false);
  const alertContext = useContext(AlertContext);
    if (!alertContext) {
    return <div>Context is not provided!</div>; // Handle the case where the context is not provided
  }

  // Destructure context values
  const { setAlert } = alertContext;
  const focusElement = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.focus();
    }
  }, []);

  useEffect(() => {
    const inputsDiv = inputsRef.current;
    if (!inputsDiv) return;

    const allEmpty = inputs.every(input => input === '');
    if (allEmpty) {
      focusElement(inputsDiv.children[0] as HTMLInputElement);
    }

    const preventMouseFocusChange = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const activeRowStart = activeRow * columns;
      const activeRowEnd = activeRowStart + columns - 1;
      if (lastFocusedIndex >= activeRowStart && lastFocusedIndex <= activeRowEnd) {
        focusElement(inputsDiv.children[lastFocusedIndex] as HTMLInputElement);
      }
    };

    document.addEventListener('mousedown', preventMouseFocusChange);
    document.addEventListener('touchstart', preventMouseFocusChange);

    return () => {
      document.removeEventListener('mousedown', preventMouseFocusChange);
      document.removeEventListener('touchstart', preventMouseFocusChange);
    };
  }, [inputs, lastFocusedIndex, focusElement, activeRow, columns]);

function endGame(): void {
  // Select all input elements with the class 'input'
  const inputs = document.querySelectorAll<HTMLInputElement>('.input');

  // Iterate over each input element
  inputs.forEach((input) => {
    // Disable the input field
    input.disabled = true;

    // Remove any interactive capabilities and the text cursor
    input.style.pointerEvents = 'none'; // Ensure no interactions
    input.style.outline = 'none'; // Remove the text cursor
  });
}


  const finishGame = () => {
    // Your game finish logic here
    setIsGameFinished(true);
    endGame();
    setAlert('Game finished!', 'success');
    // document.body.style.cursor = 'none'; // Hide cursor
    
  };

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const val = target.value;
    if (/^[a-zA-Z]*$/.test(val)) {
      const index = Array.from(inputsRef.current?.children || []).indexOf(target);
      const rowIndex = Math.floor(index / columns);
      if (rowIndex === activeRow) {
        const newInputs = [...inputs];
        newInputs[index] = val.toUpperCase();
        setInputs(newInputs);
        setLastFocusedIndex(index);

        if (val !== '') {
          const next = target.nextElementSibling as HTMLInputElement;
          if (next && next.classList.contains('input') && Math.floor((index + 1) / columns) === activeRow) {
            focusElement(next);
          }
        }
      }
    }
  }, [inputs, focusElement, activeRow, columns]);

  const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const val = target.value;
    const key = e.key.toLowerCase();
    const index = Array.from(inputsRef.current?.children || []).indexOf(target);
    const rowIndex = Math.floor(index / columns);
    const columnIndex = index % columns;
    const rowStart = rowIndex * columns;
    const lastIndexOfRow = rowStart + columns -1 ;

    if (rowIndex === activeRow) {
      if (key === 'backspace' || key === 'delete') {
        const newInputs = [...inputs];
        if (newInputs[index] === '') {
          const prev = target.previousElementSibling as HTMLInputElement;
          if (prev && prev.classList.contains('input') && Math.floor((index - 1) / columns) === activeRow) {
            newInputs[index] = '';
            setInputs(newInputs);
            focusElement(prev);
          }
        } else {
          newInputs[index] = '';
          setInputs(newInputs);
        }
        setLastFocusedIndex(index);
      } else if (key === 'enter' && index === lastIndexOfRow) {

        const rowEnd = rowStart + columns;
        const newStatus = [...inputStatus];
        const rowInputs = inputs.slice(rowStart, rowEnd);
        
        if (rowInputs.every(input => input.trim() !== '')) {
          const mismatchDict: { [key: string]: number } = {};
          for (let i = rowStart; i < rowEnd; i++) {
            const currentIndex =  i%columns;
            const answerAtIndex = charsArray[currentIndex];
            const inputAtIndex = rowInputs[currentIndex];
            const filteredChars = charsArray.filter((_, index) => index !== currentIndex);
            const dictOfMismatch = filteredChars.includes(inputAtIndex);
            if(answerAtIndex == inputAtIndex){
              newStatus[i] = 'match';
            }
            else {
              newStatus[i] = 'mismatch';  
              mismatchDict[answerAtIndex] = (mismatchDict[answerAtIndex] || 0) + 1;
            }
            setInputStatus(newStatus);
          }
          for (let i = rowStart; i < rowEnd; i++) {
          
            const currentIndex =  i%columns;
            const answerAtIndex = charsArray[currentIndex];
            const inputAtIndex = rowInputs[currentIndex];
            if(newStatus[i] === 'mismatch' && mismatchDict[inputAtIndex] && mismatchDict[inputAtIndex] > 0){
              newStatus[i] = 'semi';
              mismatchDict[inputAtIndex]--;
              setInputStatus(newStatus);
            }
            
          }
        
          if (activeRow < rows - 1) {
            
            setActiveRow(activeRow + 1);
            const nextRowStart = (activeRow + 1) * columns;
            focusElement(inputsRef.current?.children[nextRowStart] as HTMLInputElement);
          } 
          // else case to handle
          // else {
          // }
        }
         const subset = newStatus.slice(rowStart, rowEnd + 1);
        if (subset.every(value => value === 'match')){
          finishGame();
        }
      }
      else if ((/^[a-zA-Z]*$/.test(key)) && val !== '') {
        const next = target.nextElementSibling as HTMLInputElement;
        if (next && next.classList.contains('input') && Math.floor((index + 1) / columns) === activeRow) {
          const nextVal = next.value;
          if (nextVal.length === 0) {
            const newInputs = [...inputs];
            newInputs[index + 1] = key.toUpperCase();
            setInputs(newInputs);
            setLastFocusedIndex(index + 1);
            focusElement(next);
          }
        }
      }
    }
  }, [inputs, focusElement, activeRow, columns, rows]);

  return (
    <div>
      <div className="container">
        <div
          className="inputs"
          ref={inputsRef}
          onClick={(e) => {
            const target = e.target as HTMLInputElement;
            if (target.tagName === 'INPUT') {
              const index = Array.from(inputsRef.current?.children || []).indexOf(target);
              const rowIndex = Math.floor(index / columns);
              if (rowIndex === activeRow) {
                focusElement(target);
                setLastFocusedIndex(index);
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
      </div>
    </div>
  );
};

export default Game;
