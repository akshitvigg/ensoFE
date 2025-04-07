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
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  setTool(tool: ToolsType) {
    this.selectedTool = tool;
  }

  setColor(color: string) {
    this.selectedColor = color;
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    // Add color property to existing shapes if they don't have it
    this.existingShapes = this.existingShapes.map((shape) => {
      if (!("color" in shape)) {
        //@ts-ignore
        return { ...shape, color: "#FFFFFF" };
      }
      return shape;
    });
    this.clearCanvas();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type == "chat") {
        const parsedShape = JSON.parse(message.message);
        this.existingShapes.push(parsedShape.shape);
        this.clearCanvas();
      } else if (message.type == "move") {
        const parsedData = JSON.parse(message.message);
        const { index, newShape } = parsedData;
        this.existingShapes[index] = newShape;
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(20, 20, 30)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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

  // Check if a point is inside a shape
  isPointInShape(x: number, y: number, shape: Shape): boolean {
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
      // Check if point is inside triangle using barycentric coordinates
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
      // Check if point is near the line
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

      return distance < 5;
    } else if (shape.type === "pencil") {
      // Check if point is near any line segment in the pencil path
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

        if (distance < 5) return true;
      }
      return false;
    }

    return false;
  }

  // Find which shape was clicked
  findClickedShape(x: number, y: number): number {
    for (let i = this.existingShapes.length - 1; i >= 0; i--) {
      if (this.isPointInShape(x, y, this.existingShapes[i])) {
        return i;
      }
    }
    return -1;
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;

    const rect = this.canvas.getBoundingClientRect();
    this.startX = e.clientX - rect.left;
    this.startY = e.clientY - rect.top;

    if (this.selectedTool === "move") {
      const shapeIndex = this.findClickedShape(this.startX, this.startY);

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
          // Use the midpoint of the triangle as reference
          const midX = (shape.x1 + shape.x2 + shape.x3) / 3;
          const midY = (shape.y1 + shape.y2 + shape.y3) / 3;
          this.dragOffsetX = this.startX - midX;
          this.dragOffsetY = this.startY - midY;
        } else if (shape.type === "line") {
          // Use the midpoint of the line as reference
          const midX = (shape.x1 + shape.x2) / 2;
          const midY = (shape.y1 + shape.y2) / 2;
          this.dragOffsetX = this.startX - midX;
          this.dragOffsetY = this.startY - midY;
        } else if (shape.type === "pencil") {
          // Use the first point of the pencil as reference
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
    if (!this.clicked) return;

    const rect = this.canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    if (this.selectedTool === "move" && this.isDragging) {
      this.isDragging = false;

      // Send the updated shape to other users
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
    }

    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({
          shape,
        }),
        roomId: this.roomId,
      })
    );
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.clicked) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
