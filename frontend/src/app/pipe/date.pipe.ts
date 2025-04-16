import { formatDate } from "@angular/common";
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'custom_date'
})
export class CustomDatePipe implements PipeTransform {
  private getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  transform(value: Date | string, format?: string, withTime?: boolean): string {
    if (!value) return '';

    const date = new Date(value);

    const day = date.getDate();
    let defaultFormat = `d'${this.getOrdinalSuffix(day)}' MMM, y 'at' h:mm a`;
    if(!withTime) {
      defaultFormat = `d'${this.getOrdinalSuffix(day)}' MMM, y`;
    } else {
      defaultFormat = `d'${this.getOrdinalSuffix(day)}' MMM, y 'at' h:mm a`;
    }

    return formatDate(date, format || defaultFormat, 'en-US');
  }
}