import React, { useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import styles from './spectralBoard.module.css';

interface SpectralBoardProps {
  onPositionChange: (x: number, y: number) => void; 
  onRelease: (x: number, y: number) => void;
}

const SpectralBoard = ({ onPositionChange, onRelease}: SpectralBoardProps): JSX.Element => {
    const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
    const normalizedY = 0 + ((data.y - (89)) / (0 - (89))) * (100 - (0));
    const normalizedX = -100 + ((data.x - (0))) / (0 - 177) * (100 - (-100));
       onPositionChange(normalizedX, normalizedY);
  };

   const handleStop = (e, data) => {
     const normalizedY = -100 + ((data.y - 0) / (89 - 0)) * (100 - (-100));
     const normalizedX = -100 + ((data.x - (177))) / (0 - 177) * (100 - (-100));
    if (onRelease) {
      onRelease(normalizedX, normalizedY);
    }
  };
  


  return (
    <div className={styles.spectralBoard}>
      <div className={styles.board} id="board">
        <Draggable 
          bounds="parent"
          position={position}
          onDrag={handleDrag}
          onStop={handleStop}
        >
          <div className={styles.draggablePoint} />
              </Draggable>
          </div>
          <div className={styles.h5}>Spectral Balance</div>
      </div>
     
      
  );
};

export default SpectralBoard;
