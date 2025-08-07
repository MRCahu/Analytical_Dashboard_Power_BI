
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  CalendarIcon,
  Filter,
  X,
  Users,
  Building2,
  AlertCircle,
  Radio,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FilterState, Agente } from '@/lib/types';

interface FilterPanelProps {
  agentes: Agente[];
  departamentos: string[];
  status: string[];
  prioridades: string[];
  canais: string[];
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
  className?: string;
}

export default function FilterPanel({
  agentes,
  departamentos,
  status,
  prioridades,
  canais,
  onFilterChange,
  initialFilters,
  className
}: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>(
    initialFilters ?? {
      periodo: {
        inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        fim: new Date()
      },
      agentes: [],
      departamentos: [],
      status: [],
      prioridades: [],
      canais: []
    }
  );

  const [searchTerm, setSearchTerm] = useState('');

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const addFilter = (type: keyof FilterState, value: string) => {
    if (type === 'periodo') return;
    
    const currentValues = filters[type] as string[];
    if (!currentValues?.includes?.(value)) {
      updateFilters({
        [type]: [...currentValues, value]
      });
    }
  };

  const removeFilter = (type: keyof FilterState, value: string) => {
    if (type === 'periodo') return;
    
    const currentValues = filters[type] as string[];
    updateFilters({
      [type]: currentValues?.filter?.((v) => v !== value) ?? []
    });
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      periodo: filters?.periodo,
      agentes: [],
      departamentos: [],
      status: [],
      prioridades: [],
      canais: []
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  };

  const filteredAgentes = agentes?.filter?.(agente =>
    agente?.nome?.toLowerCase?.()?.includes?.(searchTerm?.toLowerCase?.() ?? '') ?? false
  ) ?? [];

  const totalActiveFilters = (filters?.agentes?.length ?? 0) +
    (filters?.departamentos?.length ?? 0) +
    (filters?.status?.length ?? 0) +
    (filters?.prioridades?.length ?? 0) +
    (filters?.canais?.length ?? 0);

  return (
    <Card className={cn(
      'p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border shadow-lg',
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Filtros
          </h3>
          {totalActiveFilters > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {totalActiveFilters}
            </Badge>
          )}
        </div>
        {totalActiveFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-slate-500 hover:text-red-600"
          >
            <X className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {/* Período */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            Período
          </label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  {filters?.periodo?.inicio ? (
                    format(filters.periodo.inicio, 'dd/MM/yyyy', { locale: ptBR })
                  ) : (
                    'Início'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters?.periodo?.inicio}
                  onSelect={(date) => date && updateFilters({
                    periodo: { ...filters?.periodo, inicio: date }
                  })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  {filters?.periodo?.fim ? (
                    format(filters.periodo.fim, 'dd/MM/yyyy', { locale: ptBR })
                  ) : (
                    'Fim'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters?.periodo?.fim}
                  onSelect={(date) => date && updateFilters({
                    periodo: { ...filters?.periodo, fim: date }
                  })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Agentes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Users className="w-4 h-4" />
            Agentes
          </label>
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar agente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value ?? '')}
                className="pl-9"
              />
            </div>
            <Select value="" onValueChange={(value) => value && addFilter('agentes', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione agente" />
              </SelectTrigger>
              <SelectContent>
                {filteredAgentes?.map?.((agente) => (
                  <SelectItem key={agente?.id} value={agente?.id ?? ''}>
                    {agente?.nome} ({agente?.departamento})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Departamentos */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            Departamentos
          </label>
          <Select value="" onValueChange={(value) => value && addFilter('departamentos', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Departamentos</SelectItem>
              {departamentos?.map?.((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Status
          </label>
          <Select value="" onValueChange={(value) => value && addFilter('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              {status?.map?.((st) => (
                <SelectItem key={st} value={st}>
                  {st}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prioridades */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Prioridades
          </label>
          <Select value="" onValueChange={(value) => value && addFilter('prioridades', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Prioridades</SelectItem>
              {prioridades?.map?.((prio) => (
                <SelectItem key={prio} value={prio}>
                  {prio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Canais */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Radio className="w-4 h-4" />
            Canais
          </label>
          <Select value="" onValueChange={(value) => value && addFilter('canais', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Canais</SelectItem>
              {canais?.map?.((canal) => (
                <SelectItem key={canal} value={canal}>
                  {canal}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {totalActiveFilters > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Filtros Aplicados:
          </h4>
          <div className="flex flex-wrap gap-2">
            {filters?.agentes?.map?.((agentId) => {
              const agent = agentes?.find?.(a => a?.id === agentId);
              return (
                <Badge key={agentId} variant="outline" className="bg-blue-50 text-blue-700">
                  {agent?.nome ?? agentId}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer hover:text-red-600"
                    onClick={() => removeFilter('agentes', agentId)}
                  />
                </Badge>
              );
            })}
            {filters?.departamentos?.map?.((dept) => (
              <Badge key={dept} variant="outline" className="bg-green-50 text-green-700">
                {dept}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer hover:text-red-600"
                  onClick={() => removeFilter('departamentos', dept)}
                />
              </Badge>
            ))}
            {filters?.status?.map?.((st) => (
              <Badge key={st} variant="outline" className="bg-orange-50 text-orange-700">
                {st}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer hover:text-red-600"
                  onClick={() => removeFilter('status', st)}
                />
              </Badge>
            ))}
            {filters?.prioridades?.map?.((prio) => (
              <Badge key={prio} variant="outline" className="bg-red-50 text-red-700">
                {prio}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer hover:text-red-600"
                  onClick={() => removeFilter('prioridades', prio)}
                />
              </Badge>
            ))}
            {filters?.canais?.map?.((canal) => (
              <Badge key={canal} variant="outline" className="bg-purple-50 text-purple-700">
                {canal}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer hover:text-red-600"
                  onClick={() => removeFilter('canais', canal)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
