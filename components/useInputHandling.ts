import { useCallback } from 'react';
import { InputStatus } from './types';

export const useInputHandling = (
  inputs: string[],
  setInputs: React.Dispatch<React.SetStateAction<string[]>>,
  inputsRef: React.RefObject<HTMLDivElement>,
  activeRow: number,
  columns: number,
  setLastFocusedIndex: React.Dispatch<React.SetStateAction<number>>,
  setActiveRow: React.Dispatch<React.SetStateAction<number>>,
  inputStatus: InputStatus[],
  setInputStatus: React.Dispatch<React.SetStateAction<InputStatus[]>>,
  rows: number,
  finishGame: () => void
) => {
  const wordOfTheRound = 'ALIVE';
  const charsArray = wordOfTheRound.split('');

  const focusElement = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.focus();
    }
  }, []);

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
  }, [inputs, focusElement, activeRow, columns, inputsRef, setInputs, setLastFocusedIndex]);

  const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const val = target.value;
    const key = e.key.toLowerCase();
    const index = Array.from(inputsRef.current?.children || []).indexOf(target);
    const rowIndex = Math.floor(index / columns);
    const rowStart = rowIndex * columns;
    const lastIndexOfRow = rowStart + columns - 1;

    if (rowIndex === activeRow) {
      if (key === 'backspace' || key === 'delete') {
        const newInputs = [...inputs];
        if (newInputs[index] === '') {
          const prev = target.previousElementSibling as HTMLInputElement;
          if (prev && prev.classList.contains('input') && Math.floor((index - 1) / columns) === activeRow) {
            newInputs[index - 1] = '';
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
            const currentIndex = i % columns;
            const answerAtIndex = charsArray[currentIndex];
            const inputAtIndex = rowInputs[currentIndex];
            const filteredChars = charsArray.filter((_, index) => index !== currentIndex);
            if (answerAtIndex === inputAtIndex) {
              newStatus[i] = 'match';
            } else {
              newStatus[i] = 'mismatch';  
              mismatchDict[answerAtIndex] = (mismatchDict[answerAtIndex] || 0) + 1;
            }
          }
          for (let i = rowStart; i < rowEnd; i++) {
            const currentIndex = i % columns;
            const inputAtIndex = rowInputs[currentIndex];
            if (newStatus[i] === 'mismatch' && mismatchDict[inputAtIndex] && mismatchDict[inputAtIndex] > 0) {
              newStatus[i] = 'semi';
              mismatchDict[inputAtIndex]--;
            }
          }
          setInputStatus(newStatus);
        
          if (activeRow < rows - 1) {
            setActiveRow(activeRow + 1);
            const nextRowStart = (activeRow + 1) * columns;
            focusElement(inputsRef.current?.children[nextRowStart] as HTMLInputElement);
          }
          
          const subset = newStatus.slice(rowStart, rowEnd);
          if (subset.every(value => value === 'match')) {
            finishGame();
          }
        }
      } else if ((/^[a-zA-Z]*$/.test(key)) && val !== '') {
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
  }, [inputs, focusElement, activeRow, columns, rows, inputsRef, setInputs, setLastFocusedIndex, setActiveRow, inputStatus, setInputStatus, finishGame, charsArray]);

  return { handleInput, handleKeyUp };
};