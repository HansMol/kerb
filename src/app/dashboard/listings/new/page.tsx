'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  ImageIcon,
  ChevronRight,
  Plus,
  Pencil,
  Sparkles,
  X,
  Loader2,
} from 'lucide-react'

// ── Constants (as const for z.enum compatibility) ────────────────────────────
const MAKES = [
  'Audi', 'BMW', 'Citroën', 'Ferrari', 'Ford', 'Honda', 'Hyundai',
  'Jaguar', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus', 'Mazda',
  'Mercedes-Benz', 'Mini', 'Nissan', 'Peugeot', 'Porsche', 'Range Rover',
  'Renault', 'SEAT', 'Skoda', 'Tesla', 'Toyota', 'Vauxhall', 'Volkswagen',
  'Volvo', 'Other',
] as const

const BODY_TYPES = ['Hatchback', 'Saloon', 'Estate', 'SUV', 'Coupe', 'Convertible', 'MPV', 'Van', 'Pickup'] as const
const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Plug-in Hybrid', 'Electric', 'LPG'] as const
const DOORS      = ['2', '3', '4', '5'] as const
const DOOR_OPTS  = [{ value: '2', label: '2 doors' }, { value: '3', label: '3 doors' }, { value: '4', label: '4 doors' }, { value: '5', label: '5 doors' }]

// ── Description builder constants ────────────────────────────────────────────
const FEATURES_LIST = [
  'Leather seats', 'Heated front seats', 'Heated rear seats', 'Sunroof',
  'Panoramic roof', 'Built-in sat nav', 'Rear camera', 'Parking sensors',
  'Blind spot monitoring', 'Cruise control', 'Adaptive cruise control',
  'Alloy wheels', 'Apple CarPlay', 'Android Auto', 'Bluetooth', 'DAB radio',
  'Keyless entry', 'Push-button start', 'Towbar', 'Third row seating', 'Lane assist',
] as const

const SERVICE_HISTORY_OPTS = [
  { value: 'Full main dealer',  label: 'Full main dealer' },
  { value: 'Full independent',  label: 'Full independent' },
  { value: 'Partial',           label: 'Partial' },
  { value: 'None',              label: 'None' },
  { value: 'Not known',         label: 'Not known' },
]

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

type DescBuilderState = {
  condition:      string
  serviceHistory: string
  owners:         string
  features:       string[]
  motMonth:       string
  motYear:        string
  recentWork:     string
  issues:         string
}

const DESC_BUILDER_DEFAULT: DescBuilderState = {
  condition: '', serviceHistory: '', owners: '', features: [],
  motMonth: '', motYear: '', recentWork: '', issues: '',
}

function buildDescription(
  s: DescBuilderState,
  make: string,
  model: string,
  year: number | undefined,
  colour: string,
): string {
  const parts: string[] = []
  const vehicleRef = [year, make, model].filter(Boolean).join(' ') || 'This vehicle'
  const colourPart    = colour ? ` in ${colour}` : ''
  const conditionPart = s.condition ? ` presents in ${s.condition.toLowerCase()} condition` : ''
  parts.push(`This ${vehicleRef}${colourPart}${conditionPart}.`)

  const historyMap: Record<string, string> = {
    'Full main dealer': 'full main dealer service history',
    'Full independent': 'full independent service history',
    'Partial':          'partial service history',
    'None':             'no service history',
    'Not known':        '',
  }
  const historyStr = s.serviceHistory ? historyMap[s.serviceHistory] : ''
  const ownerStr   = s.owners === '1' ? 'One previous owner' : s.owners ? `${s.owners} previous owners` : ''
  if (ownerStr && historyStr) {
    parts.push(`${ownerStr} with ${historyStr}.`)
  } else if (ownerStr) {
    parts.push(`${ownerStr}.`)
  } else if (historyStr) {
    parts.push(`Comes with ${historyStr}.`)
  }

  if (s.features.length > 0) {
    const list = s.features.length === 1
      ? s.features[0]
      : s.features.slice(0, -1).join(', ') + ' and ' + s.features[s.features.length - 1]
    parts.push(`Specification includes ${list}.`)
  }

  if (s.motMonth && s.motYear) {
    parts.push(`MOT valid until ${s.motMonth} ${s.motYear}.`)
  }

  if (s.recentWork.trim()) {
    const w = s.recentWork.trim()
    parts.push(w.endsWith('.') ? w : w + '.')
  }

  if (s.issues.trim()) {
    const i = s.issues.trim()
    parts.push(`Please note: ${i.endsWith('.') ? i : i + '.'}`)
  }

  return parts.join(' ')
}

