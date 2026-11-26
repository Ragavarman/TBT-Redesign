/**
 * Small layout helpers for the Foundations documentation stories.
 * Not part of the component library.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Page({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-14 p-10">
      <header className="flex flex-col gap-2 border-b pb-8">
        <span className="text-overline text-muted-foreground uppercase">Foundations</span>
        <h1 className="text-display">{title}</h1>
        <p className="max-w-2xl text-body text-muted-foreground">{description}</p>
      </header>
      {children}
    </div>
  )
}

export function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-heading-2">{title}</h2>
        {description && <p className="text-small text-muted-foreground">{description}</p>}
      </div>
      <div className="rounded-xl bg-muted/60 p-8">{children}</div>
    </section>
  )
}

/** Reads a CSS custom property's resolved value and re-reads it when <html> theme attributes change. */
function useCssVar(name: string, el?: HTMLElement | null) {
  const [value, setValue] = useState('')
  useEffect(() => {
    const target = el ?? document.documentElement
    const read = () => setValue(getComputedStyle(target).getPropertyValue(name).trim())
    read()
    const obs = new MutationObserver(read)
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-base'],
    })
    return () => obs.disconnect()
  }, [name, el])
  return value
}

export function Swatch({
  name,
  cssVar,
  className,
}: {
  name: string
  cssVar: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [el, setEl] = useState<HTMLDivElement | null>(null)
  useEffect(() => setEl(ref.current), [])
  const value = useCssVar(cssVar, el)
  return (
    <div ref={ref} className={cn('flex flex-col gap-2', className)}>
      <div
        className="h-14 rounded-lg border border-black/5 dark:border-white/10"
        style={{ background: `var(${cssVar})` }}
      />
      <div className="flex flex-col">
        <span className="text-label">{name}</span>
        <span className="font-mono text-caption text-muted-foreground">{value || '—'}</span>
      </div>
    </div>
  )
}

export function Grid({ children, cols = 6 }: { children: ReactNode; cols?: number }) {
  return (
    <div
      className="grid gap-x-4 gap-y-6"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  )
}
