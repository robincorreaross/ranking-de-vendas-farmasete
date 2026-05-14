import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { format, startOfDay, endOfDay, startOfYesterday, startOfMonth, endOfMonth, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type DateRange = {
  from: Date;
  to: Date;
  label: string;
};

interface DateFilterProps {
  onRangeChange: (range: DateRange) => void;
}

const presets = [
  {
    label: "Hoje",
    getValue: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
      label: "Hoje"
    })
  },
  {
    label: "Ontem",
    getValue: () => ({
      from: startOfYesterday(),
      to: endOfDay(startOfYesterday()),
      label: "Ontem"
    })
  },
  {
    label: "Últimos 7 dias",
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date()),
      label: "Últimos 7 dias"
    })
  },
  {
    label: "Este Mês",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
      label: "Este Mês"
    })
  }
];

export function DateFilter({ onRangeChange }: DateFilterProps) {
  const [range, setRange] = useState<DateRange>(presets[3].getValue());
  const [isCustom, setIsCustom] = useState(false);

  const handlePresetClick = (preset: typeof presets[0]) => {
    const newRange = preset.getValue();
    setRange(newRange);
    setIsCustom(false);
    onRangeChange(newRange);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:flex bg-slate-900 border border-slate-800 rounded-lg p-1">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant="ghost"
            size="sm"
            className={cn(
              "text-xs px-3 h-8",
              range.label === preset.label && !isCustom
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white"
            )}
            onClick={() => handlePresetClick(preset)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white",
              isCustom && "border-blue-500/50 text-blue-400"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {isCustom ? (
              <>
                {format(range.from, "dd/MM", { locale: ptBR })} - {format(range.to, "dd/MM", { locale: ptBR })}
              </>
            ) : (
              range.label
            )}
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-800" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={range.from}
            selected={{ from: range.from, to: range.to }}
            onSelect={(newRange: any) => {
              if (newRange?.from && newRange?.to) {
                const finalRange = {
                  from: startOfDay(newRange.from),
                  to: endOfDay(newRange.to),
                  label: "Customizado"
                };
                setRange(finalRange);
                setIsCustom(true);
                onRangeChange(finalRange);
              }
            }}
            numberOfMonths={2}
            locale={ptBR}
            className="text-white"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
