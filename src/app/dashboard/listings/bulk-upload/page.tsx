'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Papa from 'papaparse'
import { ArrowLeft, Download, Upload, CheckCircle2, AlertTriangle, Loader2, ChevronRight } from 'lucide-react'

type CreatedRow = { id: string; make: string; model: string }
type ErrorRow   = { row: number; message: string }
type Result     = { created: CreatedRow[]; errors: ErrorRow[] }

export default function BulkUploadPage() {
  const [file, setFile]     = useState<File | null>(null)
  const [busy, setBusy]     = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError]   = useState<string | null>(null)
  const inputRef            = useRef<HTMLInputElement>(null)

  async function handleUpload() {
    if (!file) return
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const text = await file.text()
      const res = await fetch('/api/listings/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: text,
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Something went wrong — please try again.')
      } else {
        setResult(json as Result)
        setFile(null)
        if (inputRef.current) inputRef.current.value = ''
      }
    } catch {
      setError('Something went wrong — please try again.')
    } finally {
      setBusy(false)
    }
  }

  function downloadErrorReport() {
    if (!result?.errors.length) return
    const csv = Papa.unparse(result.errors.map(e => ({ row: e.row, error: e.message })))
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk-upload-errors.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-[#F8F8FA] min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6E6E73] hover:text-[#0A0A0F] transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          Back to dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-[28px] font-light text-[#0A0A0F] tracking-tight">Bulk upload</h1>
          <p className="text-[14px] text-[#6E6E73] mt-1">
            Create multiple listings at once from a spreadsheet. Photos are added to each listing afterwards.
          </p>
        </div>

        {/* Step 1 — template */}
        <div className="bg-white border border-[#E5E5E7] rounded-xl p-6 mb-6">
          <h2 className="text-[15px] font-semibold text-[#0A0A0F] mb-2">1. Download the template</h2>
          <p className="text-[13px] text-[#6E6E73] mb-4">
            One row per car. Fill it in using a spreadsheet app (Excel, Google Sheets, Numbers), then save or export as CSV.
          </p>
          <a
            href="/bulk-upload-template.csv"
            download
            className="inline-flex items-center gap-2 bg-white border border-[#E5E5E7] hover:border-[#C4C6CC] text-[#0A0A0F] text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <Download size={15} />
            Download CSV template
          </a>
        </div>

        {/* Step 2 — upload */}
        <div className="bg-white border border-[#E5E5E7] rounded-xl p-6 mb-6">
          <h2 className="text-[15px] font-semibold text-[#0A0A0F] mb-2">2. Upload your completed file</h2>
          <p className="text-[13px] text-[#6E6E73] mb-4">
            Every valid row is created as a draft listing — nothing goes live until you add photos and publish it. Up to 200 rows per upload.
          </p>

          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#E5E5E7] hover:border-[#C4C6CC] rounded-xl h-32 mb-4 cursor-pointer transition-colors">
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
            />
            <Upload size={20} className="text-[#C4C6CC]" />
            <p className="text-[13px] font-medium text-[#0A0A0F]">
              {file ? file.name : 'Click to choose a CSV file'}
            </p>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[13px] text-red-600 mb-4">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || busy}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#0A0A0F] hover:bg-[#1C1C1E] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-semibold py-3 rounded-lg transition-colors"
          >
            {busy ? <><Loader2 size={16} className="animate-spin" /> Uploading…</> : 'Upload'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white border border-[#E5E5E7] rounded-xl p-6">
            <h2 className="text-[15px] font-semibold text-[#0A0A0F] mb-4">Results</h2>

            {result.created.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 text-[13px] font-medium text-green-700 mb-3">
                  <CheckCircle2 size={16} />
                  {result.created.length} listing{result.created.length !== 1 ? 's' : ''} created as drafts
                </div>
                <ul className="space-y-1.5">
                  {result.created.map(c => (
                    <li key={c.id} className="flex items-center justify-between bg-[#F8F8FA] border border-[#E5E5E7] rounded-lg px-4 py-2.5">
                      <span className="text-[13px] text-[#0A0A0F]">{c.make} {c.model}</span>
                      <Link
                        href={`/dashboard/listings/${c.id}/edit`}
                        className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#A0714A] hover:text-[#8A6040] transition-colors"
                      >
                        Add photos &amp; publish <ChevronRight size={13} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.errors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-[13px] font-medium text-red-600">
                    <AlertTriangle size={16} />
                    {result.errors.length} row{result.errors.length !== 1 ? 's' : ''} had errors — not created
                  </div>
                  <button
                    type="button"
                    onClick={downloadErrorReport}
                    className="text-[12px] font-semibold text-[#6E6E73] hover:text-[#0A0A0F] transition-colors"
                  >
                    Download error report
                  </button>
                </div>
                <ul className="space-y-1.5">
                  {result.errors.map(e => (
                    <li key={e.row} className="text-[13px] text-[#6E6E73] bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
                      <span className="font-semibold text-red-600">Row {e.row}:</span> {e.message}
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] text-[#A8AAB0] mt-3">
                  Fix these rows and upload again — only include the corrected rows, not ones that already succeeded above, or you&apos;ll create duplicate listings.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
