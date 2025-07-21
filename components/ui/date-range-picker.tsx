"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface DateRangePickerProps {
  onUpdate?: (values: { range: DateRange; rangeCompare?: DateRange }) => void;
  initialDateFrom?: Date | string;
  initialDateTo?: Date | string;
  initialCompareFrom?: Date | string;
  initialCompareTo?: Date | string;
  align?: "start" | "center" | "end";
  locale?: string;
  showCompare?: boolean;
}

const PRESETS = [
  { name: "today", label: "Today" },
  { name: "yesterday", label: "Yesterday" },
  { name: "last7", label: "Last 7 days" },
  { name: "last14", label: "Last 14 days" },
  { name: "last30", label: "Last 30 days" },
  { name: "thisWeek", label: "This Week" },
  { name: "lastWeek", label: "Last Week" },
  { name: "thisMonth", label: "This Month" },
  { name: "lastMonth", label: "Last Month" },
];

export function DateRangePicker({
  onUpdate,
  initialDateFrom = new Date(new Date().setHours(0, 0, 0, 0)),
  initialDateTo,
  initialCompareFrom,
  initialCompareTo,
  align = "end",
  locale = "en-US",
  showCompare = true,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSmallScreen, setIsSmallScreen] = React.useState(false);
  const [selectedPreset, setSelectedPreset] = React.useState<string>();

  const getDateAdjusted = (dateInput: Date | string): Date => {
    if (typeof dateInput === "string") {
      const parts = dateInput.split("-").map((p) => parseInt(p, 10));
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return dateInput;
  };

  const [range, setRange] = React.useState<DateRange>({
    from: getDateAdjusted(initialDateFrom),
    to: initialDateTo
      ? getDateAdjusted(initialDateTo)
      : getDateAdjusted(initialDateFrom),
  });

  const [rangeCompare, setRangeCompare] = React.useState<DateRange | undefined>(
    initialCompareFrom
      ? {
          from: getDateAdjusted(initialCompareFrom),
          to: initialCompareTo
            ? getDateAdjusted(initialCompareTo)
            : getDateAdjusted(initialCompareFrom),
        }
      : undefined
  );

  const openedRangeRef = React.useRef<DateRange>();
  const openedRangeCompareRef = React.useRef<DateRange | undefined>();

  React.useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 960);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      openedRangeRef.current = range;
      openedRangeCompareRef.current = rangeCompare;
    }
  }, [isOpen]);

  const getPresetRange = (preset: string): DateRange => {
    const from = new Date();
    const to = new Date();
    const first = from.getDate() - from.getDay();

    switch (preset) {
      case "today":
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "yesterday":
        from.setDate(from.getDate() - 1);
        from.setHours(0, 0, 0, 0);
        to.setDate(to.getDate() - 1);
        to.setHours(23, 59, 59, 999);
        break;
      case "last7":
        from.setDate(from.getDate() - 6);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "last14":
        from.setDate(from.getDate() - 13);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "last30":
        from.setDate(from.getDate() - 29);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "thisWeek":
        from.setDate(first);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "lastWeek":
        from.setDate(from.getDate() - 7 - from.getDay());
        to.setDate(to.getDate() - to.getDay() - 1);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "thisMonth":
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "lastMonth":
        from.setMonth(from.getMonth() - 1);
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
        to.setDate(0);
        to.setHours(23, 59, 59, 999);
        break;
    }
    return { from, to };
  };

  const setPreset = (preset: string) => {
    const range = getPresetRange(preset);
    setRange(range);
    if (rangeCompare) {
      const compareRange = {
        from: new Date(
          range.from.getFullYear() - 1,
          range.from.getMonth(),
          range.from.getDate()
        ),
        to: range.to
          ? new Date(
              range.to.getFullYear() - 1,
              range.to.getMonth(),
              range.to.getDate()
            )
          : undefined,
      };
      setRangeCompare(compareRange);
    }
    setSelectedPreset(preset);
  };

  const checkPreset = () => {
    for (const preset of PRESETS) {
      const presetRange = getPresetRange(preset.name);
      const normalizedRangeFrom = new Date(range.from.setHours(0, 0, 0, 0));
      const normalizedPresetFrom = new Date(
        presetRange.from.setHours(0, 0, 0, 0)
      );
      const normalizedRangeTo = new Date(range.to?.setHours(0, 0, 0, 0) ?? 0);
      const normalizedPresetTo = new Date(
        presetRange.to?.setHours(0, 0, 0, 0) ?? 0
      );

      if (
        normalizedRangeFrom.getTime() === normalizedPresetFrom.getTime() &&
        normalizedRangeTo.getTime() === normalizedPresetTo.getTime()
      ) {
        setSelectedPreset(preset.name);
        return;
      }
    }
    setSelectedPreset(undefined);
  };

  React.useEffect(() => {
    checkPreset();
  }, [range]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const areRangesEqual = (a?: DateRange, b?: DateRange) => {
    if (!a || !b) return a === b;
    return (
      a.from.getTime() === b.from.getTime() &&
      (!a.to || !b.to || a.to.getTime() === b.to.getTime())
    );
  };

  const resetValues = () => {
    setRange({
      from: getDateAdjusted(initialDateFrom),
      to: initialDateTo
        ? getDateAdjusted(initialDateTo)
        : getDateAdjusted(initialDateFrom),
    });
    setRangeCompare(
      initialCompareFrom
        ? {
            from: getDateAdjusted(initialCompareFrom),
            to: initialCompareTo
              ? getDateAdjusted(initialCompareTo)
              : getDateAdjusted(initialCompareFrom),
          }
        : undefined
    );
  };

  const DateInput = ({
    value,
    onChange,
  }: {
    value?: Date;
    onChange: (date: Date) => void;
  }) => {
    const [inputValue, setInputValue] = React.useState(
      value ? format(value, "yyyy-MM-dd") : ""
    );

    React.useEffect(() => {
      if (value) setInputValue(format(value, "yyyy-MM-dd"));
    }, [value]);

    return (
      <Input
        type="date"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          if (e.target.value) onChange(new Date(e.target.value));
        }}
        className="w-32"
      />
    );
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetValues();
        setIsOpen(open);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <div className="text-right">
            <div className="py-1">
              <div>
                {formatDate(range.from)}
                {range.to && ` - ${formatDate(range.to)}`}
              </div>
            </div>
            {rangeCompare && (
              <div className="text-xs opacity-60 -mt-1">
                vs. {formatDate(rangeCompare.from)}
                {rangeCompare.to && ` - ${formatDate(rangeCompare.to)}`}
              </div>
            )}
          </div>
          <div className="ml-auto">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <div className="flex">
          <div className="flex flex-col">
            <div className="flex flex-col gap-2 p-3 pb-4 lg:flex-row lg:items-start lg:pb-0">
              {showCompare && (
                <div className="flex items-center space-x-2 pr-4 py-1">
                  <Switch
                    id="compare"
                    checked={!!rangeCompare}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        if (!range.to)
                          setRange({ from: range.from, to: range.from });
                        setRangeCompare({
                          from: new Date(
                            range.from.getFullYear() - 1,
                            range.from.getMonth(),
                            range.from.getDate()
                          ),
                          to: range.to
                            ? new Date(
                                range.to.getFullYear() - 1,
                                range.to.getMonth(),
                                range.to.getDate()
                              )
                            : undefined,
                        });
                      } else {
                        setRangeCompare(undefined);
                      }
                    }}
                  />
                  <Label htmlFor="compare">Compare</Label>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <DateInput
                    value={range.from}
                    onChange={(date) => {
                      const to = !range.to || date > range.to ? date : range.to;
                      setRange({ from: date, to });
                    }}
                  />
                  <div className="py-1">-</div>
                  <DateInput
                    value={range.to}
                    onChange={(date) => {
                      const from = date < range.from ? date : range.from;
                      setRange({ from, to: date });
                    }}
                  />
                </div>
                {rangeCompare && (
                  <div className="flex gap-2">
                    <DateInput
                      value={rangeCompare.from}
                      onChange={(date) => {
                        const to =
                          !rangeCompare.to || date > rangeCompare.to
                            ? date
                            : rangeCompare.to;
                        setRangeCompare({ from: date, to });
                      }}
                    />
                    <div className="py-1">-</div>
                    <DateInput
                      value={rangeCompare.to}
                      onChange={(date) => {
                        const from =
                          rangeCompare.from && date < rangeCompare.from
                            ? date
                            : rangeCompare.from;
                        setRangeCompare({ from, to: date });
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            {isSmallScreen && (
              <Select value={selectedPreset} onValueChange={setPreset}>
                <SelectTrigger className="mx-auto mb-2 w-[180px]">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {PRESETS.map((preset) => (
                    <SelectItem key={preset.name} value={preset.name}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Calendar
              mode="range"
              selected={range}
              onSelect={(value) => {
                if (value?.from) setRange({ from: value.from, to: value.to });
              }}
              numberOfMonths={isSmallScreen ? 1 : 2}
              defaultMonth={
                new Date(
                  new Date().setMonth(
                    new Date().getMonth() - (isSmallScreen ? 0 : 1)
                  )
                )
              }
            />
          </div>
          {!isSmallScreen && (
            <div className="flex flex-col gap-1 p-3">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreset(preset.name)}
                  className={cn(
                    "justify-start",
                    selectedPreset === preset.name && "pointer-events-none"
                  )}
                >
                  <span
                    className={cn(
                      "mr-2 opacity-0",
                      selectedPreset === preset.name && "opacity-100"
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </span>
                  {preset.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t p-3">
          <Button
            variant="ghost"
            onClick={() => {
              setIsOpen(false);
              resetValues();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false);
              if (
                !areRangesEqual(range, openedRangeRef.current) ||
                !areRangesEqual(rangeCompare, openedRangeCompareRef.current)
              ) {
                onUpdate?.({ range, rangeCompare });
              }
            }}
          >
            Update
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