// ── Description builder component ────────────────────────────────────────────
function DescriptionBuilder({
  onUse,
  make,
  model,
  year,
  colour,
  hasError,
}: {
  onUse:    (text: string) => void
  make:     string
  model:    string
  year:     number | undefined
  colour:   string
  hasError: boolean
}) {
  const [mode,    setMode]    = useState<'write' | 'builder'>('write')
  const [state,   setState]   = useState<DescBuilderState>(DESC_BUILDER_DEFAULT)
  const [preview, setPreview] = useState<string | null>(null)
  const [manual,  setManual]  = useState('')

  function toggleFeature(f: string) {
    setState(prev => ({
      ...prev,
      features: prev.features.includes(f)
        ? prev.features.filter(x => x !== f)
        : [...prev.features, f],
    }))
  }

  function generate() {
    const text = buildDescription(state, make, model, year, colour)
    setPreview(text)
  }

  function useGenerated() {
    if (preview) {
      setManual(preview)
      onUse(preview)
      setMode('write')
      setPreview(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setMode('write'); setPreview(null) }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold border transition-colors ${
            mode === 'write'
              ? 'bg-[#0A0A0F] text-white border-[#0A0A0F]'
              : 'bg-white text-[#6E6E73] border-[#E5E5E7] hover:border-[#C4C6CC]'
          }`}
        >
          <Pencil size={12} />
          Write my own
        </button>
        <button
          type="button"
          onClick={() => setMode('builder')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold border transition-colors ${
            mode === 'builder'
              ? 'bg-[#0A0A0F] text-white border-[#0A0A0F]'
              : 'bg-white text-[#6E6E73] border-[#E5E5E7] hover:border-[#C4C6CC]'
          }`}
        >
          <Sparkles size={12} />
          Description builder
        </button>
      </div>

      {/* Write my own */}
      {mode === 'write' && (
        <textarea
          value={manual}
          onChange={e => { setManual(e.target.value); onUse(e.target.value) }}
          rows={5}
          placeholder="Describe the vehicle's condition, service history, any extras or modifications, reason for sale…"
          className={`w-full bg-white border ${
            hasError ? 'border-red-400 focus:border-red-400' : 'border-[#E5E5E7] focus:border-[#0A0A0F]'
          } rounded-lg px-4 py-3 text-[14px] text-[#0A0A0F] placeholder-[#C4C6CC] outline-none transition-colors resize-none`}
        />
      )}

      {/* Builder questions */}
      {mode === 'builder' && !preview && (
        <div className="bg-[#F8F8FA] border border-[#E5E5E7] rounded-xl p-5 space-y-5">

          {/* Condition */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6E6E73] mb-2">Overall condition</p>
            <div className="flex gap-2">
              {['Excellent', 'Good', 'Fair'].map(c => (
                <button
                  key={c} type="button"
                  onClick={() => setState(p => ({ ...p, condition: p.condition === c ? '' : c }))}
                  className={`px-3.5 py-2 rounded-lg text-[12px] font-medium border transition-colors ${
                    state.condition === c
                      ? 'bg-[#0A0A0F] text-white border-[#0A0A0F]'
                      : 'bg-white text-[#6E6E73] border-[#E5E5E7] hover:border-[#C4C6CC]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Service history */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6E6E73] mb-2">Service history</p>
            <div className="flex flex-wrap gap-2">
              {SERVICE_HISTORY_OPTS.map(o => (
                <button
                  key={o.value} type="button"
                  onClick={() => setState(p => ({ ...p, serviceHistory: p.serviceHistory === o.value ? '' : o.value }))}
                  className={`px-3.5 py-2 rounded-lg text-[12px] font-medium border transition-colors ${
                    state.serviceHistory === o.value
                      ? 'bg-[#0A0A0F] text-white border-[#0A0A0F]'
                      : 'bg-white text-[#6E6E73] border-[#E5E5E7] hover:border-[#C4C6CC]'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Previous owners */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6E6E73] mb-2">Previous owners</p>
            <div className="flex gap-2">
              {['1', '2', '3', '4+'].map(n => (
                <button
                  key={n} type="button"
                  onClick={() => setState(p => ({ ...p, owners: p.owners === n ? '' : n }))}
                  className={`px-3.5 py-2 rounded-lg text-[12px] font-medium border transition-colors ${
                    state.owners === n
                      ? 'bg-[#0A0A0F] text-white border-[#0A0A0F]'
                      : 'bg-white text-[#6E6E73] border-[#E5E5E7] hover:border-[#C4C6CC]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Key features */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6E6E73] mb-2">Key features / spec</p>
            <div className="flex flex-wrap gap-2">
              {FEATURES_LIST.map(f => (
                <button
                  key={f} type="button"
                  onClick={() => toggleFeature(f)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium border transition-colors ${
                    state.features.includes(f)
                      ? 'bg-[#0A0A0F] text-white border-[#0A0A0F]'
                      : 'bg-white text-[#6E6E73] border-[#E5E5E7] hover:border-[#C4C6CC]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* MOT */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6E6E73] mb-2">MOT valid until (optional)</p>
            <div className="flex gap-2">
              <select
                value={state.motMonth}
                onChange={e => setState(p => ({ ...p, motMonth: e.target.value }))}
                className="flex-1 bg-white border border-[#E5E5E7] focus:border-[#0A0A0F] rounded-lg px-3 py-2 text-[13px] text-[#0A0A0F] outline-none appearance-none"
              >
                <option value="">Month</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input
                type="number"
                value={state.motYear}
                onChange={e => setState(p => ({ ...p, motYear: e.target.value }))}
                placeholder="2027"
                className="w-24 bg-white border border-[#E5E5E7] focus:border-[#0A0A0F] rounded-lg px-3 py-2 text-[13px] text-[#0A0A0F] outline-none"
              />
            </div>
          </div>

          {/* Recent work */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6E6E73] mb-2">Recent work (optional)</p>
            <textarea
              value={state.recentWork}
              onChange={e => setState(p => ({ ...p, recentWork: e.target.value }))}
              rows={2}
              placeholder="e.g. Fresh service and new tyres fitted June 2026"
              className="w-full bg-white border border-[#E5E5E7] focus:border-[#0A0A0F] rounded-lg px-4 py-2.5 text-[13px] text-[#0A0A0F] placeholder-[#C4C6CC] outline-none resize-none"
            />
          </div>

          {/* Issues */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6E6E73] mb-2">Any damage or issues to disclose? (optional)</p>
            <textarea
              value={state.issues}
              onChange={e => setState(p => ({ ...p, issues: e.target.value }))}
              rows={2}
              placeholder="e.g. Minor scuff to rear bumper, priced to reflect"
              className="w-full bg-white border border-[#E5E5E7] focus:border-[#0A0A0F] rounded-lg px-4 py-2.5 text-[13px] text-[#0A0A0F] placeholder-[#C4C6CC] outline-none resize-none"
            />
          </div>

          <button
            type="button"
            onClick={generate}
            className="w-full flex items-center justify-center gap-2 bg-[#0A0A0F] hover:bg-[#1C1C1E] text-white text-[13px] font-semibold py-2.5 rounded-lg transition-colors"
          >
            <Sparkles size={14} />
            Build description
          </button>
        </div>
      )}

      {/* Preview */}
      {mode === 'builder' && preview && (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6E6E73]">Generated description</p>
          <div className="bg-[#F8F8FA] border border-[#E5E5E7] rounded-xl p-4">
            <p className="text-[14px] text-[#0A0A0F] leading-relaxed">{preview}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={useGenerated}
              className="flex-1 bg-[#0A0A0F] hover:bg-[#1C1C1E] text-white text-[13px] font-semibold py-2.5 rounded-lg transition-colors"
            >
              Use this description
            </button>
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="px-4 py-2.5 border border-[#E5E5E7] text-[#6E6E73] text-[13px] font-medium rounded-lg hover:border-[#C4C6CC] transition-colors"
            >
              Edit answers
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Schema ───────────────────────────────────────────────────────────────────
const listingSchema = z.object({
  make:         z.enum(MAKES, { error: 'Select a make' }),
  model:        z.string().min(1, 'Model is required'),
  year:         z.number({ error: 'Enter a valid year' })
                  .min(1990, 'Year must be 1990 or later')
                  .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  mileage:      z.number({ error: 'Enter a valid mileage' }).min(0),
  colour:       z.string().min(1, 'Colour is required'),
  bodyType:     z.enum(BODY_TYPES, { error: 'Select a body type' }),
  doors:        z.enum(DOORS, { error: 'Select number of doors' }),
  fuelType:     z.enum(FUEL_TYPES, { error: 'Select a fuel type' }),
  transmission: z.enum(['Manual', 'Automatic'] as const, { error: 'Select transmission' }),
  engineSize:   z.string().optional(),
  variant:      z.string().optional(),
  price:        z.number({ error: 'Enter a valid price' }).min(500, 'Price must be at least £500'),
  status:       z.enum(['draft', 'live'] as const),
  description:  z.string().min(20, 'Please write at least 20 characters'),
})

type ListingFormData = z.infer<typeof listingSchema>

// ── Primitives ────────────────────────────────────────────────────────────────
function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold tracking-[0.08em] uppercase text-[#6E6E73]">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint  && !error && <p className="text-[11px] text-[#6E6E73]">{hint}</p>}
      {error && <p className="text-[12px] text-red-500 mt-0.5">{error}</p>}
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
      className={`w-full bg-white border ${
        hasError ? 'border-red-400 focus:border-red-400' : 'border-[#E5E5E7] focus:border-[#0A0A0F]'
      } rounded-lg px-4 py-2.5 text-[14px] text-[#0A0A0F] placeholder-[#C4C6CC] outline-none transition-colors`}
    />
  )
}

function SelectInput({
  hasError,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }) {
  return (
    <select
      {...props}
      className={`w-full bg-white border ${
        hasError ? 'border-red-400' : 'border-[#E5E5E7] focus:border-[#0A0A0F]'
      } rounded-lg px-4 py-2.5 text-[14px] text-[#0A0A0F] outline-none transition-colors appearance-none`}
    >
      {children}
    </select>
  )
}

function ToggleChip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors border ${
        selected
          ? 'bg-[#0A0A0F] text-white border-[#0A0A0F]'
          : 'bg-white text-[#6E6E73] border-[#E5E5E7] hover:border-[#C4C6CC] hover:text-[#0A0A0F]'
      }`}
    >
      {label}
    </button>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-[#E5E5E7] pb-3 mb-6">
      <h2 className="text-[15px] font-semibold text-[#0A0A0F]">{children}</h2>
    </div>
  )
}

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({ data }: { data: ListingFormData }) {
  return (
    <div className="bg-[#F8F8FA] min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <Check size={24} className="text-green-600" />
        </div>
        <h1 className="text-[28px] font-light text-[#0A0A0F] tracking-tight mb-3">
          {data.status === 'live' ? 'Listing published.' : 'Listing saved as draft.'}
        </h1>
        <p className="text-[15px] text-[#6E6E73] mb-10">
          {data.year} {data.make} {data.model} — {data.status === 'live'
            ? 'Your listing is now live and visible to buyers.'
            : 'Save it as a draft for now — you can publish it from your dashboard.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-[#0A0A0F] hover:bg-[#1C1C1E] text-white text-[14px] font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Back to dashboard <ChevronRight size={16} />
          </Link>
          {data.status === 'live' && (
            <Link
              href="/dashboard/listings/new"
              className="inline-flex items-center justify-center gap-2 bg-white border border-[#E5E5E7] text-[#0A0A0F] text-[14px] font-semibold px-6 py-3 rounded-lg transition-colors hover:border-[#C4C6CC]"
            >
              Add another listing
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function NewListingPage() {
  const [done, setDone]                     = useState(false)
  const [submitted, setSubmitted]           = useState<ListingFormData | null>(null)
  const [saving, setSaving]                 = useState(false)
  const [saveError, setSaveError]           = useState<string | null>(null)
  const [photos, setPhotos]                 = useState<string[]>([])
  const [uploadingSlots, setUploadingSlots] = useState<Set<number>>(new Set())
  const [coverDragOver, setCoverDragOver]   = useState(false)
  const submitIntent                        = useRef<'draft' | 'live'>('draft')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      status:       'draft',
      transmission: 'Manual',
    },
  })

  const watchedBodyType = watch('bodyType')
  const watchedFuel     = watch('fuelType')
  const watchedDoors    = watch('doors')
  const watchedStatus   = watch('status')

  async function uploadPhoto(file: File, slotIndex: number) {
    setUploadingSlots(prev => new Set([...prev, slotIndex]))
    try {
      const res = await fetch('/api/listings/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      })
      if (!res.ok) throw new Error('Upload URL failed')
      const { signedUrl, publicUrl } = await res.json() as { signedUrl: string; publicUrl: string }
      await fetch(signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      setPhotos(prev => { const next = [...prev]; next[slotIndex] = publicUrl; return next })
    } catch {
      setSaveError('Photo upload failed — please try again.')
    } finally {
      setUploadingSlots(prev => { const s = new Set(prev); s.delete(slotIndex); return s })
    }
  }

  function removePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  function handleFiles(files: FileList | File[], startSlot: number) {
    const arr = Array.from(files).slice(0, 20 - startSlot)
    arr.forEach((file, i) => uploadPhoto(file, startSlot + i))
  }

  async function onSubmit(data: ListingFormData) {
    setSaving(true)
    setSaveError(null)
    const status = submitIntent.current
    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, status, photos }),
    })
    if (res.ok) {
      setSubmitted({ ...data, status })
      setDone(true)
    } else {
      const json = await res.json().catch(() => ({}))
      setSaveError(json.error || 'Something went wrong. Please try again.')
    }
    setSaving(false)
  }

  if (done && submitted) return <SuccessScreen data={submitted} />

  return (
    <div className="bg-[#F8F8FA] min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6E6E73] hover:text-[#0A0A0F] transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          Back to dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-[28px] font-light text-[#0A0A0F] tracking-tight">Add a listing</h1>
          <p className="text-[14px] text-[#6E6E73] mt-1">Fill in the details below. You can save as a draft and publish later.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit, (errs) => {
          const fields = Object.keys(errs).join(', ')
          setSaveError(`Please fix the following fields: ${fields}`)
        })} className="space-y-8">

          {/* ── Section 1: Vehicle details ─────────────────────────────── */}
          <div className="bg-white border border-[#E5E5E7] rounded-xl p-6">
            <SectionHeader>Vehicle details</SectionHeader>
            <div className="space-y-5">

              <div className="grid grid-cols-2 gap-4">
                <Field label="Make" required error={errors.make?.message}>
                  <SelectInput {...register('make')} hasError={!!errors.make}>
                    <option value="">Select make…</option>
                    {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                  </SelectInput>
                </Field>
                <Field label="Model" required error={errors.model?.message}>
                  <TextInput
                    {...register('model')}
                    placeholder="e.g. 320i M Sport"
                    hasError={!!errors.model}
                  />
                </Field>
              </div>

              <Field label="Variant" hint="Optional — e.g. 997, E46, W204, S-Line. Helps buyers identify the exact generation or trim.">
                <TextInput
                  {...register('variant')}
                  placeholder="e.g. 997"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Year" required error={errors.year?.message}>
                  <TextInput
                    {...register('year', { valueAsNumber: true })}
                    type="number"
                    placeholder="e.g. 2021"
                    hasError={!!errors.year}
                  />
                </Field>
                <Field label="Mileage" required error={errors.mileage?.message}>
                  <TextInput
                    {...register('mileage', { valueAsNumber: true })}
                    type="number"
                    placeholder="e.g. 34200"
                    hasError={!!errors.mileage}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Colour" required error={errors.colour?.message}>
                  <TextInput
                    {...register('colour')}
                    placeholder="e.g. Mineral White"
                    hasError={!!errors.colour}
                  />
                </Field>
                <Field label="Engine size" hint="Optional — e.g. 2.0L, 3.0T">
                  <TextInput
                    {...register('engineSize')}
                    placeholder="e.g. 2.0L"
                  />
                </Field>
              </div>

              <Field label="Body type" required error={errors.bodyType?.message}>
                <div className="flex flex-wrap gap-2">
                  {BODY_TYPES.map(bt => (
                    <ToggleChip
                      key={bt}
                      label={bt}
                      selected={watchedBodyType === bt}
                      onClick={() => setValue('bodyType', bt as ListingFormData['bodyType'], { shouldValidate: true })}
                    />
                  ))}
                </div>
                {errors.bodyType && <p className="text-[12px] text-red-500 mt-1">{errors.bodyType.message}</p>}
              </Field>

              <Field label="Doors" required error={errors.doors?.message}>
                <div className="flex gap-2">
                  {DOOR_OPTS.map(d => (
                    <ToggleChip
                      key={d.value}
                      label={d.label}
                      selected={watchedDoors === d.value}
                      onClick={() => setValue('doors', d.value as ListingFormData['doors'], { shouldValidate: true })}
                    />
                  ))}
                </div>
                {errors.doors && <p className="text-[12px] text-red-500 mt-1">{errors.doors.message}</p>}
              </Field>

            </div>
          </div>

          {/* ── Section 2: Engine & drivetrain ────────────────────────── */}
          <div className="bg-white border border-[#E5E5E7] rounded-xl p-6">
            <SectionHeader>Engine &amp; drivetrain</SectionHeader>
            <div className="space-y-5">

              <Field label="Fuel type" required error={errors.fuelType?.message}>
                <div className="flex flex-wrap gap-2">
                  {FUEL_TYPES.map(ft => (
                    <ToggleChip
                      key={ft}
                      label={ft}
                      selected={watchedFuel === ft}
                      onClick={() => setValue('fuelType', ft as ListingFormData['fuelType'], { shouldValidate: true })}
                    />
                  ))}
                </div>
                {errors.fuelType && <p className="text-[12px] text-red-500 mt-1">{errors.fuelType.message}</p>}
              </Field>

              <Field label="Transmission" required error={errors.transmission?.message}>
                <div className="flex gap-2">
                  {(['Manual', 'Automatic'] as const).map(t => (
                    <ToggleChip
                      key={t}
                      label={t}
                      selected={watch('transmission') === t}
                      onClick={() => setValue('transmission', t, { shouldValidate: true })}
                    />
                  ))}
                </div>
                {errors.transmission && <p className="text-[12px] text-red-500 mt-1">{errors.transmission.message}</p>}
              </Field>

            </div>
          </div>

          {/* ── Section 3: Pricing & status ───────────────────────────── */}
          <div className="bg-white border border-[#E5E5E7] rounded-xl p-6">
            <SectionHeader>Pricing &amp; status</SectionHeader>
            <div className="space-y-5">

              <Field label="Asking price (£)" required error={errors.price?.message}>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-[#6E6E73]">£</span>
                  <TextInput
                    {...register('price', { valueAsNumber: true })}
                    type="number"
                    placeholder="24995"
                    hasError={!!errors.price}
                    className="pl-8"
                    style={{ paddingLeft: '2rem' }}
                  />
                </div>
              </Field>

              <Field label="Listing status" required>
                <div className="flex gap-2">
                  {(['draft', 'live'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setValue('status', s)}
                      className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold border transition-colors ${
                        watchedStatus === s
                          ? s === 'live'
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-[#0A0A0F] text-white border-[#0A0A0F]'
                          : 'bg-white text-[#6E6E73] border-[#E5E5E7] hover:border-[#C4C6CC]'
                      }`}
                    >
                      {s === 'live' ? '● Publish now' : '○ Save as draft'}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#6E6E73] mt-1.5">
                  {watchedStatus === 'live'
                    ? 'Listing goes live immediately — visible to all buyers.'
                    : 'Saved privately — only you can see it until you publish.'}
                </p>
              </Field>

            </div>
          </div>

          {/* ── Section 4: Description ────────────────────────────────── */}
          <div className="bg-white border border-[#E5E5E7] rounded-xl p-6">
            <SectionHeader>Description</SectionHeader>
            {errors.description && (
              <p className="text-[12px] text-red-500 mb-3">{errors.description.message}</p>
            )}
            <DescriptionBuilder
              make={watch('make') ?? ''}
              model={watch('model') ?? ''}
              year={watch('year')}
              colour={watch('colour') ?? ''}
              hasError={!!errors.description}
              onUse={(text) => setValue('description', text, { shouldValidate: true })}
            />
          </div>

          {/* ── Section 5: Photos ─────────────────────────────────────── */}
          <div className="bg-white border border-[#E5E5E7] rounded-xl p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[15px] font-semibold text-[#0A0A0F]">Photos</h2>
              <span className="text-[11px] text-[#6E6E73]">Up to 20 · JPEG or PNG · Max 10 MB each</span>
            </div>
            <p className="text-[13px] text-[#6E6E73] mb-5">The first photo will be the listing cover.</p>

            {/* Cover slot */}
            {photos[0] ? (
              <div className="relative rounded-xl overflow-hidden mb-3 aspect-[16/9]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photos[0]} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(0)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl h-36 mb-3 cursor-pointer transition-colors ${
                  coverDragOver
                    ? 'border-[#0A0A0F] bg-[#F8F8FA]'
                    : 'border-[#E5E5E7] hover:border-[#C4C6CC]'
                }`}
                onDragOver={e => { e.preventDefault(); setCoverDragOver(true) }}
                onDragLeave={() => setCoverDragOver(false)}
                onDrop={e => {
                  e.preventDefault()
                  setCoverDragOver(false)
                  if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files, 0)
                }}
              >
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={e => {
                    if (e.target.files?.length) handleFiles(e.target.files, 0)
                    e.target.value = ''
                  }}
                />
                {uploadingSlots.size > 0 && !photos[0] ? (
                  <Loader2 size={22} className="text-[#C4C6CC] animate-spin" />
                ) : (
                  <>
                    <ImageIcon size={22} className="text-[#C4C6CC]" />
                    <div className="text-center">
                      <p className="text-[13px] font-medium text-[#0A0A0F]">Cover photo</p>
                      <p className="text-[11px] text-[#6E6E73]">Click or drag &amp; drop · select multiple</p>
                    </div>
                  </>
                )}
              </label>
            )}

            {/* Additional photo grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-3">
                {Array.from({ length: Math.min(19, photos.length) }).map((_, i) => {
                  const slotIndex = i + 1
                  const url = photos[slotIndex]
                  const loading = uploadingSlots.has(slotIndex)
                  return url ? (
                    <div key={slotIndex} className="relative aspect-square rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Photo ${slotIndex + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(slotIndex)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <label
                      key={slotIndex}
                      className="aspect-square border border-dashed border-[#E5E5E7] rounded-lg flex items-center justify-center cursor-pointer hover:border-[#C4C6CC] transition-colors"
                    >
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) uploadPhoto(file, slotIndex)
                          e.target.value = ''
                        }}
                      />
                      {loading
                        ? <Loader2 size={14} className="text-[#C4C6CC] animate-spin" />
                        : <Plus size={14} className="text-[#C4C6CC]" />
                      }
                    </label>
                  )
                })}
              </div>
            )}

            {/* Bulk add more */}
            {photos.length > 0 && photos.filter(Boolean).length < 20 && (
              <label className="flex items-center gap-2 cursor-pointer w-fit">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={e => {
                    if (e.target.files?.length) handleFiles(e.target.files, photos.filter(Boolean).length)
                    e.target.value = ''
                  }}
                />
                <Plus size={13} className="text-[#6E6E73]" />
                <span className="text-[12px] font-medium text-[#6E6E73] hover:text-[#0A0A0F] transition-colors">
                  Add more photos
                </span>
                <span className="text-[11px] text-[#A8AAB0]">
                  {photos.filter(Boolean).length}/20
                </span>
              </label>
            )}
          </div>

          {/* ── Error banner ──────────────────────────────────────────── */}
          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[13px] text-red-600">
              {saveError}
            </div>
          )}

          {/* ── Submit ────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 pb-10">
            <button
              type="submit"
              disabled={saving}
              onClick={() => { submitIntent.current = 'draft' }}
              className="flex-1 py-3 rounded-lg text-[14px] font-semibold border border-[#E5E5E7] bg-white text-[#0A0A0F] hover:border-[#C4C6CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && submitIntent.current === 'draft' ? 'Saving…' : 'Save as draft'}
            </button>
            <button
              type="submit"
              disabled={saving}
              onClick={() => { submitIntent.current = 'live' }}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-lg text-[14px] font-semibold bg-[#0A0A0F] hover:bg-[#1C1C1E] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Publishing…' : (
                <>Publish listing <ChevronRight size={16} /></>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
