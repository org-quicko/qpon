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
  dateString: string;
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
      <h3 class="text-base text-on-surface mb-4 font-medium">Sales</h3>

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
        tension: 0,
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
        tension: 0,
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
        grid: {
          display: false, // ✅ no vertical grid lines
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#666',
          font: { size: 12 },
        },
        grid: {
          color: 'rgba(230,230,230,0.4)',
          lineWidth: 1,
        },
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

  /** ✅ Custom external tooltip renderer */
  private renderCustomTooltip(context: any): void {
    const { chart, tooltip } = context;
    const canvasParent = chart.canvas?.parentNode as HTMLElement | null;
    if (!canvasParent) return;

    let tooltipEl = canvasParent.querySelector(
      'div.chartjs-tooltip'
    ) as HTMLElement | null;

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.classList.add('chartjs-tooltip');
      tooltipEl.style.cssText = `
        position: absolute;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        pointer-events: none;
        transition: all 0.1s ease;
        border: 1px solid rgba(0,0,0,0.1);
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
      <div style="font-size: 14px; font-weight: 500; color: #444; margin-bottom: 8px;">
        ${dateLabel}
      </div>
      <div style="display:flex; justify-content:space-between; font-size:13px; color:#111; margin-bottom:4px; gap:10px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="width:8px;height:8px;border-radius:50%;background:#B1C6FF;"></span>
          <span>Gross revenue</span>
        </div>
        <span>${grossValue.toLocaleString()}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:13px; color:#111; margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="width:8px;height:8px;border-radius:50%;background:#4D5C92;"></span>
          <span>Net revenue</span>
        </div>
        <span>${netValue.toLocaleString()}</span>
      </div>
      <div style="height:1px;background:#E0E0E0;margin:6px 0;"></div>
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

  /** ✅ Dynamic dataset handling */
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

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['graphData'] ||
      changes['dateRangeType'] ||
      changes['startDate'] ||
      changes['endDate']
    ) {
      // 🩵 Default to 'all' when nothing is passed
      this.dateRangeType = this.dateRangeType || 'all';

      this.hasData = !!(this.graphData?.length && this.startDate && this.endDate);
      this.updateChart();
    }
  }


  private updateChart() {

    if (this.dateRangeType === 'all') {
      if (!this.graphData?.length) {
        this.chartData.labels = this.getEmptyLabels();
        this.chartData.datasets.forEach(d => d.data = []);
        this.hasData = false;
        this.chart?.update();
        return;
      }

      // Build points from full dataset
      this.chartPoints = this.graphData.map(d => ({
        date: new Date(d.date),
        dateString: d.date,
        grossAmount: d.grossSalesAmount || 0,
        netAmount: d.netSalesAmount || 0,
        xLabel: ''
      }));

      // Apply auto-label system
      this.chartPoints = this.assignXLabels(this.chartPoints);

      this.hasData = this.chartPoints.some(p => p.grossAmount > 0 || p.netAmount > 0);

      this.chartData.labels = this.chartPoints.map(p => p.xLabel);
      this.chartData.datasets[0].data = this.chartPoints.map(p => p.grossAmount);
      this.chartData.datasets[1].data = this.chartPoints.map(p => p.netAmount);

      this.chart?.update();
      return;
    }

    // --- OTHER RANGES ---------------------------
    if (!this.startDate || !this.endDate) {
      this.chartData.labels = this.getEmptyLabels();
      this.chartData.datasets.forEach(d => d.data = []);
      this.hasData = false;
      this.chart?.update();
      return;
    }

    this.chartPoints = this.generateChartPoints();
    this.hasData = this.chartPoints.some(p => p.grossAmount > 0 || p.netAmount > 0);

    this.chartData.labels = this.chartPoints.map(p => p.xLabel);
    this.chartData.datasets[0].data = this.chartPoints.map(p => p.grossAmount);
    this.chartData.datasets[1].data = this.chartPoints.map(p => p.netAmount);

    this.chart?.update();
  }

  private normalizeDate(d: Date): Date {
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  }



  private generateChartPoints(): ChartPoint[] {

    // Safety: never use start/end for "all"
    if (this.dateRangeType === 'all') {
      return [];
    }

    const dataMap = new Map<string, DailyData>();
    this.graphData.forEach(d => {
      const key = this.normalizeDate(new Date(d.date)).toISOString().split('T')[0];
      dataMap.set(key, d);
    });

    const points: ChartPoint[] = [];
    const current = this.normalizeDate(new Date(this.startDate!));
    const end = this.normalizeDate(new Date(this.endDate!));

    while (current <= end) {
      const key = current.toISOString().split('T')[0];
      const d = dataMap.get(key);

      points.push({
        date: new Date(current),
        dateString: key,
        grossAmount: d?.grossSalesAmount || 0,
        netAmount: d?.netSalesAmount || 0,
        xLabel: '',
      });

      current.setDate(current.getDate() + 1);
    }

    return this.assignXLabels(points);
  }


  private assignAutoLabels(points: ChartPoint[]): ChartPoint[] {
    if (!points.length) return points;

    const first = points[0].date;
    const last = points[points.length - 1].date;
    const diffDays = Math.ceil(
      (last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    if (diffDays <= 7) {
      return this.assignDailyLabels(points);
    }

    if (diffDays <= 35) {
      return this.assignWeeklyLabels(points);
    }

    return this.assignMonthlyLabels(points);
  }



  private assignXLabels(points: ChartPoint[]): ChartPoint[] {
    const type = this.dateRangeType;

    // AUTO LABELS for "custom" and "all"
    if (type === 'custom' || type === 'all') {
      return this.assignAutoLabels(points);
    }

    // Predefined date ranges
    switch (type) {
      case '7': return this.assignDailyLabels(points);
      case '30': return this.assignWeeklyLabels(points);
      case '90': return this.assignMonthlyLabels(points);
      case '365': return this.assignMonthlyLabels(points);
      default: return this.assignAutoLabels(points);
    }
  }



  private assignDailyLabels(points: ChartPoint[]): ChartPoint[] {
    const skip = Math.ceil(points.length / 7);

    return points.map((p, i) => {
      const isPeriodicLabel = (i % skip === 0);
      const isLastPoint = (i === points.length - 1);

      return {
        ...p,
        xLabel: (isPeriodicLabel || isLastPoint)
          ? this.formatShortDate(p.date)
          : '',
      };
    });
  }


  private assignWeeklyLabels(points: ChartPoint[]): ChartPoint[] {
    const weekSize = Math.ceil(points.length / 4);
    return points.map((p, i) => {
      const weekNum = Math.floor(i / weekSize) + 1;
      const isFirstInWeek = i % weekSize === 0;
      return { ...p, xLabel: isFirstInWeek ? `Week ${weekNum}` : '' };
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

  ngOnDestroy(): void {
    this.chart?.chart?.destroy();
  }
}
