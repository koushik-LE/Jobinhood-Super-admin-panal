'use client';
import { useMemo, useState, useEffect } from 'react';
import {
  IconDots,
  IconArrowsSort,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from '@tabler/icons-react';
import { FaCaretUp, FaCaretDown } from 'react-icons/fa';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import TableSkeleton from '../custom-skeletons/table-skeleton';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@radix-ui/react-dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export interface ColumnDefinition<T extends DataRow = DataRow> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  // Add any other column properties you need
}

export interface SortConfig {
  key: string;
  order: 'asc' | 'desc' | '';
}

interface AccordionConfig {
  show: boolean;
  data: unknown;
  dataApi: string;
  key: string;
}

interface DownloadConfig {
  show: boolean;
  apiUrl: string;
  filters: unknown;
}

export interface MenuItem {
  action: () => void;
  hoverClass: string;
  icon: React.ReactNode;
  textColor: string;
  label: string;
  disabled?: boolean;
}

export interface DataRow {
  [key: string]: unknown;
  id: string | number;
}
interface DataTableProps<T extends DataRow = DataRow> {
  data: T[];
  selectedColumns: Array<ColumnDefinition<T>>;
  total: number;
  current: number;
  onChange: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  loading?: boolean;
  isAction: boolean;
  itemPerPage: number;
  setSort: (sort: SortConfig) => void;
  sort: SortConfig;
  detailsUrl?: string;
  defaultSortColumn?: string;
  type?: string;
  accordion?: AccordionConfig | null;
  isDownload?: DownloadConfig | null;
  menuItems?: (row: T) => MenuItem[];
  totalPages?: number;
}

