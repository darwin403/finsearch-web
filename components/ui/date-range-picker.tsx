"use client";

import * as React from "react";
import { format } from "date-fns";
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

const presets = [
  { name: "Today", days: 0 },
  { name: "Last 7 days", days: 7 },
  { name: "Last 30 days", days: 30 },
  { name: "Last 90 days", days: 90 },
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

  const handlePreset = (days: number) => {
    const today = new Date();
    const from = new Date();
    from.setDate(today.getDate() - (days - 1));
    from.setHours(0, 0, 0, 0);
    today.setHours(23, 59, 59, 999);
    setTempRange({ from: days === 0 ? today : from, to: today });
  };

  const handleUpdate = () => {
    setRange(tempRange);
    onDateChange?.(tempRange);
    setOpen(false);
  };

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
          {range?.from ? (
            range.to ? (
              <>
                {format(range.from, "LLL dd, y")} -{" "}
                {format(range.to, "LLL dd, y")}
              </>
            ) : (
              format(range.from, "LLL dd, y")
            )
          ) : (
            "Pick a date range"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 border-b p-3">
              <div className="grid gap-1">
                <label className="text-xs text-muted-foreground">From</label>
                <Input
                  type="date"
                  value={
                    tempRange?.from ? format(tempRange.from, "yyyy-MM-dd") : ""
                  }
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    if (!isNaN(date.getTime())) {
                      setTempRange({ from: date, to: tempRange?.to });
                    }
                  }}
                  className="h-8 w-[120px]"
                />
              </div>
              <div className="pt-5 text-muted-foreground">→</div>
              <div className="grid gap-1">
                <label className="text-xs text-muted-foreground">To</label>
                <Input
                  type="date"
                  value={
                    tempRange?.to ? format(tempRange.to, "yyyy-MM-dd") : ""
                  }
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    if (!isNaN(date.getTime())) {
                      setTempRange({ from: tempRange?.from || date, to: date });
                    }
                  }}
                  className="h-8 w-[120px]"
                />
              </div>
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
          <div className="flex flex-col gap-1 border-l p-2">
            <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Quick select
            </p>
            {presets.map((preset) => (
              <Button
                key={preset.days}
                variant="ghost"
                size="sm"
                onClick={() => handlePreset(preset.days)}
                className="justify-start font-normal"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
