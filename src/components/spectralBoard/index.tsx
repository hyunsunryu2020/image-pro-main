import React, { useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import styles from './spectralBoard.module.css';

interface SpectralBoardProps {
  onPositionChange: (x: number, y: number) => void; 
}

const SpectralBoard = ({ onPositionChange }: SpectralBoardProps): JSX.Element => {
    const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleDrag = (e, data) => {
      setPosition({ x: data.x, y: data.y });
       onPositionChange(data.x, data.y);
  };
  


  return (
    <div className={styles.spectralBoard}>
      <div className={styles.board} id="board">
        <Draggable 
          bounds="parent"
          position={position}
          onDrag={handleDrag}
        >
          <div className={styles.draggablePoint} />
              </Draggable>
          </div>
          <div className={styles.h5}>Spectral Balance</div>
      </div>
     
      
  );
};

export default SpectralBoard;
