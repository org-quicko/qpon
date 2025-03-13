import { BadRequestException } from '@nestjs/common';
import {
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';
import { timePeriodEnum } from '../enums';

interface StartEndDateInterface {
  parsedStartDate: Date;
  parsedEndDate: Date;
}

export function getStartEndDate(
  startDate: string | undefined, // format of start and end date: mm/dd/yyyy
  endDate: string | undefined,
  timePeriod?: timePeriodEnum,
): StartEndDateInterface {
  // by default, a 1 month report shall be generated
  if (!timePeriod && !(startDate && endDate)) {
    return {
      parsedStartDate: subMonths(new Date(), 1),
      parsedEndDate: new Date(),
    };
  }

  if (timePeriod) {
    return getPeriodStartEndDate(timePeriod);
  }

  const defaultStartDate = subMonths(new Date(), 1);

  const parsedStartDate = startDate ? new Date(startDate) : defaultStartDate;

  const parsedEndDate = getEndDate(parsedStartDate, endDate);

  return {
    parsedStartDate,
    parsedEndDate,
  };
}

function getPeriodStartEndDate(
  timePeriod: timePeriodEnum,
): StartEndDateInterface {
  let parsedStartDate: Date;
  const parsedEndDate = new Date();

  switch (timePeriod) {
    case timePeriodEnum.THIS_WEEK:
      parsedStartDate = startOfWeek(parsedEndDate);
      break;
    case timePeriodEnum.THIS_MONTH:
      parsedStartDate = startOfMonth(parsedEndDate);
      break;
    case timePeriodEnum.LAST_7_DAYS:
      parsedStartDate = subWeeks(parsedEndDate, 1);
      break;
    case timePeriodEnum.LAST_30_DAYS:
      parsedStartDate = subDays(parsedEndDate, 30);
      break;
    case timePeriodEnum.LAST_90_DAYS:
      parsedStartDate = subDays(parsedEndDate, 90);
      break;
    default:
      throw new BadRequestException(`Incorrect time period passed.`);
  }

  return {
    parsedStartDate,
    parsedEndDate,
  };
}

function getEndDate(parsedStartDate: Date, endDate: string | undefined) {
  if (isNaN(parsedStartDate.getTime())) {
    throw new BadRequestException('Invalid start date format.');
  }

  const parsedEndDate = endDate ? new Date(endDate) : new Date();
  if (isNaN(parsedEndDate.getTime())) {
    throw new BadRequestException('Invalid end date format.');
  }

  if (parsedStartDate > parsedEndDate) {
    throw new BadRequestException('Start date must be before End date.');
  }

  return parsedEndDate;
}

export function formatDate(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  let fullDateString = formatter.format(date);
  const [month, dateNum, year] = fullDateString.split('/');

  fullDateString = `${dateNum}-${month}-${year}`;

  return fullDateString;
}
