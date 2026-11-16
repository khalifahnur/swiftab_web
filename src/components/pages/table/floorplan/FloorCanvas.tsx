"use client";

import { useEffect, useRef, useState } from "react";
import { Circle, Group, Layer, Rect, Stage, Text, Transformer } from "react-konva";
import type Konva from "konva";
import { CANVAS, clampPosition, seatPositions, snap } from "@/lib/floor";
import type { FloorTable, LiveTable } from "@/types/api";

type LiveState = LiveTable["live"];

interface Props {
  tables: FloorTable[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Present in edit mode: called when a table is dropped or rotated. */
  onTransform?: (id: string, change: { x: number; y: number; rotation: number }) => void;
  /** Present in live mode: each table's current status, by table id. */
  live?: Record<string, LiveState>;
}

const FONT = "Inter, ui-sans-serif, system-ui, sans-serif";

/** Fill, outline and text colours for a table in each state. */
function palette(state: LiveState["status"] | "edit", selected: boolean) {
  switch (state) {
    case "occupied":
      return { fill: "#0f766e", stroke: "#0f766e", text: "#ffffff", sub: "#ccfbf1", chair: "#5eada5" };
    case "reserved":
      return { fill: "#fef3c7", stroke: "#f59e0b", text: "#78350f", sub: "#92400e", chair: "#fcd34d" };
    case "free":
      return { fill: "#ffffff", stroke: "#94a3b8", text: "#334155", sub: "#64748b", chair: "#cbd5e1" };
    default:
      return { fill: "#ffffff", stroke: selected ? "#008080" : "#94a3b8", text: "#1f2937", sub: "#6b7280", chair: selected ? "#7cc7c7" : "#cbd5e1" };
  }
}

function liveCaption(state: LiveState): string {
  if (state.status === "occupied") return state.guests ? `${state.guests} seated` : "Seated";
  if (state.status === "reserved") {
    const at = state.since ? new Date(state.since).toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit" }) : "";
    return at ? `Booked ${at}` : "Reserved";
  }
  return "Free";
}

function TableNode({
  table,
  selected,
  editable,
  state,
  scale,
  onSelect,
  onTransform,
}: {
  table: FloorTable;
  selected: boolean;
  editable: boolean;
  state?: LiveState;
  /** Canvas zoom, used to keep labels a readable size on screen. */
  scale: number;
  onSelect: (id: string) => void;
  onTransform?: Props["onTransform"];
}) {
  const group = useRef<Konva.Group>(null);
  const transformer = useRef<Konva.Transformer>(null);
  const { width, height } = table.size;
  const cx = width / 2;
  const cy = height / 2;
  const colors = palette(state ? state.status : "edit", selected);
  // Aim for about 13px and 10.5px on screen, within what fits a small table.
  const nameSize = Math.min(22, Math.max(14, 13 / scale));
  const captionSize = Math.min(17, Math.max(11, 10.5 / scale));

  useEffect(() => {
    if (selected && editable && transformer.current && group.current) {
      transformer.current.nodes([group.current]);
      transformer.current.getLayer()?.batchDraw();
    }
  }, [selected, editable, width, height]);

  const report = () => {
    const node = group.current;
    if (!node || !onTransform) return;
    const position = clampPosition(snap(node.x() - cx), snap(node.y() - cy), width, height);
    // Put the node exactly where the saved position says it is.
    node.position({ x: position.x + cx, y: position.y + cy });
    onTransform(table.id, { ...position, rotation: Math.round(node.rotation()) });
  };

  return (
    <>
      <Group
        ref={group}
        x={table.position.x + cx}
        y={table.position.y + cy}
        offsetX={cx}
        offsetY={cy}
        rotation={table.rotation}
        draggable={editable}
        onMouseDown={() => onSelect(table.id)}
        onTap={() => onSelect(table.id)}
        onDragStart={(e) => e.target.moveToTop()}
        onDragEnd={report}
        onTransformEnd={() => {
          group.current?.scale({ x: 1, y: 1 });
          report();
        }}
        onMouseEnter={(e) => {
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = editable ? "grab" : "pointer";
        }}
        onMouseLeave={(e) => {
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = "default";
        }}
      >
        {seatPositions(table).map((seat, index) => (
          <Rect
            key={index}
            x={seat.x}
            y={seat.y}
            offsetX={12}
            offsetY={7}
            width={24}
            height={14}
            cornerRadius={6}
            rotation={seat.rotation}
            fill={colors.chair}
          />
        ))}

        {table.shape === "round" ? (
          <Circle
            x={cx}
            y={cy}
            radius={cx}
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth={selected ? 2.5 : 1.5}
            shadowColor="#0f172a"
            shadowOpacity={0.08}
            shadowBlur={10}
            shadowOffsetY={3}
          />
        ) : (
          <Rect
            width={width}
            height={height}
            cornerRadius={12}
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth={selected ? 2.5 : 1.5}
            shadowColor="#0f172a"
            shadowOpacity={0.08}
            shadowBlur={10}
            shadowOffsetY={3}
          />
        )}

        {/* The label stays upright however the table is turned. */}
        <Group x={cx} y={cy} rotation={-table.rotation} listening={false}>
          <Text
            text={table.name}
            x={-cx}
            y={-nameSize}
            width={width}
            align="center"
            fontFamily={FONT}
            fontSize={nameSize}
            fontStyle="600"
            fill={colors.text}
            wrap="none"
            ellipsis
          />
          <Text
            text={state ? liveCaption(state) : `${table.chairs.length} seat${table.chairs.length === 1 ? "" : "s"}`}
            x={-cx}
            y={4}
            width={width}
            align="center"
            fontFamily={FONT}
            fontSize={captionSize}
            fill={colors.sub}
            wrap="none"
            ellipsis
          />
        </Group>
      </Group>

      {selected && editable && (
        <Transformer
          ref={transformer}
          resizeEnabled={false}
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          rotationSnapTolerance={8}
          rotateAnchorOffset={28}
          borderStroke="#008080"
          borderDash={[5, 4]}
          anchorSize={10}
          anchorCornerRadius={5}
          anchorStroke="#008080"
          anchorFill="#ffffff"
        />
      )}
    </>
  );
}

/** The drawing surface: scales the fixed layout area to the space available. */
export default function FloorCanvas({ tables, selectedId, onSelect, onTransform, live }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Never shrink below a usable size; narrow screens scroll sideways instead.
  const stageWidth = Math.max(width, 640);
  const scale = stageWidth / CANVAS.width;

  return (
    <div ref={container} className="w-full overflow-x-auto">
      {width > 0 && (
        <Stage
          width={stageWidth}
          height={CANVAS.height * scale}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={(e) => {
            if (e.target === e.target.getStage()) onSelect(null);
          }}
          onTouchStart={(e) => {
            if (e.target === e.target.getStage()) onSelect(null);
          }}
        >
          <Layer>
            {tables.map((table) => (
              <TableNode
                key={table.id}
                table={table}
                selected={selectedId === table.id}
                editable={Boolean(onTransform)}
                scale={scale}
                state={live ? (live[table.id] ?? { status: "free", guests: 0 }) : undefined}
                onSelect={onSelect}
                onTransform={onTransform}
              />
            ))}
          </Layer>
        </Stage>
      )}
    </div>
  );
}
