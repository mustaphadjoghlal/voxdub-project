import { useState, useEffect, useRef } from "react";
import { db, auth, storage } from "../../../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { Trash2, Pencil, Plus, LogOut, Save, X, Upload, Image, Loader } from "lucide-react";

interface Work {
  id: string; title: string; description: string; coverImage: string; images: string[];
  altText: string; soundcloudUrl: string; audioUrl?: string; category: "design" | "photography" | "voice";
}
interface Experience { id: string; period: string; title: string; location: string; tasks: string; }
interface MediaOutput {
  id: string; title: string; channel: string;
  type: "تلفزيون" | "إذاعة" | "صحافة" | "بودكاست" | "يوتيوب" | "أخرى";
  date: string; description: string; url: string; coverImage?: string;
}
interface Article {
  id: string; title: string; content: string; coverImage: string;
  coverAlt: string; date: string; tags: string[]; category: string;
}
interface Client { id: string; name: string; logoUrl: string; logoAlt: string; }
interface Course { id: string; title: string; description: string; image: string; duration: string; students: string; level: string; modules: string; email: string; }
interface AboutImage { url: string; alt: string; }
interface SiteInfo {
  id: string; heroName: string; heroDescription: string; profileImageUrl: string;
  aboutText: string; aboutBio: string; aboutImages: AboutImage[];
  email: string; phone: string; footerDescription: string;
  linkedinUrl: string; twitterUrl: string; instagramUrl: string;
}

function SingleImageUploader({ url, onChange, folder = "images", label = "رفع صورة", rounded = false }: {
  url: string; onChange: (url: string) => void; folder?: string; label?: string; rounded?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const handleFile = async (file: File) => {
    setUploading(true);
    const task = uploadBytesResumable(ref(storage, `${folder}/${Date.now()}_${file.name}`), file);
    task.on("state_changed", (s) => setProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)), console.error,
      async () => { onChange(await getDownloadURL(task.snapshot.ref)); setUploading(false); setProgress(0); });
  };
  return (
    <div className="flex gap-3 items-center">
      {url && <img src={url} alt="" className={`w-16 h-16 object-cover border-2 border-gray-700 ${rounded ? "rounded-full" : "rounded-lg"}`} />}
      <div onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-xl p-3 text-center cursor-pointer transition-all">
        {uploading ? <div className="space-y-1"><Loader size={16} className="animate-spin mx-auto text-blue-400" /><p className="text-gray-400 text-xs">{progress}%</p></div>
          : <div className="flex items-center justify-center gap-2 text-gray-400 text-sm"><Upload size={14} /><span>{label}</span></div>}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>
    </div>
  );
}

function AudioUploader({ url, onChange, folder = "audio", label = "رفع ملف صوتي" }: {
  url: string; onChange: (url: string) => void; folder?: string; label?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const handleFile = async (file: File) => {
    setUploading(true);
    const task = uploadBytesResumable(ref(storage, `${folder}/${Date.now()}_${file.name}`), file);
    task.on("state_changed", (s) => setProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)), console.error,
      async () => { onChange(await getDownloadURL(task.snapshot.ref)); setUploading(false); setProgress(0); });
  };
  return (
    <div className="space-y-2">
      {url && <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-green-400">✓ ملف صوتي مرفوع</div>}
      <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-xl p-3 text-center cursor-pointer transition-all">
        {uploading ? <div className="space-y-1"><Loader size={16} className="animate-spin mx-auto text-purple-400" /><p className="text-gray-400 text-xs">{progress}%</p></div>
          : <div className="flex items-center justify-center gap-2 text-gray-400 text-sm"><Upload size={14} /><span>{label}</span></div>}
        <input ref={fileInputRef} type="file" accept="audio/mp3,audio/mpeg,audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>
    </div>
  );
}

