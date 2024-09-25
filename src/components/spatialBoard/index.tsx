import React, { useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import styles from './spatialBoard.module.css';

interface SpatialBoardProps {
  onPositionChange: (x: number, y: number) => void; 
}

const SpatialBoard = ({ onPositionChange }: SpatialBoardProps): JSX.Element => {
    const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
    const normalizedY = -100 + ((data.y - (89)) / (0 - (89))) * (100 - (-100));
    console.log("normalizedY:", normalizedY);
       onPositionChange(data.x, normalizedY);
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

    // const handleDrag = (e, data) => {
    //     // Bound the y-axis between -100 and 100
    //     const boundedY = Math.max(-100, Math.min(100, data.y - boardDimensions.height / 2));
    //     const newPosition = { x: data.x, y: boundedY + boardDimensions.height / 2 };

    //     setPosition(newPosition);
    //     onPositionChange(data.x - boardDimensions.width / 2, boundedY); // Adjust relative to center
    // };
  return (
    <div className={styles.spatialBoard}>
      <div className={styles.board} id="board">
        <Draggable 
          bounds="parent"
          position={position}
          onDrag={handleDrag} 
        >
          <div className={styles.draggablePoint} id="draggable"/>
              </Draggable>
          </div>
          <div className={styles.h5}>Spatial Volume</div>
      </div>
     
      
  );
};

export default SpatialBoard;