const DataTable = <T extends DataRow>({
  data,
  selectedColumns,
  total,
  current,
  onChange,
  setItemsPerPage,
  loading = false,
  isAction,
  itemPerPage = 10,
  sort,
  setSort,
  detailsUrl,
  defaultSortColumn,
  type = '',
  accordion = null,
  isDownload = null,
  menuItems,
  totalPages,
}: DataTableProps<T>) => {
  const router = useRouter();

  useEffect(() => {
    if (!sort.key && defaultSortColumn) {
      setSort({ key: defaultSortColumn, order: 'asc' });
    }
  }, [defaultSortColumn, setSort, sort.key]);

  const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemPerPage);
  const itemsPerPageOptions = [5, 10, 20, 30, 50, 100];

  const handlePrevious = () => {
    if (current > 1) {
      onChange(current - 1);
    }
  };

  const handleNext = () => {
    if (current < total) {
      onChange(current + 1);
    }
  };

  const handleSortChange = (key: string) => {
    if (key === 'status') return;

    if (sort.key === key) {
      if (sort.order === 'asc') {
        setSort({ key, order: 'desc' });
      } else if (sort.order === 'desc') {
        setSort({ key: 'createdAt', order: 'desc' });
      }
    } else {
      setSort({ key, order: 'asc' });
    }
  };

  const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

  const formatHeader = (header: string) =>
    header
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());

  function isValidDate(dateString: string | number) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  function formatCompactDate(input: string | number) {
    try {
      let date;

      if (!isNaN(input as number) && input.toString().length === 10) {
        date = new Date(Number(input) * 1000);
      } else if (typeof input === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
        const [month, day, year] = input.split('/');
        date = new Date(`${year}-${month}-${day}`);
      } else {
        return input.toString();
      }

      const optionsDate: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
      };

      const optionsTime: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      };

      const formattedDate = date.toLocaleDateString('en-US', optionsDate);
      const formattedTime = date.toLocaleTimeString('en-US', optionsTime);

      return `${formattedDate}, ${formattedTime}`;
    } catch {
      return input.toString();
    }
  }

  const getVisibleContent = (data: unknown) => {
    if (!data) return '-';
    if (typeof data === 'object') return JSON.stringify(data, null, 2);
    else if (typeof data === 'string') return truncateText(data, 300);
    else if (isValidDate(data as string | number))
      return formatCompactDate(data as string | number);
    else return truncateText(String(data), 30);
  };

  const handleIncreaseItemsPerPage = () => {
    const currentIndex = itemsPerPageOptions.indexOf(selectedItemsPerPage);
    if (currentIndex < itemsPerPageOptions.length - 1) {
      setSelectedItemsPerPage(itemsPerPageOptions[currentIndex + 1]);
      setItemsPerPage(itemsPerPageOptions[currentIndex + 1]);
    }
  };

  const handleDecreaseItemsPerPage = () => {
    const currentIndex = itemsPerPageOptions.indexOf(selectedItemsPerPage);
    if (currentIndex > 0) {
      setSelectedItemsPerPage(itemsPerPageOptions[currentIndex - 1]);
      setItemsPerPage(itemsPerPageOptions[currentIndex - 1]);
    }
  };

  const getTooltipContent = (data: unknown) => {
    if (!data) return '-';
    else if (typeof data === 'object') return JSON.stringify(data, null, 2);
    else if (typeof data === 'string') return data;
    else return String(data);
  };

  const handleNavigation = (val: string) => {
    if (type !== 'credits') {
      router.push(val);
    }
  };

  return (
    <>
      {loading ? (
        <TableSkeleton rowCount={itemPerPage + 1} className="mt-2" />
      ) : data.length > 0 ? (
        <div className="scrollbar-custom overflow-y-auto">
          <div className="flex flex-row [@media(max-width:320px)]:flex-col flex-wrap justify-between items-center bg-white dark:bg-[#1A1A2E] border-b-2 dark:border-[#3F3F56] px-3 pt-2 pb-3 h-auto">
            <div className="flex items-center space-x-2">
              <span className="text-gray80 text-sm sm:text-lg dark:text-blue-200">Show</span>
              <div className="flex items-center border border-gray110 rounded-md px-2">
                <span className="text-center text-sm">{selectedItemsPerPage}</span>
                <div className="flex flex-col items-center ml-2">
                  <FaCaretUp
                    onClick={handleIncreaseItemsPerPage}
                    className="cursor-pointer text-gray80 text-sm"
                  />
                  <FaCaretDown
                    onClick={handleDecreaseItemsPerPage}
                    className="cursor-pointer -mt-1 text-gray80 text-sm"
                  />
                </div>
              </div>
              <span className="text-gray80 text-sm sm:text-lg dark:text-blue-200">entries</span>
            </div>

            <div className="flex items-center space-x-2 p-1 rounded-md">
              <span className="text-gray80 text-sm sm:text-lg dark:text-blue-200">{`${
                (current - 1) * itemPerPage + 1
              } - ${Math.min(current * itemPerPage, total)} of ${total}`}</span>
              <button
                onClick={handlePrevious}
                disabled={current === 1}
                className={`p-2 text-sm sm:text-lg rounded-md transition-all ${
                  current === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                &lt;
              </button>
              <button
                onClick={handleNext}
                disabled={current >= (totalPages ?? 0)}
                className={`p-2 rounded-md text-sm sm:text-lg transition-all ${
                  current >= (totalPages ?? 0)
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                &gt;
              </button>
            </div>
          </div>

          <Table>
            <TableHeader className="bg-white h-16 font-semibold text-sm text-black10 dark:bg-[#1A1A2E] dark:text-blue-200">
              <TableRow>
                <TableHead className="border-b-2 cursor-pointer border-[#3F3F56] text-center align-middle whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] text-white-800 dark:text-blue-200">
                  <h1>S.No</h1>
                </TableHead>

                {selectedColumns
                  .filter(header => header.key !== 'id')
                  .map(header => (
                    <TableHead
                      key={header.key}
                      onClick={() => handleSortChange(header.key)}
                      className="cursor-pointer text-black whitespace-nowrap border-b-2 border-[#3F3F56] dark:text-blue-200"
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-start max-w-[200px] overflow-hidden text-ellipsis">
                              <span className="truncate">
                                {truncateText(formatHeader(header.label.toString()), 20)}
                              </span>
                              {header.label !== 'Status' &&
                                (sort.key === header.key ? (
                                  sort.order === 'asc' ? (
                                    <IconSortAscendingLetters
                                      size={20}
                                      className="ml-1 text-green-500 h-5 w-5"
                                    />
                                  ) : (
                                    <IconSortDescendingLetters
                                      size={20}
                                      className="ml-1 text-red-500 h-5 w-5"
                                    />
                                  )
                                ) : (
                                  <IconArrowsSort
                                    size={20}
                                    className="ml-2 h-5 w-5 ml-1 text-[#AFAFAF]"
                                    title="Click here to sort"
                                  />
                                ))}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>{formatHeader(header.label)}</span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                  ))}

                {isAction && (
                  <TableHead className="text-center align-middle border-b-2 text-black cursor-pointer border-[#3F3F56] whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] dark:text-blue-200">
                    <h1>Action</h1>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.length > 0 ? (
                data.map((row, rowIndex) => (
                  <TableRow
                    key={row.id ? String(row.id) : `row-${rowIndex}`}
                    onClick={() => handleNavigation(`${detailsUrl}/${row.id}`)}
                    className="border-b-2 h-16 cursor-pointer font-normal text-justify border-[#3F3F56] dark:bg-[#1A1A2E] hover:bg-[#f0f4ff] dark:hover:bg-[#F02AF3]/20"
                  >
                    <>
                      <TableCell className="text-center align-middle whitespace-nowrap overflow-hidden text-ellipsis max-w-[50px] text-black dark:text-blue-200">
                        {(current - 1) * itemPerPage + (rowIndex + 1)}.
                      </TableCell>

                      {selectedColumns
                        .filter(col => col.key !== 'id')
                        .map((col, colIndex) => (
                          <TableCell
                            key={col.key}
                            className="whitespace-nowrap text-sm overflow-hidden text-ellipsis max-w-[200px] text-black dark:text-blue-200"
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  {col.render ? (
                                    col.render(row)
                                  ) : colIndex === 0 ? (
                                    <div className="flex items-center space-x-3">
                                      <Avatar className="w-8 h-8 rounded-full border dark:border-gray-600 border-gray110 shadow-md transition-all duration-300">
                                        {row.avatar ? (
                                          <AvatarImage
                                            src={String(row.avatar)}
                                            alt={String(row[col.key])}
                                            className="object-cover w-full h-full rounded-full"
                                          />
                                        ) : (
                                          <AvatarFallback
                                            className="w-full h-full flex items-center justify-center text-lg font-semibold
                                                       bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 transition-all duration-300"
                                          >
                                            {row[col.key]
                                              ? String(row[col.key]).charAt(0).toUpperCase()
                                              : 'U'}
                                          </AvatarFallback>
                                        )}
                                      </Avatar>
                                      <span>{getVisibleContent(row[col.key])}</span>
                                    </div>
                                  ) : (
                                    <span>{getVisibleContent(row[col.key])}</span>
                                  )}
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  align="center"
                                  sticky="partial"
                                  className="z-40 text max-w-xs max-h-80 overflow-auto whitespace-normal break-words h-auto"
                                >
                                  <span>{getTooltipContent(row[col.key])}</span>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        ))}
                    </>

                    {isAction && (
                      <TableCell className="w-1/12 py-2 max-w-[50px] mr-7">
                        <div className="flex items-center justify-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <IconDots
                                size={18}
                                className="cursor-pointer hover:text-blue-600 transition-all duration-200"
                                onClick={e => e.stopPropagation()}
                                title="View options"
                              />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-56 rounded-lg shadow-md border border-gray-200 bg-white dark:bg-blue40"
                              onClick={e => e.stopPropagation()}
                            >
                              {Array.isArray(menuItems?.(row)) &&
                                menuItems(row).map((item: MenuItem, index: number) => (
                                  <DropdownMenuItem
                                    key={index}
                                    onClick={e => {
                                      e.stopPropagation();
                                      // item.action();
                                      if (!item.disabled) item.action();
                                    }}
                                    className={`${item.disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${item.hoverClass} flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200`}
                                  >
                                    {item.icon}
                                    <span className={`font-medium ${item.textColor}`}>
                                      {item.label}
                                    </span>
                                  </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <div className="text-gray-500 dark:text-blue-400 text-base">
                        No data available. Please adjust the filter.
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500 dark:text-gray-400">
            No data available. Please adjust the filters.
          </div>
        </div>
      )}
    </>
  );
};

export default DataTable;
