import React, { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  IconAdjustments,
  IconAdjustmentsOff,
  IconCheck,
  IconRestore,
  IconX,
} from '@tabler/icons-react';
import { Button } from '../ui/button';
import { useDispatch } from 'react-redux';
import InfoToolTip from './info-tooltip';
// import { setFilterDatesFromRedux } from "@/redux/slice/dateSlice";

const getDateRange = (days: number) => {
  const today = new Date();
  const toDate = today.toISOString().split('T')[0];
  const fromDate = new Date(today.setDate(today.getDate() - days)).toISOString().split('T')[0];

  return {
    fromDate,
    toDate,
  };
};

const rangeNames: { [key: number]: string } = {
  0: 'Today',
  1: 'Yesterday',
  7: 'Last 7 Days',
  30: 'Last 30 Days',
  90: 'Last 3 Months',
};
const forDays: number = 7;

const DEFAULT_DATE = {
  ...getDateRange(forDays),
  isDefault: true,
};
const DATE_RANGES: string[] = [
  'Yesterday',
  'Today',
  'Last 7 Days',
  'Last 30 Days',
  'Last 3 Months',
];

const DEFAULT_DATE_DISPLAY_NAME = rangeNames[forDays] || `Last ${forDays} Days`;

interface FilterDateProps {
  dateRange?: { fromDate: string; toDate: string; isDefault?: boolean };
  onSelect: (range: { fromDate: string; toDate: string }) => void;
  handleReset?: () => void;
  defaultDate?: { fromDate: string; toDate: string; isDefault?: boolean };
}

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const FilterButton: React.FC<FilterDateProps> = ({
  dateRange = { fromDate: '', toDate: '' },
  onSelect,
  handleReset,
  defaultDate = {
    fromDate: '',
    toDate: formatDate(new Date()),
    isDefault: true,
  },
}) => {
  const today = formatDate(new Date());
  // const getDefaultRangeInString = () => {
  //   if (dateRange.fromDate || dateRange.toDate) {
  //     return String(dateRange.fromDate) + " to " + String(dateRange.toDate);
  //   } else return DEFAULT_DATE_DISPLAY_NAME;
  // };
  const getFilterNameInString = (
    isDefault: boolean = false,
    fromDate: string,
    toDate: string
  ): string => {
    if (isDefault || (!fromDate && !toDate)) return DEFAULT_DATE_DISPLAY_NAME;

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const getDateRange = (daysAgoStart: number, daysAgoEnd: number) => {
      const from = new Date();
      from.setDate(from.getDate() - daysAgoStart);
      const to = new Date();
      to.setDate(to.getDate() - daysAgoEnd);
      return {
        fromDate: formatDate(from),
        toDate: formatDate(to),
      };
    };

    const today = getDateRange(0, 0);
    const yesterday = getDateRange(1, 1);
    const last7Days = getDateRange(7, 0);
    const last30Days = getDateRange(30, 0);
    const last3Months = getDateRange(90, 0);

    if (fromDate === today.fromDate && toDate === today.toDate) return 'Today';
    if (fromDate === yesterday.fromDate && toDate === yesterday.toDate) return 'Yesterday';
    if (fromDate === last7Days.fromDate && toDate === last7Days.toDate) return 'Last 7 Days';
    if (fromDate === last30Days.fromDate && toDate === last30Days.toDate) return 'Last 30 Days';
    if (fromDate === last3Months.fromDate && toDate === last3Months.toDate) return 'Last 3 Months';

    return `${fromDate} to ${toDate}`;
  };

  const [selectedFilter, setSelectedFilter] = useState(
    getFilterNameInString(dateRange.isDefault, dateRange.fromDate, dateRange.toDate)
  );
  const [startDate, setStartDate] = useState(dateRange.fromDate);
  const [endDate, setEndDate] = useState(dateRange.toDate || today);
  const [isOpen, setIsOpen] = useState(false);
  const [disableReset, setDisableReset] = useState(true);
  const dispatch = useDispatch();
  // useEffect(() => {
  //   setStartDate(dateRange.fromDate);
  //   setEndDate(dateRange.toDate || today);
  //   setSelectedFilter(
  //     dateRange.fromDate && dateRange.toDate
  //       ? `${dateRange.fromDate} to ${dateRange.toDate}`
  //       : DEFAULT_DATE_DISPLAY_NAME
  //   );
  // }, [dateRange, today]);
  const handleSelect = (filter: string) => {
    // setDisableReset(false);
    setIsOpen(false);
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const getDateRange = (daysAgoStart: number, daysAgoEnd: number) => {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - daysAgoStart);
      const toDate = new Date();
      toDate.setDate(toDate.getDate() - daysAgoEnd);
      return {
        fromDate: formatDate(fromDate),
        toDate: formatDate(toDate),
      };
    };
    let filterDates: { fromDate: string; toDate: string } = {
      fromDate: '',
      toDate: '',
    };
    switch (filter) {
      case 'Today':
        filterDates = getDateRange(0, 0);
        break;
      case 'Yesterday':
        filterDates = getDateRange(1, 1);
        break;
      case 'Last 7 Days':
        filterDates = getDateRange(7, 0);
        break;
      case 'Last 30 Days':
        filterDates = getDateRange(30, 0);
        break;
      case 'Last 3 Months':
        filterDates = getDateRange(90, 0);
        break;
      default:
        filterDates = defaultDate;
        break;
    }
    setStartDate(filterDates.fromDate);
    setEndDate(filterDates.toDate);
    onSelect(filterDates);
    setSelectedFilter(filter);
    // dispatch(setFilterDatesFromRedux(filterDates));
    setIsOpen(false);
  };
  const handleDateChange = () => {
    const effectiveEndDate = endDate || today;
    // setDisableReset(false);
    if (startDate && new Date(startDate) <= new Date(effectiveEndDate)) {
      setSelectedFilter(`${startDate} to ${effectiveEndDate}`);
      onSelect({
        fromDate: startDate,
        toDate: effectiveEndDate,
      });
      //   dispatch(
      //     setFilterDatesFromRedux({
      //       fromDate: startDate,
      //       toDate: effectiveEndDate,
      //     })
      //   );
      setIsOpen(false);
    }
  };
  const handleSubmitDateFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleDateChange();
  };
  const handleClose = () => {
    // if (selectedFilter !== `${startDate} to ${endDate}`) {
    //   setStartDate(dateRange.fromDate);
    //   setEndDate(dateRange.toDate || today);
    //   setSelectedFilter(getDefaultRangeInString());
    // }
    setIsOpen(false);
  };
  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={isOpen => {
        if (!isOpen) handleClose();
        setIsOpen(isOpen);
      }}
    >
      <DropdownMenuTrigger asChild>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 p-2 gap-2 justify-end"
        >
          <span className="text-xs font-bold text-black10">{selectedFilter}</span>
          {isOpen ? (
            <IconAdjustmentsOff className="w-5 h-5" />
          ) : (
            <IconAdjustments className="w-5 h-5" />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {DATE_RANGES
          // Filter out the selected range
          .map((range: string) => (
            <DropdownMenuItem key={range} onClick={() => handleSelect(range)}>
              {range}
            </DropdownMenuItem>
          ))}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-md">
          <form>
            {/* From Date */}
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm -mt-3">
                From:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => {
                  // setDisableReset(false);
                  setStartDate(e.target.value);
                }}
                className={`w-full h-8 p-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark ${
                  startDate && new Date(startDate) > new Date()
                    ? 'border-red-500 focus:ring-red-500'
                    : ''
                }`}
                onClick={e => e.stopPropagation()}
                max={today}
              />
              {startDate && new Date(startDate) > new Date() && (
                <p className="text-xs text-red-500 mt-1">The start date cannot be in the future.</p>
              )}
            </div>
            {/* To Date */}
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm -mt-2">
                To:
              </label>
              <input
                type="date"
                value={endDate || today}
                className={`w-full h-8 p-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  endDate && new Date(endDate) > new Date()
                    ? 'border-red-500 focus:ring-red-500'
                    : ''
                }`}
                onChange={e => {
                  const selectedDate = e.target.value;
                  if (selectedDate) {
                    const inputDate = new Date(selectedDate);
                    if (inputDate.getFullYear() !== parseInt(selectedDate.substring(0, 4))) {
                      inputDate.setFullYear(parseInt(selectedDate.substring(0, 4)));
                    }

                    setEndDate(inputDate.toISOString().split('T')[0]);
                  }
                }}
              />
              {endDate && new Date(endDate) > new Date() && (
                <p className="text-xs text-red-500 mt-1">The end date cannot be in the future.</p>
              )}
              {endDate && startDate && new Date(endDate) < new Date(startDate) && (
                <p className="text-xs text-red-500 mt-1">
                  The end date cannot be earlier than the start date.
                </p>
              )}
              {startDate.length === 10 && parseInt(startDate.substring(0, 4), 10) < 1000 && (
                <p className="text-xs text-red-500 mt-1">
                  The start date cannot be earlier than 1000.
                </p>
              )}
            </div>
            {/* Buttons */}
            <div className="flex items-center justify-between gap-4 mt-4">
              <Button
                type="submit"
                variant="outline"
                className="w-14 h-7 p-2 rounded-md bg-brand-dark text-white hover:bg-brand-dark/90 focus:ring-2 focus:ring-brand-dark disabled:bg-gray-300 disabled:text-gray-500"
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleDateChange();
                }}
                disabled={
                  !startDate ||
                  (startDate.length === 10 && parseInt(startDate.substring(0, 4), 10) < 1000) ||
                  new Date(startDate) > new Date() ||
                  new Date(endDate) > new Date() ||
                  new Date(endDate) < new Date(startDate)
                }
              >
                <InfoToolTip
                  message="Submit"
                  icon={<IconCheck size={18} className="text-white" />}
                />
              </Button>
              <Button
                variant="outline"
                type="reset"
                className="w-14 h-7 p-2 rounded-md bg-gray-600 text-white hover:bg-red-400 focus:ring-2 focus:ring-red-500"
                onClick={e => {
                  e.preventDefault();
                  setIsOpen(false);
                  handleClose();
                }}
              >
                <InfoToolTip message="Close" icon={<IconX size={18} className="text-white" />} />
              </Button>
              <Button
                variant="outline"
                type="button"
                className="w-14 h-7 p-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 focus:ring-2 focus:ring-gray-500 disabled:bg-gray-300 disabled:text-gray-500"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  // handleSelect(DEFAULT_DATE_DISPLAY_NAME);
                  // setDisableReset(true);
                  // onSelect(defaultDate);
                  setSelectedFilter(DEFAULT_DATE_DISPLAY_NAME);
                  setStartDate(DEFAULT_DATE.fromDate || '');
                  setEndDate(DEFAULT_DATE.toDate || today);
                  handleReset?.();
                  setIsOpen(false);
                }}
                disabled={selectedFilter === DEFAULT_DATE_DISPLAY_NAME}
              >
                <InfoToolTip
                  message="Reset"
                  icon={<IconRestore size={18} className="text-white" />}
                />
              </Button>
            </div>
          </form>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default FilterButton;
