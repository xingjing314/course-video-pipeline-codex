import React from 'react';
type Column = {
  label: string;
  width: number;
  align?: 'left' | 'center' | 'right';
  mono?: boolean;
  fontSize: number;
  accentValues?: string[];
};

export type RowSelection28Config = {
  canvas: {width: number; height: number};
  table: {
    x: number;
    y: number;
    columns: Column[];
    rows: string[][];
    headerHeight: number;
    rowHeight: number;
    headerFontSize: number;
    style: {
      ink: string;
      accent: string;
      headerTintOpacity: number;
      selectionOpacity: number;
      hoverOpacity: number;
      columnHoverOpacity: number;
      columnMarkerHoverOpacity: number;
      cellSelectionOpacity: number;
      cellHoverOpacity: number;
      internalLineOpacity: number;
    };
  };
  animation: {
    horizontalGridStartFrame: number;
    verticalGridStartFrame: number;
    headerStartFrame: number;
    headerTextStartFrame: number;
    headerDurationInFrames: number;
    rowsStartFrame: number;
    rowRevealDurationInFrames: number;
    rowStaggerInFrames: number;
    hoverRowIndex: number;
    hoverStartFrame: number;
    hoverEndFrame: number;
    hoverColumnIndex: number;
    hoverColumnStartFrame: number;
    hoverColumnEndFrame: number;
    hoverCell: {row: number; column: number};
    hoverCellStartFrame: number;
    hoverCellEndFrame: number;
  };
  selection: {
    transitionDurationInFrames: number;
    keyframes: Array<{
      atFrame: number;
      rows: number[];
      columns: number[];
      cells: Array<{row: number; column: number}>;
    }>;
  };
};

type RowSelection28Props = {config: RowSelection28Config; localFrame: number};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
const progressAt = (frame: number, start: number, duration: number) =>
  clamp01((frame - start) / duration);

const getSelectionIntensities = (
  keyframes: RowSelection28Config['selection']['keyframes'],
  transitionDurationInFrames: number,
  frame: number,
  itemCount: number,
  dimension: 'rows' | 'columns',
) => {
  let currentIndex = -1;
  for (let index = 0; index < keyframes.length; index++) {
    if (keyframes[index].atFrame <= frame) currentIndex = index;
    else break;
  }
  const empty = {
    atFrame: 0,
    rows: [] as number[],
    columns: [] as number[],
    cells: [] as Array<{row: number; column: number}>,
  };
  const current = currentIndex >= 0 ? keyframes[currentIndex] : empty;
  const previous = currentIndex > 0 ? keyframes[currentIndex - 1] : empty;
  const transitionProgress =
    transitionDurationInFrames <= 0
      ? 1
      : easeInOut(clamp01((frame - current.atFrame) / transitionDurationInFrames));
  const currentItems = new Set(current[dimension]);
  const previousItems = new Set(previous[dimension]);

  return Array.from({length: itemCount}, (_, itemIndex) => {
    const nowSelected = currentItems.has(itemIndex);
    const wasSelected = previousItems.has(itemIndex);
    if (nowSelected && wasSelected) return 1;
    if (nowSelected) return transitionProgress;
    if (wasSelected) return 1 - transitionProgress;
    return 0;
  });
};

const getCellIntensities = (
  keyframes: RowSelection28Config['selection']['keyframes'],
  transitionDurationInFrames: number,
  frame: number,
  cells: Array<{row: number; column: number}>,
) => {
  let currentIndex = -1;
  for (let index = 0; index < keyframes.length; index++) {
    if (keyframes[index].atFrame <= frame) currentIndex = index;
    else break;
  }
  const empty = {
    atFrame: 0,
    rows: [] as number[],
    columns: [] as number[],
    cells: [] as Array<{row: number; column: number}>,
  };
  const current = currentIndex >= 0 ? keyframes[currentIndex] : empty;
  const previous = currentIndex > 0 ? keyframes[currentIndex - 1] : empty;
  const transitionProgress =
    transitionDurationInFrames <= 0
      ? 1
      : easeInOut(clamp01((frame - current.atFrame) / transitionDurationInFrames));
  const keyFor = (cell: {row: number; column: number}) => `${cell.row}:${cell.column}`;
  const currentCells = new Set(current.cells.map(keyFor));
  const previousCells = new Set(previous.cells.map(keyFor));

  return new Map<string, number>(
    cells.map((cell): [string, number] => {
      const nowSelected = currentCells.has(keyFor(cell));
      const wasSelected = previousCells.has(keyFor(cell));
      if (nowSelected && wasSelected) return [keyFor(cell), 1];
      if (nowSelected) return [keyFor(cell), transitionProgress];
      if (wasSelected) return [keyFor(cell), 1 - transitionProgress];
      return [keyFor(cell), 0];
    }),
  );
};

