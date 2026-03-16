"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number[]
  onValueChange: (value: number[]) => void
}

export function Slider({ className, value, onValueChange, ...props }: SliderProps) {
  return (
    <input
      type="range"
      value={value[0]}
      onChange={(e) => onValueChange([parseInt(e.target.value)])}
      className={cn(
        "w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500",
        className
      )}
      {...props}
    />
  )
}
