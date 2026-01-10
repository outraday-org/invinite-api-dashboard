import * as React from 'react'

import { cn } from '@/lib/utils'

type TabsContextValue = {
  value: string
  setValue: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

const useTabsContext = () => {
  const ctx = React.useContext(TabsContext)
  if (!ctx) {
    throw new Error('Tabs components must be used within <Tabs>')
  }
  return ctx
}

type TabsProps = {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

function Tabs({ defaultValue, value, onValueChange, className, children }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const currentValue = value ?? internalValue

  const handleChange = (next: string) => {
    if (value === undefined) {
      setInternalValue(next)
    }
    onValueChange?.(next)
  }

  return (
    <TabsContext.Provider value={{ value: currentValue, setValue: handleChange }}>
      <div data-slot="tabs" className={cn('flex flex-col gap-3', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

type TabsListProps = React.ComponentProps<'div'>

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      data-slot="tabs-list"
      className={cn(
        'bg-muted text-muted-foreground border-border/60 inline-flex h-10 items-center justify-center rounded-lg border p-1',
        className,
      )}
      {...props}
    />
  ),
)
TabsList.displayName = 'TabsList'

type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const { value: activeValue, setValue } = useTabsContext()
    const isActive = activeValue === value

    return (
      <button
        ref={ref}
        role="tab"
        type="button"
        data-state={isActive ? 'active' : 'inactive'}
        data-slot="tabs-trigger"
        aria-selected={isActive}
        onClick={() => setValue(value)}
        className={cn(
          'text-sm inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 font-medium transition-all',
          'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow',
          'data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:text-foreground',
          className,
        )}
        {...props}
      />
    )
  },
)
TabsTrigger.displayName = 'TabsTrigger'

type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { value: activeValue } = useTabsContext()
    const isActive = activeValue === value

    if (!isActive) return null

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-slot="tabs-content"
        data-state="active"
        className={cn('ring-offset-background focus-visible:outline-none', className)}
        {...props}
      />
    )
  },
)
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsContent, TabsList, TabsTrigger }
