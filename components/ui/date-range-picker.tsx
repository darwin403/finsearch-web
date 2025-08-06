"use client";

import * as React from "react";
import { format, startOfMonth, endOfMonth, subDays, subMonths } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

// Fiscal Year utilities
const FY_START_MONTH = 3; // April (0-indexed)
const FY_BASE_YEAR = 1999;

const getFiscalYear = (date = new Date()) => {
  const month = date.getMonth();
  const year = date.getFullYear();
  return (month >= FY_START_MONTH ? year : year - 1) - FY_BASE_YEAR;
};

const getFiscalQuarter = (date = new Date()) => {
  const month = date.getMonth();
  const fy = getFiscalYear(date);
  const quarterMap = [4, 4, 4, 1, 1, 1, 2, 2, 2, 3, 3, 3];
  return { fy, quarter: quarterMap[month] };
};

const getDateRange = (type: string, params?: any): DateRange => {
  const today = new Date();

  const ranges: Record<string, () => DateRange> = {
    today: () => ({ from: today, to: today }),
    yesterday: () => ({ from: subDays(today, 1), to: subDays(today, 1) }),
    last30: () => ({ from: subDays(today, 29), to: today }),
    thisMonth: () => ({ from: startOfMonth(today), to: endOfMonth(today) }),
    lastMonth: () => {
      const lastMonth = subMonths(today, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    },
    fiscalYear: () => {
      const { year } = params;
      return {
        from: new Date(year, FY_START_MONTH, 1),
        to: new Date(year + 1, FY_START_MONTH, 0),
      };
    },
    fiscalQuarter: () => {
      const { year, quarter } = params;
      const startMonth = (quarter - 1) * 3 + FY_START_MONTH;
      return {
        from: new Date(year, startMonth, 1),
        to: new Date(year, startMonth + 3, 0),
      };
    },
  };

  return ranges[type]?.() || { from: undefined, to: undefined };
};

// Generate presets
const currentFY = getFiscalYear();
const currentQuarter = getFiscalQuarter();
const prevQuarter =
  currentQuarter.quarter === 1
    ? { fy: currentQuarter.fy - 1, quarter: 4 }
    : { fy: currentQuarter.fy, quarter: currentQuarter.quarter - 1 };

const presets = [
  { name: "Today", type: "today" },
  { name: "Yesterday", type: "yesterday" },
  { name: "Last 30 days", type: "last30" },
  { name: "This month", type: "thisMonth" },
  { name: "Last month", type: "lastMonth" },
  {
    name: `Current FY (FY${currentFY.toString().slice(-2)})`,
    type: "fiscalYear",
    params: { year: currentFY + FY_BASE_YEAR },
  },
  {
    name: `Previous FY (FY${(currentFY - 1).toString().slice(-2)})`,
    type: "fiscalYear",
    params: { year: currentFY + FY_BASE_YEAR - 1 },
  },
  {
    name: `Current Quarter (Q${currentQuarter.quarter} FY${currentQuarter.fy
      .toString()
      .slice(-2)})`,
    type: "fiscalQuarter",
    params: {
      year: currentQuarter.fy + FY_BASE_YEAR,
      quarter: currentQuarter.quarter,
    },
  },
  {
    name: `Previous Quarter (Q${prevQuarter.quarter} FY${prevQuarter.fy
      .toString()
      .slice(-2)})`,
    type: "fiscalQuarter",
    params: {
      year: prevQuarter.fy + FY_BASE_YEAR,
      quarter: prevQuarter.quarter,
    },
  },
];

interface DateRangePickerProps {
  className?: string;
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  date,
  onDateChange,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<DateRange | undefined>(date);
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(date);

  React.useEffect(() => {
    if (open) setTempRange(range);
  }, [open, range]);

  const handlePreset = (preset: (typeof presets)[0]) => {
    setTempRange(getDateRange(preset.type, preset.params));
  };

  const handleUpdate = () => {
    setRange(tempRange);
    onDateChange?.(tempRange);
    setOpen(false);
  };

  const handleDateInput = (type: "from" | "to", value: string) => {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      setTempRange((prev) => ({
        from: type === "from" ? date : prev?.from || date,
        to: type === "to" ? date : prev?.to,
      }));
    }
  };

  const formatDateRange = () => {
    if (!range?.from) return "Pick a date range";
    if (!range.to) return format(range.from, "LLL dd, y");
    return `${format(range.from, "LLL dd, y")} - ${format(
      range.to,
      "LLL dd, y"
    )}`;
  };

  const PresetSection = ({
    title,
    presets,
  }: {
    title: string;
    presets: typeof presets;
  }) => (
    <div className="mb-2">
      <p className="px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <div className="flex flex-col">
        {presets.map((preset) => (
          <Button
            key={preset.name}
            variant="ghost"
            size="sm"
            onClick={() => handlePreset(preset)}
            className="justify-start font-normal h-8"
          >
            <span className="flex items-center">
              <span>{preset.name.split(" (")[0]}</span>
              {preset.name.includes("(") && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">
                  {preset.name.match(/\(([^)]+)\)/)?.[1]}
                </span>
              )}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );

  const DateInput = ({
    label,
    type,
  }: {
    label: string;
    type: "from" | "to";
  }) => (
    <div className="grid gap-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <Input
        type="date"
        value={tempRange?.[type] ? format(tempRange[type]!, "yyyy-MM-dd") : ""}
        onChange={(e) => handleDateInput(type, e.target.value)}
        className="h-8 w-[120px]"
      />
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !range && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 border-b p-3">
              <DateInput label="From" type="from" />
              <div className="pt-5 text-muted-foreground">→</div>
              <DateInput label="To" type="to" />
            </div>
            <div className="p-3">
              <Calendar
                mode="range"
                defaultMonth={tempRange?.from}
                selected={tempRange}
                onSelect={setTempRange}
                numberOfMonths={2}
                className="rounded-md"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-end gap-2 p-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleUpdate}>
                Update
              </Button>
            </div>
          </div>
          <div className="flex flex-col border-l p-2 w-44">
            <PresetSection
              title="Recent Periods"
              presets={presets.slice(0, 4)}
            />
            <PresetSection
              title="Financial Calendar"
              presets={presets.slice(4)}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
