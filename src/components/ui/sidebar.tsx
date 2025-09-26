import * as React from "react"
import { cn } from "@/lib/utils"
const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
      className
    )}
    {...props}
  />
))
Sidebar.displayName = "Sidebar"
const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center h-16 px-4 border-b border-sidebar-border", className)}
    {...props}
  />
))
SidebarHeader.displayName = "SidebarHeader"
const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto p-4", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"
const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-4 border-t border-sidebar-border", className)}
    {...props}
  />
))
SidebarFooter.displayName = "SidebarFooter"
export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter }