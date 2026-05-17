'use client'
import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore'
import { db } from './firebase'
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react'

interface ServiceItem {
  id: string
  nameAr: string
  nameEn: string
  descriptionAr: string
  descriptionEn: string
  icon: string
  available: boolean
}

const ICON_OPTIONS = [
  { value: 'mic', label: '🎙️ ميكروفون' },
  { value: 'studio', label: '🏢 استوديو' },
  { value: 'headphones', label: '🎧 سماعات' },
  { value: 'music', label: '🎵 موسيقى' },
  { value: 'video', label: '🎬 فيديو' },
  { value: 'star', label: '⭐ نجمة' },
]

const ICON_EMOJI: Record<string, string> = {
  mic: '🎙️', studio: '🏢', headphones: '🎧', music: '🎵', video: '🎬', star: '⭐',
}

const DEFAULTS: Omit<ServiceItem, 'id'>[] = [
  {
    nameAr: 'استئجار معدات التعليق الصوتي',
    nameEn: 'Voice-Over Equipment Rental',
    descriptionAr: 'احصل على أفضل المعدات الصوتية الاحترافية بأسعار تنافسية. ميكروفونات عالية الجودة، مرشحات صوتية، ومعدات التسجيل الكاملة.',
    descriptionEn: 'Get access to professional audio equipment at competitive prices. High-quality microphones, audio filters, and complete recording gear.',
    icon: 'mic',
    available: true,
  },
  {
    nameAr: 'التسجيل في الاستوديو',
    nameEn: 'Studio Recording',
    descriptionAr: 'استوديوهات مجهزة بأحدث التقنيات لتسجيل صوتي احترافي في بيئة مُعزولة صوتياً تضمن جودة استثنائية.',
    descriptionEn: 'Studios equipped with the latest technology for professional recording in a soundproof environment that guarantees exceptional quality.',
    icon: 'studio',
    available: true,
  },
]

const EMPTY: Omit<ServiceItem, 'id'> = {
  nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', icon: 'mic', available: true,
}

