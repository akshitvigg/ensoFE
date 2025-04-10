import { ToolsType, StrokeColor } from "../components/realcanvas";
import { getExistingShapes } from "./http";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
      color: string;
    }
  | {
      type: "pencil";
      points: { x: number; y: number }[];
      color: string;
    }
  | {
      type: "triangle";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      x3: number;
      y3: number;
      color: string;
    }
  | {
      type: "line";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      color: string;
    };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: string;
  private clicked: boolean;
  private startX = 0;
  private startY = 0;
  private selectedTool: ToolsType = "rect";
  private selectedColor: string = "#FFFFFF";
  private selectedShape: number = -1;
  private isDragging: boolean = false;
  private dragOffsetX: number = 0;
  private dragOffsetY: number = 0;

  private zoomLevel: number = 1;
  private offsetX: number = 0;
  private offsetY: number = 0;
  private isPanning: boolean = false;
  private lastPanPoint = { x: 0, y: 0 };
  private minZoom: number = 0.1;
  private maxZoom: number = 10;
  private addControlsLegend() {
    const legend = document.createElement("div");
    legend.style.position = "absolute";
    legend.style.bottom = "10px";
    legend.style.right = "10px";
    legend.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    legend.style.color = "white";
    legend.style.padding = "10px";
    legend.style.borderRadius = "5px";
    legend.style.fontSize = "12px";
    legend.style.userSelect = "none";
    legend.style.zIndex = "1000";
    legend.style.fontFamily = "Arial, sans-serif";
    legend.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";

    legend.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">Canvas Controls</div>
      <div style="display: flex; justify-content: space-between;">
        <div style="flex: 1;">
          <div>Mouse wheel: Zoom in/out</div>
          <div>Space + drag: Pan canvas</div>
        </div>
     
      </div>
      <div style="text-align: right; margin-top: 5px; cursor: pointer; font-size: 10px;" id="hide-controls">Hide</div>
    `;

    this.canvas.parentElement?.appendChild(legend);

    const hideButton = legend.querySelector("#hide-controls");
    hideButton?.addEventListener("click", () => {
      legend.style.display = "none";

      localStorage.setItem("hideControlsLegend", "true");

      this.addHelpButton();
    });

    if (localStorage.getItem("hideControlsLegend") === "true") {
      legend.style.display = "none";
      this.addHelpButton();
    }
  }

  private addHelpButton() {
    const helpButton = document.createElement("div");
    helpButton.style.position = "absolute";
    helpButton.style.bottom = "10px";
    helpButton.style.right = "10px";
    helpButton.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    helpButton.style.color = "white";
    helpButton.style.width = "24px";
    helpButton.style.height = "24px";
    helpButton.style.borderRadius = "50%";
    helpButton.style.display = "flex";
    helpButton.style.justifyContent = "center";
    helpButton.style.alignItems = "center";
    helpButton.style.cursor = "pointer";
    helpButton.style.zIndex = "1000";
    helpButton.style.fontSize = "14px";
    helpButton.style.fontWeight = "bold";
    helpButton.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
    helpButton.innerHTML = "?";

    helpButton.addEventListener("click", () => {
      helpButton.remove();

      localStorage.removeItem("hideControlsLegend");
      this.addControlsLegend();
    });

    this.canvas.parentElement?.appendChild(helpButton);
  }
  socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
    this.addControlsLegend();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("wheel", this.wheelHandler);
    window.removeEventListener("keydown", this.keyDownHandler);
    window.removeEventListener("keyup", this.keyUpHandler);
  }

  setTool(tool: ToolsType) {
    this.selectedTool = tool;
  }

  setColor(color: string) {
    this.selectedColor = color;
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);

    this.existingShapes = this.existingShapes.map((shape) => {
      if (!("color" in shape)) {
        //@ts-ignore
        return { ...shape, color: "#FFFFFF" };
      }
      return shape;
    });

    this.applyTransform();
    this.clearCanvas();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type == "chat") {
        const parsedShape = JSON.parse(message.message);

        const isOwnShape = this.existingShapes.some(
          (shape) => JSON.stringify(shape) === JSON.stringify(parsedShape.shape)
        );

        if (!isOwnShape) {
          this.existingShapes.push(parsedShape.shape);
          this.clearCanvas();
        }
      } else if (message.type == "move") {
        const parsedData = JSON.parse(message.message);
        const { index, newShape } = parsedData;
        this.existingShapes[index] = newShape;
        this.clearCanvas();
      }
    };

    this.canvas.addEventListener("wheel", this.wheelHandler);

    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);
  }

  applyTransform() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.zoomLevel, this.zoomLevel);
  }

  screenToCanvas(x: number, y: number): { x: number; y: number } {
    return {
      x: (x - this.offsetX) / this.zoomLevel,
      y: (y - this.offsetY) / this.zoomLevel,
    };
  }

  clearCanvas() {
    this.ctx.save();

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(28, 28, 28)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.restore();

    // this.drawGrid();

    this.existingShapes.forEach((shape) => {
      this.ctx.strokeStyle = shape.color || "#FFFFFF";

      if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          Math.abs(shape.radius),
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "pencil" && shape.points.length > 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.points[0].x, shape.points[0].y);

        for (let i = 1; i < shape.points.length; i++) {
          this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }

        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "triangle") {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.x1, shape.y1);
        this.ctx.lineTo(shape.x2, shape.y2);
        this.ctx.lineTo(shape.x3, shape.y3);
        this.ctx.closePath();
        this.ctx.stroke();
      } else if (shape.type === "line") {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.x1, shape.y1);
        this.ctx.lineTo(shape.x2, shape.y2);
        this.ctx.stroke();
        this.ctx.closePath();
      }
    });
  }

  drawGrid() {
    const gridSize = 50;
    const gridColor = "rgba(150, 150, 150, 0.2)";

    const topLeft = this.screenToCanvas(0, 0);
    const bottomRight = this.screenToCanvas(
      this.canvas.width,
      this.canvas.height
    );

    const startX = Math.floor(topLeft.x / gridSize) * gridSize;
    const startY = Math.floor(topLeft.y / gridSize) * gridSize;
    const endX = Math.ceil(bottomRight.x / gridSize) * gridSize;
    const endY = Math.ceil(bottomRight.y / gridSize) * gridSize;

    this.ctx.beginPath();
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1 / this.zoomLevel;

    for (let x = startX; x <= endX; x += gridSize) {
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, endY);
    }

    for (let y = startY; y <= endY; y += gridSize) {
      this.ctx.moveTo(startX, y);
      this.ctx.lineTo(endX, y);
    }

    this.ctx.stroke();
    this.ctx.lineWidth = 1;
  }

  isPointInShape(x: number, y: number, shape: Shape): boolean {
    const canvasPoint = this.screenToCanvas(x, y);
    x = canvasPoint.x;
    y = canvasPoint.y;

    if (shape.type === "rect") {
      return (
        x >= shape.x &&
        x <= shape.x + shape.width &&
        y >= shape.y &&
        y <= shape.y + shape.height
      );
    } else if (shape.type === "circle") {
      const dx = x - shape.centerX;
      const dy = y - shape.centerY;
      return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
    } else if (shape.type === "triangle") {
      const a = { x: shape.x1, y: shape.y1 };
      const b = { x: shape.x2, y: shape.y2 };
      const c = { x: shape.x3, y: shape.y3 };

      const areaABC = Math.abs(
        (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)
      );
      const areaPBC = Math.abs((b.x - x) * (c.y - y) - (c.x - x) * (b.y - y));
      const areaPAC = Math.abs(
        (x - a.x) * (c.y - a.y) - (c.x - a.x) * (y - a.y)
      );
      const areaPAB = Math.abs(
        (b.x - a.x) * (y - a.y) - (x - a.x) * (b.y - a.y)
      );

      return Math.abs(areaABC - (areaPBC + areaPAC + areaPAB)) < 1;
    } else if (shape.type === "line") {
      const lineLength = Math.sqrt(
        Math.pow(shape.x2 - shape.x1, 2) + Math.pow(shape.y2 - shape.y1, 2)
      );

      if (lineLength === 0) return false;

      const distance =
        Math.abs(
          (shape.y2 - shape.y1) * x -
            (shape.x2 - shape.x1) * y +
            shape.x2 * shape.y1 -
            shape.y2 * shape.x1
        ) / lineLength;

      return distance < 5 / this.zoomLevel;
    } else if (shape.type === "pencil") {
      for (let i = 1; i < shape.points.length; i++) {
        const p1 = shape.points[i - 1];
        const p2 = shape.points[i];

        const lineLength = Math.sqrt(
          Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
        );

        if (lineLength === 0) continue;

        const distance =
          Math.abs(
            (p2.y - p1.y) * x - (p2.x - p1.x) * y + p2.x * p1.y - p2.y * p1.x
          ) / lineLength;

        if (distance < 5 / this.zoomLevel) return true;
      }
      return false;
    }

    return false;
  }

  findClickedShape(x: number, y: number): number {
    for (let i = this.existingShapes.length - 1; i >= 0; i--) {
      if (this.isPointInShape(x, y, this.existingShapes[i])) {
        return i;
      }
    }
    return -1;
  }

  wheelHandler = (e: WheelEvent) => {
    e.preventDefault();

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;

    const newZoom = this.zoomLevel * zoomFactor;

    if (newZoom < this.minZoom || newZoom > this.maxZoom) {
      return;
    }

    const worldX = (mouseX - this.offsetX) / this.zoomLevel;
    const worldY = (mouseY - this.offsetY) / this.zoomLevel;

    this.zoomLevel = newZoom;

    this.offsetX = mouseX - worldX * this.zoomLevel;
    this.offsetY = mouseY - worldY * this.zoomLevel;

    this.applyTransform();
    this.clearCanvas();
  };

  keyDownHandler = (e: KeyboardEvent) => {
    if (e.code === "Space" && !this.isPanning) {
      this.isPanning = true;
      this.canvas.style.cursor = "grab";
    }
  };

  keyUpHandler = (e: KeyboardEvent) => {
    if (e.code === "Space" && this.isPanning) {
      this.isPanning = false;
      this.canvas.style.cursor = "default";
    }
  };

  mouseDownHandler = (e: MouseEvent) => {
    if (this.isPanning) {
      this.clicked = true;
      this.canvas.style.cursor = "grabbing";
      const rect = this.canvas.getBoundingClientRect();
      this.lastPanPoint.x = e.clientX - rect.left;
      this.lastPanPoint.y = e.clientY - rect.top;
      return;
    }

    this.clicked = true;

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const canvasPoint = this.screenToCanvas(mouseX, mouseY);
    this.startX = canvasPoint.x;
    this.startY = canvasPoint.y;

    if (this.selectedTool === "move") {
      const shapeIndex = this.findClickedShape(mouseX, mouseY);

      if (shapeIndex !== -1) {
        this.selectedShape = shapeIndex;
        this.isDragging = true;

        const shape = this.existingShapes[shapeIndex];

        if (shape.type === "rect") {
          this.dragOffsetX = this.startX - shape.x;
          this.dragOffsetY = this.startY - shape.y;
        } else if (shape.type === "circle") {
          this.dragOffsetX = this.startX - shape.centerX;
          this.dragOffsetY = this.startY - shape.centerY;
        } else if (shape.type === "triangle") {
          const midX = (shape.x1 + shape.x2 + shape.x3) / 3;
          const midY = (shape.y1 + shape.y2 + shape.y3) / 3;
          this.dragOffsetX = this.startX - midX;
          this.dragOffsetY = this.startY - midY;
        } else if (shape.type === "line") {
          const midX = (shape.x1 + shape.x2) / 2;
          const midY = (shape.y1 + shape.y2) / 2;
          this.dragOffsetX = this.startX - midX;
          this.dragOffsetY = this.startY - midY;
        } else if (shape.type === "pencil") {
          this.dragOffsetX = this.startX - shape.points[0].x;
          this.dragOffsetY = this.startY - shape.points[0].y;
        }
      }
    } else if (this.selectedTool === "pencil") {
      const shape: Shape = {
        type: "pencil",
        points: [{ x: this.startX, y: this.startY }],
        color: this.selectedColor,
      };
      this.existingShapes.push(shape);
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    if (this.isPanning) {
      this.clicked = false;
      this.canvas.style.cursor = "grab";
      return;
    }

    if (!this.clicked) return;

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const canvasPoint = this.screenToCanvas(mouseX, mouseY);
    const endX = canvasPoint.x;
    const endY = canvasPoint.y;

    if (this.selectedTool === "move" && this.isDragging) {
      this.isDragging = false;

      if (this.selectedShape !== -1) {
        this.socket.send(
          JSON.stringify({
            type: "move",
            message: JSON.stringify({
              index: this.selectedShape,
              newShape: this.existingShapes[this.selectedShape],
            }),
            roomId: this.roomId,
          })
        );
        this.selectedShape = -1;
      }

      this.clicked = false;
      return;
    }

    this.clicked = false;

    const width = endX - this.startX;
    const height = endY - this.startY;

    let shape: Shape | null = null;

    if (this.selectedTool === "rect") {
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        height,
        width,
        color: this.selectedColor,
      };
    } else if (this.selectedTool === "circle") {
      const radius = Math.sqrt(width * width + height * height) / 2;
      shape = {
        type: "circle",
        radius: radius,
        centerX: this.startX + width / 2,
        centerY: this.startY + height / 2,
        color: this.selectedColor,
      };
    } else if (this.selectedTool === "pencil") {
      shape = this.existingShapes[this.existingShapes.length - 1];
    } else if (this.selectedTool === "triangle") {
      const midX = this.startX + width / 2;

      shape = {
        type: "triangle",
        x1: midX,
        y1: this.startY,
        x2: this.startX,
        y2: this.startY + height,
        x3: this.startX + width,
        y3: this.startY + height,
        color: this.selectedColor,
      };
    } else if (this.selectedTool === "line") {
      shape = {
        type: "line",
        x1: this.startX,
        y1: this.startY,
        x2: endX,
        y2: endY,
        color: this.selectedColor,
      };
    }

    if (!shape) return;

    if (this.selectedTool !== "pencil") {
      this.existingShapes.push(shape);

      this.socket.send(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify({
            shape,
          }),
          roomId: this.roomId,
        })
      );
    } else {
      this.socket.send(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify({
            shape,
          }),
          roomId: this.roomId,
        })
      );
    }
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.clicked) return;

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (this.isPanning) {
      const dx = mouseX - this.lastPanPoint.x;
      const dy = mouseY - this.lastPanPoint.y;

      this.offsetX += dx;
      this.offsetY += dy;

      this.lastPanPoint.x = mouseX;
      this.lastPanPoint.y = mouseY;

      this.applyTransform();
      this.clearCanvas();
      return;
    }

    const canvasPoint = this.screenToCanvas(mouseX, mouseY);
    const x = canvasPoint.x;
    const y = canvasPoint.y;

    if (
      this.selectedTool === "move" &&
      this.isDragging &&
      this.selectedShape !== -1
    ) {
      const shape = this.existingShapes[this.selectedShape];

      if (shape.type === "rect") {
        shape.x = x - this.dragOffsetX;
        shape.y = y - this.dragOffsetY;
      } else if (shape.type === "circle") {
        shape.centerX = x - this.dragOffsetX;
        shape.centerY = y - this.dragOffsetY;
      } else if (shape.type === "triangle") {
        const midXOld = (shape.x1 + shape.x2 + shape.x3) / 3;
        const midYOld = (shape.y1 + shape.y2 + shape.y3) / 3;

        const deltaX = x - this.dragOffsetX - midXOld;
        const deltaY = y - this.dragOffsetY - midYOld;

        shape.x1 += deltaX;
        shape.y1 += deltaY;
        shape.x2 += deltaX;
        shape.y2 += deltaY;
        shape.x3 += deltaX;
        shape.y3 += deltaY;
      } else if (shape.type === "line") {
        const midXOld = (shape.x1 + shape.x2) / 2;
        const midYOld = (shape.y1 + shape.y2) / 2;

        const deltaX = x - this.dragOffsetX - midXOld;
        const deltaY = y - this.dragOffsetY - midYOld;

        shape.x1 += deltaX;
        shape.y1 += deltaY;
        shape.x2 += deltaX;
        shape.y2 += deltaY;
      } else if (shape.type === "pencil") {
        const deltaX = x - this.dragOffsetX - shape.points[0].x;
        const deltaY = y - this.dragOffsetY - shape.points[0].y;

        shape.points = shape.points.map((point) => ({
          x: point.x + deltaX,
          y: point.y + deltaY,
        }));

        this.dragOffsetX = x - shape.points[0].x;
        this.dragOffsetY = y - shape.points[0].y;
      }

      this.clearCanvas();
      return;
    }

    if (this.selectedTool === "pencil") {
      const lastShape = this.existingShapes[this.existingShapes.length - 1];
      if (lastShape.type === "pencil") {
        lastShape.points.push({ x, y });

        this.ctx.beginPath();
        this.ctx.strokeStyle = this.selectedColor;
        this.ctx.moveTo(
          lastShape.points[lastShape.points.length - 2].x,
          lastShape.points[lastShape.points.length - 2].y
        );
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.closePath();
      }
    } else {
      const width = x - this.startX;
      const height = y - this.startY;
      this.clearCanvas();
      this.ctx.strokeStyle = this.selectedColor;

      if (this.selectedTool === "rect") {
        this.ctx.strokeRect(this.startX, this.startY, width, height);
      } else if (this.selectedTool === "circle") {
        const radius = Math.sqrt(width * width + height * height) / 2;
        const centerX = this.startX + width / 2;
        const centerY = this.startY + height / 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (this.selectedTool === "triangle") {
        const midX = this.startX + width / 2;

        this.ctx.beginPath();
        this.ctx.moveTo(midX, this.startY);
        this.ctx.lineTo(this.startX, this.startY + height);
        this.ctx.lineTo(this.startX + width, this.startY + height);
        this.ctx.closePath();
        this.ctx.stroke();
      } else if (this.selectedTool === "line") {
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.closePath();
      }
    }
  };

  resetView() {
    this.zoomLevel = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.applyTransform();
    this.clearCanvas();
  }

  centerView() {
    if (this.existingShapes.length === 0) {
      this.resetView();
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    this.existingShapes.forEach((shape) => {
      if (shape.type === "rect") {
        minX = Math.min(minX, shape.x);
        minY = Math.min(minY, shape.y);
        maxX = Math.max(maxX, shape.x + shape.width);
        maxY = Math.max(maxY, shape.y + shape.height);
      } else if (shape.type === "circle") {
        minX = Math.min(minX, shape.centerX - shape.radius);
        minY = Math.min(minY, shape.centerY - shape.radius);
        maxX = Math.max(maxX, shape.centerX + shape.radius);
        maxY = Math.max(maxY, shape.centerY + shape.radius);
      } else if (shape.type === "triangle") {
        minX = Math.min(minX, shape.x1, shape.x2, shape.x3);
        minY = Math.min(minY, shape.y1, shape.y2, shape.y3);
        maxX = Math.max(maxX, shape.x1, shape.x2, shape.x3);
        maxY = Math.max(maxY, shape.y1, shape.y2, shape.y3);
      } else if (shape.type === "line") {
        minX = Math.min(minX, shape.x1, shape.x2);
        minY = Math.min(minY, shape.y1, shape.y2);
        maxX = Math.max(maxX, shape.x1, shape.x2);
        maxY = Math.max(maxY, shape.y1, shape.y2);
      } else if (shape.type === "pencil") {
        shape.points.forEach((point) => {
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
        });
      }
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const width = maxX - minX;
    const height = maxY - minY;

    const widthZoom = this.canvas.width / (width + 100);
    const heightZoom = this.canvas.height / (height + 100);
    this.zoomLevel = Math.min(widthZoom, heightZoom, 1);

    this.offsetX = this.canvas.width / 2 - centerX * this.zoomLevel;
    this.offsetY = this.canvas.height / 2 - centerY * this.zoomLevel;

    this.applyTransform();
    this.clearCanvas();
  }

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
