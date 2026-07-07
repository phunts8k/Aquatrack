/**
 * A small, dependency-free charting module built directly on the Canvas 2D API.
 * Supports line charts (usage trend) and bar charts (weekly/monthly comparison).
 * Reads its colors from the page's CSS custom properties so it respects the
 * active light/dark theme automatically.
 */

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, width: rect.width, height: rect.height };
}

/**
 * Draws a line chart of usage over time.
 * @param {HTMLCanvasElement} canvas
 * @param {{label: string, value: number}[]} points
 */
export function drawLineChart(canvas, points) {
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);

  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  if (!points.length) {
    ctx.fillStyle = cssVar('--text-muted') || '#94a3b8';
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No data yet', width / 2, height / 2);
    return;
  }

  const values = points.map((p) => p.value);
  const maxVal = Math.max(...values, 1) * 1.15;
  const minVal = 0;

  const xStep = points.length > 1 ? chartW / (points.length - 1) : 0;
  const yScale = (val) => padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
  const xScale = (i) => padding.left + i * xStep;

  const borderColor = cssVar('--border-color') || '#e2e8f0';
  const primary = cssVar('--color-primary') || '#4f46e5';
  const textMuted = cssVar('--text-muted') || '#94a3b8';

  // Gridlines
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;
  const gridLines = 4;
  for (let i = 0; i <= gridLines; i++) {
    const y = padding.top + (chartH / gridLines) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  // Area fill under the line
  ctx.beginPath();
  points.forEach((p, i) => {
    const x = xScale(i);
    const y = yScale(p.value);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(xScale(points.length - 1), padding.top + chartH);
  ctx.lineTo(xScale(0), padding.top + chartH);
  ctx.closePath();
  ctx.fillStyle = primary + '18';
  ctx.fill();

  // Line
  ctx.beginPath();
  points.forEach((p, i) => {
    const x = xScale(i);
    const y = yScale(p.value);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = primary;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Points
  points.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(xScale(i), yScale(p.value), 3, 0, Math.PI * 2);
    ctx.fillStyle = primary;
    ctx.fill();
  });

  // X labels (sample a subset if there are many points)
  ctx.fillStyle = textMuted;
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'center';
  const labelStep = Math.ceil(points.length / 7);
  points.forEach((p, i) => {
    if (i % labelStep === 0) {
      ctx.fillText(p.label, xScale(i), height - 8);
    }
  });
}

/**
 * Draws a bar chart, e.g. comparing weekly totals.
 * @param {HTMLCanvasElement} canvas
 * @param {{label: string, value: number}[]} points
 */
export function drawBarChart(canvas, points) {
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);

  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  if (!points.length) {
    ctx.fillStyle = cssVar('--text-muted') || '#94a3b8';
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No data yet', width / 2, height / 2);
    return;
  }

  const values = points.map((p) => p.value);
  const maxVal = Math.max(...values, 1) * 1.15;

  const barGap = 12;
  const barWidth = (chartW - barGap * (points.length - 1)) / points.length;
  const accent = cssVar('--color-accent') || '#06b6d4';
  const textMuted = cssVar('--text-muted') || '#94a3b8';
  const borderColor = cssVar('--border-color') || '#e2e8f0';

  // Gridlines
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  points.forEach((p, i) => {
    const barHeight = (p.value / maxVal) * chartH;
    const x = padding.left + i * (barWidth + barGap);
    const y = padding.top + chartH - barHeight;

    ctx.fillStyle = accent;
    const r = 4;
    ctx.beginPath();
    ctx.moveTo(x, y + barHeight);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.lineTo(x + barWidth - r, y);
    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
    ctx.lineTo(x + barWidth, y + barHeight);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = textMuted;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.label, x + barWidth / 2, height - 8);
  });
}
