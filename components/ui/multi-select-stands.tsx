'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STANDS, type StandCode } from '@/lib/expo/stands'

interface StandsMultiSelectProps {
  selected: StandCode[]
  onChange: (selected: StandCode[]) => void
  placeholder?: string
  className?: string
  id?: string
}

export function StandsMultiSelect({
  selected,
  onChange,
  placeholder = 'Selecione os stands...',
  className,
  id,
}: StandsMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const toggleOption = (value: StandCode) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value].sort()
    onChange(newSelected)
  }

  const removeStand = (value: StandCode, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter((v) => v !== value))
  }

  const displayText = selected.length === 0
    ? placeholder
    : selected.length === 1
    ? selected[0]
    : `${selected.length} stands selecionados`

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-full min-h-[2.5rem]"
      >
        <div className="flex flex-wrap gap-1 flex-1 items-center">
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : selected.length <= 2 ? (
            selected.map((stand) => (
              <span
                key={stand}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium"
              >
                {stand}
                <button
                  type="button"
                  onClick={(e) => removeStand(stand, e)}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          ) : (
            <>
              {selected.slice(0, 2).map((stand) => (
                <span
                  key={stand}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium"
                >
                  {stand}
                  <button
                    type="button"
                    onClick={(e) => removeStand(stand, e)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <span className="text-xs text-muted-foreground">
                +{selected.length - 2} mais
              </span>
            </>
          )}
        </div>
        <ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform ml-2 flex-shrink-0', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-[300px] overflow-auto">
          <div className="p-1">
            {STANDS.map((stand) => {
              const isSelected = selected.includes(stand)
              return (
                <button
                  key={stand}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleOption(stand)
                  }}
                  className={cn(
                    'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                    isSelected && 'bg-accent text-accent-foreground'
                  )}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {isSelected && <Check className="h-4 w-4" />}
                  </span>
                  {stand}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}


