"use client"
import * as React from "react"
import { type TooltipProps } from "recharts"
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
    formatter?: (value: any, name?: string, entry?: any, index?: number, payload?: any[]) => React.ReactNode
  }
}
type ChartContextProps = {
  config: ChartConfig
}
export const ChartContext = React.createContext<ChartContextProps>({
  config: {},
})
export type ChartContainerProps = React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<"div">["children"]
}