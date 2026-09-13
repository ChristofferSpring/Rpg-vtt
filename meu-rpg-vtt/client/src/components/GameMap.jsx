import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Line, Circle, Text, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { api, BASE_URL } from '../services/api';
import { getSocket } from '../services/socket';
import Token from './Token';
import CreateTokenPanel from './CreateTokenPanel';
import BackgroundUploader from './BackgroundUploader';
import EditTokenPanel from './EditTokenPanel';
import DicePanel from './DicePanel';

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

  // pickedTokenId: satellite bubbles showing next to a clicked token
  // editingTokenId: full edit panel open for that token (set once the gear bubble is clicked)
  const [pickedTokenId, setPickedTokenId] = useState(null);
  const [editingTokenId, setEditingTokenId] = useState(null);

  const isMaster = game.role === 'MASTER';
  const backgroundUrl = board.backgroundImageUrl ? `${BASE_URL}${board.backgroundImageUrl}` : null;
  const [backgroundImage] = useImage(backgroundUrl);
  const pickedToken = board.tokens.find((t) => t.id === pickedTokenId) || null;
  const editingToken = board.tokens.find((t) => t.id === editingTokenId) || null;

  const deselectToken = () => {
    setPickedTokenId(null);
    setEditingTokenId(null);
  };

  // board fetch filters owner-only tokens server-side, but live broadcasts
  // don't, so we filter again here for both cases
  const canSee = useCallback(
    (t) => t.visibility !== 'owner' || isMaster || t.ownerId === user.userId,
    [isMaster, user.userId]
  );

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
      if (!canSee(token)) return;
      setBoard((prev) => ({ ...prev, tokens: [...prev.tokens, token] }));
    };

    const handleTokenUpdated = (token) => {
      setBoard((prev) => ({
        ...prev,
        tokens: canSee(token)
          ? prev.tokens.map((t) => (t.id === token.id ? token : t))
          : prev.tokens.filter((t) => t.id !== token.id)
      }));
    };

    const handleTokenDeleted = ({ tokenId }) => {
      setPickedTokenId((current) => (current === tokenId ? null : current));
      setEditingTokenId((current) => (current === tokenId ? null : current));
      setBoard((prev) => ({ ...prev, tokens: prev.tokens.filter((t) => t.id !== tokenId) }));
    };

    const handleBackgroundUpdated = ({ backgroundImageUrl }) => {
      setBoard((prev) => ({ ...prev, backgroundImageUrl }));
    };

    // rejected moves leave the token wherever it got dragged on screen -
    // just refetch to snap it back
    const handleError = () => {
      api.getBoard(game.id).then(setBoard).catch((err) => console.error('Error reloading board:', err));
    };

    socket.on('token_moved', handleTokenMoved);
    socket.on('token_created', handleTokenCreated);
    socket.on('token_updated', handleTokenUpdated);
    socket.on('token_deleted', handleTokenDeleted);
    socket.on('background_updated', handleBackgroundUpdated);
    socket.on('error', handleError);

    return () => {
      socket.off('token_moved', handleTokenMoved);
      socket.off('token_created', handleTokenCreated);
      socket.off('token_updated', handleTokenUpdated);
      socket.off('token_deleted', handleTokenDeleted);
      socket.off('background_updated', handleBackgroundUpdated);
      socket.off('error', handleError);
    };
  }, [canSee, game.id]);

  const snapToGrid = (value) => Math.round((value - CELL_SIZE / 2) / CELL_SIZE) * CELL_SIZE + CELL_SIZE / 2;

  const handleMoveToken = (tokenId, x, y) => {
    getSocket()?.emit('move_token', { tokenId, x: snapToGrid(x), y: snapToGrid(y) });
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
        onClick={(e) => {
          if (e.target === e.target.getStage()) deselectToken();
        }}
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
          <Rect x={0} y={0} width={mapWidth} height={mapHeight} fill="#000" onClick={deselectToken} />
          {backgroundImage && (
            <KonvaImage image={backgroundImage} width={mapWidth} height={mapHeight} onClick={deselectToken} />
          )}
          {gridLines}
          {board.tokens.filter(canSee).map((token) => (
            <Token
              key={token.id}
              token={token}
              cellSize={CELL_SIZE}
              draggable={isMaster || token.ownerId === user.userId}
              selected={token.id === pickedTokenId}
              onMove={handleMoveToken}
              onSelect={isMaster ? (t) => setPickedTokenId(t.id) : undefined}
            />
          ))}
          {pickedToken && !editingToken && (
            <TokenBubbles
              token={pickedToken}
              cellSize={CELL_SIZE}
              onGear={() => setEditingTokenId(pickedToken.id)}
            />
          )}
        </Layer>
      </Stage>

      <FloatingMenu
        onExit={handleLeave}
        isMaster={isMaster}
        game={game}
        selectedToken={editingToken}
        onCloseEdit={deselectToken}
      />
    </div>
  );
}

function TokenBubbles({ token, cellSize, onGear }) {
  const radius = cellSize * 0.4;
  const bubbleY = token.y - radius - 20;

  return (
    <>
      <Circle
        x={token.x - 18}
        y={bubbleY}
        radius={13}
        fill="#f7f7f7"
        stroke="#000"
        strokeWidth={1}
        shadowBlur={4}
        onClick={onGear}
        onTap={onGear}
      />
      <Text
        x={token.x - 18 - 13}
        y={bubbleY - 8}
        width={26}
        align="center"
        text="⚙️"
        fontSize={16}
        listening={false}
      />
      <Circle
        x={token.x + 18}
        y={bubbleY}
        radius={13}
        fill={token.color}
        stroke="#000"
        strokeWidth={1}
        shadowBlur={4}
      />
    </>
  );
}

function FloatingMenu({ onExit, isMaster, game, selectedToken, onCloseEdit }) {
  const [open, setOpen] = React.useState(false);
  const isOpen = open || !!selectedToken;

  return (
    <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
      {isOpen && (
        <div style={{
            marginBottom: '10px', background: 'white', color: 'black',
            padding: '10px', borderRadius: '5px', width: '200px'
        }}>
          {selectedToken ? (
            <EditTokenPanel game={game} token={selectedToken} onClose={onCloseEdit} />
          ) : (
            <>
              <div>Tools</div>
              <div>Ruler</div>
              <DicePanel />
              {isMaster && <CreateTokenPanel game={game} />}
              {isMaster && <BackgroundUploader game={game} />}
              <div>
                <button onClick={onExit}> back </button>
              </div>
            </>
          )}
        </div>
      )}
      <button
        onClick={() => (selectedToken ? onCloseEdit() : setOpen(!open))}
        style={{
            width: '50px', height: '50px', borderRadius: '50%',
            border: 'none', background: '#e53e3e', color: 'white',
            fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}
      >
        {isOpen ? 'x' : '+'}
      </button>
    </div>
  );
}
