'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, ChevronRight, ChevronLeft, Phone, Search, Loader2, Building2, AlertCircle } from 'lucide-react'
import type { CompanyResult } from '@/app/api/companies-house/route'

// ── Schemas ───────────────────────────────────────────────────────────────
const step1Schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName:  z.string().min(1, 'Last name is required'),
  email:     z.string().email('Please enter a valid email address'),
  phone:     z.string().min(10, 'Please enter a valid phone number'),
})

const step2Schema = z.object({
  businessName:   z.string().min(1, 'Business name is required'),
  companyNumber:  z.string().optional(),
  companyStatus:  z.string().optional(),
  city:           z.string().min(1, 'Town or city is required'),
  postcode:       z.string().min(5, 'Please enter a valid postcode'),
  website:        z.string().optional(),
})

const step3Schema = z.object({
  makes:         z.array(z.string()).min(1, 'Please select at least one make'),
  inventorySize: z.string().min(1, 'Please select your typical inventory size'),
  priceRange:    z.string().min(1, 'Please select your average price range'),
  termsAccepted: z.literal(true, { error: () => ({ message: 'You must accept the terms to register' }) }),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>
type Step3Data = z.infer<typeof step3Schema>
type WizardData = Step1Data & Step2Data & Step3Data

// ── Constants ─────────────────────────────────────────────────────────────
const MAKES = [
  'Audi', 'BMW', 'Citroën', 'Ferrari', 'Ford', 'Honda', 'Hyundai',
  'Jaguar', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus', 'Mazda',
  'Mercedes-Benz', 'Mini', 'Nissan', 'Peugeot', 'Porsche', 'Range Rover',
  'Renault', 'SEAT', 'Skoda', 'Tesla', 'Toyota', 'Vauxhall', 'Volkswagen',
  'Volvo', 'Other',
]

const INVENTORY_SIZES = [
  { value: '1-10',   label: '1–10 cars' },
  { value: '11-30',  label: '11–30 cars' },
  { value: '31-75',  label: '31–75 cars' },
  { value: '76-150', label: '76–150 cars' },
  { value: '150+',   label: '150+ cars' },
]

const PRICE_RANGES = [
  { value: 'under-10k', label: 'Under £10,000' },
  { value: '10k-25k',   label: '£10,000 – £25,000' },
  { value: '25k-50k',   label: '£25,000 – £50,000' },
  { value: '50k-100k',  label: '£50,000 – £100,000' },
  { value: '100k+',     label: '£100,000+' },
]

const STEPS = [
  { number: 1, label: 'Your details' },
  { number: 2, label: 'Your dealership' },
  { number: 3, label: 'Your stock' },
]

// ── Companies House search ────────────────────────────────────────────────
function CompanySearch({
  onSelect,
  onClear,
}: {
  onSelect: (company: CompanyResult) => void
  onClear: () => void
}) {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState<CompanyResult[]>([])
  const [loading, setLoading]   = useState(false)
  const [open, setOpen]         = useState(false)
  const [selected, setSelected] = useState<CompanyResult | null>(null)
  const containerRef            = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounced search
  useEffect(() => {
    if (selected || query.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res  = await fetch(`/api/companies-house?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.items ?? [])
        setOpen((data.items ?? []).length > 0)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 380)
    return () => clearTimeout(timer)
  }, [query, selected])

  function handleSelect(company: CompanyResult) {
    setSelected(company)
    setQuery(company.title)
    setOpen(false)
    onSelect(company)
  }

  function handleClear() {
    setSelected(null)
    setQuery('')
    setResults([])
    onClear()
  }

  const isActive    = selected?.company_status === 'active'
  const isDissolved = selected && !isActive

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E73] pointer-events-none" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); if (selected) handleClear() }}
          placeholder="Search company name…"
          autoComplete="off"
          className="w-full bg-[#1C1C1E] border border-[#2A2A2E] focus:border-[#C4C6CC] rounded-lg pl-10 pr-10 py-3 text-[14px] text-white placeholder-[#6E6E73] outline-none transition-colors"
        />
        {loading && (
          <Loader2 size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6E6E73] animate-spin" />
        )}
        {selected && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6E6E73] hover:text-white transition-colors text-[18px] leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <div className="bg-[#1C1C1E] border border-[#2A2A2E] rounded-lg overflow-hidden shadow-xl">
          {results.map((r, i) => (
            <button
              key={r.company_number}
              type="button"
              onClick={() => handleSelect(r)}
              className={`w-full text-left px-4 py-3 hover:bg-[#2A2A2E] transition-colors ${
                i < results.length - 1 ? 'border-b border-[#2A2A2E]' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] text-white font-medium truncate">{r.title}</p>
                  <p className="text-[11px] text-[#6E6E73] mt-0.5 truncate">{r.address_snippet}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[10px] text-[#6E6E73] font-mono">{r.company_number}</span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wide ${
                    r.company_status === 'active' ? 'text-[#C4C6CC]' : 'text-[#6E6E73]'
                  }`}>
                    {r.company_status}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected company status */}
      {selected && isActive && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#C4C6CC]/10 border border-[#C4C6CC]/25 rounded-lg">
          <Check size={13} className="text-[#C4C6CC] flex-shrink-0" />
          <p className="text-[12px] text-white">
            <span className="font-semibold">{selected.title}</span>
            <span className="text-[#6E6E73]"> — active · {selected.company_number}</span>
          </p>
        </div>
      )}

      {selected && isDissolved && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#1C1C1E] border border-[#2A2A2E] rounded-lg">
          <AlertCircle size={13} className="text-[#6E6E73] flex-shrink-0" />
          <p className="text-[12px] text-[#6E6E73]">
            <span className="text-white font-semibold">{selected.title}</span> is listed as <span className="font-semibold">{selected.company_status}</span> on Companies House — we can&apos;t verify this automatically. <span className="text-[#C4C6CC]">Contact us and we&apos;ll verify you another way.</span>
          </p>
        </div>
      )}

      {/* Sole trader escape hatch */}
      {!selected && query.length > 1 && !loading && results.length === 0 && (
        <p className="text-[12px] text-[#6E6E73] px-1">
          No results found.{' '}
          <span className="text-[#C4C6CC]">Sole trader or not registered?</span>{' '}
          Fill in your details below — we&apos;ll verify you another way.
        </p>
      )}
    </div>
  )
}

// ── Primitives ────────────────────────────────────────────────────────────
function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#6E6E73]">
        {label}
      </label>
      {children}
      {hint  && !error && <p className="text-[11px] text-[#6E6E73]">{hint}</p>}
      {error && <p className="text-[12px] text-red-400 mt-0.5">{error}</p>}
    </div>
  )
}

function TextInput({
  hasError,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  return (
    <input
      {...props}
      className={`w-full bg-[#1C1C1E] border ${
        hasError ? 'border-red-500' : 'border-[#2A2A2E] focus:border-[#C4C6CC]'
      } rounded-lg px-4 py-3 text-[14px] text-white placeholder-[#6E6E73] outline-none transition-colors`}
    />
  )
}

function ToggleChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors border ${
        selected
          ? 'bg-[#C4C6CC] text-[#0A0A0F] border-[#C4C6CC]'
          : 'bg-transparent text-[#6E6E73] border-[#2A2A2E] hover:border-[#6E6E73] hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}

function OptionCard({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg text-[13px] font-medium text-left transition-colors border ${
        selected
          ? 'bg-[#C4C6CC] text-[#0A0A0F] border-[#C4C6CC]'
          : 'bg-transparent text-[#6E6E73] border-[#2A2A2E] hover:border-[#6E6E73] hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}

// ── Step indicator ────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-start gap-0 mb-10">
      {STEPS.map((step, i) => (
        <div key={step.number} className="flex items-start">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold transition-colors ${
              current > step.number
                ? 'bg-[#C4C6CC] text-[#0A0A0F]'
                : current === step.number
                ? 'bg-[#C4C6CC] text-[#0A0A0F]'
                : 'bg-[#1C1C1E] text-[#6E6E73] border border-[#2A2A2E]'
            }`}>
              {current > step.number ? <Check size={14} /> : step.number}
            </div>
            <span className={`text-[10px] font-medium tracking-wide whitespace-nowrap ${
              current >= step.number ? 'text-[#C4C6CC]' : 'text-[#6E6E73]'
            }`}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-px w-16 sm:w-24 mx-2 mt-4 transition-colors ${
              current > step.number ? 'bg-[#C4C6CC]' : 'bg-[#2A2A2E]'
            }`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Nav buttons ───────────────────────────────────────────────────────────
function StepNav({ onBack, isFirst, isLast, submitting }: {
  onBack?: () => void
  isFirst?: boolean
  isLast?: boolean
  submitting?: boolean
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      {!isFirst && onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-medium text-[#6E6E73] hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </button>
      ) : <div />}
      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 bg-[#C4C6CC] hover:bg-[#A8AAB0] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0A0F] text-[14px] font-semibold px-6 py-3 rounded-lg transition-colors"
      >
        {submitting ? 'Submitting…' : isLast ? 'Register my dealership' : 'Continue'}
        {!submitting && <ChevronRight size={16} />}
      </button>
    </div>
  )
}

// ── Success screen ────────────────────────────────────────────────────────
function SuccessScreen({ data }: { data: WizardData }) {
  const isVerified = data.companyStatus === 'active'

  return (
    <div className="max-w-lg mx-auto px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[#C4C6CC] flex items-center justify-center mx-auto mb-6">
        {isVerified ? <Check className="text-[#0A0A0F]" size={28} /> : <Building2 className="text-[#0A0A0F]" size={28} />}
      </div>
      <h1 className="text-[32px] font-light text-white tracking-tight mb-3">
        You&apos;re registered, {data.firstName}.
      </h1>

      {isVerified ? (
        <p className="text-[16px] text-[#6E6E73] leading-relaxed mb-10">
          <span className="text-white font-medium">{data.businessName}</span> verified via Companies House.
          Your listings will go live as soon as you add your inventory.
        </p>
      ) : (
        <p className="text-[16px] text-[#6E6E73] leading-relaxed mb-10">
          {data.businessName} is registered. We&apos;ll call you on{' '}
          <span className="text-white">{data.phone}</span> within one working day to verify your details
          and get your first listings live.
        </p>
      )}

      <div className="bg-[#111113] border border-[#1C1C1E] rounded-xl p-6 text-left space-y-5 mb-8">
        {(isVerified
          ? [
              { title: 'Add your inventory', body: 'Head to your dealer dashboard to add your first cars. Your listings go live immediately.' },
              { title: 'Buyers start calling you', body: 'Every enquiry routes straight to your phone. No platform inbox, no delays.' },
              { title: 'Grow your presence', body: 'Add your logo, dealership description, and opening hours to complete your profile.' },
            ]
          : [
              { title: 'We verify your dealership', body: 'A quick call to confirm your details before your listings go live.' },
              { title: 'Your inventory goes live', body: 'We add your first batch of cars together — no fiddly upload portals.' },
              { title: 'Buyers start calling you', body: 'Every enquiry routes straight to your phone. No platform inbox, no delays.' },
            ]
        ).map((item, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-6 h-6 rounded-full bg-[#C4C6CC] text-[#0A0A0F] flex items-center justify-center flex-shrink-0 text-[11px] font-bold mt-0.5">
              {i + 1}
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white mb-0.5">{item.title}</p>
              <p className="text-[13px] text-[#6E6E73] leading-relaxed">{item.body}</p>
            </div>
          </div>
        ))}
      </div>

      {isVerified && (
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-[#C4C6CC] hover:bg-[#A8AAB0] text-[#0A0A0F] text-[14px] font-semibold px-6 py-3 rounded-lg transition-colors mb-6"
        >
          Go to my dashboard <ChevronRight size={16} />
        </a>
      )}

      <div className="flex items-center justify-center gap-2 text-[13px] text-[#6E6E73]">
        <Phone size={14} />
        <span>Confirmation sent to <span className="text-white">{data.email}</span></span>
      </div>
    </div>
  )
}

// ── Wizard ────────────────────────────────────────────────────────────────
export function DealerWizard({ initialPlan }: { initialPlan?: 'solo' | 'pro' }) {
  const [step, setStep]               = useState(1)
  const [data, setData]               = useState<Partial<WizardData>>({})
  const [submitting, setSubmitting]   = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [done, setDone]               = useState(false)
  const [isSoleTrader, setIsSoleTrader] = useState(false)
  const [plan, setPlan]               = useState<'solo' | 'pro'>(initialPlan ?? 'solo')

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      firstName: data.firstName ?? '',
      lastName:  data.lastName  ?? '',
      email:     data.email     ?? '',
      phone:     data.phone     ?? '',
    },
  })

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      businessName:  data.businessName  ?? '',
      companyNumber: data.companyNumber ?? '',
      companyStatus: data.companyStatus ?? '',
      city:          data.city          ?? '',
      postcode:      data.postcode      ?? '',
      website:       data.website       ?? '',
    },
  })

  const form3 = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      makes:         data.makes         ?? [],
      inventorySize: data.inventorySize ?? '',
      priceRange:    data.priceRange    ?? '',
      termsAccepted: false as unknown as true,
    },
  })

  const onStep1 = form1.handleSubmit((values) => {
    setData(prev => ({ ...prev, ...values }))
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  const onStep2 = form2.handleSubmit((values) => {
    // Block dissolved companies from proceeding
    if (values.companyStatus && values.companyStatus !== 'active') {
      form2.setError('businessName', { message: 'This company is not active on Companies House. Please contact us.' })
      return
    }
    setData(prev => ({ ...prev, ...values }))
    setStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  const onStep3 = form3.handleSubmit(async (values) => {
    const final = { ...data, ...values } as WizardData
    setData(final)
    setSubmitting(true)
    setSubmitError(null)

    const verifiedVia = isSoleTrader
      ? 'Stripe Identity (pending)'
      : final.companyStatus === 'active'
        ? 'Companies House (auto)'
        : 'Manual review required'

    try {
      const res = await fetch('/api/dealers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...final, isSoleTrader, verifiedVia, plan }),
      })

      if (!res.ok) {
        const err = await res.json()
        setSubmitError(err.error ?? 'Registration failed. Please try again.')
        return
      }

      // Sole trader → redirect to Stripe Identity
      if (isSoleTrader) {
        const idRes = await fetch('/api/stripe/identity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: final.email,
            name:  `${final.firstName} ${final.lastName}`,
          }),
        })
        if (idRes.ok) {
          const { url } = await idRes.json() as { url: string }
          window.location.href = url
          return
        }
      }

      setDone(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setSubmitError('Connection error. Please check your internet and try again.')
    } finally {
      setSubmitting(false)
    }
  })

  if (done) return <SuccessScreen data={data as WizardData} />

  return (
    <div className="max-w-lg mx-auto px-4">
      <div className="mb-8">
        <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#C4C6CC] mb-3">
          Dealer registration
        </p>
        <h1 className="text-[28px] sm:text-[36px] font-light text-white tracking-tight leading-tight">
          List your inventory.<br />
          <span className="text-[#6E6E73]">It costs nothing.</span>
        </h1>
      </div>

      <StepIndicator current={step} />

      <div className="bg-[#111113] border border-[#1C1C1E] rounded-xl p-6 sm:p-8">

        {/* Step 1 — Contact details */}
        {step === 1 && (
          <form onSubmit={onStep1} className="flex flex-col gap-5">

            {/* Plan selector */}
            <div className="pb-5 border-b border-[#1C1C1E]">
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#6E6E73] mb-2">Your plan</p>
              <div className="flex gap-2 p-1 bg-[#1C1C1E] rounded-lg">
                <button
                  type="button"
                  onClick={() => setPlan('solo')}
                  className={`flex-1 py-2 rounded-md text-[12px] font-semibold transition-colors ${
                    plan === 'solo' ? 'bg-[#C4C6CC] text-[#0A0A0F]' : 'text-[#6E6E73] hover:text-white'
                  }`}
                >
                  Solo — £55/mo
                </button>
                <button
                  type="button"
                  onClick={() => setPlan('pro')}
                  className={`flex-1 py-2 rounded-md text-[12px] font-semibold transition-colors ${
                    plan === 'pro' ? 'bg-[#C4C6CC] text-[#0A0A0F]' : 'text-[#6E6E73] hover:text-white'
                  }`}
                >
                  Pro — £132/mo
                </button>
              </div>
              <p className="text-[11px] text-[#6E6E73] mt-2 px-1">
                No payment required now. You won&apos;t be charged until you&apos;ve had 3 real buyer enquiries — and after that, only in months we send you one.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" error={form1.formState.errors.firstName?.message}>
                <TextInput {...form1.register('firstName')} placeholder="John" hasError={!!form1.formState.errors.firstName} />
              </Field>
              <Field label="Last name" error={form1.formState.errors.lastName?.message}>
                <TextInput {...form1.register('lastName')} placeholder="Smith" hasError={!!form1.formState.errors.lastName} />
              </Field>
            </div>
            <Field label="Email address" error={form1.formState.errors.email?.message}>
              <TextInput {...form1.register('email')} type="email" placeholder="john@smithmotors.co.uk" hasError={!!form1.formState.errors.email} />
            </Field>
            <Field label="Mobile number" error={form1.formState.errors.phone?.message}>
              <TextInput {...form1.register('phone')} type="tel" placeholder="07700 900000" hasError={!!form1.formState.errors.phone} />
            </Field>
            <StepNav isFirst />
          </form>
        )}

        {/* Step 2 — Dealership */}
        {step === 2 && (
          <form onSubmit={onStep2} className="flex flex-col gap-5">

            {/* Business type toggle */}
            <div className="flex gap-2 p-1 bg-[#1C1C1E] rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setIsSoleTrader(false)
                  form2.setValue('companyNumber', '')
                  form2.setValue('companyStatus', '')
                }}
                className={`flex-1 py-2 rounded-md text-[12px] font-semibold transition-colors ${
                  !isSoleTrader
                    ? 'bg-[#C4C6CC] text-[#0A0A0F]'
                    : 'text-[#6E6E73] hover:text-white'
                }`}
              >
                Limited company
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSoleTrader(true)
                  form2.setValue('companyNumber', '')
                  form2.setValue('companyStatus', '')
                }}
                className={`flex-1 py-2 rounded-md text-[12px] font-semibold transition-colors ${
                  isSoleTrader
                    ? 'bg-[#C4C6CC] text-[#0A0A0F]'
                    : 'text-[#6E6E73] hover:text-white'
                }`}
              >
                Sole trader
              </button>
            </div>

            {/* Ltd path: Companies House search */}
            {!isSoleTrader && (
              <Field
                label="Find your business"
                hint="Search Companies House to verify your dealership automatically."
                error={form2.formState.errors.businessName?.message}
              >
                <CompanySearch
                  onSelect={(company) => {
                    form2.setValue('businessName',   company.title,          { shouldValidate: true })
                    form2.setValue('companyNumber',  company.company_number, { shouldValidate: true })
                    form2.setValue('companyStatus',  company.company_status, { shouldValidate: true })
                  }}
                  onClear={() => {
                    form2.setValue('companyNumber', '')
                    form2.setValue('companyStatus', '')
                  }}
                />
              </Field>
            )}

            {/* Business / trading name */}
            <Field
              label={isSoleTrader ? 'Trading name' : 'Business name'}
              error={form2.formState.errors.businessName?.message}
            >
              <TextInput
                {...form2.register('businessName')}
                placeholder={isSoleTrader ? 'e.g. Smith Car Sales' : 'Smith Motors Ltd'}
                hasError={!!form2.formState.errors.businessName}
              />
            </Field>

            {/* Sole trader: ID verification notice */}
            {isSoleTrader && (
              <div className="flex items-start gap-3 bg-[#C4C6CC]/8 border border-[#C4C6CC]/20 rounded-lg px-4 py-3">
                <div className="w-5 h-5 rounded-full bg-[#C4C6CC]/15 border border-[#C4C6CC]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] text-[#C4C6CC] font-bold">i</span>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-white mb-0.5">ID verification required</p>
                  <p className="text-[12px] text-[#6E6E73] leading-relaxed">
                    After registration, we&apos;ll verify your identity with a government-issued ID (passport or driving licence) and a quick selfie. Takes under 2 minutes.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field label="Town / city" error={form2.formState.errors.city?.message}>
                <TextInput {...form2.register('city')} placeholder="Birmingham" hasError={!!form2.formState.errors.city} />
              </Field>
              <Field label="Postcode" error={form2.formState.errors.postcode?.message}>
                <TextInput {...form2.register('postcode')} placeholder="B1 1AA" hasError={!!form2.formState.errors.postcode} />
              </Field>
            </div>

            <Field label="Website (optional)">
              <TextInput {...form2.register('website')} placeholder="www.smithmotors.co.uk" />
            </Field>

            <StepNav onBack={() => setStep(1)} />
          </form>
        )}

        {/* Step 3 — Stock profile */}
        {step === 3 && (
          <form onSubmit={onStep3} className="flex flex-col gap-6">
            <div>
              <label className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#6E6E73] mb-3 block">
                Makes you typically stock
              </label>
              <div className="flex flex-wrap gap-2">
                {MAKES.map(make => (
                  <ToggleChip
                    key={make}
                    label={make}
                    selected={form3.watch('makes').includes(make)}
                    onClick={() => {
                      const current = form3.getValues('makes')
                      const next    = current.includes(make)
                        ? current.filter(m => m !== make)
                        : [...current, make]
                      form3.setValue('makes', next, { shouldValidate: true })
                    }}
                  />
                ))}
              </div>
              {form3.formState.errors.makes && (
                <p className="text-[12px] text-red-400 mt-2">{form3.formState.errors.makes.message}</p>
              )}
            </div>

            <Field label="Typical inventory size" error={form3.formState.errors.inventorySize?.message}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INVENTORY_SIZES.map(opt => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={form3.watch('inventorySize') === opt.value}
                    onClick={() => form3.setValue('inventorySize', opt.value, { shouldValidate: true })}
                  />
                ))}
              </div>
            </Field>

            <Field label="Average price range" error={form3.formState.errors.priceRange?.message}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRICE_RANGES.map(opt => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={form3.watch('priceRange') === opt.value}
                    onClick={() => form3.setValue('priceRange', opt.value, { shouldValidate: true })}
                  />
                ))}
              </div>
            </Field>

            <div className="border border-[#2A2A2E] rounded-lg p-4 flex flex-col gap-3">
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#6E6E73]">Founding commitments — binding at signup</p>
              <ul className="flex flex-col gap-1.5">
                {[
                  'Enquiry Ownership — every enquiry goes directly to you. We never intercept or monetise your enquiries.',
                  'Search Integrity — organic results are ordered by relevance and recency only. No dealer can pay to rank above another.',
                  'Exit With Your Data — your data belongs to you. Full export available at any time. Leaving costs nothing.',
                ].map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-[#6E6E73]">
                    <span className="text-[#C4C6CC] mt-0.5 flex-shrink-0">—</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <label className="flex items-start gap-3 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  className="mt-0.5 flex-shrink-0 accent-[#C4C6CC]"
                  {...form3.register('termsAccepted')}
                />
                <span className="text-[13px] text-[#6E6E73]">
                  I agree to the{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#C4C6CC] underline underline-offset-2">
                    Kerb Terms of Service
                  </a>
                  , including the three founding commitments above.
                </span>
              </label>
              {form3.formState.errors.termsAccepted && (
                <p className="text-[12px] text-red-400">{form3.formState.errors.termsAccepted.message}</p>
              )}
            </div>

            {submitError && (
              <p className="text-[13px] text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {submitError}
              </p>
            )}

            <StepNav onBack={() => setStep(2)} isLast submitting={submitting} />
          </form>
        )}
      </div>

      <p className="text-center text-[12px] text-[#6E6E73] mt-6">
        No payment required. No commitment. A real person will call you within one working day.
      </p>
    </div>
  )
}
