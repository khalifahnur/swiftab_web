"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Group, Transformer, Path } from 'react-konva';
import { TableItem } from '@/types/table';

interface FloorCanvasProps {
  tables: TableItem[];
  selectedTableId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateTransform: (id: string, x: number, y: number, rotation: number) => void;
  onContextMenu: (id: string, x: number, y: number) => void;
}

const TableNode = ({ table, isSelected, onSelect, onUpdateTransform, onContextMenu }: any) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const cx = table.size.width / 2;
  const cy = table.size.height / 2;

  const getChairPos = (index: number, total: number) => {
    if (total === 0) return { x: 0, y: 0, rotation: 0 }; 
    const offset = 22; 
    if (table.shape === 'round') {
      const angle = (index / total) * 2 * Math.PI;
      const rx = cx + offset;
      const ry = cy + offset;
      return { x: cx + Math.sin(angle) * rx, y: cy - Math.cos(angle) * ry, rotation: angle * (180 / Math.PI) };
    } else {
      const perSide = Math.ceil(total / 4);
      const side = Math.floor(index / perSide);
      const sidePercent = ((index % perSide) + 0.5) / perSide;
      
      switch (side) {
        case 0: return { x: sidePercent * table.size.width, y: -offset, rotation: 0 }; 
        case 1: return { x: table.size.width + offset, y: sidePercent * table.size.height, rotation: 90 }; 
        case 2: return { x: (1 - sidePercent) * table.size.width, y: table.size.height + offset, rotation: 180 }; 
        case 3: return { x: -offset, y: (1 - sidePercent) * table.size.height, rotation: 270 }; 
        default: return { x: 0, y: 0, rotation: 0 };
      }
    }
  };

  return (
    <React.Fragment>
      <Group
        ref={shapeRef}
        x={table.position.x + cx}
        y={table.position.y + cy}
        offsetX={cx}
        offsetY={cy}
        rotation={table.rotation}
        draggable
        onClick={(e) => { e.cancelBubble = true; onSelect(table.id); }}
        onTap={(e) => { e.cancelBubble = true; onSelect(table.id); }}
        onContextMenu={(e) => {
          e.evt.preventDefault();
          e.cancelBubble = true;
          onSelect(table.id);
          onContextMenu(table.id, e.evt.clientX, e.evt.clientY);
        }}
        onDragStart={(e) => { onSelect(table.id); e.target.moveToTop(); }}
        onDragEnd={(e) => {
          onUpdateTransform(table.id, Math.round(e.target.x() - cx), Math.round(e.target.y() - cy), e.target.rotation());
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          node.scaleX(1); node.scaleY(1);
          onUpdateTransform(table.id, Math.round(node.x() - cx), Math.round(node.y() - cy), Math.round(node.rotation()));
        }}
      >
        {table.chairs.map((chair: any, i: number) => {
          const pos = getChairPos(i, table.chairs.length);
          return (
            <Group key={chair.id} x={pos.x} y={pos.y} rotation={pos.rotation}>
              <Path data="M -12 -10 Q 0 -15 12 -10 L 10 5 L -10 5 Z" fill="#f1f5f9" shadowColor="#000" shadowBlur={4} shadowOpacity={0.1} shadowOffsetY={2} />
              <Rect x={-10} y={-4} width={20} height={16} cornerRadius={4} fill="#ffffff" stroke="#e2e8f0" strokeWidth={1} shadowColor="#000" shadowBlur={2} shadowOpacity={0.05} />
            </Group>
          );
        })}

        {table.shape === 'round' ? (
           <Circle x={cx} y={cy} radius={cx} fill="#ffffff" shadowColor="rgba(0,0,0,0.15)" shadowBlur={25} shadowOffsetY={10} />
        ) : (
           <Rect x={0} y={0} width={table.size.width} height={table.size.height} cornerRadius={4} fill="#ffffff" shadowColor="rgba(0,0,0,0.15)" shadowBlur={25} shadowOffsetY={10} />
        )}

        <Text text={table.name} x={0} y={cy - 16} width={table.size.width} align="center" fontSize={16} fontStyle="bold" fill="#4b5563" />

        {/* <Group x={cx - 30} y={cy + 8}>
          <Rect width={60} height={20} cornerRadius={2} fill={table.status === 'Free' ? '#5E8B83' : '#374151'} />
          <Text text={table.status} width={60} y={4} align="center" fontSize={11} fontStyle="bold" fill="#ffffff" />
        </Group> */}
      </Group>

      {isSelected && (
        <Transformer
          ref={trRef}
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          resizeEnabled={false} 
          borderStroke="#6b7280"
          borderDash={[4, 4]}
          anchorSize={8}
          anchorCornerRadius={4}
          anchorStroke="#6b7280"
          anchorFill="#ffffff"
        />
      )}
    </React.Fragment>
  );
};

export default function FloorCanvas({ tables, selectedTableId, onSelect, onUpdateTransform, onContextMenu }: FloorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  // BUG FIX: Do not render the Konva Stage until dimensions are successfully calculated!
  if (dimensions.width === 0 || dimensions.height === 0) {
    return <div ref={containerRef} className="w-full h-full relative" />;
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative" 
      onClick={() => onSelect(null)}
      onContextMenu={(e) => e.preventDefault()} 
      style={{ cursor: selectedTableId ? 'default' : 'grab' }}
    >
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer>
          {tables.map((table) => (
            <TableNode 
              key={table.id} 
              table={table} 
              isSelected={selectedTableId === table.id} 
              onSelect={onSelect} 
              onUpdateTransform={onUpdateTransform} 
              onContextMenu={onContextMenu}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}