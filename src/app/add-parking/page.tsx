'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Check, X, Loader2, Lock, ShieldCheck, MapPin, Building2, Sparkles, FileText, ScanLine, AlertCircle, CheckCircle2 } from 'lucide-react'
import { getToken, getUser, saveAuth } from '@/lib/auth'
import styles from './add-parking.module.css'

const AMENITIES  = ['CCTV', 'EV Charging', '24/7 Access', 'Washroom', 'Wheelchair accessible', 'Security guard', 'Valet', 'Gated']
const SPOT_TYPES = ['Covered', 'Open Air', 'Underground', 'Valet', 'Rooftop']
const DAYS       = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const STEPS      = ['Basic info', 'Location', 'Schedule & photos', 'Amenities'/*, 'Verify ownership'*/]

interface FormState {
  title:         string
  pricePerHour:  string
  spotType:      string
  description:   string
  street:        string
  city:          string
  state:         string
  availableFrom: string
  availableTo:   string
}

type StepErrors = Partial<Record<keyof FormState | 'days' | 'photos', string>>

// ── Transfer Modal ────────────────────────────────────────────────
type ModalPhase = 'listing' | 'upgrading' | 'done'

function TransferModal({ phase, userName }: { phase: ModalPhase; userName: string }) {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (phase !== 'done') return
    const id = setInterval(() => setCountdown(c => c - 1), 1000)
    return () => clearInterval(id)
  }, [phase])

  return (
    <>
      <div className={styles.modalBackdrop} />
      <div className={styles.transferModal}>

        {/* ── Phase 1: Creating listing ── */}
        <div className={`${styles.phase} ${phase === 'listing' ? styles.phaseVisible : styles.phaseHidden}`}>
          <div className={styles.orbitWrap}>
            <div className={styles.orbit} />
            <div className={styles.orbitInner}>
              <MapPin size={28} strokeWidth={2} />
            </div>
          </div>
          <h2 className={styles.modalTitle}>Creating your listing…</h2>
          <p className={styles.modalSub}>Uploading spot details to ParkSpot</p>
          <div className={styles.dotRow}>
            <span className={styles.dot} style={{ animationDelay: '0s'   }} />
            <span className={styles.dot} style={{ animationDelay: '0.2s' }} />
            <span className={styles.dot} style={{ animationDelay: '0.4s' }} />
          </div>
        </div>

        {/* ── Phase 2: Upgrading ── */}
        <div className={`${styles.phase} ${phase === 'upgrading' ? styles.phaseVisible : styles.phaseHidden}`}>
          <div className={styles.transferRow}>
            {/* User node */}
            <div className={styles.transferNode}>
              <div className={`${styles.nodeCircle} ${styles.nodeUser}`}>
                <span className={styles.nodeAvatar}>{userName.charAt(0).toUpperCase()}</span>
              </div>
              <span className={styles.nodeLabel}>User</span>
            </div>

            {/* Animated path */}
            <div className={styles.transferPath}>
              <div className={styles.pathLine} />
              <div className={styles.pathPulse} />
              <div className={styles.arrowHead} />
            </div>

            {/* Owner node */}
            <div className={styles.transferNode}>
              <div className={`${styles.nodeCircle} ${styles.nodeOwner}`}>
                <Building2 size={22} strokeWidth={2} />
              </div>
              <span className={styles.nodeLabel}>Owner</span>
            </div>
          </div>

          <h2 className={styles.modalTitle}>Upgrading your account…</h2>
          <p className={styles.modalSub}>Granting owner permissions</p>
          <div className={styles.dotRow}>
            <span className={styles.dot} style={{ animationDelay: '0s'   }} />
            <span className={styles.dot} style={{ animationDelay: '0.2s' }} />
            <span className={styles.dot} style={{ animationDelay: '0.4s' }} />
          </div>
        </div>

        {/* ── Phase 3: Done ── */}
        <div className={`${styles.phase} ${phase === 'done' ? styles.phaseVisible : styles.phaseHidden}`}>
          {/* Particles */}
          {[...Array(12)].map((_, i) => (
            <span key={i} className={styles.particle} style={{ '--i': i } as React.CSSProperties} />
          ))}

          <div className={styles.successRing}>
            <div className={styles.successCircle}>
              <Check size={32} strokeWidth={3} />
            </div>
          </div>

          <div className={styles.ownerBadge}>
            <Sparkles size={13} />
            You&apos;re now an Owner
          </div>

          <h2 className={styles.modalTitle}>Listing live!</h2>
          <p className={styles.modalSub}>Your spot is now on ParkSpot</p>

          <div className={styles.redirectBar}>
            <div className={styles.redirectFill} />
          </div>
          <p className={styles.redirectText}>Redirecting to dashboard in {countdown}s…</p>
        </div>

      </div>
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function AddParkingPage() {
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step,            setStep]           = useState(0)
  const [amenities,       setAmenities]      = useState<string[]>(['CCTV'])
  const [days,            setDays]           = useState<string[]>([])
  const [submitting,      setSubmitting]     = useState(false)
  const [submitError,     setSubmitError]    = useState('')
  const [stepErrors,      setStepErrors]     = useState<StepErrors>({})
  const [showCctvPopup,   setShowCctvPopup]  = useState(false)
  const [modalPhase,      setModalPhase]     = useState<ModalPhase | null>(null)

  const [form, setForm] = useState<FormState>({
    title:         '',
    pricePerHour:  '',
    spotType:      'Covered',
    description:   '',
    street:        '',
    city:          '',
    state:         '',
    availableFrom: '06:00',
    availableTo:   '22:00',
  })

  const [photos,         setPhotos]        = useState<string[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadError,    setUploadError]    = useState('')
  const [previewUrls,    setPreviewUrls]    = useState<string[]>([])

  // ── Verification step state ──────────────────────────────────────
  const billRef                                         = useRef<HTMLInputElement>(null)
  const [billPreview,    setBillPreview]    = useState<string | null>(null)
  const [,               setBillFile]       = useState<File | null>(null)
  const [ocrStatus,      setOcrStatus]      = useState<'idle' | 'scanning' | 'matched' | 'mismatch' | 'error'>('idle')
  const [ocrProgress,    setOcrProgress]    = useState(0)
  const [extractedName,  setExtractedName]  = useState('')
  const [ocrError,       setOcrError]       = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setStepErrors(prev => ({ ...prev, [name]: '' }))
  }

  const toggleAmenity = (a: string) => {
    if (a === 'CCTV') {
      setShowCctvPopup(true)
      setTimeout(() => setShowCctvPopup(false), 2500)
      return
    }
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  const toggleDay = (d: string) => {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
    setStepErrors(prev => ({ ...prev, days: '' }))
  }

  const validateStep = (): boolean => {
    const errs: StepErrors = {}

    if (step === 0) {
      if (!form.title.trim())                  errs.title        = 'Spot title is required'
      else if (form.title.trim().length < 5)   errs.title        = 'Title must be at least 5 characters'
      if (!form.pricePerHour)                  errs.pricePerHour = 'Price per hour is required'
      else if (Number(form.pricePerHour) <= 0) errs.pricePerHour = 'Price must be greater than ₹0'
      if (!form.description.trim())            errs.description  = 'Description is required'
      else if (form.description.trim().length < 20) errs.description = 'Description must be at least 20 characters'
    }

    if (step === 1) {
      if (!form.street.trim()) errs.street = 'Street address is required'
      if (!form.city.trim())   errs.city   = 'City is required'
      if (!form.state.trim())  errs.state  = 'State is required'
    }

    if (step === 2) {
      if (days.length === 0)   errs.days   = 'Select at least one available day'
      if (photos.length < 3)   errs.photos = `At least 3 photos are required (${photos.length}/3 uploaded)`
    }

    // step 3 (amenities) has no hard validation
    // step 4 (verify) is checked separately in handleNext

    setStepErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1)
  }

  // ── ImageKit Upload ──────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingPhoto(true)
    setUploadError('')

    for (const file of Array.from(files)) {
      try {
        const authRes = await fetch('/api/imagekit/auth', { cache: 'no-store' })
        if (!authRes.ok) throw new Error('Failed to get ImageKit auth')
        const { token, expire, signature } = await authRes.json()

        const formData = new FormData()
        formData.append('file',      file)
        formData.append('fileName',  `parkspot_${Date.now()}_${file.name}`)
        formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!)
        formData.append('signature', signature)
        formData.append('expire',    String(expire))
        formData.append('token',     token)
        formData.append('folder',    '/parkspot/listings')

        const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
          method: 'POST',
          body:   formData,
        })

        if (!uploadRes.ok) {
          const err = await uploadRes.json()
          throw new Error(err.message || 'Upload failed')
        }

        const data = await uploadRes.json()
        setPhotos(prev      => [...prev, data.url])
        setPreviewUrls(prev => [...prev, data.url])
        setStepErrors(prev  => ({ ...prev, photos: '' }))

      } catch (err: unknown) {
        setUploadError(err instanceof Error ? err.message : 'Upload failed')
      }
    }

    setUploadingPhoto(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const removePhoto = (index: number) => {
    setPhotos(prev      => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  // ── Electricity bill OCR ─────────────────────────────────────────
  const handleBillUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBillFile(file)
    setBillPreview(URL.createObjectURL(file))
    setOcrStatus('scanning')
    setOcrProgress(0)
    setExtractedName('')
    setOcrError('')

    try {
      const Tesseract = (await import('tesseract.js')).default
      const result = await Tesseract.recognize(file, 'eng+hin', {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100))
          }
        },
      })

      const text     = result.data.text
      const found    = extractNameFromBill(text)
      const userName = getUser()?.name || ''

      setExtractedName(found)

      if (!found) {
        setOcrStatus('error')
        setOcrError('Could not find a name on the bill. Try a clearer image.')
        return
      }

      const isMatch = namesMatch(found, userName)
      setOcrStatus(isMatch ? 'matched' : 'mismatch')

    } catch (err) {
      setOcrStatus('error')
      setOcrError(err instanceof Error ? err.message : 'OCR failed. Try again.')
    }

    if (billRef.current) billRef.current.value = ''
  }

  // Extract name from bill — supports English labels, Hindi labels (नाम etc.),
  // same-line and next-line name placement.
  const extractNameFromBill = (text: string): string => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

    // English label patterns — anchored to line start to avoid "Division Name", "Zone Name" etc.
    const engPatterns = [
      /^(?:consumer\s*name|name\s*of\s*consumer|account\s*holder|name\s*of\s*account\s*holder|customer\s*name|service\s*holder)[:\s]+([A-Za-z][A-Za-z\s.]{2,45})/i,
      /^name[:\s]+([A-Za-z][A-Za-z\s.]{2,45})/i,
      /^(?:smt\.|mr\.|mrs\.|shri|shrimati)\s*([A-Za-z][A-Za-z\s.]{2,45})/i,
    ]

    // Hindi label patterns — anchored to line start so "Division नाम", "Vibhag नाम" etc. are ignored.
    // Only matches when नाम / consumer-name label is the FIRST word on the line.
    const hinPatterns = [
      /^(?:उपभोक्ता\s*का\s*नाम|ग्राहक\s*का\s*नाम|खाताधारक\s*का\s*नाम|उपभोक्ता\s*नाम|ग्राहक\s*नाम)[:\s]*([A-Za-z][A-Za-z\s.]{2,45})/,
      /^नाम[:\s]+([A-Za-z][A-Za-z\s.]{2,45})/,
      /^(?:श्री|श्रीमती)\s*([A-Za-z][A-Za-z\s.]{2,45})/,
    ]

    // 1. Check same-line matches (English then Hindi)
    for (const line of lines) {
      for (const pat of [...engPatterns, ...hinPatterns]) {
        const m = line.match(pat)
        if (m?.[1]) return m[1].trim().replace(/\s+/g, ' ')
      }
    }

    // 2. Check next-line: label on one line, name on the next
    //    Label must start the line (^) to exclude "Division नाम", "Area Name" etc.
    const labelRe = /^(?:consumer\s*name|account\s*holder|customer\s*name|name\s*of\s*consumer|service\s*holder|name|उपभोक्ता\s*का\s*नाम|ग्राहक\s*का\s*नाम|उपभोक्ता\s*नाम|खाताधारक|नाम)\s*[:\-]?\s*$/i
    const isEnglishName = (s: string) => /^[A-Za-z][A-Za-z\s.]{3,45}$/.test(s) && s.split(' ').length >= 2

    for (let i = 0; i < lines.length - 1; i++) {
      if (labelRe.test(lines[i]) && isEnglishName(lines[i + 1])) {
        return lines[i + 1].trim().replace(/\s+/g, ' ')
      }
    }

    // 3. Fallback: ALL CAPS line of 2–5 words (common on older bills)
    for (const line of lines) {
      if (/^[A-Z][A-Z\s.]{4,35}$/.test(line)) {
        const words = line.trim().split(/\s+/)
        if (words.length >= 2 && words.length <= 5) return line.trim()
      }
    }

    return ''
  }

  // Fuzzy name match: normalise → split → check word overlap ≥ 50%
  const namesMatch = (billName: string, userName: string): boolean => {
    const norm  = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, '').trim()
    const words = (s: string) => norm(s).split(/\s+/).filter(w => w.length > 1)

    const bWords = words(billName)
    const uWords = words(userName)
    if (!bWords.length || !uWords.length) return false

    const matched = uWords.filter(w => bWords.some(b => b.includes(w) || w.includes(b)))
    return matched.length / uWords.length >= 0.5
  }

  const resetBill = () => {
    setBillPreview(null)
    setBillFile(null)
    setOcrStatus('idle')
    setOcrProgress(0)
    setExtractedName('')
    setOcrError('')
  }

  // ── Final Submit ─────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError('')

    try {
      const token = getToken()
      const user  = getUser()
      if (!token || !user) { router.push('/login'); return }

      // Phase 1 — create listing
      setModalPhase('listing')
      await new Promise(r => setTimeout(r, 1200))

      const fullAddress = [form.street, form.city, form.state].filter(Boolean).join(', ')

      const res = await fetch('/api/parking', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title:         form.title,
          pricePerHour:  form.pricePerHour,
          spotType:      form.spotType,
          description:   form.description,
          address:       fullAddress,
          availableFrom: form.availableFrom,
          availableTo:   form.availableTo,
          days,
          photos,
          amenities,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setModalPhase(null)
        setSubmitError(data.error || 'Failed to submit listing')
        setSubmitting(false)
        return
      }

      // Phase 2 — upgrade to owner if needed
      if (user.role !== 'owner') {
        setModalPhase('upgrading')
        await new Promise(r => setTimeout(r, 1400))

        const ownerRes  = await fetch('/api/auth/become-owner', {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify({}),
        })
        const ownerData = await ownerRes.json()
        if (ownerRes.ok) {
          saveAuth(ownerData.token, ownerData.user)
        }
      }

      // Phase 3 — done
      setModalPhase('done')
      await new Promise(r => setTimeout(r, 3200))

      window.location.href = '/owner/dashboard'

    } catch {
      setModalPhase(null)
      setSubmitError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const progress  = ((step + 1) / STEPS.length) * 100
  const user      = getUser()
  const userName  = user?.name || 'U'

  return (
    <div className="page-wrapper" style={{ maxWidth: 680 }}>
      <h1 className="page-title animate-fadeUp">List your parking spot</h1>
      <p className="page-subtitle animate-fadeUp delay-1">Fill in the details and start earning</p>

      {/* ── Progress ── */}
      <div className={`${styles.progressWrap} animate-fadeUp delay-1`}>
        <div className={styles.stepLabels}>
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`${styles.stepLabel} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}
            >
              {i < step ? <Check size={11} /> : i + 1}
              <span className={styles.stepText}>{s}</span>
            </span>
          ))}
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* ── Step 0: Basic info ── */}
      {step === 0 && (
        <div className={`card ${styles.stepCard} animate-fadeUp`}>
          <div className={styles.field}>
            <label className="label">Spot title</label>
            <input
              className={`input ${stepErrors.title ? styles.inputErr : ''}`}
              name="title" value={form.title} onChange={handleChange}
              placeholder="e.g. Central Park Basement B2"
            />
            {stepErrors.title && <span className={styles.fieldError}>{stepErrors.title}</span>}
          </div>

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className="label">Price per hour (₹)</label>
              <input
                className={`input ${stepErrors.pricePerHour ? styles.inputErr : ''}`}
                type="number" name="pricePerHour" value={form.pricePerHour}
                onChange={handleChange} placeholder="80" min="1"
              />
              {stepErrors.pricePerHour && <span className={styles.fieldError}>{stepErrors.pricePerHour}</span>}
            </div>
            <div className={styles.field}>
              <label className="label">Spot type</label>
              <select className="input" name="spotType" value={form.spotType} onChange={handleChange}>
                {SPOT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className="label">Description</label>
            <textarea
              className={`input ${stepErrors.description ? styles.inputErr : ''}`}
              name="description" value={form.description} onChange={handleChange}
              rows={3}
              placeholder="Describe your spot — nearby landmarks, entry instructions, special features… (min 20 chars)"
              style={{ resize: 'vertical' }}
            />
            {stepErrors.description && <span className={styles.fieldError}>{stepErrors.description}</span>}
          </div>
        </div>
      )}

      {/* ── Step 1: Location ── */}
      {step === 1 && (
        <div className={`card ${styles.stepCard} animate-fadeUp`}>
          <div className={styles.field}>
            <label className="label">Street address</label>
            <input
              className={`input ${stepErrors.street ? styles.inputErr : ''}`}
              name="street" value={form.street} onChange={handleChange}
              placeholder="e.g. B-12, Connaught Place"
            />
            {stepErrors.street && <span className={styles.fieldError}>{stepErrors.street}</span>}
          </div>

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className="label">City</label>
              <input
                className={`input ${stepErrors.city ? styles.inputErr : ''}`}
                name="city" value={form.city} onChange={handleChange}
                placeholder="e.g. New Delhi"
              />
              {stepErrors.city && <span className={styles.fieldError}>{stepErrors.city}</span>}
            </div>
            <div className={styles.field}>
              <label className="label">State</label>
              <input
                className={`input ${stepErrors.state ? styles.inputErr : ''}`}
                name="state" value={form.state} onChange={handleChange}
                placeholder="e.g. Delhi"
              />
              {stepErrors.state && <span className={styles.fieldError}>{stepErrors.state}</span>}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Schedule & photos ── */}
      {step === 2 && (
        <div className={`card ${styles.stepCard} animate-fadeUp`}>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className="label">Available from</label>
              <input className="input" type="time" name="availableFrom" value={form.availableFrom} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label className="label">Available until</label>
              <input className="input" type="time" name="availableTo" value={form.availableTo} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.field}>
            <label className="label">Days available</label>
            <div className={styles.dayRow}>
              {DAYS.map(d => (
                <button
                  key={d}
                  className={`${styles.dayChip} ${days.includes(d) ? styles.dayOn : ''}`}
                  type="button"
                  onClick={() => toggleDay(d)}
                >{d}</button>
              ))}
            </div>
            {stepErrors.days && <span className={styles.fieldError}>{stepErrors.days}</span>}
          </div>

          <div className={styles.field}>
            <div className={styles.photoLabelRow}>
              <label className="label" style={{ margin: 0 }}>Spot photos</label>
              <span className={`${styles.photoCount} ${photos.length >= 3 ? styles.photoCountMet : ''}`}>
                {photos.length}/3 minimum
              </span>
            </div>

            {previewUrls.length > 0 && (
              <div className={styles.photoGrid}>
                {previewUrls.map((url, i) => (
                  <div key={i} className={styles.photoThumb}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Spot photo ${i + 1}`} />
                    <button type="button" className={styles.removePhoto} onClick={() => removePhoto(i)}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className={`${styles.uploadZone} ${uploadingPhoto ? styles.uploading : ''}`}>
              {uploadingPhoto ? (
                <><Loader2 size={24} className={styles.spin} /><span>Uploading to ImageKit…</span></>
              ) : (
                <>
                  <Upload size={24} />
                  <span>Click or drag images here</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>JPG, PNG up to 10MB · Multiple allowed</span>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} disabled={uploadingPhoto} />
            </label>

            {uploadError        && <p className={styles.fieldError}>{uploadError}</p>}
            {stepErrors.photos  && <p className={styles.fieldError}>{stepErrors.photos}</p>}
          </div>
        </div>
      )}

      {/* ── Step 3: Amenities ── */}
      {step === 3 && (
        <div className={`card ${styles.stepCard} animate-fadeUp`} style={{ position: 'relative' }}>
          <p className={styles.amenityHint}>Select all that apply to your spot</p>
          <div className={styles.amenityGrid}>
            {AMENITIES.map(a => {
              const isCctv    = a === 'CCTV'
              const isChecked = amenities.includes(a)
              return (
                <button
                  key={a}
                  className={`${styles.amenityChip} ${isChecked ? styles.amenityOn : ''} ${isCctv ? styles.amenityCctv : ''}`}
                  onClick={() => toggleAmenity(a)}
                  type="button"
                >
                  {isCctv ? <Lock size={12} /> : isChecked ? <Check size={12} /> : null}
                  {a}
                  {isCctv && <span className={styles.cctvBadge}>Required</span>}
                </button>
              )
            })}
          </div>

          {showCctvPopup && (
            <div className={`${styles.cctvPopup} animate-fadeUp`}>
              <ShieldCheck size={14} />
              CCTV is mandatory for all listed spots
            </div>
          )}

          {submitError && (
            <p style={{ color: 'var(--danger,#ef4444)', fontSize: '0.85rem', marginTop: 8, textAlign: 'center' }}>
              {submitError}
            </p>
          )}
        </div>
      )}

      {/* ── Step 4: Verify ownership (temporarily disabled) ── */}
      {false && step === 4 && (
        <div className={`card ${styles.stepCard} animate-fadeUp`}>
          <div className={styles.verifyHeader}>
            <div className={styles.verifyIconWrap}>
              <FileText size={22} />
            </div>
            <div>
              <p className={styles.verifyTitle}>Electricity bill verification</p>
              <p className={styles.verifySub}>We extract your name to confirm you own this property</p>
            </div>
          </div>

          <div className={styles.verifyNameHint}>
            <span className={styles.verifyNameLabel}>Your registered name</span>
            <span className={styles.verifyNameValue}>{getUser()?.name}</span>
          </div>

          {/* Upload zone */}
          {ocrStatus === 'idle' && (
            <label className={styles.billUploadZone}>
              <ScanLine size={28} />
              <span>Upload electricity bill</span>
              <span className={styles.billUploadHint}>JPG, PNG or PDF scan · Max 10MB</span>
              <input
                ref={billRef}
                type="file"
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={handleBillUpload}
              />
            </label>
          )}

          {/* Preview + status */}
          {billPreview && ocrStatus !== 'idle' && (
            <div className={styles.billPreviewWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={billPreview ?? undefined} alt="Bill preview" className={styles.billPreviewImg} />
              {!['matched', 'mismatch', 'error'].includes(ocrStatus) && (
                <div className={styles.billOverlay}>
                  <div className={styles.scanLine} />
                </div>
              )}
            </div>
          )}

          {/* Scanning progress */}
          {ocrStatus === 'scanning' && (
            <div className={styles.ocrProgress}>
              <div className={styles.ocrProgressBar}>
                <div className={styles.ocrProgressFill} style={{ width: `${ocrProgress}%` }} />
              </div>
              <p className={styles.ocrProgressText}>
                <Loader2 size={12} className={styles.spin} />
                Scanning document (English + Hindi)… {ocrProgress}%
              </p>
            </div>
          )}

          {/* Result: matched */}
          {ocrStatus === 'matched' && (
            <div className={`${styles.ocrResult} ${styles.ocrMatched}`}>
              <CheckCircle2 size={18} />
              <div>
                <p className={styles.ocrResultTitle}>Name matched!</p>
                <p className={styles.ocrResultSub}>Found on bill: <strong>{extractedName}</strong></p>
              </div>
              <button className={styles.ocrRetry} onClick={resetBill}>Change</button>
            </div>
          )}

          {/* Result: mismatch */}
          {ocrStatus === 'mismatch' && (
            <div className={`${styles.ocrResult} ${styles.ocrMismatch}`}>
              <AlertCircle size={18} />
              <div>
                <p className={styles.ocrResultTitle}>Name does not match</p>
                <p className={styles.ocrResultSub}>Found: <strong>{extractedName}</strong> — expected: <strong>{getUser()?.name}</strong></p>
              </div>
              <button className={styles.ocrRetry} onClick={resetBill}>Retry</button>
            </div>
          )}

          {/* Result: error */}
          {ocrStatus === 'error' && (
            <div className={`${styles.ocrResult} ${styles.ocrError}`}>
              <AlertCircle size={18} />
              <div>
                <p className={styles.ocrResultTitle}>Could not read bill</p>
                <p className={styles.ocrResultSub}>{ocrError}</p>
              </div>
              <button className={styles.ocrRetry} onClick={resetBill}>Retry</button>
            </div>
          )}

          {/* Re-upload when mismatch/error */}
          {(ocrStatus === 'mismatch' || ocrStatus === 'error') && (
            <label className={`${styles.billUploadZone} ${styles.billUploadZoneSmall}`}>
              <Upload size={16} />
              <span>Upload a different image</span>
              <input
                type="file"
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={handleBillUpload}
              />
            </label>
          )}

          {submitError && (
            <p style={{ color: 'var(--danger,#ef4444)', fontSize: '0.85rem', marginTop: 8, textAlign: 'center' }}>
              {submitError}
            </p>
          )}
        </div>
      )}

      {/* ── Navigation ── */}
      <div className={styles.navRow}>
        {step > 0
          ? <button className="btn-outline" onClick={() => setStep(s => s - 1)}>← Back</button>
          : <span />
        }
        {step < STEPS.length - 1 ? (
          <button className={`btn-primary ${styles.nextBtn}`} onClick={handleNext}>
            Continue →
          </button>
        ) : (
          <button
            className={`btn-primary ${styles.nextBtn}`}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <><Loader2 size={14} className={styles.spin} /> Submitting…</> : 'Submit listing ✓'}
          </button>
        )}
      </div>

      {/* ── Transfer Modal ── */}
      {modalPhase && <TransferModal phase={modalPhase} userName={userName} />}
    </div>
  )
}
