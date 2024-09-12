export interface GameProps {
  rows: number;
  columns: number;
}

export type InputStatus = 'unattempted' | 'match' | 'semi' | 'mismatch';

export interface GameBoardProps {
  inputs: string[];
  inputStatus: InputStatus[];
  columns: number;
  rows: number;
  inputsRef: React.RefObject<HTMLDivElement>;
  activeRow: number;
  handleInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}