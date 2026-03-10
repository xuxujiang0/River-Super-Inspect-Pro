/// <reference types="@figma/plugin-typings" />

// 定义发送给 UI 的数据接口
interface ColorData {
  type: string;
  hex: string;
  rgba: string;
}

interface TypographyData {
  fontFamily: string;
  fontSize: number | 'mixed';
  fontWeight: string | number;
  lineHeight: string | number | 'mixed';
}

interface NodeData {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  width: number;
  height: number;
  fills: ColorData[];
  strokes: ColorData[];
  cornerRadius: number | 'mixed' | null;
  typography: TypographyData | null;
}

// 初始化 UI，设置面板大小和位置（模拟右侧面板）
figma.showUI(__html__, { width: 320, height: 600, themeColors: true });

// 辅助函数：将 RGB 转换为 HEX
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// 辅助函数：解析颜色数据
function parsePaints(paints: ReadonlyArray<Paint> | PluginAPI['mixed']): ColorData[] {
  if (paints === figma.mixed || !Array.isArray(paints)) return [];
  
  const colors: ColorData[] = [];
  for (const paint of paints) {
    if (paint.visible === false) continue;
    
    if (paint.type === 'SOLID') {
      const { r, g, b } = paint.color;
      const a = paint.opacity !== undefined ? paint.opacity : 1;
      colors.push({
        type: 'SOLID',
        hex: rgbToHex(r, g, b),
        rgba: `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a.toFixed(2)})`
      });
    } else if (paint.type === 'GRADIENT_LINEAR' || paint.type === 'GRADIENT_RADIAL' || paint.type === 'GRADIENT_ANGULAR' || paint.type === 'GRADIENT_DIAMOND') {
      // 简化处理渐变，提取第一个颜色站
      if (paint.gradientStops.length > 0) {
        const stop = paint.gradientStops[0];
        const { r, g, b } = stop.color;
        const a = stop.color.a !== undefined ? stop.color.a : 1;
        colors.push({
          type: paint.type,
          hex: rgbToHex(r, g, b),
          rgba: `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a.toFixed(2)})`
        });
      }
    }
  }
  return colors;
}

// 辅助函数：提取排版数据
function extractTypography(node: TextNode): TypographyData | null {
  const fontName = node.fontName;
  const fontSize = node.fontSize;
  const lineHeight = node.lineHeight;
  
  if (fontName === figma.mixed) return null;
  
  let parsedLineHeight: string | number | 'mixed' = 'auto';
  if (lineHeight !== figma.mixed) {
    if (lineHeight.unit === 'PIXELS') {
      parsedLineHeight = `${Math.round(lineHeight.value)}px`;
    } else if (lineHeight.unit === 'PERCENT') {
      parsedLineHeight = `${Math.round(lineHeight.value)}%`;
    }
  } else {
    parsedLineHeight = 'mixed';
  }

  return {
    fontFamily: fontName.family,
    fontSize: fontSize === figma.mixed ? 'mixed' : fontSize,
    fontWeight: fontName.style,
    lineHeight: parsedLineHeight
  };
}

// 核心函数：提取节点属性
function extractNodeProperties(node: SceneNode): NodeData {
  const data: NodeData = {
    id: node.id,
    name: node.name,
    type: node.type,
    x: node.x,
    y: node.y,
    absoluteX: node.absoluteBoundingBox?.x || 0,
    absoluteY: node.absoluteBoundingBox?.y || 0,
    width: node.width,
    height: node.height,
    fills: [],
    strokes: [],
    cornerRadius: null,
    typography: null
  };

  // 提取填充和描边
  if ('fills' in node) {
    data.fills = parsePaints(node.fills as ReadonlyArray<Paint> | PluginAPI['mixed']);
  }
  if ('strokes' in node) {
    data.strokes = parsePaints(node.strokes as ReadonlyArray<Paint> | PluginAPI['mixed']);
  }

  // 提取圆角
  if ('cornerRadius' in node) {
    data.cornerRadius = node.cornerRadius as number | 'mixed';
  }

  // 提取排版（仅限文本节点）
  if (node.type === 'TEXT') {
    data.typography = extractTypography(node);
  }

  return data;
}

// 处理选择变化
function handleSelectionChange() {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    figma.ui.postMessage({ type: 'selection-cleared' });
    return;
  }

  // 目前仅处理单节点或多节点的第一个节点，可根据需求扩展为多节点数组
  const nodesData = selection.map(node => extractNodeProperties(node));
  
  figma.ui.postMessage({
    type: 'selection-updated',
    data: nodesData
  });
}

// 处理文档变化（属性修改等）
function handleDocumentChange(event: DocumentChangeEvent) {
  // 检查是否有当前选中的节点发生了变化
  const selectionIds = new Set(figma.currentPage.selection.map(n => n.id));
  let shouldUpdate = false;

  for (const change of event.documentChanges) {
    if (change.type === 'PROPERTY_CHANGE' && selectionIds.has(change.id)) {
      shouldUpdate = true;
      break;
    }
  }

  if (shouldUpdate) {
    handleSelectionChange();
  }
}

// 注册事件监听器
figma.on('selectionchange', handleSelectionChange);
figma.on('documentchange', handleDocumentChange);

// 初始化时触发一次
handleSelectionChange();

// 监听来自 UI 的消息
figma.ui.onmessage = (msg) => {
  if (msg.type === 'notify') {
    figma.notify(msg.message, { timeout: 2000 });
  }
};