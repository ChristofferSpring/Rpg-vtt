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
import OnlinePanel from './OnlinePanel';

const CELL_SIZE = 50;

export default function GameMap({ user, game, onJoinGame, onlineUsers }) {
  const containerRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [board, setBoard] = useState({
    tokens: [],
    strokes: [],
    backgroundImageUrl: null,
    gridWidth: 40,
    gridHeight: 30
  });

  // pickedTokenId: satellite bubbles showing next to a clicked token
  // editingTokenId: full edit panel open for that token (set once the gear bubble is clicked)
  const [pickedTokenId, setPickedTokenId] = useState(null);
  const [editingTokenId, setEditingTokenId] = useState(null);
  const [rulerMode, setRulerMode] = useState(false);
  const [rulerPoints, setRulerPoints] = useState(null);
  const [dragPreview, setDragPreview] = useState(null);
  const [placingToken, setPlacingToken] = useState(null);
  const [ghostPos, setGhostPos] = useState(null);
  const [pencilMode, setPencilMode] = useState(false);
  const [eraserMode, setEraserMode] = useState(false);
  const [pencilColor, setPencilColor] = useState('#ffffff');
  const [currentStroke, setCurrentStroke] = useState(null);

  const isMaster = game.role === 'MASTER';
  const backgroundUrl = board.backgroundImageUrl ? `${BASE_URL}${board.backgroundImageUrl}` : null;
  const [backgroundImage] = useImage(backgroundUrl);
  const pickedToken = board.tokens.find((t) => t.id === pickedTokenId) || null;
  const editingToken = board.tokens.find((t) => t.id === editingTokenId) || null;
  const bubbleToken = dragPreview && pickedToken && dragPreview.tokenId === pickedToken.id
    ? { ...pickedToken, x: dragPreview.x, y: dragPreview.y }
    : pickedToken;

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

    const handleStrokeCreated = (stroke) => {
      setBoard((prev) => ({ ...prev, strokes: [...prev.strokes, stroke] }));
    };

    const handleStrokeDeleted = ({ strokeId }) => {
      setBoard((prev) => ({ ...prev, strokes: prev.strokes.filter((s) => s.id !== strokeId) }));
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
    socket.on('stroke_created', handleStrokeCreated);
    socket.on('stroke_deleted', handleStrokeDeleted);
    socket.on('error', handleError);

    return () => {
      socket.off('token_moved', handleTokenMoved);
      socket.off('token_created', handleTokenCreated);
      socket.off('token_updated', handleTokenUpdated);
      socket.off('token_deleted', handleTokenDeleted);
      socket.off('background_updated', handleBackgroundUpdated);
      socket.off('stroke_created', handleStrokeCreated);
      socket.off('stroke_deleted', handleStrokeDeleted);
      socket.off('error', handleError);
    };
  }, [canSee, game.id]);

  const snapToGrid = (value) => Math.round((value - CELL_SIZE / 2) / CELL_SIZE) * CELL_SIZE + CELL_SIZE / 2;

  const handleDragMove = (tokenId, x, y) => {
    setDragPreview({ tokenId, x, y });
  };

  const handleMoveToken = (tokenId, x, y) => {
    const snapped = { x: snapToGrid(x), y: snapToGrid(y) };
    setDragPreview(null);
    // update locally right away so the token and its bubbles land together -
    // no waiting on the round trip to the server to see it settle
    setBoard((prev) => ({
      ...prev,
      tokens: prev.tokens.map((t) => (t.id === tokenId ? { ...t, ...snapped } : t))
    }));
    getSocket()?.emit('move_token', { tokenId, ...snapped });
  };

  const handleStartPlacing = (tokenSpec) => {
    deselectToken();
    setPlacingToken(tokenSpec);
    setGhostPos(null);
  };

  const handleCancelPlacing = () => {
    setPlacingToken(null);
    setGhostPos(null);
  };

  const confirmPlacement = async (x, y) => {
    if (!placingToken) return;
    const spec = placingToken;
    setPlacingToken(null);
    setGhostPos(null);
    try {
      await api.createToken(game.id, { ...spec, x: snapToGrid(x), y: snapToGrid(y) });
    } catch (err) {
      alert("Couldn't create the token: " + err.message);
    }
  };

  const handleBackgroundClick = (e) => {
    if (placingToken) {
      const pos = e.target.getStage().getRelativePointerPosition();
      confirmPlacement(pos.x, pos.y);
      return;
    }
    deselectToken();
  };

  const handleLeave = () => {
    onJoinGame(null);
  };

  const toggleRulerMode = () => {
    setRulerMode((prev) => !prev);
    setRulerPoints(null);
    setPencilMode(false);
    setEraserMode(false);
    setCurrentStroke(null);
    deselectToken();
  };

  const togglePencilMode = () => {
    setPencilMode((prev) => !prev);
    setEraserMode(false);
    setRulerMode(false);
    setRulerPoints(null);
    setCurrentStroke(null);
    deselectToken();
  };

  const toggleEraserMode = () => {
    setEraserMode((prev) => !prev);
    setPencilMode(false);
    setRulerMode(false);
    setRulerPoints(null);
    setCurrentStroke(null);
    deselectToken();
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
      <OnlinePanel users={onlineUsers} currentUserId={user.userId} />
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        draggable={!rulerMode && !pencilMode && !eraserMode}
        onClick={(e) => {
          if (placingToken) {
            const pos = e.target.getStage().getRelativePointerPosition();
            confirmPlacement(pos.x, pos.y);
            return;
          }
          if (e.target === e.target.getStage()) deselectToken();
        }}
        onMouseDown={(e) => {
          const pos = e.target.getStage().getRelativePointerPosition();
          if (pencilMode) {
            setCurrentStroke({ points: [pos.x, pos.y], color: pencilColor });
            return;
          }
          if (!rulerMode) return;
          setRulerPoints({ start: pos, end: pos });
        }}
        onMouseMove={(e) => {
          const pos = e.target.getStage().getRelativePointerPosition();
          if (placingToken) setGhostPos(pos);
          if (pencilMode && currentStroke) {
            setCurrentStroke((prev) => ({ ...prev, points: [...prev.points, pos.x, pos.y] }));
            return;
          }
          if (!rulerMode || !rulerPoints) return;
          setRulerPoints((prev) => ({ ...prev, end: pos }));
        }}
        onMouseUp={() => {
          if (!pencilMode || !currentStroke) return;
          if (currentStroke.points.length >= 4) {
            getSocket()?.emit('draw_stroke', currentStroke);
          }
          setCurrentStroke(null);
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
          <Rect x={0} y={0} width={mapWidth} height={mapHeight} fill="#000" onClick={handleBackgroundClick} />
          {backgroundImage && (
            <KonvaImage image={backgroundImage} width={mapWidth} height={mapHeight} onClick={handleBackgroundClick} />
          )}
          {gridLines}
          {board.strokes.map((stroke) => (
            <Line
              key={stroke.id}
              points={stroke.points}
              stroke={stroke.color}
              strokeWidth={3}
              lineCap="round"
              lineJoin="round"
              hitStrokeWidth={20}
              listening={eraserMode}
              onClick={eraserMode ? () => getSocket()?.emit('erase_stroke', { strokeId: stroke.id }) : undefined}
            />
          ))}
          {currentStroke && (
            <Line
              points={currentStroke.points}
              stroke={currentStroke.color}
              strokeWidth={3}
              lineCap="round"
              lineJoin="round"
              listening={false}
            />
          )}
          {board.tokens.filter(canSee).map((token) => (
            <Token
              key={token.id}
              token={token}
              cellSize={CELL_SIZE}
              draggable={!rulerMode && !placingToken && !pencilMode && !eraserMode && (isMaster || token.ownerId === user.userId)}
              selected={token.id === pickedTokenId}
              onMove={handleMoveToken}
              onDragMove={handleDragMove}
              onSelect={isMaster && !rulerMode && !placingToken && !pencilMode && !eraserMode ? (t) => setPickedTokenId(t.id) : undefined}
            />
          ))}
          {pickedToken && !editingToken && (
            <TokenBubbles
              token={bubbleToken}
              cellSize={CELL_SIZE}
              onGear={() => setEditingTokenId(pickedToken.id)}
            />
          )}
          {rulerPoints && <RulerLine points={rulerPoints} cellSize={CELL_SIZE} />}
          {placingToken && ghostPos && (
            <Circle
              x={snapToGrid(ghostPos.x)}
              y={snapToGrid(ghostPos.y)}
              radius={CELL_SIZE * 0.4}
              stroke={placingToken.color}
              strokeWidth={2}
              dash={[6, 4]}
              listening={false}
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
        rulerMode={rulerMode}
        onToggleRuler={toggleRulerMode}
        placingToken={placingToken}
        onCancelPlacing={handleCancelPlacing}
        onStartPlacing={handleStartPlacing}
        pencilMode={pencilMode}
        onTogglePencil={togglePencilMode}
        eraserMode={eraserMode}
        onToggleEraser={toggleEraserMode}
        pencilColor={pencilColor}
        onPencilColorChange={setPencilColor}
      />
    </div>
  );
}

function RulerLine({ points, cellSize }) {
  const { start, end } = points;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = (Math.sqrt(dx * dx + dy * dy) / cellSize).toFixed(1);
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  return (
    <>
      <Line points={[start.x, start.y, end.x, end.y]} stroke="#ffeb3b" strokeWidth={2} dash={[6, 4]} />
      <Text
        x={midX - 30}
        y={midY - 20}
        width={60}
        align="center"
        text={`${distance} cells`}
        fontSize={14}
        fill="#ffeb3b"
        fontStyle="bold"
      />
    </>
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

function FloatingMenu({
  onExit, isMaster, game, selectedToken, onCloseEdit, rulerMode, onToggleRuler,
  placingToken, onCancelPlacing, onStartPlacing,
  pencilMode, onTogglePencil, eraserMode, onToggleEraser, pencilColor, onPencilColorChange
}) {
  const [open, setOpen] = React.useState(false);
  const drawingMode = pencilMode || eraserMode;
  const isOpen = (open || !!selectedToken) && !rulerMode && !placingToken && !drawingMode;

  const handleToggleRuler = () => {
    setOpen(false);
    onToggleRuler();
  };

  const handleTogglePencil = () => {
    setOpen(false);
    onTogglePencil();
  };

  const handleToggleEraser = () => {
    setOpen(false);
    onToggleEraser();
  };

  return (
    <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
      {isOpen && (
        <div style={{
            marginBottom: '10px', background: 'white', color: 'black',
            padding: '10px', borderRadius: '5px', width: '200px',
            maxHeight: 'calc(100vh - 100px)', overflowY: 'auto'
        }}>
          {selectedToken ? (
            <EditTokenPanel game={game} token={selectedToken} onClose={onCloseEdit} />
          ) : (
            <>
              <div>Tools</div>
              <button onClick={handleToggleRuler} style={{ width: '100%', marginBottom: '5px' }}>
                Ruler
              </button>
              <button onClick={handleTogglePencil} style={{ width: '100%', marginBottom: '5px' }}>
                Pencil
              </button>
              <input
                type="color"
                value={pencilColor}
                onChange={(e) => onPencilColorChange(e.target.value)}
                style={{ width: '100%', marginBottom: '5px' }}
              />
              <button onClick={handleToggleEraser} style={{ width: '100%', marginBottom: '5px' }}>
                Eraser
              </button>
              <DicePanel />
              {isMaster && <CreateTokenPanel game={game} onStartPlacing={onStartPlacing} />}
              {isMaster && <BackgroundUploader game={game} />}
              <div>
                <button onClick={onExit}> back </button>
              </div>
            </>
          )}
        </div>
      )}
      <button
        onClick={() => {
          if (placingToken) return onCancelPlacing();
          if (rulerMode) return onToggleRuler();
          if (pencilMode) return onTogglePencil();
          if (eraserMode) return onToggleEraser();
          if (selectedToken) return onCloseEdit();
          setOpen(!open);
        }}
        style={{
            width: '50px', height: '50px', borderRadius: '50%',
            border: 'none', color: 'white', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            background: placingToken ? '#dd6b20' : (rulerMode || drawingMode) ? '#3182ce' : '#e53e3e',
            fontSize: placingToken || rulerMode || drawingMode ? '14px' : '24px'
        }}
      >
        {placingToken ? 'Cancel' : (rulerMode || drawingMode) ? 'Stop' : (isOpen ? 'x' : '+')}
      </button>
    </div>
  );
}
