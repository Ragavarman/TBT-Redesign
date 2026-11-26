/**
 * Optical padding audit. Every specimen measures itself in the browser and reports:
 *   H×W · edge L / edge R (visible gap from the outermost content to the side)
 *   vs. that content's vertical gap (cap height for text, box for icons/avatars) · square.
 * ✓ = within 1px. Toggle Mode/Accent/Base freely — the geometry must not change.
 */
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, Badge, Button, IconButton, Input, Kbd, StatusGlyph } from '@/components/atoms'
import {
  ConditionBadge,
  ListItem,
  Pagination,
  RailItem,
  SidebarItem,
  Select,
  SlaBadge,
  Tabs,
  TabsList,
  TabsTrigger,
  TicketStatusBadge,
} from '@/components/molecules'
import { menuItem } from '@/components/ui/menu-styles'
import { Icon } from '@/components/atoms'
import { Page, Section } from './docs'

const CAP = 0.727 // Inter cap height ÷ em
const ASCENT = 0.96875 // Inter hhea ascender ÷ em

type Box = { left: number; right: number; top: number; bottom: number; text: boolean }
type Metrics = {
  h: number
  w: number
  l?: { gap: number; v: number }
  r?: { gap: number; v: number }
  /** cap box of the first text: gap above the cap top / below the baseline */
  c?: { top: number; bottom: number }
}

function contentBoxes(root: HTMLElement): Box[] {
  const boxes: Box[] = []
  const rr = root.getBoundingClientRect()
  // text nodes (skip screen-reader-only text)
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent?.trim()) continue
    const parent = n.parentElement!
    if (parent.closest('.sr-only, svg')) continue
    const holder = parent.closest('[data-slot=avatar], kbd')
    if (holder && holder !== root) continue
    const range = document.createRange()
    range.selectNodeContents(n)
    const tr = range.getBoundingClientRect()
    if (!tr.width) continue
    // A text range box is the font content area (Inter: ascent 0.96875em), independent of
    // line-height — the cap top sits (ascent − cap) below its top.
    const fs = parseFloat(getComputedStyle(parent).fontSize)
    const capTop = tr.top + (ASCENT - CAP) * fs
    boxes.push({
      left: tr.left,
      right: tr.right,
      top: capTop,
      bottom: capTop + CAP * fs,
      text: true,
    })
  }
  // inputs: text sits at the input box, cap centred in its line box
  root.querySelectorAll('input').forEach((el) => {
    const r = el.getBoundingClientRect()
    const fs = parseFloat(getComputedStyle(el).fontSize)
    const capTop = r.top + (r.height - fs * CAP) / 2
    boxes.push({ left: r.left, right: r.right, top: capTop, bottom: capTop + fs * CAP, text: true })
  })
  // icons, avatars, kbds, nested buttons, dots
  root
    .querySelectorAll<HTMLElement | SVGElement>('svg, [data-slot=avatar], kbd, button, [data-edge]')
    .forEach((el) => {
      if (el.tagName.toLowerCase() !== 'svg' && el.closest('svg')) return
      const holder = el.parentElement?.closest('[data-slot=avatar], kbd')
      if (holder && holder !== root && root.contains(holder)) return
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height || r.width > rr.width - 2) return
      boxes.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom, text: false })
    })
  return boxes
}

function measure(root: HTMLElement): Metrics {
  const r = root.getBoundingClientRect()
  const boxes = contentBoxes(root)
  if (!boxes.length) return { h: r.height, w: r.width }
  const left = boxes.reduce((a, b) => (b.left < a.left ? b : a))
  const right = boxes.reduce((a, b) => (b.right > a.right ? b : a))
  const text = boxes.find((b) => b.text)
  return {
    h: r.height,
    w: r.width,
    l: { gap: left.left - r.left, v: left.top - r.top },
    r: { gap: r.right - right.right, v: right.top - r.top },
    c: text ? { top: text.top - r.top, bottom: r.bottom - text.bottom } : undefined,
  }
}

const fmt = (n: number) => (Math.round(n * 10) / 10).toString()
const ok = (a: number, b: number) => Math.abs(a - b) <= 1

