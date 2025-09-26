"use client"
import * as React from "react"
import {
  Bar,
  BarChart as BarChartPrimitive,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Legend as LegendPrimitive,
  Line,
  LineChart as LineChartPrimitive,
  Pie,
  PieChart as PieChartPrimitive,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RadarChartPrimitive,
  RadialBar,
  RadialBarChart as RadialBarChartPrimitive,
  Rectangle,
  ReferenceLine,
  Scatter,
  ScatterChart as ScatterChartPrimitive,
  Tooltip as TooltipPrimitive,
  Treemap as TreemapPrimitive,
  XAxis,
  YAxis,
} from "recharts"
import { type ContentType } from "recharts/types/component/Tooltip"
import { cn } from "@/lib/utils"
import {
  type ChartConfig,
  type ChartContainerProps,
  ChartContext,
} from "@/lib/chart"
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  ChartContainerProps
>(({ id, className, children, config, ...props }, ref) => {
  const chartId = React.useId()
  const containerId = id || chartId
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart
        ref={ref}
        id={containerId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-radial-bar-sector]:stroke-primary [&_.recharts-reference-line-line]:stroke-border [&_.recharts-sector[path]]:fill-primary [&_.recharts-sector[path]]:stroke-primary [&_.recharts-surface]:outline-none [&_.recharts-tooltip-wrapper]:rounded-lg [&_.recharts-tooltip-wrapper]:border [&_.recharts-tooltip-wrapper]:bg-background/80 [&_.recharts-tooltip-wrapper]:text-foreground [&_.recharts-tooltip-wrapper]:shadow-lg [&_.recharts-tooltip-wrapper]:backdrop-blur-sm",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"
const ChartTooltip = TooltipPrimitive
const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof TooltipPrimitive> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = React.useContext(ChartContext)
    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload || payload.length === 0) {
        return null
      }
      const [item] = payload
      const key = `${labelKey || item.dataKey || item.name || "value"}`
      const itemConfig = config?.[key as keyof typeof config]
      if (itemConfig?.label) {
        return itemConfig.label
      }
      if (label) {
        return label
      }
      if (labelFormatter) {
        return labelFormatter(item.name, payload)
      }
      return item.name
    }, [label, labelFormatter, payload, hideLabel, config, labelKey])
    if (!active || !payload || payload.length === 0) {
      return null
    }
    const nestLabel = payload.length === 1 && indicator !== "dot"
    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!nestLabel ? (
          <div className={cn("font-medium", labelClassName)}>
            {tooltipLabel}
          </div>
        ) : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = config?.[key as keyof typeof config]
            const indicatorColor = color || item.color || item.fill
            const value =
              !formatter && itemConfig?.formatter
                ? itemConfig.formatter(item.value, item.name, item, index, payload)
                : formatter
                  ? formatter(item.value, item.name, item, index)
                  : item.value
            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter || itemConfig?.formatter ? (
                  <div
                    className={cn(
                      "flex flex-1 justify-between",
                      nestLabel && "items-end"
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    <span className="font-medium tabular-nums text-foreground">
                      {value as React.ReactNode}
                    </span>
                  </div>
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "w-1 shrink-0 rounded-[2px]",
                            indicator === "dot" && "h-2.5",
                            indicator === "line" && "h-1",
                            indicator === "dashed" &&
                              "my-0.5 h-0 border-[1.5px] border-dashed"
                          )}
                          style={{
                            background: indicatorColor,
                          }}
                        />
                      )
                    )}
                    <div className="flex flex-1 justify-between gap-4">
                      <span>{itemConfig?.label || item.name}</span>
                      <span className="font-medium tabular-nums text-foreground">
                        {item.value as React.ReactNode}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"
const ChartLegend = LegendPrimitive
const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<React.ComponentProps<typeof LegendPrimitive>, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    ref
  ) => {
    const { config } = React.useContext(ChartContext)
    if (!payload || !payload.length) {
      return null
    }
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = config?.[key as keyof typeof config]
          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {itemConfig?.icon ? (
                <itemConfig.icon />
              ) : (
                !hideIcon && (
                  <div
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />
                )
              )}
              {itemConfig?.label || item.value}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegend"
// Export all recharts components
export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  // Recharts
  BarChartPrimitive as BarChart,
  LineChartPrimitive as LineChart,
  PieChartPrimitive as PieChart,
  RadarChartPrimitive as RadarChart,
  RadialBarChartPrimitive as RadialBarChart,
  ScatterChartPrimitive as ScatterChart,
  TreemapPrimitive as Treemap,
  // Grids
  CartesianGrid,
  PolarGrid,
  // Axes
  XAxis,
  YAxis,
  PolarAngleAxis,
  PolarRadiusAxis,
  // Components
  Bar,
  Line,
  Pie,
  Radar,
  RadialBar,
  Scatter,
  // Cells
  Cell,
  // Shapes
  Rectangle,
  // Tooltip
  TooltipPrimitive,
  // Legend
  LegendPrimitive,
  // Label
  Label,
  LabelList,
  // Reference
  ReferenceLine,
}
export type {
  ChartConfig,
  // Recharts
  ContentType,
}