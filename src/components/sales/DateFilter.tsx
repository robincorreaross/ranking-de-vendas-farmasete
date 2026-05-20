import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { CalendarIcon, ChevronDown } from "lucide-react";
import { format, startOfDay, endOfDay, startOfYesterday, startOfMonth, endOfMonth, subDays, setMonth, isSameMonth, setYear, getYear } from "date-fns";
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

const months = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

export function DateFilter({ onRangeChange }: DateFilterProps) {
  const [range, setRange] = useState<DateRange>(presets[3].getValue());
  const [isCustom, setIsCustom] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(getYear(new Date()));

  const currentYear = getYear(new Date());
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handlePresetClick = (preset: typeof presets[0]) => {
    const newRange = preset.getValue();
    setRange(newRange);
    setIsCustom(false);
    onRangeChange(newRange);
    setIsOpen(false);
    setSelectedYear(getYear(newRange.from));
  };

  const handleMonthClick = (monthIndex: number) => {
    let dateInMonth = setYear(new Date(), selectedYear);
    dateInMonth = setMonth(dateInMonth, monthIndex);
    
    const newRange = {
      from: startOfMonth(dateInMonth),
      to: endOfMonth(dateInMonth),
      label: `${months[monthIndex]} ${selectedYear}`
    };
    setRange(newRange);
    setIsCustom(false);
    onRangeChange(newRange);
    setIsOpen(false);
  };

  const isMonthSelected = (monthIndex: number) => {
    if (isCustom) return false;
    let monthDate = setYear(new Date(), selectedYear);
    monthDate = setMonth(monthDate, monthIndex);
    
    return isSameMonth(range.from, monthDate) && 
           isSameMonth(range.to, monthDate) &&
           range.from.getTime() === startOfMonth(monthDate).getTime() &&
           range.to.getTime() === endOfMonth(monthDate).getTime();
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

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white h-8 md:h-10",
              isCustom && "border-blue-500/50 text-blue-400"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">
              {isCustom ? (
                <>
                  {format(range.from, "dd/MM", { locale: ptBR })} - {format(range.to, "dd/MM", { locale: ptBR })}
                </>
              ) : (
                range.label
              )}
            </span>
            <span className="sm:hidden">Filtrar</span>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4 bg-slate-900 border-slate-800" align="end">
          <div className="flex flex-col gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Selecione o Ano e Mês</h4>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger className="w-[100px] h-8 text-xs bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    {years.map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {months.map((month, index) => (
                  <Button
                    key={month}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "text-xs h-8 px-0",
                      isMonthSelected(index)
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                    onClick={() => handleMonthClick(index)}
                  >
                    {month}
                  </Button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider px-1 mb-2">Personalizado</h4>
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
                  } else if (newRange?.from) {
                    setRange({
                      from: startOfDay(newRange.from),
                      to: startOfDay(newRange.from),
                      label: "Customizado"
                    });
                  }
                }}
                numberOfMonths={1}
                locale={ptBR}
                className="text-white bg-transparent p-0"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

