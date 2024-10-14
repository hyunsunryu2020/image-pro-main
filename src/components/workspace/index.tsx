import { useCallback, useEffect, useRef, useState } from 'react';
import { WorkspaceWrap } from 'polotno';
import Toolbar from 'polotno/toolbar/toolbar';
import Workspace from 'polotno/canvas/workspace';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { StoreType } from 'polotno/model/store';
import { setHighlighterStyle, setTransformerStyle } from 'polotno/config';
import CanvasMenu from '@/components/canvasMenu';
import Konva from 'konva';
import { debounce } from 'underscore';

// @ts-ignore
const Tooltip = () => null;

export default function MyWorkspace(props: { store: StoreType, onStageReady: (stage: Konva.Stage) => void }): JSX.Element {
  const [showCanvasMenu, setShowCanvasMenu] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  function MouseRightClick(e: MouseEvent): void {
    e.preventDefault();

    if (props.store.selectedElements[0] !== undefined) {
      const workspaceWrapper = getElementPosition(document.getElementById('workspace-wrapper-copy')!);

      setMousePos({
        x: e.clientX - workspaceWrapper.x + 10,
        y: e.clientY - workspaceWrapper.y,
      });
      setShowCanvasMenu(true);
    }
  }

  function getElementPosition(e: HTMLElement): { x: number, y: number } {
    let x = 0;
    let y = 0;
    while (e !== null) {
      x += e.offsetLeft;
      y += e.offsetTop;
      e = e.offsetParent as HTMLElement;
    }
    return { x, y };
  }

  function watchMouseClick(e: MouseEvent): void {
    e.button === 0 && setShowCanvasMenu(false);
  }

  setTransformerStyle({
    anchorStroke: 'rgb(158, 85, 225)',
    borderStroke: 'rgb(158, 85, 225)',
  });

  setHighlighterStyle({
    stroke: 'rgb(158, 85, 225)',
  });

  return (
    <WorkspaceWrap
      onContextMenu={MouseRightClick}
      onClick={watchMouseClick}
    >
		  <div
        id="workspace-wrapper-copy"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
        }}
      />

      <Toolbar store={props.store} />

      <Workspace
        store={props.store}
        pageControlsEnabled={false}
        components={{ Tooltip }}
      />

      <div
        style={{
          position: 'absolute',
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          display: `${showCanvasMenu ? 'block' : 'none'}`,
        }}
      >
        <CanvasMenu store={props.store} />
      </div>

      <ZoomButtons store={props.store} />
    </WorkspaceWrap>
  );
}
