import { formatDate } from "@angular/common";
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'date'
  })
  export class DatePipe implements PipeTransform {
    private getOrdinalSuffix(day: number): string {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    }
  
    transform(value: Date | string): string {
      if (!value) return '';
      
      const date = new Date(value);
      const day = date.getDate();
      const formattedDate = formatDate(date, `d'${this.getOrdinalSuffix(day)}' MMM, y 'at' h:mm a`, 'en-US');
      
      return formattedDate;
    }
  }