import React from 'react';
import { Circle, Text, Group } from 'react-konva';
import useImage from 'use-image';
import { BASE_URL } from '../services/api';

export default function Token({ token, cellSize, draggable, selected, onMove, onSelect }) {
  const radius = cellSize * 0.4;
  const [image] = useImage(token.imageUrl ? `${BASE_URL}${token.imageUrl}` : null);

  return (
    <Group
      x={token.x}
      y={token.y}
      draggable={draggable}
      onDragEnd={(e) => onMove(token.id, e.target.x(), e.target.y())}
      onClick={() => onSelect?.(token)}
      onTap={() => onSelect?.(token)}
    >
      {selected && (
        <Circle radius={radius + 4} stroke="#fff" strokeWidth={2} dash={[4, 3]} />
      )}
      {image ? (
        <Circle
          radius={radius}
          stroke="#000"
          strokeWidth={1}
          fillPatternImage={image}
          fillPatternScale={{
            x: Math.max((radius * 2) / image.width, (radius * 2) / image.height),
            y: Math.max((radius * 2) / image.width, (radius * 2) / image.height)
          }}
          fillPatternOffset={{ x: image.width / 2, y: image.height / 2 }}
        />
      ) : (
        <Circle radius={radius} fill={token.color} stroke="#000" strokeWidth={1} />
      )}
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
