import React, { useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import styles from './spatialBoard.module.css';

interface SpatialBoardProps {
  onPositionChange: (x: number, y: number) => void; 
  onRelease: (x: number, y: number) => void;
}

const SpatialBoard = ({ onPositionChange, onRelease }: SpatialBoardProps): JSX.Element => {
    const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
    const normalizedY = 20 + ((data.y - (89)) / (0 - (89))) * (200 - (20));
    const normalizedX = 0 + ((data.x - (0))) / (177 - 0) * (200 - (0));
    // const normalizedY = ((data.y - 0) / (89 - 0)) * (100 - 0);
    console.log("normalizedY:", normalizedY);
    onPositionChange(normalizedX, normalizedY);
  };

   const handleStop = (e, data) => {
     const normalizedY = 20 + ((data.y - 89) / (0 - 89)) * (200 - 20);
     const normalizedX = 0 + ((data.x - (0))) / (177 - 0) * (200 - (0));
    if (onRelease) {
      onRelease(normalizedX, normalizedY);
    }
  };
  const [boardDimensions, setBoardDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
      var boardElement = document.getElementById('board');
      var draggableElement = document.getElementById('draggable');
      
      var boardPosition = boardElement.getBoundingClientRect();
      var draggablePosition = draggableElement.getBoundingClientRect();
      const centerX = boardPosition.width / 2 - draggablePosition.width / 2;
      const centerY = boardPosition.height / 2 - draggablePosition.height / 2;

        setBoardDimensions({ width: boardPosition.width, height: boardPosition.height });
      setPosition({ x: centerX, y: centerY});

    }, []);
  return (
    <div className={styles.spatialBoard}>
      <div className={styles.board} id="board">
        <Draggable 
          bounds="parent"
          position={position}
          onDrag={handleDrag} 
          onStop={handleStop}
        >
          <div className={styles.draggablePoint} id="draggable"/>
              </Draggable>
          </div>
          <div className={styles.h5}>Spatial Volume</div>
      </div>
     
      
  );
};

export default SpatialBoard;
