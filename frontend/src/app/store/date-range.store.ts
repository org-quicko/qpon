import { Injectable, signal, computed } from '@angular/core';
import { format } from 'date-fns';

export type DateRangeType = '7' | '30' | '90' | '365' | 'all' | 'custom';

@Injectable({ providedIn: 'root' })
export class DateRangeStore {
    private _activeRange = signal<DateRangeType>('30');
    private _start = signal<Date | null>(null);
    private _end = signal<Date | null>(null);
    private _label = signal('Last 30 days');

    constructor() {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 29);
        this._start.set(start);
        this._end.set(today);
    }

    readonly start = computed(() => this._start());
    readonly end = computed(() => this._end());
    readonly activeRange = computed(() => this._activeRange());
    readonly label = computed(() => this._label());

    readonly formattedRange = computed(() => {
        const start = this._start();
        const end = this._end();
        if (!start || !end) return 'All time';
        return `${format(start, 'do MMM, yyyy')} - ${format(end, 'do MMM, yyyy')}`;
    });

    private setToEndOfDay(date: Date): Date {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
    }

    private ensureDate(d: any): Date | null {
        if (!d) return null;
        if (d._isAMomentObject && typeof d.toDate === 'function') {
            return d.toDate();
        }
        if (d instanceof Date) return d;
        return null;
    }



    // This method updates the store when Apply is clicked
    applyRange(range: {
        type: DateRangeType;
        start: Date | null;
        end: Date | null;
    }) {
        this._activeRange.set(range.type);

        // Handle special cases first
        if (range.type === 'all') {
            this._label.set('All time');
            this._start.set(null);
            this._end.set(null);
            return;
        }

        if (range.type === 'custom' && range.start && range.end) {
            const startDate = this.ensureDate(range.start);
            const endDate = this.ensureDate(range.end);

            if (!startDate || !endDate) return;

            const normalizedStart = new Date(startDate);
            normalizedStart.setHours(0, 0, 0, 0);

            const normalizedEnd = new Date(endDate);
            normalizedEnd.setHours(0, 0, 0, 0);

            this._label.set('Custom');
            this._start.set(normalizedStart);
            this._end.set(normalizedEnd);
            return;
        }


        // Handle predefined numeric ranges safely
        const today = new Date();
        const labelMap: Record<DateRangeType, string> = {
            '7': 'Last 7 days',
            '30': 'Last 30 days',
            '90': 'Last 90 days',
            '365': 'Last 365 days',
            all: 'All time',
            custom: 'Custom',
        };

        // Restrict keys to only valid numeric ones
        const daysBackMap: Record<'7' | '30' | '90' | '365', number> = {
            '7': 6,
            '30': 29,
            '90': 89,
            '365': 364,
        };

        // TypeScript now knows range.type is one of these four
        if (range.type in daysBackMap) {
            const daysBack = daysBackMap[range.type as '7' | '30' | '90' | '365'];
            const start = new Date(today);
            start.setDate(today.getDate() - daysBack - 1);
            const normalizedStart = this.setToEndOfDay(start);

            this._label.set(labelMap[range.type]);
            this._start.set(normalizedStart);
            this._end.set(today);
        }
    }


    reset() {
        this.applyRange({ type: '30', start: null, end: null });
    }
}