export default function AdminServicesTab() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Omit<ServiceItem, 'id'>>(EMPTY)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<Omit<ServiceItem, 'id'>>(EMPTY)
  const [saving, setSaving] = useState(false)

  const fetchServices = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'services'), orderBy('createdAt', 'asc')))
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as ServiceItem))
      setServices(data)
      if (data.length === 0) await seedDefaults()
    } catch {} finally { setLoading(false) }
  }

  const seedDefaults = async () => {
    for (const s of DEFAULTS) {
      await addDoc(collection(db, 'services'), { ...s, createdAt: serverTimestamp() })
    }
    const snap = await getDocs(collection(db, 'services'))
    setServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as ServiceItem)))
  }

  useEffect(() => { fetchServices() }, [])

  const handleAdd = async () => {
    if (!addForm.nameAr) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'services'), { ...addForm, createdAt: serverTimestamp() })
      await fetchServices()
      setShowAdd(false)
      setAddForm(EMPTY)
    } catch { alert('فشل الإضافة') } finally { setSaving(false) }
  }

  const handleEdit = async (id: string) => {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'services', id), { ...editForm })
      await fetchServices()
      setEditingId(null)
    } catch { alert('فشل التحديث') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذه الخدمة؟')) return
    await deleteDoc(doc(db, 'services', id))
    setServices(prev => prev.filter(s => s.id !== id))
  }

  const toggleAvailable = async (s: ServiceItem) => {
    await updateDoc(doc(db, 'services', s.id), { available: !s.available })
    setServices(prev => prev.map(x => x.id === s.id ? { ...x, available: !x.available } : x))
  }

  const FormFields = ({ form, setForm }: { form: Omit<ServiceItem, 'id'>; setForm: (v: Omit<ServiceItem, 'id'>) => void }) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-gray-400 font-black text-xs mb-1 block">الاسم (عربي)</label>
          <input value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} dir="rtl"
            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm outline-none focus:border-red-500 transition" />
        </div>
        <div>
          <label className="text-gray-400 font-black text-xs mb-1 block">Name (English)</label>
          <input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} dir="ltr"
            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm outline-none focus:border-red-500 transition" />
        </div>
      </div>
      <div>
        <label className="text-gray-400 font-black text-xs mb-1 block">الوصف (عربي)</label>
        <textarea value={form.descriptionAr} onChange={e => setForm({ ...form, descriptionAr: e.target.value })} rows={2} dir="rtl"
          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm outline-none focus:border-red-500 transition resize-none" />
      </div>
      <div>
        <label className="text-gray-400 font-black text-xs mb-1 block">Description (English)</label>
        <textarea value={form.descriptionEn} onChange={e => setForm({ ...form, descriptionEn: e.target.value })} rows={2} dir="ltr"
          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm outline-none focus:border-red-500 transition resize-none" />
      </div>
      <div className="flex items-center gap-4">
        <div>
          <label className="text-gray-400 font-black text-xs mb-1 block">الأيقونة</label>
          <select value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm outline-none focus:border-red-500 transition">
            {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer mt-4">
          <input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} className="w-4 h-4 accent-red-600" />
          <span className="text-gray-300 font-bold text-sm">متاح</span>
        </label>
      </div>
    </div>
  )

  if (loading) return <div className="glass rounded-2xl p-12 text-center text-gray-500 font-black">جاري التحميل...</div>

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-white font-black text-xl mb-1">إدارة الخدمات</h2>
          <p className="text-gray-400 font-bold text-sm">خدمات موجهة للمعلقين الصوتيين تظهر في الصفحة الرئيسية</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl font-black text-sm hover:bg-red-700 transition">
          <Plus size={16} /> إضافة خدمة
        </button>
      </div>

      {showAdd && (
        <div className="glass rounded-2xl p-6 border border-red-600/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-black">إضافة خدمة جديدة</h3>
            <button onClick={() => setShowAdd(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
          </div>
          <FormFields form={addForm} setForm={setAddForm} />
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} disabled={saving || !addForm.nameAr}
              className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-black text-sm hover:bg-emerald-700 disabled:opacity-40 transition flex items-center justify-center gap-2">
              <Save size={14} /> {saving ? 'جاري الحفظ...' : 'حفظ الخدمة'}
            </button>
            <button onClick={() => setShowAdd(false)} className="glass text-gray-400 px-4 py-2.5 rounded-xl font-black text-sm hover:bg-white/10 transition">إلغاء</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {services.length === 0 && !showAdd && (
          <div className="glass rounded-2xl p-12 text-center">
            <span className="text-5xl block mb-3">🎙️</span>
            <p className="text-gray-500 font-black">لا توجد خدمات بعد</p>
          </div>
        )}
        {services.map(svc => (
          <div key={svc.id} className="glass rounded-2xl overflow-hidden">
            {editingId === svc.id ? (
              <div className="p-5">
                <FormFields form={editForm} setForm={setEditForm} />
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleEdit(svc.id)} disabled={saving}
                    className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-black text-sm hover:bg-emerald-700 disabled:opacity-40 transition flex items-center justify-center gap-2">
                    <Save size={14} /> {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                  </button>
                  <button onClick={() => setEditingId(null)} className="glass text-gray-400 px-4 py-2.5 rounded-xl font-black text-sm hover:bg-white/10 transition">إلغاء</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 px-5 py-4">
                <span className="text-3xl flex-shrink-0">{ICON_EMOJI[svc.icon] || '🎙️'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-sm">{svc.nameAr}</p>
                  <p className="text-gray-500 font-bold text-xs">{svc.nameEn}</p>
                  <p className="text-gray-400 font-bold text-xs mt-0.5 truncate">{svc.descriptionAr}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleAvailable(svc)}
                    className={`px-2.5 py-1 rounded-full text-xs font-black transition ${svc.available ? 'bg-emerald-600/20 text-emerald-400' : 'bg-gray-600/20 text-gray-500'}`}>
                    {svc.available ? '✓ متاح' : '✕ مخفي'}
                  </button>
                  <button onClick={() => { setEditingId(svc.id); setEditForm({ nameAr: svc.nameAr, nameEn: svc.nameEn, descriptionAr: svc.descriptionAr, descriptionEn: svc.descriptionEn, icon: svc.icon, available: svc.available }) }}
                    className="w-8 h-8 bg-blue-600/10 rounded-lg flex items-center justify-center hover:bg-blue-600 transition group">
                    <Edit3 size={13} className="text-blue-400 group-hover:text-white" />
                  </button>
                  <button onClick={() => handleDelete(svc.id)}
                    className="w-8 h-8 bg-red-600/10 rounded-lg flex items-center justify-center hover:bg-red-600 transition group">
                    <Trash2 size={13} className="text-red-400 group-hover:text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
