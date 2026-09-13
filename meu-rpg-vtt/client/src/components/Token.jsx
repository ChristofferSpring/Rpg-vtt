import React from 'react';
import { Circle, Text, Group } from 'react-konva';

export default function Token({ token, cellSize, draggable, onMove, onSelect }) {
  const radius = cellSize * 0.4;

  return (
    <Group
      x={token.x}
      y={token.y}
      draggable={draggable}
      onDragEnd={(e) => onMove(token.id, e.target.x(), e.target.y())}
      onClick={() => onSelect?.(token)}
      onTap={() => onSelect?.(token)}
    >
      <Circle radius={radius} fill={token.color} stroke="#000" strokeWidth={1} />
      <Text
        text={token.label}
        fontSize={12}
        fill="#fff"
        align="center"
        width={radius * 2}
        x={-radius}
        y={radius + 2}
      />
    </Group>
  );
}
