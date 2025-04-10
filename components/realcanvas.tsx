"use client";
import { Game } from "@/canvasLogic/games";
import {
  Circle,
  MousePointer2,
  Pencil,
  RectangleHorizontalIcon,
  Triangle,
  MinusIcon,
  Palette,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type ToolsType =
  | "rect"
  | "circle"
  | "pencil"
  | "triangle"
  | "line"
  | "move";
export type StrokeColor = string;

export function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<ToolsType>("rect");
  const [selectedColor, setSelectedColor] = useState<StrokeColor>("#FFFFFF");
  const [showColorPalette, setShowColorPalette] = useState<boolean>(false);

  const colors = [
    "#FFFFFF",
    "#FF3333",
    "#33FF33",
    "#3333FF",
    "#FFFF33",
    "#FF33FF",
    "#33FFFF",
    "#FF9933",
    "#9933FF",
  ];

  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    game?.setColor(selectedColor);
  }, [selectedColor, game]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const g = new Game(canvas, roomId, socket);
      setGame(g);

      return () => {
        g.destroy();
      };
    }
  }, [canvasRef, roomId, socket]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          const savedData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;

          ctx.putImageData(savedData, 0, 0);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-gray-800 bg-opacity-60 p-1 rounded-md text-xs text-white">
        Room: {roomId}
      </div>

      <ToolBar
        setSelectedTool={setSelectedTool}
        selectedTool={selectedTool}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        colors={colors}
        showColorPalette={showColorPalette}
        setShowColorPalette={setShowColorPalette}
      />

      <canvas
        ref={canvasRef}
        className="fixed top-0  left-0 w-screen h-screen"
      ></canvas>
    </div>
  );
}

function ToolBar({
  setSelectedTool,
  selectedTool,
  selectedColor,
  setSelectedColor,
  colors,
  showColorPalette,
  setShowColorPalette,
}: {
  selectedTool: ToolsType;
  setSelectedTool: (s: ToolsType) => void;
  selectedColor: StrokeColor;
  setSelectedColor: (s: StrokeColor) => void;
  colors: string[];
  showColorPalette: boolean;
  setShowColorPalette: (show: boolean) => void;
}) {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      {/* Tools Panel */}
      <div className="bg-gray-800 bg-opacity-80 p-1.5 rounded-lg shadow-lg flex items-center gap-1">
        <ToolButton
          onClick={() => setSelectedTool("rect")}
          isSelected={selectedTool === "rect"}
          tooltip="Rectangle"
        >
          <RectangleHorizontalIcon size={20} />
        </ToolButton>

        <ToolButton
          onClick={() => setSelectedTool("circle")}
          isSelected={selectedTool === "circle"}
          tooltip="Circle"
        >
          <Circle size={20} />
        </ToolButton>

        <ToolButton
          onClick={() => setSelectedTool("triangle")}
          isSelected={selectedTool === "triangle"}
          tooltip="Triangle"
        >
          <Triangle size={20} />
        </ToolButton>

        <ToolButton
          onClick={() => setSelectedTool("line")}
          isSelected={selectedTool === "line"}
          tooltip="Line"
        >
          <MinusIcon size={20} />
        </ToolButton>

        <ToolButton
          onClick={() => setSelectedTool("pencil")}
          isSelected={selectedTool === "pencil"}
          tooltip="Pencil"
        >
          <Pencil size={20} />
        </ToolButton>

        <ToolButton
          onClick={() => setSelectedTool("move")}
          isSelected={selectedTool === "move"}
          tooltip="Move"
        >
          <MousePointer2 size={20} />
        </ToolButton>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        <div className="relative">
          <button
            onClick={() => setShowColorPalette(!showColorPalette)}
            className="p-1.5 rounded-md hover:bg-gray-700 relative"
            style={{
              backgroundColor: showColorPalette
                ? "rgba(55, 65, 81, 0.8)"
                : undefined,
            }}
          >
            <div
              className="w-5 h-5 rounded-full border border-gray-500"
              style={{ backgroundColor: selectedColor }}
            />
          </button>

          {showColorPalette && (
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800 p-2 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-300">Colors</span>
                <button
                  onClick={() => setShowColorPalette(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 w-24">
                {colors.map((color) => (
                  <ColorButton
                    key={color}
                    color={color}
                    isSelected={selectedColor === color}
                    onClick={() => {
                      setSelectedColor(color);
                      setShowColorPalette(false);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToolButton({
  children,
  onClick,
  isSelected,
  tooltip,
}: {
  children: React.ReactNode;
  onClick: () => void;
  isSelected: boolean;
  tooltip: string;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`p-1.5 rounded-md transition-all ${
          isSelected
            ? "bg-blue-600 text-white"
            : "text-gray-300 hover:bg-gray-700"
        }`}
      >
        {children}
      </button>
      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-black bg-opacity-70 text-white text-xs p-1 rounded whitespace-nowrap">
        {tooltip}
      </span>
    </div>
  );
}

function ColorButton({
  color,
  isSelected,
  onClick,
}: {
  color: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-6 h-6 rounded-full transition-all ${
        isSelected
          ? "ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-800 scale-110"
          : "hover:scale-105"
      }`}
      style={{ backgroundColor: color }}
      aria-label={`Select ${color} color`}
    />
  );
}
