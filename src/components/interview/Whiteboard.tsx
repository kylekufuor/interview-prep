'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Pencil,
  Square,
  Circle,
  ArrowRight,
  Type,
  Eraser,
  Undo2,
  Trash2,
  Minus,
} from 'lucide-react';

type Tool = 'pen' | 'line' | 'rect' | 'circle' | 'arrow' | 'text' | 'eraser';

interface Point {
  x: number;
  y: number;
}

interface DrawAction {
  imageData: ImageData;
}

const COLORS = [
  '#1e1e1e',
  '#ef4444',
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
];

const STROKE_WIDTHS = [2, 4, 6];

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#1e1e1e');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [history, setHistory] = useState<DrawAction[]>([]);
  const [textInput, setTextInput] = useState<{
    x: number;
    y: number;
    visible: boolean;
  }>({ x: 0, y: 0, visible: false });
  const [textValue, setTextValue] = useState('');

  const getCtx = useCallback(() => {
    return canvasRef.current?.getContext('2d') || null;
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCanvas.getContext('2d')?.drawImage(canvas, 0, 0);

      canvas.width = rect.width;
      canvas.height = rect.height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const saveState = useCallback(() => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    setHistory((prev) => [
      ...prev,
      { imageData: ctx.getImageData(0, 0, canvas.width, canvas.height) },
    ]);
  }, [getCtx]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    const ctx = getCtx();
    if (!ctx) return;

    if (tool === 'text') {
      setTextInput({ x: pos.x, y: pos.y, visible: true });
      setTextValue('');
      return;
    }

    saveState();
    setIsDrawing(true);
    setStartPoint(pos);

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
      ctx.lineWidth = tool === 'eraser' ? strokeWidth * 4 : strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    const ctx = getCtx();
    if (!ctx) return;

    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) {
      setIsDrawing(false);
      return;
    }

    const pos = getPos(e);
    const ctx = getCtx();
    if (!ctx) {
      setIsDrawing(false);
      return;
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';

    if (tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'rect') {
      ctx.strokeRect(
        startPoint.x,
        startPoint.y,
        pos.x - startPoint.x,
        pos.y - startPoint.y
      );
    } else if (tool === 'circle') {
      const rx = Math.abs(pos.x - startPoint.x) / 2;
      const ry = Math.abs(pos.y - startPoint.y) / 2;
      const cx = startPoint.x + (pos.x - startPoint.x) / 2;
      const cy = startPoint.y + (pos.y - startPoint.y) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (tool === 'arrow') {
      const angle = Math.atan2(pos.y - startPoint.y, pos.x - startPoint.x);
      const headLen = 15;
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.lineTo(
        pos.x - headLen * Math.cos(angle - Math.PI / 6),
        pos.y - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(
        pos.x - headLen * Math.cos(angle + Math.PI / 6),
        pos.y - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    }

    setIsDrawing(false);
    setStartPoint(null);
  };

  const handleTextSubmit = () => {
    const ctx = getCtx();
    if (!ctx || !textValue.trim()) {
      setTextInput({ ...textInput, visible: false });
      return;
    }
    saveState();
    ctx.font = `${strokeWidth * 6 + 8}px sans-serif`;
    ctx.fillStyle = color;
    ctx.fillText(textValue, textInput.x, textInput.y);
    setTextInput({ ...textInput, visible: false });
    setTextValue('');
  };

  const undo = () => {
    if (history.length === 0) return;
    const ctx = getCtx();
    if (!ctx) return;
    const prev = history[history.length - 1];
    ctx.putImageData(prev.imageData, 0, 0);
    setHistory((h) => h.slice(0, -1));
  };

  const clear = () => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    saveState();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const tools: { value: Tool; icon: React.ElementType; label: string }[] = [
    { value: 'pen', icon: Pencil, label: 'Pen' },
    { value: 'line', icon: Minus, label: 'Line' },
    { value: 'rect', icon: Square, label: 'Rectangle' },
    { value: 'circle', icon: Circle, label: 'Circle' },
    { value: 'arrow', icon: ArrowRight, label: 'Arrow' },
    { value: 'text', icon: Type, label: 'Text' },
    { value: 'eraser', icon: Eraser, label: 'Eraser' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">
        {/* Tools */}
        <div className="flex gap-0.5">
          {tools.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTool(value)}
              title={label}
              className={cn(
                'p-1.5 rounded transition-colors',
                tool === value
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-500 hover:bg-gray-200'
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Colors */}
        <div className="flex gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                'w-5 h-5 rounded-full border-2 transition-transform',
                color === c
                  ? 'border-indigo-500 scale-110'
                  : 'border-transparent'
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Stroke width */}
        <div className="flex gap-1">
          {STROKE_WIDTHS.map((w) => (
            <button
              key={w}
              onClick={() => setStrokeWidth(w)}
              className={cn(
                'w-7 h-7 rounded flex items-center justify-center',
                strokeWidth === w
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-500 hover:bg-gray-200'
              )}
            >
              <div
                className="rounded-full bg-current"
                style={{ width: w + 2, height: w + 2 }}
              />
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Actions */}
        <button
          onClick={undo}
          className="p-1.5 rounded text-gray-500 hover:bg-gray-200"
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={clear}
          className="p-1.5 rounded text-gray-500 hover:bg-gray-200"
          title="Clear"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className={cn(
            'absolute inset-0',
            tool === 'text' ? 'cursor-text' : 'cursor-crosshair'
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDrawing(false)}
        />
        {/* Text input overlay */}
        {textInput.visible && (
          <input
            type="text"
            autoFocus
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTextSubmit();
              if (e.key === 'Escape')
                setTextInput({ ...textInput, visible: false });
            }}
            onBlur={handleTextSubmit}
            className="absolute border border-indigo-400 bg-white px-1 py-0.5 text-sm outline-none"
            style={{ left: textInput.x, top: textInput.y - 20 }}
          />
        )}
      </div>
    </div>
  );
}