function Measure({
  children,
  expectH,
  square,
  check = 'edges',
  pick,
}: {
  children: ReactNode
  expectH?: number
  square?: boolean
  /** edges: side gap = vertical gap · shape: square only (counters) · center: cap centred (avatars) · none */
  check?: 'edges' | 'leading' | 'shape' | 'center' | 'none'
  /** CSS selector of the element to measure inside the specimen (default: its root) */
  pick?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [m, setM] = useState<Metrics | null>(null)
  useLayoutEffect(() => {
    let alive = true
    void document.fonts.ready.then(() => {
      const root = (
        pick ? ref.current?.querySelector(pick) : ref.current?.firstElementChild
      ) as HTMLElement | null
      if (alive && root) setM(measure(root))
    })
    return () => {
      alive = false
    }
  }, [pick])
  const checks: [string, boolean][] = m
    ? [
        ...(expectH ? [[`H ${fmt(m.h)}`, ok(m.h, expectH)] as [string, boolean]] : []),
        ...(square
          ? [[`□ ${fmt(m.w)}×${fmt(m.h)}`, Math.abs(m.w - m.h) <= 0.5] as [string, boolean]]
          : []),
        ...(check === 'center' && m.c
          ? [
              [`⊕ ${fmt(m.c.top)}/${fmt(m.c.bottom)}`, Math.abs(m.c.top - m.c.bottom) / 2 <= 1] as [
                string,
                boolean,
              ],
            ]
          : []),
        ...((check === 'edges' || check === 'leading') && m.l
          ? [[`L ${fmt(m.l.gap)}/${fmt(m.l.v)}`, ok(m.l.gap, m.l.v)] as [string, boolean]]
          : []),
        ...(check === 'edges' && m.r
          ? [[`R ${fmt(m.r.gap)}/${fmt(m.r.v)}`, ok(m.r.gap, m.r.v)] as [string, boolean]]
          : []),
      ]
    : []
  return (
    <div className="flex flex-col items-start gap-1.5">
      <div ref={ref} className="inline-flex">
        {children}
      </div>
      <div className="flex flex-col font-mono text-[10px] leading-3.5">
        {checks.map(([label, pass]) => (
          <span key={label} className={pass ? 'text-success' : 'text-destructive'}>
            {pass ? '✓' : '✗'} {label}
          </span>
        ))}
      </div>
    </div>
  )
}

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid grid-cols-[6rem_1fr] items-start gap-4 border-b py-4 last:border-b-0">
    <span className="pt-1.5 text-caption text-muted-foreground">{label}</span>
    <div className="flex flex-wrap items-start gap-6">{children}</div>
  </div>
)

const H = { sm: 28, md: 32, lg: 36 } as const

