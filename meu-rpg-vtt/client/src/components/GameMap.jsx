import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Line, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { api, BASE_URL } from '../services/api';
import { getSocket } from '../services/socket';
import Token from './Token';

const CELL_SIZE = 50;

export default function GameMap({ user, game, onJoinGame }) {
  const containerRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [board, setBoard] = useState({
    tokens: [],
    backgroundImageUrl: null,
    gridWidth: 40,
    gridHeight: 30
  });

  const isMaster = game.role === 'MASTER';
  const backgroundUrl = board.backgroundImageUrl ? `${BASE_URL}${board.backgroundImageUrl}` : null;
  const [backgroundImage] = useImage(backgroundUrl);

  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setStageSize({ width, height });
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    api.getBoard(game.id).then(setBoard).catch((err) => console.error('Error loading board:', err));
  }, [game.id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleTokenMoved = ({ tokenId, x, y }) => {
      setBoard((prev) => ({
        ...prev,
        tokens: prev.tokens.map((t) => (t.id === tokenId ? { ...t, x, y } : t))
      }));
    };

    const handleTokenCreated = (token) => {
      setBoard((prev) => ({ ...prev, tokens: [...prev.tokens, token] }));
    };

    const handleBackgroundUpdated = ({ backgroundImageUrl }) => {
      setBoard((prev) => ({ ...prev, backgroundImageUrl }));
    };

    socket.on('token_moved', handleTokenMoved);
    socket.on('token_created', handleTokenCreated);
    socket.on('background_updated', handleBackgroundUpdated);

    return () => {
      socket.off('token_moved', handleTokenMoved);
      socket.off('token_created', handleTokenCreated);
      socket.off('background_updated', handleBackgroundUpdated);
    };
  }, []);

  const handleMoveToken = (tokenId, x, y) => {
    getSocket()?.emit('move_token', { tokenId, x, y });
  };

  const handleLeave = () => {
    onJoinGame(null);
  };

  const mapWidth = board.gridWidth * CELL_SIZE;
  const mapHeight = board.gridHeight * CELL_SIZE;

  const gridLines = [];
  for (let i = 0; i <= board.gridWidth; i++) {
    gridLines.push(
      <Line key={`v${i}`} points={[i * CELL_SIZE, 0, i * CELL_SIZE, mapHeight]} stroke="#333" strokeWidth={1} />
    );
  }
  for (let j = 0; j <= board.gridHeight; j++) {
    gridLines.push(
      <Line key={`h${j}`} points={[0, j * CELL_SIZE, mapWidth, j * CELL_SIZE]} stroke="#333" strokeWidth={1} />
    );
  }

  return (
    <div className="map-area" ref={containerRef}>
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        draggable
        onWheel={(e) => {
          e.evt.preventDefault();
          const stage = e.target.getStage();
          const oldScale = stage.scaleX();
          const scaleBy = 1.05;
          const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
          stage.scale({ x: newScale, y: newScale });
          stage.batchDraw();
        }}
      >
        <Layer>
          <Rect x={0} y={0} width={mapWidth} height={mapHeight} fill="#000" />
          {backgroundImage && (
            <KonvaImage image={backgroundImage} width={mapWidth} height={mapHeight} />
          )}
          {gridLines}
          {board.tokens.map((token) => (
            <Token
              key={token.id}
              token={token}
              cellSize={CELL_SIZE}
              draggable={isMaster || token.ownerId === user.userId}
              onMove={handleMoveToken}
            />
          ))}
        </Layer>
      </Stage>

      <FloatingMenu onExit={handleLeave} />
    </div>
  );
}

function FloatingMenu({ onExit }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
      {open && (
        <div style={{
            marginBottom: '10px', background: 'white', color: 'black',
            padding: '10px', borderRadius: '5px'
        }}>
          <div>🛠️ Tools</div>
          <div>🎲 Dice</div>
          <div>📏 Ruler</div>
          <div>
            <button onClick={onExit}> back </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        style={{
            width: '50px', height: '50px', borderRadius: '50%',
            border: 'none', background: '#e53e3e', color: 'white',
            fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}
      >
        {open ? 'x' : '+'}
      </button>
    </div>
  );
}
