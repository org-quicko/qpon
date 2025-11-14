import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DateRangeType } from '../../../../store/date-range.store';

Chart.register(...registerables);

interface DailyData {
  date: string;
  grossSalesAmount: number;
  netSalesAmount: number;
  discountAmount: number;
}

interface ChartPoint {
  date: Date;
  dateString: string; // YYYY-MM-DD
  grossAmount: number;
  netAmount: number;
  xLabel: string;
}

@Component({
  selector: 'app-sales-trend-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="bg-surface-container-lowest relative">
      <h3 class="text-base text-on-surface-variant font-medium">Sales</h3>

      <div class="h-[336px] relative mb-4">
        <!-- Always render chart -->
        <canvas
          baseChart
          [data]="displayChartData"
          [options]="chartOptions"
          [type]="'line'">
        </canvas>

        <!-- Centered “No data available” -->
        <div
          *ngIf="!hasData"
          class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <p class="font-medium text-on-surface">
            No data available
          </p>
        </div>
      </div>
    </div>
  `,
})
export class SalesTrendChartComponent implements OnChanges, OnDestroy {
  @Input() graphData: DailyData[] = [];
  @Input() dateRangeType: DateRangeType = '30';
  @Input() startDate: Date | null = null;
  @Input() endDate: Date | null = null;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  hasData = false;
  private chartPoints: ChartPoint[] = [];

  chartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Gross Revenue',
        data: [],
        borderColor: '#B1C6FF',
        backgroundColor: 'rgba(177, 198, 255, 0.3)',
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 7,
        pointHitRadius: 12,
        pointBackgroundColor: '#B1C6FF',
        pointBorderWidth: 1,
        pointBorderColor: '#ffffff',
        clip: false,
      },
      {
        label: 'Net Revenue',
        data: [],
        borderColor: '#4D5C92',
        backgroundColor: 'rgba(77, 92, 146, 0.1)',
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 7,
        pointHitRadius: 12,
        pointBackgroundColor: '#4D5C92',
        pointBorderWidth: 1,
        pointBorderColor: '#ffffff',
        clip: false,
      },
    ],
  };

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        ticks: {
          color: '#888',
          font: { size: 12 },
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          callback: (value, index) => this.chartPoints[index]?.xLabel || '',
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#666', font: { size: 12 } },
        grid: { color: 'rgba(230,230,230,0.4)', lineWidth: 1 },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { usePointStyle: true, boxWidth: 8 },
      },
      tooltip: {
        enabled: false,
        external: (context) => this.renderCustomTooltip(context),
      },
    },
  };

  // ------------------ Tooltip (unchanged, formatted) ------------------
  private renderCustomTooltip(context: any): void {
    const { chart, tooltip } = context;
    const canvasParent = chart.canvas?.parentNode as HTMLElement | null;
    if (!canvasParent) return;

    let tooltipEl = canvasParent.querySelector('div.chartjs-tooltip') as HTMLElement | null;

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.classList.add('chartjs-tooltip');
      tooltipEl.style.cssText = `
        position: absolute;
        background: var(--sys-surface-container-lowest);
        color: var(--sys-on-surface);
        border-radius: 5px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        pointer-events: none;
        transition: all 0.1s ease;
        border: 1px solid var(--sys-outline-variant);
        padding: 12px 16px;
        font-family: Inter, sans-serif;
        z-index: 10;
      `;
      canvasParent.appendChild(tooltipEl);
    }

    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = '0';
      return;
    }

    const dataIndex = tooltip.dataPoints?.[0]?.dataIndex ?? 0;
    const point = this.chartPoints[dataIndex];
    if (!point) return;

    const grossValue = point.grossAmount;
    const netValue = point.netAmount;
    const discount = grossValue - netValue;
    const dateLabel = this.formatDateLabel(point.dateString);

    tooltipEl.innerHTML = `
      <div style="font-size: 14px; font-weight: 500; color: var(--sys-on-surface-variant); margin-bottom: 8px;">
        ${dateLabel}
      </div>

      <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px; gap:6px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="width:8px;height:8px;border-radius:50%;background:var(--sys-primary);"></span>
          <span>Gross revenue</span>
        </div>
        <span>${grossValue.toLocaleString()}</span>
      </div>

      <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="width:8px;height:8px;border-radius:50%;background:var(--sys-secondary);"></span>
          <span>Net revenue</span>
        </div>
        <span>${netValue.toLocaleString()}</span>
      </div>

      <div style="height:1px;background:var(--sys-outline);margin:6px 0;"></div>

      <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:600;">
        <span>Discount</span>
        <span>${discount.toLocaleString()}</span>
      </div>
    `;

    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
    const tooltipWidth = tooltipEl.offsetWidth || 160;
    const tooltipHeight = tooltipEl.offsetHeight || 80;
    const leftPosition = positionX + tooltip.caretX - tooltipWidth - 12;
    const topPosition = positionY + tooltip.caretY - tooltipHeight / 2;
    const finalLeft = Math.max(8, leftPosition);

    tooltipEl.style.opacity = '1';
    tooltipEl.style.left = `${finalLeft}px`;
    tooltipEl.style.top = `${topPosition}px`;
  }

  // ------------------ Display data wrapper ------------------
  get displayChartData() {
    if (this.hasData) return this.chartData;
    return {
      labels:
        this.chartData.labels && this.chartData.labels.length > 0
          ? this.chartData.labels
          : this.getEmptyLabels(),
      datasets: [],
    };
  }

  private getEmptyLabels(): string[] {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  }

  // ------------------ Lifecycle ------------------
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['graphData'] ||
      changes['dateRangeType'] ||
      changes['startDate'] ||
      changes['endDate']
    ) {
      // default to 'all' if not set
      this.dateRangeType = this.dateRangeType || 'all';

      // compute hasData only after the chart pipeline runs; keep previous quick check for blank inputs
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.chart?.destroy();
  }

  // ------------------ Chart update pipeline (unified) ------------------
  private updateChart(): void {
    // emergency fallback: no graphData
    if (!this.graphData || !this.graphData.length) {
      this.clearChartData();
      this.chart?.update();
      return;
    }

    // Build normalized map once
    const dataMap = this.buildDataMap(this.graphData);

    // Determine period to render based on dateRangeType
    const { from, to } = this.resolveRangeBounds(this.dateRangeType, this.startDate, this.endDate, dataMap);

    if (!from || !to || from > to) {
      this.clearChartData();
      this.chart?.update();
      return;
    }

    // Create continuous points from from -> to (inclusive)
    const points = this.generateContinuousPoints(from, to, dataMap);

    // Assign labels according to range type (auto for custom/all)
    this.chartPoints = this.assignLabels(points, this.dateRangeType);

    // bind to chart
    this.chartData.labels = this.chartPoints.map(p => p.xLabel);
    this.chartData.datasets[0].data = this.chartPoints.map(p => p.grossAmount);
    this.chartData.datasets[1].data = this.chartPoints.map(p => p.netAmount);

    this.hasData = this.chartPoints.some(p => p.grossAmount > 0 || p.netAmount > 0);

    this.chart?.update();
  }

  private clearChartData(): void {
    this.chartData.labels = this.getEmptyLabels();
    this.chartData.datasets.forEach(d => (d.data = []));
    this.hasData = false;
    this.chartPoints = [];
  }

  // ------------------ Helpers: data map & date utilities ------------------
  private buildDataMap(data: DailyData[]): Map<string, DailyData> {
    const map = new Map<string, DailyData>();
    for (const d of data) {
      const key = this.normalizeDate(new Date(d.date)).toISOString().split('T')[0];
      map.set(key, d);
    }
    return map;
  }

  private normalizeDate(d: Date): Date {
    // keep UTC normalization like original
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  }

  private dateKey(d: Date): string {
    return this.normalizeDate(d).toISOString().split('T')[0];
  }

  private addDays(d: Date, days: number): Date {
    const nd = new Date(d.valueOf());
    nd.setUTCDate(nd.getUTCDate() + days);
    return nd;
  }

  // ------------------ Determine from/to for each range ------------------
  private resolveRangeBounds(
    rangeType: DateRangeType,
    start: Date | null,
    end: Date | null,
    dataMap: Map<string, DailyData>
  ): { from: Date | null; to: Date | null } {
    const today = this.normalizeDate(new Date());

    if (rangeType === 'all') {
      // earliest data date -> today
      const keys = Array.from(dataMap.keys());
      if (!keys.length) return { from: null, to: null };
      const earliest = new Date(Math.min(...keys.map(k => new Date(k).getTime())));
      return { from: this.normalizeDate(earliest), to: today };
    }

    // for 'custom' use provided start/end (validate)
    if (rangeType === 'custom') {
      if (!start || !end) return { from: null, to: null };
      return { from: this.normalizeDate(start), to: this.normalizeDate(end) };
    }

    // predefined numeric ranges: '7', '30', '90', '365' - interpret as last N days ending today
    const numericDays = Number(rangeType);
    if (!Number.isNaN(numericDays) && numericDays > 0) {
      const to = today;
      const from = this.addDays(to, 1 - numericDays); // include today
      return { from, to };
    }

    // fallback: if start/end present, use them
    if (start && end) return { from: this.normalizeDate(start), to: this.normalizeDate(end) };

    // unknown: bail out
    return { from: null, to: null };
  }

  // ------------------ Generate continuous points (fill gaps with zeros) ------------------
  private generateContinuousPoints(from: Date, to: Date, dataMap: Map<string, DailyData>): ChartPoint[] {
    const points: ChartPoint[] = [];
    let cursor = this.normalizeDate(new Date(from));

    while (cursor <= to) {
      const key = this.dateKey(cursor);
      const d = dataMap.get(key);
      points.push({
        date: new Date(cursor),
        dateString: key,
        grossAmount: d?.grossSalesAmount ?? 0,
        netAmount: d?.netSalesAmount ?? 0,
        xLabel: '',
      });
      cursor = this.addDays(cursor, 1);
    }
    return points;
  }

  // ------------------ Label assignment entry (keeps same behavior) ------------------
  private assignLabels(points: ChartPoint[], rangeType: DateRangeType): ChartPoint[] {
    if (!points.length) return points;

    // auto for custom/all
    if (rangeType === 'custom' || rangeType === 'all') {
      return this.assignAutoLabels(points);
    }

    switch (rangeType) {
      case '7':
        return this.assignDailyLabels(points);
      case '30':
        return this.assignWeeklyLabels(points);
      case '90':
      case '365':
        return this.assignMonthlyLabels(points);
      default:
        return this.assignAutoLabels(points);
    }
  }

  // ------------------ Existing label functions (kept behavior) ------------------
  private assignAutoLabels(points: ChartPoint[]): ChartPoint[] {
    if (!points.length) return points;
    const first = points[0].date;
    const last = points[points.length - 1].date;
    const diffDays = Math.ceil((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (diffDays <= 7) return this.assignDailyLabels(points);
    if (diffDays <= 35) return this.assignWeeklyLabels(points);
    return this.assignMonthlyLabels(points);
  }

  private assignDailyLabels(points: ChartPoint[]): ChartPoint[] {
    const skip = Math.max(1, Math.ceil(points.length / 7));
    return points.map((p, i) => ({
      ...p,
      xLabel: (i % skip === 0 || i === points.length - 1) ? this.formatShortDate(p.date) : '',
    }));
  }

  private assignWeeklyLabels(points: ChartPoint[]): ChartPoint[] {
    const weekSize = Math.max(1, Math.ceil(points.length / 4));
    return points.map((p, i) => {
      const weekNum = Math.floor(i / weekSize) + 1;
      return { ...p, xLabel: (i % weekSize === 0) ? `Week ${weekNum}` : '' };
    });
  }

  private assignMonthlyLabels(points: ChartPoint[]): ChartPoint[] {
    const labeled = new Set<string>();
    return points.map((p) => {
      const monthKey = `${p.date.getFullYear()}-${p.date.getMonth()}`;
      if (!labeled.has(monthKey) && p.date.getDate() <= 7) {
        labeled.add(monthKey);
        return { ...p, xLabel: p.date.toLocaleString('en-US', { month: 'short' }) };
      }
      return { ...p, xLabel: '' };
    });
  }

  // ------------------ Format helpers ------------------
  private formatShortDate(date: Date): string {
    return `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })}`;
  }

  private formatDateLabel(dateString: string): string {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