function ImageUploader({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const uploadFile = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `works/${Date.now()}_${file.name}`);
    return new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file);
      task.on("state_changed", (s) => setProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)), reject,
        async () => resolve(await getDownloadURL(task.snapshot.ref)));
    });
  };
  const handleFiles = async (files: FileList) => {
    setUploading(true);
    try { const urls: string[] = []; for (const f of Array.from(files)) urls.push(await uploadFile(f)); onChange([...images.filter(img => img.trim()), ...urls]); }
    catch (e) { console.error(e); }
    setUploading(false); setProgress(0);
  };
  const removeImage = async (url: string, index: number) => {
    try { if (url.includes("firebasestorage")) await deleteObject(ref(storage, url)); } catch {}
    onChange(images.filter((_, i) => i !== index));
  };
  return (
    <div className="space-y-3">
      <label className="block text-gray-400 text-sm flex items-center gap-1"><Image size={14} /> الصور</label>
      <div onDrop={(e) => { e.preventDefault(); e.dataTransfer.files.length && handleFiles(e.dataTransfer.files); }}
        onDragOver={(e) => e.preventDefault()} onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-xl p-5 text-center cursor-pointer transition-all">
        {uploading ? <div className="space-y-2"><Loader size={20} className="animate-spin mx-auto text-blue-400" /><p className="text-gray-400 text-sm">{progress}%</p><div className="w-full bg-gray-700 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} /></div></div>
          : <div className="space-y-1"><Upload size={20} className="mx-auto text-gray-500" /><p className="text-gray-400 text-sm">اسحب أو اضغط للاختيار</p></div>}
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
      </div>
      {images.filter(img => img.trim()).length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.filter(img => img.trim()).map((img, i) => (
            <div key={i} className="relative group aspect-square">
              <img src={img} alt="" className="w-full h-full object-cover rounded-lg border border-gray-700" />
              <button onClick={() => removeImage(img, i)} className="absolute top-1 left-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LoginForm({ onLogin }: { onLogin: (email: string, password: string) => void }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    setLoading(true); setError("");
    try { await onLogin(email, password); } catch { setError("البريد أو كلمة المرور غير صحيحة"); }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-black flex items-center justify-center" dir="rtl">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">لوحة التحكم</h1>
        <p className="text-gray-400 text-center mb-8">أدخل بياناتك للدخول</p>
        {error && <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg p-3 mb-6 text-center">{error}</div>}
        <div className="space-y-4">
          <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
          <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
          <button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50">
            {loading ? "جارٍ الدخول..." : "دخول"}
          </button>
        </div>
      </div>
    </div>
  );
}

function WorksList({ works, category, saving, editingWork, setEditingWork, onSave, onDelete, showAdd, setShowAdd, newWork, setNewWork, onAdd, sc }: any) {
  const filtered = works.filter((w: Work) => w.category === category);
  const isVoice = category === "voice";
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-gray-400 text-sm">{filtered.length} عمل</span>
        <button onClick={() => { setNewWork({ title: "", description: "", coverImage: "", images: [], altText: "", soundcloudUrl: "", audioUrl: "", category }); setShowAdd(true); }} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2 rounded-lg font-semibold text-sm hover:from-blue-600 hover:to-purple-700 transition-all"><Plus size={16} /> إضافة عمل</button>
      </div>
      {showAdd && newWork.category === category && (
        <div className="bg-gray-900 border border-blue-800 rounded-2xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between"><h3 className="font-bold text-blue-400">إضافة عمل جديد</h3><button onClick={() => setShowAdd(false)}><X size={18} className="text-gray-400" /></button></div>
          <div className="grid md:grid-cols-2 gap-4">
            <input value={newWork.title} onChange={(e) => setNewWork({ ...newWork, title: e.target.value })} placeholder="عنوان العمل" className={sc} />
            <input value={newWork.altText} onChange={(e) => setNewWork({ ...newWork, altText: e.target.value })} placeholder="Alt text للـ SEO" className={sc} />
            {isVoice && <input value={newWork.soundcloudUrl} onChange={(e) => setNewWork({ ...newWork, soundcloudUrl: e.target.value })} placeholder="رابط SoundCloud (اختياري)" className={`${sc} md:col-span-2`} />}
            <textarea value={newWork.description} onChange={(e) => setNewWork({ ...newWork, description: e.target.value })} placeholder="وصف العمل" rows={2} className={`${sc} resize-none md:col-span-2`} />
          </div>
          <div className="space-y-2">
            <p className="text-gray-400 text-sm font-semibold">🖼️ صورة الغلاف (تظهر في القائمة)</p>
            <SingleImageUploader url={newWork.coverImage || ""} onChange={(url) => setNewWork({ ...newWork, coverImage: url })} folder="works" label="رفع صورة الغلاف" />
          </div>
          {isVoice && (
            <div className="space-y-2">
              <p className="text-gray-400 text-sm font-semibold">🎵 ملف صوتي MP3 (اختياري - بديل SoundCloud)</p>
              <AudioUploader url={newWork.audioUrl || ""} onChange={(url) => setNewWork({ ...newWork, audioUrl: url })} folder="works/audio" label="رفع ملف MP3" />
            </div>
          )}
          {!isVoice && (
            <div className="space-y-2">
              <p className="text-gray-400 text-sm font-semibold">📸 صور المحتوى (تظهر في الصفحة التفصيلية)</p>
              <ImageUploader images={newWork.images} onChange={(imgs: string[]) => setNewWork({ ...newWork, images: imgs })} />
            </div>
          )}
          <button onClick={onAdd} disabled={saving} className="flex items-center gap-2 bg-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"><Plus size={16} /> {saving ? "جارٍ الإضافة..." : "إضافة"}</button>
        </div>
      )}
      <div className="space-y-4">
        {filtered.length === 0 && <div className="text-center text-gray-500 py-12 border border-dashed border-gray-800 rounded-xl">لا توجد أعمال بعد</div>}
        {filtered.map((work: Work) => (
          <div key={work.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            {editingWork?.id === work.id ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input value={editingWork.title} onChange={(e) => setEditingWork({ ...editingWork, title: e.target.value })} className={sc} />
                  <input value={editingWork.altText} onChange={(e) => setEditingWork({ ...editingWork, altText: e.target.value })} placeholder="Alt text" className={sc} />
                  {isVoice && <input value={editingWork.soundcloudUrl || ""} onChange={(e) => setEditingWork({ ...editingWork, soundcloudUrl: e.target.value })} placeholder="رابط SoundCloud (اختياري)" className={`${sc} md:col-span-2`} />}
                  <textarea value={editingWork.description} onChange={(e) => setEditingWork({ ...editingWork, description: e.target.value })} rows={2} className={`${sc} resize-none md:col-span-2`} />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm font-semibold">🖼️ صورة الغلاف</p>
                  <SingleImageUploader url={editingWork.coverImage || ""} onChange={(url) => setEditingWork({ ...editingWork, coverImage: url })} folder="works" label="رفع صورة الغلاف" />
                </div>
                {isVoice && (
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm font-semibold">🎵 ملف صوتي MP3</p>
                    <AudioUploader url={editingWork.audioUrl || ""} onChange={(url) => setEditingWork({ ...editingWork, audioUrl: url })} folder="works/audio" label="تغيير الملف الصوتي" />
                  </div>
                )}
                {!isVoice && (
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm font-semibold">📸 صور المحتوى</p>
                    <ImageUploader images={editingWork.images || []} onChange={(imgs: string[]) => setEditingWork({ ...editingWork, images: imgs })} />
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={onSave} disabled={saving} className="flex items-center gap-2 bg-green-600 px-5 py-2 rounded-lg font-semibold hover:bg-green-700"><Save size={16} /> حفظ</button>
                  <button onClick={() => setEditingWork(null)} className="flex items-center gap-2 bg-gray-700 px-5 py-2 rounded-lg hover:bg-gray-600"><X size={16} /> إلغاء</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {work.coverImage ? <img src={work.coverImage} alt={work.altText} className="w-14 h-14 rounded-lg object-cover border border-gray-700 flex-shrink-0" /> : isVoice ? <div className="w-14 h-14 rounded-lg border border-gray-700 flex-shrink-0 bg-pink-900/20 flex items-center justify-center">🎙️</div> : null}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white">{work.title}</h3>
                  <p className="text-gray-400 text-sm truncate">{work.description}</p>
                  {work.soundcloudUrl && <span className="text-xs text-orange-400 mr-2">SoundCloud ✓</span>}
                  {work.audioUrl && <span className="text-xs text-purple-400">MP3 ✓</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingWork(work)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg"><Pencil size={16} /></button>
                  <button onClick={() => onDelete(work.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"info" | "about" | "media" | "articles" | "clients" | "courses" | "footer" | "works">("info");
  const [worksSubTab, setWorksSubTab] = useState<"design" | "photography" | "voice">("design");
  const [works, setWorks] = useState<Work[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [mediaOutputs, setMediaOutputs] = useState<MediaOutput[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [editingMedia, setEditingMedia] = useState<MediaOutput | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showAddWork, setShowAddWork] = useState(false);
  const [showAddExp, setShowAddExp] = useState(false);
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const emptyWork = { title: "", description: "", coverImage: "", images: [], altText: "", soundcloudUrl: "", audioUrl: "", category: "design" as Work["category"] };
  const emptyExp: Omit<Experience, "id"> = { period: "", title: "", location: "", tasks: "" };
  const emptyMedia: Omit<MediaOutput, "id"> = { title: "", channel: "", type: "تلفزيون", date: "", description: "", url: "" };
  const emptyArticle: Omit<Article, "id"> = { title: "", content: "", coverImage: "", coverAlt: "", date: new Date().toLocaleDateString("ar-SA"), tags: [], category: "" };
  const emptyClient: Omit<Client, "id"> = { name: "", logoUrl: "", logoAlt: "" };
  const emptyCourse: Omit<Course, "id"> = { title: "", description: "", image: "", duration: "", students: "", level: "", modules: "", email: "djo-mustapha@gmail.com" };

  const [newWork, setNewWork] = useState(emptyWork);
  const [newExp, setNewExp] = useState(emptyExp);
  const [newMedia, setNewMedia] = useState(emptyMedia);
  const [newArticle, setNewArticle] = useState(emptyArticle);
  const [newClient, setNewClient] = useState(emptyClient);
  const [newCourse, setNewCourse] = useState(emptyCourse);

  const [infoForm, setInfoForm] = useState({
    heroName: "", heroDescription: "", profileImageUrl: "", aboutText: "",
    aboutBio: "", aboutImages: [] as AboutImage[],
    email: "", phone: "", footerDescription: "", linkedinUrl: "", twitterUrl: "", instagramUrl: "",
  });

  useEffect(() => { const unsub = onAuthStateChanged(auth, (u) => setUser(u)); return unsub; }, []);

  useEffect(() => {
    if (!user) return;
    const u1 = onSnapshot(collection(db, "works"), (snap) => {
      setWorks(snap.docs.map((d) => { const data = d.data(); return { id: d.id, title: data.title || "", description: data.description || "", coverImage: data.coverImage || "", images: data.images || [], altText: data.altText || "", soundcloudUrl: data.soundcloudUrl || "", audioUrl: data.audioUrl || "", category: data.category || "design" } as Work; }));
    });
    const u2 = onSnapshot(collection(db, "experiences"), (snap) => { setExperiences(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Experience))); });
    const u3 = onSnapshot(collection(db, "mediaOutputs"), (snap) => { setMediaOutputs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MediaOutput))); });
    const u4 = onSnapshot(collection(db, "articles"), (snap) => { setArticles(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Article))); });
    const u5 = onSnapshot(collection(db, "clients"), (snap) => { setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Client))); });
    const u7 = onSnapshot(collection(db, "courses"), (snap) => { setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Course))); });
    const u6 = onSnapshot(collection(db, "siteInfo"), (snap) => {
      if (!snap.empty) {
        const d = snap.docs[0]; const data = { id: d.id, ...d.data() } as SiteInfo; setSiteInfo(data);
        setInfoForm({ heroName: data.heroName || "", heroDescription: data.heroDescription || "", profileImageUrl: data.profileImageUrl || "", aboutText: data.aboutText || "", aboutBio: data.aboutBio || "", aboutImages: data.aboutImages || [], email: data.email || "", phone: data.phone || "", footerDescription: data.footerDescription || "", linkedinUrl: data.linkedinUrl || "", twitterUrl: data.twitterUrl || "", instagramUrl: data.instagramUrl || "" });
      }
    });
    return () => { u1(); u2(); u3(); u4(); u5(); u6(); u7(); };
  }, [user]);

  const handleLogin = async (email: string, password: string) => { await signInWithEmailAndPassword(auth, email, password); };
  const handleLogout = async () => { await signOut(auth); };
  const showMsg = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(""), 3000); };

  const saveInfo = async () => { setSaving(true); try { if (siteInfo) await updateDoc(doc(db, "siteInfo", siteInfo.id), infoForm); else await addDoc(collection(db, "siteInfo"), infoForm); showMsg("✅ تم الحفظ"); } catch { showMsg("❌ حدث خطأ"); } setSaving(false); };
  const addWork = async () => { if (!newWork.title) return; setSaving(true); try { await addDoc(collection(db, "works"), newWork); setNewWork(emptyWork); setShowAddWork(false); showMsg("✅ تمت الإضافة"); } catch { showMsg("❌ حدث خطأ"); } setSaving(false); };
  const saveWork = async () => { if (!editingWork) return; setSaving(true); try { const { id, ...data } = editingWork; await updateDoc(doc(db, "works", id), data); setEditingWork(null); showMsg("✅ تم التعديل"); } catch { showMsg("❌ حدث خطأ"); } setSaving(false); };
  const deleteWork = async (id: string) => { if (!confirm("هل أنت متأكد؟")) return; await deleteDoc(doc(db, "works", id)); showMsg("✅ تم الحذف"); };
  const addExp = async () => { if (!newExp.title) return; setSaving(true); try { await addDoc(collection(db, "experiences"), newExp); setNewExp(emptyExp); setShowAddExp(false); showMsg("✅ تمت الإضافة"); } catch { showMsg("❌ حدث خطأ"); } setSaving(false); };
  const saveExp = async () => { if (!editingExp) return; setSaving(true); try { const { id, ...data } = editingExp; await updateDoc(doc(db, "experiences", id), data); setEditingExp(null); showMsg("✅ تم التعديل"); } catch { showMsg("❌ حدث خطأ"); } setSaving(false); };
  const deleteExp = async (id: string) => { if (!confirm("هل أنت متأكد؟")) return; await deleteDoc(doc(db, "experiences", id)); showMsg("✅ تم الحذف"); };
  const addMedia = async () => { if (!newMedia.title) return; setSaving(true); try { await addDoc(collection(db, "mediaOutputs"), newMedia); setNewMedia(emptyMedia); setShowAddMedia(false); showMsg("✅ تمت الإضافة"); } catch { showMsg("❌ حدث خطأ"); } setSaving(false); };
  const saveMedia = async () => { if (!editingMedia) return; setSaving(true); try { const { id, ...data } = editingMedia; await updateDoc(doc(db, "mediaOutputs", id), data); setEditingMedia(null); showMsg("✅ تم التعديل"); } catch { showMsg("❌ حدث خطأ"); } setSaving(false); };
  const deleteMedia = async (id: string) => { if (!confirm("هل أنت متأكد؟")) return; await deleteDoc(doc(db, "mediaOutputs", id)); showMsg("✅ تم الحذف"); };
  const addArticle = async () => { if (!newArticle.title) return; setSaving(true); try { await addDoc(collection(db, "articles"), newArticle); setNewArticle(emptyArticle); setShowAddArticle(false); showMsg("✅ تم نشر المقال"); } catch { showMsg("❌ حدث خطأ"); } setSaving(false); };
  const saveArticle = async () => { if (!editingArticle) return; setSaving(true); try { const { id, ...data } = editingArticle; await updateDoc(doc(db, "articles", id), data); setEditingArticle(null); showMsg("✅ تم التعديل"); } catch { showMsg("❌ حدث خطأ"); } setSaving(false); };
  const deleteArticle = async (id: string) => { if (!confirm("هل أنت متأكد من حذف المقال؟")) return; await deleteDoc(doc(db, "articles", id)); showMsg("✅ تم الحذف"); };
  const addClient = async () => { if (!newClient.name) return; setSaving(true); try { await addDoc(collection(db, "clients"), newClient); setNewClient(emptyClient); setShowAddClient(false); showMsg("✅ تمت الإضافة"); } catch { showMsg("❌ حدث خطأ"); } setSaving(false); };
  const saveClient = async () => { if (!editingClient) return; setSaving(true); try { const { id, ...data } = editingClient; await updateDoc(doc(db, "clients", id), data); setEditingClient(null); showMsg("✅ تم التعديل"); } catch { showMsg("❌ حدث خطأ"); } setSaving(false); };
  const deleteClient = async (id: string) => { if (!confirm("هل أنت متأكد؟")) return; await deleteDoc(doc(db, "clients", id)); showMsg("✅ تم الحذف"); };
  const addCourse = async () => { if (!newCourse.title) return; setSaving(true); try { await addDoc(collection(db, "courses"), newCourse); setNewCourse(emptyCourse); setShowAddCourse(false); showMsg("✅ تمت الإضافة"); } catch { showMsg("❌ حدث خطأ"); } setSaving(false); };
  const saveCourse = async () => { if (!editingCourse) return; setSaving(true); try { const { id, ...data } = editingCourse; await updateDoc(doc(db, "courses", id), data); setEditingCourse(null); showMsg("✅ تم التعديل"); } catch { showMsg("❌ حدث خطأ"); } setSaving(false); };
  const deleteCourse = async (id: string) => { if (!confirm("هل أنت متأكد؟")) return; await deleteDoc(doc(db, "courses", id)); showMsg("✅ تم الحذف"); };

  const updateAboutImage = (index: number, field: "url" | "alt", value: string) => {
    const imgs = [...(infoForm.aboutImages || [])];
    if (!imgs[index]) imgs[index] = { url: "", alt: "" };
    imgs[index] = { ...imgs[index], [field]: value };
    setInfoForm({ ...infoForm, aboutImages: imgs });
  };

  if (!user) return <LoginForm onLogin={handleLogin} />;

  const ic = "w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500";
  const sc = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm";
  const saveBtn = <button onClick={saveInfo} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"><Save size={18} /> {saving ? "جارٍ الحفظ..." : "حفظ"}</button>;
  const mediaTypes = ["تلفزيون", "إذاعة", "صحافة", "بودكاست", "يوتيوب", "أخرى"];
  const tabs = [
    { key: "info", label: "🏠 الرئيسية" }, { key: "about", label: "👤 عني" },
    { key: "media", label: "📺 المخرجات" }, { key: "articles", label: "📝 المقالات" },
    { key: "clients", label: "🤝 العملاء" }, { key: "courses", label: "🎓 الدورات" }, { key: "footer", label: "📋 الفوتر" },
    { key: "works", label: "💼 الأعمال" },
  ];
  const subTabs = [
    { key: "design", label: "🎨 التصميم", count: works.filter(w => w.category === "design").length },
    { key: "photography", label: "📷 التصوير", count: works.filter(w => w.category === "photography").length },
    { key: "voice", label: "🎙️ الصوتي", count: works.filter(w => w.category === "voice").length },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">لوحة التحكم</h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"><LogOut size={18} /> خروج</button>
      </div>
      {message && <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 text-white px-6 py-3 rounded-xl shadow-xl z-50">{message}</div>}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-1 mb-8 bg-gray-900 p-1 rounded-xl overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm whitespace-nowrap ${activeTab === tab.key ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "info" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
            <h2 className="text-xl font-bold">الصفحة الرئيسية</h2>
            <div className="space-y-2"><label className="block text-gray-400 text-sm">الصورة الشخصية</label><SingleImageUploader url={infoForm.profileImageUrl} onChange={(url) => setInfoForm({ ...infoForm, profileImageUrl: url })} folder="profile" label="رفع صورة جديدة" rounded /></div>
            <div><label className="block text-gray-400 mb-2 text-sm">الاسم</label><input value={infoForm.heroName} onChange={(e) => setInfoForm({ ...infoForm, heroName: e.target.value })} className={ic} /></div>
            <div><label className="block text-gray-400 mb-2 text-sm">وصف الهيرو</label><textarea value={infoForm.heroDescription} onChange={(e) => setInfoForm({ ...infoForm, heroDescription: e.target.value })} rows={3} className={`${ic} resize-none`} /></div>
            {saveBtn}
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-4">
              <h2 className="text-xl font-bold">النبذة الشخصية</h2>
              <textarea value={infoForm.aboutBio} onChange={(e) => setInfoForm({ ...infoForm, aboutBio: e.target.value })} rows={4} className={`${ic} resize-none`} placeholder="معلّق صوتي محترف..." />
              {saveBtn}
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
              <h2 className="text-xl font-bold">صور صفحة عني (3 صور)</h2>
              {[0, 1, 2].map((i) => (
                <div key={i} className="border border-gray-800 rounded-xl p-4 space-y-3">
                  <p className="text-gray-400 text-sm font-semibold">الصورة {i + 1} {i === 0 ? "— الهيرو" : i === 1 ? "— مع المهارات" : "— مع الصفات"}</p>
                  <SingleImageUploader url={infoForm.aboutImages?.[i]?.url || ""} onChange={(url) => updateAboutImage(i, "url", url)} folder="about" label={`رفع الصورة ${i + 1}`} />
                  <input value={infoForm.aboutImages?.[i]?.alt || ""} onChange={(e) => updateAboutImage(i, "alt", e.target.value)} placeholder="Alt text للـ SEO" className={sc} />
                </div>
              ))}
              {saveBtn}
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">المسيرة المهنية ({experiences.length})</h2>
                <button onClick={() => setShowAddExp(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2 rounded-lg font-semibold text-sm"><Plus size={16} /> إضافة</button>
              </div>
              {showAddExp && (
                <div className="bg-gray-800 border border-blue-700 rounded-xl p-5 mb-6 space-y-3">
                  <div className="flex justify-between"><h3 className="text-blue-400 font-bold">تجربة جديدة</h3><button onClick={() => setShowAddExp(false)}><X size={16} className="text-gray-400" /></button></div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <input value={newExp.title} onChange={(e) => setNewExp({ ...newExp, title: e.target.value })} placeholder="المسمى الوظيفي" className={sc} />
                    <input value={newExp.period} onChange={(e) => setNewExp({ ...newExp, period: e.target.value })} placeholder="الفترة" className={sc} />
                    <input value={newExp.location} onChange={(e) => setNewExp({ ...newExp, location: e.target.value })} placeholder="الموقع" className={sc} />
                  </div>
                  <textarea value={newExp.tasks} onChange={(e) => setNewExp({ ...newExp, tasks: e.target.value })} placeholder="المهام (سطر لكل مهمة)" rows={3} className={`${sc} resize-none`} />
                  <button onClick={addExp} disabled={saving} className="flex items-center gap-2 bg-blue-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"><Plus size={14} /> {saving ? "جارٍ..." : "إضافة"}</button>
                </div>
              )}
              <div className="space-y-3">
                {experiences.length === 0 && <p className="text-gray-500 text-center py-8">لا توجد تجارب</p>}
                {experiences.map((exp) => (
                  <div key={exp.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    {editingExp?.id === exp.id ? (
                      <div className="space-y-3">
                        <div className="grid md:grid-cols-2 gap-3">
                          <input value={editingExp.title} onChange={(e) => setEditingExp({ ...editingExp, title: e.target.value })} className={sc} />
                          <input value={editingExp.period} onChange={(e) => setEditingExp({ ...editingExp, period: e.target.value })} className={sc} />
                          <input value={editingExp.location} onChange={(e) => setEditingExp({ ...editingExp, location: e.target.value })} className={sc} />
                        </div>
                        <textarea value={editingExp.tasks} onChange={(e) => setEditingExp({ ...editingExp, tasks: e.target.value })} rows={3} className={`${sc} resize-none`} />
                        <div className="flex gap-2">
                          <button onClick={saveExp} disabled={saving} className="flex items-center gap-1 bg-green-600 px-4 py-1.5 rounded-lg text-sm hover:bg-green-700"><Save size={14} /> حفظ</button>
                          <button onClick={() => setEditingExp(null)} className="flex items-center gap-1 bg-gray-600 px-4 py-1.5 rounded-lg text-sm"><X size={14} /> إلغاء</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div><p className="font-bold text-white text-sm">{exp.title}</p><p className="text-blue-400 text-xs">{exp.period} — {exp.location}</p></div>
                        <div className="flex gap-1">
                          <button onClick={() => setEditingExp(exp)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded"><Pencil size={14} /></button>
                          <button onClick={() => deleteExp(exp.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">المخرجات الإعلامية ({mediaOutputs.length})</h2>
              <button onClick={() => setShowAddMedia(true)} className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-600 px-5 py-2 rounded-lg font-semibold text-sm"><Plus size={16} /> إضافة ظهور</button>
            </div>
            {showAddMedia && (
              <div className="bg-gray-800 border border-pink-700 rounded-xl p-5 mb-6 space-y-3">
                <div className="flex justify-between"><h3 className="text-pink-400 font-bold">ظهور إعلامي جديد</h3><button onClick={() => setShowAddMedia(false)}><X size={16} className="text-gray-400" /></button></div>
                <div className="grid md:grid-cols-2 gap-3">
                  <input value={newMedia.title} onChange={(e) => setNewMedia({ ...newMedia, title: e.target.value })} placeholder="عنوان الظهور" className={sc} />
                  <input value={newMedia.channel} onChange={(e) => setNewMedia({ ...newMedia, channel: e.target.value })} placeholder="اسم القناة" className={sc} />
                  <select value={newMedia.type} onChange={(e) => setNewMedia({ ...newMedia, type: e.target.value as any })} className={sc}>{mediaTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
                  <input value={newMedia.date} onChange={(e) => setNewMedia({ ...newMedia, date: e.target.value })} placeholder="التاريخ" className={sc} />
                  <input value={newMedia.url} onChange={(e) => setNewMedia({ ...newMedia, url: e.target.value })} placeholder="رابط (اختياري)" className={`${sc} md:col-span-2`} />
                  <textarea value={newMedia.description} onChange={(e) => setNewMedia({ ...newMedia, description: e.target.value })} placeholder="وصف مختصر" rows={2} className={`${sc} resize-none md:col-span-2`} />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm font-semibold">🖼️ صورة الغلاف (اختياري)</p>
                  <SingleImageUploader url={newMedia.coverImage || ""} onChange={(url) => setNewMedia({ ...newMedia, coverImage: url })} folder="media" label="رفع صورة الغلاف" />
                </div>
                <button onClick={addMedia} disabled={saving} className="flex items-center gap-2 bg-pink-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-pink-700"><Plus size={14} /> {saving ? "جارٍ..." : "إضافة"}</button>
              </div>
            )}
            <div className="space-y-3">
              {mediaOutputs.length === 0 && <p className="text-gray-500 text-center py-8">لا توجد مخرجات بعد</p>}
              {mediaOutputs.map((media) => (
                <div key={media.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  {editingMedia?.id === media.id ? (
                    <div className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <input value={editingMedia.title} onChange={(e) => setEditingMedia({ ...editingMedia, title: e.target.value })} className={sc} />
                        <input value={editingMedia.channel} onChange={(e) => setEditingMedia({ ...editingMedia, channel: e.target.value })} className={sc} />
                        <select value={editingMedia.type} onChange={(e) => setEditingMedia({ ...editingMedia, type: e.target.value as any })} className={sc}>{mediaTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
                        <input value={editingMedia.date} onChange={(e) => setEditingMedia({ ...editingMedia, date: e.target.value })} className={sc} />
                        <input value={editingMedia.url} onChange={(e) => setEditingMedia({ ...editingMedia, url: e.target.value })} className={`${sc} md:col-span-2`} />
                        <textarea value={editingMedia.description} onChange={(e) => setEditingMedia({ ...editingMedia, description: e.target.value })} rows={2} className={`${sc} resize-none md:col-span-2`} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm font-semibold">🖼️ صورة الغلاف</p>
                        <SingleImageUploader url={editingMedia.coverImage || ""} onChange={(url) => setEditingMedia({ ...editingMedia, coverImage: url })} folder="media" label="تغيير الصورة" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveMedia} disabled={saving} className="flex items-center gap-1 bg-green-600 px-4 py-1.5 rounded-lg text-sm hover:bg-green-700"><Save size={14} /> حفظ</button>
                        <button onClick={() => setEditingMedia(null)} className="flex items-center gap-1 bg-gray-600 px-4 py-1.5 rounded-lg text-sm"><X size={14} /> إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      {media.coverImage && <img src={media.coverImage} alt={media.title} className="w-16 h-16 rounded-lg object-cover border border-gray-700 flex-shrink-0" />}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${media.type === "تلفزيون" ? "bg-blue-900 text-blue-300" : media.type === "إذاعة" ? "bg-orange-900 text-orange-300" : media.type === "صحافة" ? "bg-green-900 text-green-300" : "bg-purple-900 text-purple-300"}`}>{media.type}</span>
                          <span className="text-gray-500 text-xs">{media.date}</span>
                        </div>
                        <p className="font-bold text-white text-sm">{media.title}</p>
                        <p className="text-gray-400 text-xs">{media.channel}</p>
                        {media.url && <a href={media.url} target="_blank" rel="noopener noreferrer" className="text-pink-400 text-xs hover:underline">🔗 مشاهدة</a>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingMedia(media)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded"><Pencil size={14} /></button>
                        <button onClick={() => deleteMedia(media.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "articles" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">المقالات ({articles.length})</h2>
              <button onClick={() => setShowAddArticle(true)} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 px-5 py-2 rounded-lg font-semibold text-sm hover:from-purple-600 hover:to-pink-700 transition-all"><Plus size={16} /> مقال جديد</button>
            </div>
            {showAddArticle && (
              <div className="bg-gray-800 border border-purple-700 rounded-xl p-5 mb-6 space-y-3">
                <div className="flex justify-between"><h3 className="text-purple-400 font-bold">مقال جديد</h3><button onClick={() => setShowAddArticle(false)}><X size={16} className="text-gray-400" /></button></div>
                <div className="grid md:grid-cols-2 gap-3">
                  <input value={newArticle.title} onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })} placeholder="عنوان المقال" className={`${sc} md:col-span-2`} />
                  <input value={newArticle.category} onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })} placeholder="التصنيف" className={sc} />
                  <input value={newArticle.date} onChange={(e) => setNewArticle({ ...newArticle, date: e.target.value })} placeholder="التاريخ" className={sc} />
                  <input value={newArticle.tags.join("، ")} onChange={(e) => setNewArticle({ ...newArticle, tags: e.target.value.split("،").map(t => t.trim()).filter(Boolean) })} placeholder="الوسوم (افصل بفاصلة عربية ،)" className={`${sc} md:col-span-2`} />
                  <input value={newArticle.coverImage} onChange={(e) => setNewArticle({ ...newArticle, coverImage: e.target.value })} placeholder="رابط صورة الغلاف" className={sc} />
                  <input value={newArticle.coverAlt} onChange={(e) => setNewArticle({ ...newArticle, coverAlt: e.target.value })} placeholder="Alt text للغلاف (SEO)" className={sc} />
                  <textarea value={newArticle.content} onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })} placeholder="محتوى المقال (يدعم HTML بسيط)" rows={10} className={`${sc} resize-none md:col-span-2`} />
                </div>
                <button onClick={addArticle} disabled={saving} className="flex items-center gap-2 bg-purple-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700"><Plus size={14} /> {saving ? "جارٍ النشر..." : "نشر المقال"}</button>
              </div>
            )}
            <div className="space-y-3">
              {articles.length === 0 && <p className="text-gray-500 text-center py-8">لا توجد مقالات بعد</p>}
              {articles.map((article) => (
                <div key={article.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  {editingArticle?.id === article.id ? (
                    <div className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <input value={editingArticle.title} onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })} className={`${sc} md:col-span-2`} />
                        <input value={editingArticle.category} onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })} className={sc} />
                        <input value={editingArticle.date} onChange={(e) => setEditingArticle({ ...editingArticle, date: e.target.value })} className={sc} />
                        <input value={editingArticle.tags.join("، ")} onChange={(e) => setEditingArticle({ ...editingArticle, tags: e.target.value.split("،").map(t => t.trim()).filter(Boolean) })} className={`${sc} md:col-span-2`} />
                        <input value={editingArticle.coverImage} onChange={(e) => setEditingArticle({ ...editingArticle, coverImage: e.target.value })} className={sc} />
                        <input value={editingArticle.coverAlt} onChange={(e) => setEditingArticle({ ...editingArticle, coverAlt: e.target.value })} className={sc} />
                        <textarea value={editingArticle.content} onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })} rows={10} className={`${sc} resize-none md:col-span-2`} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveArticle} disabled={saving} className="flex items-center gap-1 bg-green-600 px-4 py-1.5 rounded-lg text-sm hover:bg-green-700"><Save size={14} /> حفظ</button>
                        <button onClick={() => setEditingArticle(null)} className="flex items-center gap-1 bg-gray-600 px-4 py-1.5 rounded-lg text-sm"><X size={14} /> إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      {article.coverImage && <img src={article.coverImage} alt={article.coverAlt} className="w-16 h-12 rounded-lg object-cover border border-gray-700 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm">{article.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {article.category && <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded-full">{article.category}</span>}
                          <span className="text-gray-500 text-xs">{article.date}</span>
                        </div>
                        {article.tags?.length > 0 && <div className="flex gap-1 mt-1 flex-wrap">{article.tags.slice(0, 4).map((tag, i) => <span key={i} className="text-xs text-purple-400">#{tag}</span>)}</div>}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => setEditingArticle(article)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded"><Pencil size={14} /></button>
                        <button onClick={() => deleteArticle(article.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "clients" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">العملاء ({clients.length})</h2>
              <button onClick={() => setShowAddClient(true)} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 px-5 py-2 rounded-lg font-semibold text-sm hover:from-green-600 hover:to-teal-700 transition-all"><Plus size={16} /> إضافة عميل</button>
            </div>
            {showAddClient && (
              <div className="bg-gray-800 border border-green-700 rounded-xl p-5 mb-6 space-y-3">
                <div className="flex justify-between"><h3 className="text-green-400 font-bold">عميل جديد</h3><button onClick={() => setShowAddClient(false)}><X size={16} className="text-gray-400" /></button></div>
                <div className="grid md:grid-cols-2 gap-3">
                  <input value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} placeholder="اسم العميل / الشركة" className={sc} />
                  <input value={newClient.logoAlt} onChange={(e) => setNewClient({ ...newClient, logoAlt: e.target.value })} placeholder="Alt text للـ SEO" className={sc} />
                </div>
                <SingleImageUploader url={newClient.logoUrl} onChange={(url) => setNewClient({ ...newClient, logoUrl: url })} folder="clients" label="رفع شعار العميل" />
                <button onClick={addClient} disabled={saving} className="flex items-center gap-2 bg-green-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"><Plus size={14} /> {saving ? "جارٍ..." : "إضافة"}</button>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {clients.length === 0 && <p className="text-gray-500 text-center py-8 col-span-3">لا يوجد عملاء بعد</p>}
              {clients.map((client) => (
                <div key={client.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  {editingClient?.id === client.id ? (
                    <div className="space-y-3">
                      <input value={editingClient.name} onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })} className={sc} />
                      <input value={editingClient.logoAlt} onChange={(e) => setEditingClient({ ...editingClient, logoAlt: e.target.value })} placeholder="Alt text" className={sc} />
                      <SingleImageUploader url={editingClient.logoUrl} onChange={(url) => setEditingClient({ ...editingClient, logoUrl: url })} folder="clients" label="تغيير الشعار" />
                      <div className="flex gap-2">
                        <button onClick={saveClient} disabled={saving} className="flex items-center gap-1 bg-green-600 px-4 py-1.5 rounded-lg text-sm hover:bg-green-700"><Save size={14} /> حفظ</button>
                        <button onClick={() => setEditingClient(null)} className="flex items-center gap-1 bg-gray-600 px-4 py-1.5 rounded-lg text-sm"><X size={14} /> إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center">
                      {client.logoUrl ? <img src={client.logoUrl} alt={client.logoAlt || client.name} className="w-16 h-16 object-contain" /> : <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-xl font-bold text-gray-400">{client.name.charAt(0)}</div>}
                      <p className="text-white text-sm font-semibold">{client.name}</p>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingClient(client)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded"><Pencil size={14} /></button>
                        <button onClick={() => deleteClient(client.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">الدورات التدريبية ({courses.length})</h2>
              <button onClick={() => setShowAddCourse(true)} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 px-5 py-2 rounded-lg font-semibold text-sm hover:from-green-600 hover:to-teal-700 transition-all"><Plus size={16} /> إضافة دورة</button>
            </div>
            {showAddCourse && (
              <div className="bg-gray-800 border border-green-700 rounded-xl p-5 mb-6 space-y-3">
                <div className="flex justify-between"><h3 className="text-green-400 font-bold">دورة جديدة</h3><button onClick={() => setShowAddCourse(false)}><X size={16} className="text-gray-400" /></button></div>
                <div className="grid md:grid-cols-2 gap-3">
                  <input value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} placeholder="عنوان الدورة" className={`${sc} md:col-span-2`} />
                  <textarea value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} placeholder="وصف الدورة" rows={2} className={`${sc} resize-none md:col-span-2`} />
                  <input value={newCourse.duration} onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })} placeholder="المدة" className={sc} />
                  <input value={newCourse.students} onChange={(e) => setNewCourse({ ...newCourse, students: e.target.value })} placeholder="عدد المتدربين" className={sc} />
                  <input value={newCourse.level} onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })} placeholder="المستوى" className={sc} />
                  <input value={newCourse.email} onChange={(e) => setNewCourse({ ...newCourse, email: e.target.value })} placeholder="البريد للتسجيل" className={sc} />
                  <textarea value={newCourse.modules} onChange={(e) => setNewCourse({ ...newCourse, modules: e.target.value })} placeholder="محتوى الدورة (سطر لكل وحدة)" rows={4} className={`${sc} resize-none md:col-span-2`} />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm font-semibold">🖼️ صورة الدورة</p>
                  <SingleImageUploader url={newCourse.image} onChange={(url) => setNewCourse({ ...newCourse, image: url })} folder="courses" label="رفع صورة الدورة" />
                </div>
                <button onClick={addCourse} disabled={saving} className="flex items-center gap-2 bg-green-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"><Plus size={14} /> {saving ? "جارٍ..." : "إضافة"}</button>
              </div>
            )}
            <div className="space-y-4">
              {courses.length === 0 && <p className="text-gray-500 text-center py-8">لا توجد دورات</p>}
              {courses.map((course) => (
                <div key={course.id} className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                  {editingCourse?.id === course.id ? (
                    <div className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <input value={editingCourse.title} onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })} className={`${sc} md:col-span-2`} />
                        <textarea value={editingCourse.description} onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })} rows={2} className={`${sc} resize-none md:col-span-2`} />
                        <input value={editingCourse.duration} onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })} className={sc} />
                        <input value={editingCourse.students} onChange={(e) => setEditingCourse({ ...editingCourse, students: e.target.value })} className={sc} />
                        <input value={editingCourse.level} onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value })} className={sc} />
                        <input value={editingCourse.email} onChange={(e) => setEditingCourse({ ...editingCourse, email: e.target.value })} className={sc} />
                        <textarea value={editingCourse.modules} onChange={(e) => setEditingCourse({ ...editingCourse, modules: e.target.value })} rows={4} className={`${sc} resize-none md:col-span-2`} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm font-semibold">🖼️ صورة الدورة</p>
                        <SingleImageUploader url={editingCourse.image} onChange={(url) => setEditingCourse({ ...editingCourse, image: url })} folder="courses" label="تغيير الصورة" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveCourse} disabled={saving} className="flex items-center gap-1 bg-green-600 px-4 py-1.5 rounded-lg text-sm hover:bg-green-700"><Save size={14} /> حفظ</button>
                        <button onClick={() => setEditingCourse(null)} className="flex items-center gap-1 bg-gray-600 px-4 py-1.5 rounded-lg text-sm"><X size={14} /> إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      {course.image && <img src={course.image} alt={course.title} className="w-16 h-16 rounded-lg object-cover border border-gray-700 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white">{course.title}</h3>
                        <p className="text-gray-400 text-sm truncate">{course.description}</p>
                        <div className="flex gap-3 mt-1">
                          {course.duration && <span className="text-xs text-green-400">{course.duration}</span>}
                          {course.level && <span className="text-xs text-gray-500">{course.level}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingCourse(course)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded"><Pencil size={16} /></button>
                        <button onClick={() => deleteCourse(course.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "footer" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
            <h2 className="text-xl font-bold">معلومات الفوتر</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div><label className="block text-gray-400 mb-2 text-sm">البريد الإلكتروني</label><input value={infoForm.email} onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })} className={ic} /></div>
              <div><label className="block text-gray-400 mb-2 text-sm">رقم الهاتف</label><input value={infoForm.phone} onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })} className={ic} /></div>
              <div><label className="block text-gray-400 mb-2 text-sm">رابط LinkedIn</label><input value={infoForm.linkedinUrl} onChange={(e) => setInfoForm({ ...infoForm, linkedinUrl: e.target.value })} className={ic} /></div>
              <div><label className="block text-gray-400 mb-2 text-sm">رابط Twitter / X</label><input value={infoForm.twitterUrl} onChange={(e) => setInfoForm({ ...infoForm, twitterUrl: e.target.value })} className={ic} /></div>
              <div className="md:col-span-2"><label className="block text-gray-400 mb-2 text-sm">رابط Instagram</label><input value={infoForm.instagramUrl} onChange={(e) => setInfoForm({ ...infoForm, instagramUrl: e.target.value })} className={ic} /></div>
            </div>
            <div><label className="block text-gray-400 mb-2 text-sm">وصف الفوتر</label><textarea value={infoForm.footerDescription} onChange={(e) => setInfoForm({ ...infoForm, footerDescription: e.target.value })} rows={3} className={`${ic} resize-none`} /></div>
            {saveBtn}
          </div>
        )}

        {activeTab === "works" && (
          <div>
            <div className="flex gap-2 mb-6 bg-gray-900 p-1 rounded-xl">
              {subTabs.map((tab) => (
                <button key={tab.key} onClick={() => { setWorksSubTab(tab.key as any); setShowAddWork(false); setEditingWork(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all text-sm ${worksSubTab === tab.key ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}>
                  {tab.label}<span className={`text-xs px-2 py-0.5 rounded-full ${worksSubTab === tab.key ? "bg-blue-600" : "bg-gray-800"}`}>{tab.count}</span>
                </button>
              ))}
            </div>
            <WorksList works={works} category={worksSubTab} saving={saving} editingWork={editingWork} setEditingWork={setEditingWork} onSave={saveWork} onDelete={deleteWork} showAdd={showAddWork} setShowAdd={setShowAddWork} newWork={newWork} setNewWork={setNewWork} onAdd={addWork} sc={sc} />
          </div>
        )}
      </div>
    </div>
  );
}