const meta = {
  title: 'Foundations/Optical padding',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Audit: Story = {
  render: () => (
    <Page
      title="Optical padding"
      description="Each specimen measures itself: L/R = visible side gap / vertical gap of the outermost content (cap height for text). ✓ when they match within 1px; H = height on the 28/32/36 grid; □ = square."
    >
      <Section title="Button">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Row key={size} label={`${size} · ${H[size]}px`}>
            <Measure expectH={H[size]}>
              <Button size={size}>Button</Button>
            </Measure>
            <Measure expectH={H[size]}>
              <Button size={size} variant="outline" leadingIcon="plus">
                New ticket
              </Button>
            </Measure>
            <Measure expectH={H[size]}>
              <Button size={size} variant="secondary" trailingIcon="chevron-down">
                Assign
              </Button>
            </Measure>
            <Measure expectH={H[size]}>
              <Button size={size} leadingIcon="plus" shortcut="K">
                Create
              </Button>
            </Measure>
            <Measure expectH={H[size]}>
              <Button size={size} variant="outline" loading>
                Saving
              </Button>
            </Measure>
          </Row>
        ))}
      </Section>

      <Section title="IconButton">
        {(['sm', 'md'] as const).map((size) => (
          <Row key={size} label={`${size} · ${H[size]}px`}>
            {(['ghost', 'outline', 'secondary', 'primary'] as const).map((v) => (
              <Measure key={v} expectH={H[size]} square>
                <IconButton icon="dots" label="More" size={size} variant={v} />
              </Measure>
            ))}
          </Row>
        ))}
      </Section>

      <Section title="Input · Select (same row height as Button)">
        {(['sm', 'md'] as const).map((size) => (
          <Row key={size} label={`${size} · ${H[size]}px`}>
            <Measure expectH={H[size]}>
              <Input size={size} placeholder="Placeholder" aria-label="a" wrapperClassName="w-44" />
            </Measure>
            <Measure expectH={H[size]}>
              <Input
                size={size}
                type="search"
                shortcut="/"
                placeholder="Search"
                aria-label="b"
                wrapperClassName="w-44"
              />
            </Measure>
            <Measure expectH={H[size]}>
              <Select size={size} aria-label="c" className="w-40" />
            </Measure>
            <Measure expectH={H[size]}>
              <Button size={size} variant="outline">
                Button
              </Button>
            </Measure>
            <Measure expectH={H[size]} square>
              <IconButton icon="filter" label="Filter" size={size} variant="outline" />
            </Measure>
          </Row>
        ))}
      </Section>

      <Section title="Badge · Tag · Count · Kbd">
        {(['md', 'sm'] as const).map((size) => (
          <Row key={size} label={size}>
            <Measure>
              <Badge size={size}>Badge</Badge>
            </Measure>
            <Measure>
              <Badge size={size} variant="info" icon="clock">
                2h left
              </Badge>
            </Measure>
            <Measure>
              <Badge size={size} variant="success" dot>
                Online
              </Badge>
            </Measure>
            <Measure>
              <Badge size={size} variant="outline" onRemove={() => {}}>
                billing
              </Badge>
            </Measure>
            <Measure>
              <Badge size={size} variant="outline" avatar={{ name: 'Tara Lane' }}>
                Tara Lane
              </Badge>
            </Measure>
            <Measure square check="shape">
              <Badge size={size} variant="primary" count>
                3
              </Badge>
            </Measure>
            <Measure check="shape">
              <Badge size={size} variant="primary" count>
                99+
              </Badge>
            </Measure>
          </Row>
        ))}
        <Row label="helpdesk pills">
          <Measure>
            <TicketStatusBadge status="investigating" variant="pill" />
          </Measure>
          <Measure>
            <TicketStatusBadge status="resolved" variant="pill" />
          </Measure>
          <Measure>
            <SlaBadge state="at-risk">18m left</SlaBadge>
          </Measure>
          <Measure>
            <ConditionBadge condition="needs-repair" />
          </Measure>
        </Row>
        <Row label="kbd">
          <Measure square>
            <Kbd>K</Kbd>
          </Measure>
          <Measure>
            <Kbd>Ctrl</Kbd>
          </Measure>
        </Row>
      </Section>

      <Section title="Tabs">
        {(['pill', 'underline'] as const).map((variant) => (
          <Row
            key={variant}
            label={
              variant === 'pill'
                ? 'pill'
                : 'underline — text aligns to the page edge (exception); 35 = 36 − list −1px'
            }
          >
            <Measure
              expectH={variant === 'pill' ? 28 : 35}
              check={variant === 'pill' ? 'edges' : 'none'}
            >
              <Tabs defaultValue="a">
                <TabsList variant={variant} aria-label={variant} className="contents">
                  <TabsTrigger value="a" count={8}>
                    Todo
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </Measure>
            <Measure
              expectH={variant === 'pill' ? 28 : 35}
              check={variant === 'pill' ? 'edges' : 'none'}
            >
              <Tabs defaultValue="b">
                <TabsList variant={variant} aria-label={variant} className="contents">
                  <TabsTrigger value="b" icon="inbox">
                    Inbox
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </Measure>
          </Row>
        ))}
      </Section>

      <Section title="Menu item">
        <Row label="32px">
          <Measure expectH={32}>
            <div className={menuItem} style={{ width: 220 }} data-variant="default">
              <Icon name="user" size={14} />
              <span className="flex-1">Assign to me</span>
              <span className="text-caption text-muted-foreground">I</span>
            </div>
          </Measure>
          <Measure expectH={32}>
            <div className={menuItem} style={{ width: 220 }} data-variant="default">
              <span className="flex-1">Change status</span>
              <Icon name="chevron-right" size={14} />
            </div>
          </Measure>
        </Row>
      </Section>

      <Section title="Navigation & lists">
        <Row label="sidebar item · 32px">
          <Measure expectH={32}>
            <SidebarItem label="My tickets" icon="inbox" count={8} className="w-56" />
          </Measure>
          <Measure expectH={32}>
            <SidebarItem label="Open" icon="inbox" count={31} active className="w-56" />
          </Measure>
          <Measure expectH={32} check="none">
            <SidebarItem
              level={1}
              label="Investigating"
              icon={<StatusGlyph status="investigating" label={null} />}
              count={41}
              className="w-56"
            />
          </Measure>
        </Row>
        <Row label="rail item · 36px">
          <Measure expectH={36} square>
            <RailItem icon="inbox" label="Inbox" tooltip={false} />
          </Measure>
          <Measure expectH={36} square>
            <RailItem icon="customers" label="Customers" active tooltip={false} />
          </Measure>
        </Row>
        <Row label="pagination · 28px">
          <Measure expectH={28} square pick='[aria-label="Previous page"]'>
            <Pagination appearance="inline" page={5} pageCount={120} onPageChange={() => {}} />
          </Measure>
          <Measure expectH={28} square check="shape" pick='[aria-current="page"]'>
            <Pagination appearance="inline" page={5} pageCount={120} onPageChange={() => {}} />
          </Measure>
          <Measure expectH={28} check="shape" pick='[aria-label="Page 120"]'>
            <Pagination appearance="inline" page={5} pageCount={120} onPageChange={() => {}} />
          </Measure>
        </Row>
        <Row label="list item · 2 lines (trailing chevron centred on both lines — exception)">
          <Measure check="leading">
            <ListItem
              title="Dana Whitfield"
              description="Northwind · 4 open tickets"
              leading={<Avatar name="Dana Whitfield" size="xs" />}
              className="w-80"
            />
          </Measure>
        </Row>
      </Section>

      <Section title="Avatar (standalone)">
        <Row label="scale">
          {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((s) => (
            <Measure key={s} square check="center">
              <Avatar name="Tara Lane" size={s} />
            </Measure>
          ))}
        </Row>
      </Section>
    </Page>
  ),
}