const getTextX = (x: number, width: number, align: Column['align']) => {
  if (align === 'left') return x + 20;
  if (align === 'right') return x + width - 20;
  return x + width / 2;
};

const getTextAnchor = (align: Column['align']) =>
  align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle';

export const RowSelection28: React.FC<RowSelection28Props> = ({config, localFrame}) => {
  const {canvas, table, animation, selection} = config;
  const width = table.columns.reduce((sum, column) => sum + column.width, 0);
  const height = table.headerHeight + table.rows.length * table.rowHeight;
  const rowIntensities = getSelectionIntensities(
    selection.keyframes,
    selection.transitionDurationInFrames,
    localFrame,
    table.rows.length,
    'rows',
  );
  const columnIntensities = getSelectionIntensities(
    selection.keyframes,
    selection.transitionDurationInFrames,
    localFrame,
    table.columns.length,
    'columns',
  );
  const cellCoordinates = table.rows.flatMap((_, row) =>
    table.columns.map((__, column) => ({row, column})),
  );
  const cellKey = (row: number, column: number) => `${row}:${column}`;
  const cellIntensities = getCellIntensities(
    selection.keyframes,
    selection.transitionDurationInFrames,
    localFrame,
    cellCoordinates,
  );
  const columnPositions: number[] = [];
  let columnCursor = table.x;
  for (const column of table.columns) {
    columnPositions.push(columnCursor);
    columnCursor += column.width;
  }
  const columnBoundaries = [...columnPositions, table.x + width];
  const headerProgress = progressAt(
    localFrame,
    animation.headerStartFrame,
    animation.headerDurationInFrames,
  );
  const headerTextProgress = progressAt(
    localFrame,
    animation.headerTextStartFrame,
    animation.headerDurationInFrames,
  );
  const hoverProgress =
    progressAt(
      localFrame,
      animation.hoverStartFrame,
      animation.hoverEndFrame - animation.hoverStartFrame,
    ) * (1 - rowIntensities[animation.hoverRowIndex]);
  const columnHoverProgress =
    progressAt(
      localFrame,
      animation.hoverColumnStartFrame,
      animation.hoverColumnEndFrame - animation.hoverColumnStartFrame,
    ) * (1 - columnIntensities[animation.hoverColumnIndex]);
  const hoveredCellIntensity =
    cellIntensities.get(cellKey(animation.hoverCell.row, animation.hoverCell.column)) ?? 0;
  const cellHoverProgress =
    progressAt(
      localFrame,
      animation.hoverCellStartFrame,
      animation.hoverCellEndFrame - animation.hoverCellStartFrame,
    ) * (1 - hoveredCellIntensity);

  return (
    <g>
        <rect
          x={table.x}
          y={table.y}
          width={width}
          height={table.headerHeight}
          fill={table.style.ink}
          opacity={table.style.headerTintOpacity * headerProgress}
        />

        {table.columns.map((column, columnIndex) => {
          const intensity = columnIntensities[columnIndex];
          const hover = columnIndex === animation.hoverColumnIndex ? columnHoverProgress : 0;
          if (intensity <= 0.001 && hover <= 0.001) return null;
          return (
            <g key={`column-selection-${columnIndex}`}>
              <rect
                x={columnPositions[columnIndex]}
                y={table.y}
                width={column.width}
                height={height}
                fill={table.style.accent}
                opacity={
                  table.style.selectionOpacity * intensity +
                  table.style.columnHoverOpacity * hover
                }
              />
              <rect
                x={columnPositions[columnIndex]}
                y={table.y - 6}
                width={column.width}
                height={5}
                fill={table.style.accent}
                opacity={intensity + table.style.columnMarkerHoverOpacity * hover}
              />
            </g>
          );
        })}

        {cellCoordinates.map(({row, column}) => {
          const selected = cellIntensities.get(cellKey(row, column)) ?? 0;
          const hovered =
            row === animation.hoverCell.row && column === animation.hoverCell.column
              ? cellHoverProgress
              : 0;
          if (selected <= 0.001 && hovered <= 0.001) return null;
          return (
            <rect
              key={`cell-selection-${row}-${column}`}
              x={columnPositions[column] + 1}
              y={table.y + table.headerHeight + row * table.rowHeight + 1}
              width={table.columns[column].width - 2}
              height={table.rowHeight - 2}
              fill={table.style.accent}
              opacity={
                table.style.cellSelectionOpacity * selected +
                table.style.cellHoverOpacity * hovered
              }
            />
          );
        })}

        {table.rows.map((row, rowIndex) => {
          const intensity = rowIntensities[rowIndex];
          const rowY = table.y + table.headerHeight + rowIndex * table.rowHeight;
          const hover = rowIndex === animation.hoverRowIndex ? hoverProgress : 0;
          const rowReveal = progressAt(
            localFrame,
            animation.rowsStartFrame + rowIndex * animation.rowStaggerInFrames,
            animation.rowRevealDurationInFrames,
          );
          return (
            <g key={`row-${rowIndex}`}>
              <rect
                x={table.x}
                y={rowY}
                width={width}
                height={table.rowHeight}
                fill={table.style.accent}
                opacity={table.style.selectionOpacity * intensity + table.style.hoverOpacity * hover}
              />
              {row.map((value, columnIndex) => {
                const column = table.columns[columnIndex];
                const accentValue = column.accentValues?.includes(value) ?? false;
                return (
                  <text
                    key={`cell-${rowIndex}-${columnIndex}`}
                    x={getTextX(
                      columnPositions[columnIndex],
                      column.width,
                      column.align ?? 'left',
                    )}
                    y={rowY + table.rowHeight / 2 + column.fontSize * 0.34}
                    textAnchor={getTextAnchor(column.align ?? 'left')}
                    fontFamily={
                      column.mono
                        ? '"DejaVu Sans Mono", "Noto Sans Mono", ui-monospace, monospace'
                        : '"Noto Sans CJK SC", "Noto Sans SC", "Source Han Sans SC", "PingFang SC", sans-serif'
                    }
                    fontSize={column.fontSize}
                    fontWeight={accentValue ? 600 : 400}
                    fill={accentValue ? table.style.accent : table.style.ink}
                    opacity={rowReveal}
                    transform={`translate(0 ${(1 - rowReveal) * 6})`}
                  >
                    {value}
                  </text>
                );
              })}
            </g>
          );
        })}

        <text
          x={table.x + 20}
          y={table.y + table.headerHeight / 2 + 5}
          textAnchor="start"
          fontFamily='"Noto Sans CJK SC", "Noto Sans SC", "Source Han Sans SC", "PingFang SC", sans-serif'
          fontSize={table.headerFontSize}
          fontWeight={700}
          letterSpacing={1}
          fill={table.style.ink}
          opacity={headerTextProgress}
        >
          {table.columns[0].label}
        </text>
        {table.columns.slice(1).map((column, index) => {
          const columnIndex = index + 1;
          const x = getTextX(
            columnPositions[columnIndex],
            column.width,
            column.align ?? 'left',
          );
          return (
            <text
              key={`header-${columnIndex}`}
              x={x}
              y={table.y + table.headerHeight / 2 + 5}
              textAnchor={getTextAnchor(column.align ?? 'left')}
              fontFamily='"Noto Sans CJK SC", "Noto Sans SC", "Source Han Sans SC", "PingFang SC", sans-serif'
              fontSize={table.headerFontSize}
              fontWeight={700}
              letterSpacing={1}
              fill={table.style.ink}
              opacity={headerTextProgress}
            >
              {column.label}
            </text>
          );
        })}

        {Array.from({length: table.rows.length + 2}, (_, index) => {
          const y = index === 0
            ? table.y
            : table.y + table.headerHeight + (index - 1) * table.rowHeight;
          const isOuter = index === 0 || index === table.rows.length + 1;
          const isHeaderRule = index === 1;
          const progress = easeInOut(
            progressAt(
              localFrame,
              animation.horizontalGridStartFrame + index * 2,
              18,
            ),
          );
          return (
            <line
              key={`horizontal-${index}`}
              x1={table.x}
              y1={y}
              x2={table.x + width}
              y2={y}
              stroke={table.style.ink}
              strokeWidth={isOuter ? 2 : isHeaderRule ? 1.6 : 1}
              opacity={isOuter || isHeaderRule ? 1 : table.style.internalLineOpacity}
              pathLength={1}
              strokeDasharray={`${progress} 1`}
            />
          );
        })}

        {columnBoundaries.map((x, index) => {
          const isOuter = index === 0 || index === columnBoundaries.length - 1;
          const progress = easeInOut(
            progressAt(
              localFrame,
              animation.verticalGridStartFrame + index * 2,
              18,
            ),
          );
          return (
            <line
              key={`vertical-${index}`}
              x1={x}
              y1={table.y}
              x2={x}
              y2={table.y + height}
              stroke={table.style.ink}
              strokeWidth={isOuter ? 2 : 1}
              opacity={isOuter ? 1 : table.style.internalLineOpacity}
              pathLength={1}
              strokeDasharray={`${progress} 1`}
            />
          );
        })}

        {table.rows.map((_, rowIndex) => {
          const intensity = rowIntensities[rowIndex];
          if (intensity <= 0.001) return null;
          const y = table.y + table.headerHeight + rowIndex * table.rowHeight + 4;
          return (
            <rect
              key={`selection-bar-${rowIndex}`}
              x={table.x}
              y={y}
              width={5}
              height={table.rowHeight - 8}
              fill={table.style.accent}
              opacity={intensity}
            />
          );
        })}

      </g>
  );
};
