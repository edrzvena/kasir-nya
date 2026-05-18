import { useState, useEffect, useRef } from 'react';
import { Camera, Store, Hash, Mail, ShieldCheck, ImagePlus, Loader2 } from 'lucide-react';
import { authService, type UserProfile, type Store as StoreInfo } from '../../lib/db';

interface ProfileSectionProps {
  currentUser: UserProfile;
  avatarUrl: string;
  onAvatarChange: (url: string) => void;
}

function resizeImage(file: File, size = 300): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const ratio = Math.min(size / img.width, size / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ── Shared outlet info card ────────────────────────────────────────────────
function OutletInfoCard({ storeInfo, storeLoading, storeId }: {
  storeInfo: StoreInfo | null;
  storeLoading: boolean;
  storeId: number;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="h-7 w-7 bg-indigo-50 border border-indigo-100/60 rounded-lg flex items-center justify-center">
          <Store className="h-3.5 w-3.5 text-indigo-500" />
        </div>
        <h4 className="font-bold text-slate-800 text-sm leading-none">Informasi Outlet</h4>
      </div>

      {storeLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          <div className="flex items-center justify-between py-3.5">
            <span className="text-xs font-semibold text-slate-500">Nama Toko</span>
            <span className="font-bold text-slate-800 text-sm">
              {storeInfo?.name ?? <span className="text-slate-400 font-normal italic text-xs">—</span>}
            </span>
          </div>
          <div className="flex items-center justify-between py-3.5">
            <span className="text-xs font-semibold text-slate-500">Store Code</span>
            <code className="font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-2.5 py-0.5 rounded-md text-xs font-mono uppercase tracking-wider">
              {storeInfo?.code ?? '—'}
            </code>
          </div>
          <div className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Store ID</span>
              <span className="text-[9px] text-slate-400 font-medium">(tenant)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-indigo-400" />
              <span className="font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-2.5 py-0.5 rounded-md text-sm font-mono">
                {storeId}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Cashier Profile ────────────────────────────────────────────────────────
function CashierProfile({ currentUser }: ProfileSectionProps) {
  const [storeInfo, setStoreInfo]       = useState<StoreInfo | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);

  useEffect(() => {
    authService.getStoreById(currentUser.store_id)
      .then(info => setStoreInfo(info))
      .catch(() => {})
      .finally(() => setStoreLoading(false));
  }, [currentUser.store_id]);

  const initials = (currentUser.name || 'K').charAt(0).toUpperCase();

  return (
    <div className="max-w-xl space-y-6 animate-fadeIn pb-12">
      <div>
        <h2 className="font-extrabold text-slate-800 text-xl leading-none">Profil Kasir</h2>
        <p className="text-slate-400 text-xs mt-1.5 font-medium">Informasi akun kasir kamu.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-indigo-600 to-violet-600" />

        <div className="px-6 pb-6">
          {/* Initials avatar */}
          <div className="-mt-10 mb-5">
            <div className="h-20 w-20 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-extrabold">
              {initials}
            </div>
          </div>

          <div className="space-y-3.5">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Kasir</span>
              <span className="font-bold text-slate-800 text-base leading-tight">{currentUser.name || '—'}</span>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
              <ShieldCheck className="h-4 w-4 text-indigo-500 shrink-0" />
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Role</span>
                <span className="font-bold text-indigo-600 text-xs uppercase tracking-wide font-mono">Kasir</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OutletInfoCard storeInfo={storeInfo} storeLoading={storeLoading} storeId={currentUser.store_id} />
    </div>
  );
}

// ── Admin Profile ──────────────────────────────────────────────────────────
function AdminProfile({ currentUser, avatarUrl, onAvatarChange }: ProfileSectionProps) {
  const [storeInfo, setStoreInfo]       = useState<StoreInfo | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [saving, setSaving]             = useState(false);
  const [uploadError, setUploadError]   = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    authService.getStoreById(currentUser.store_id)
      .then(info => setStoreInfo(info))
      .catch(() => {})
      .finally(() => setStoreLoading(false));
  }, [currentUser.store_id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(false);

    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa gambar (JPG, PNG, WebP, dll.)');
      e.target.value = '';
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 8MB.');
      e.target.value = '';
      return;
    }

    setSaving(true);
    try {
      const resized = await resizeImage(file, 300);
      await authService.updateStoreAvatar(currentUser.store_id, resized);
      onAvatarChange(resized);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3500);
    } catch (err: any) {
      setUploadError(err.message || 'Gagal menyimpan foto.');
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const displayName = currentUser.email
    .split('@')[0]
    .split(/[-_.]/)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');

  const defaultAvatar =
    currentUser.store_id === 1
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
      : currentUser.store_id === 2
        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop';

  const displayAvatar = avatarUrl || defaultAvatar;

  return (
    <div className="max-w-xl space-y-6 animate-fadeIn pb-12">
      <div>
        <h2 className="font-extrabold text-slate-800 text-xl leading-none">Store Profile</h2>
        <p className="text-slate-400 text-xs mt-1.5 font-medium">Kelola identitas outlet dan akun admin kamu.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-indigo-600 to-violet-600" />

        <div className="px-6 pb-6">
          <div className="relative -mt-12 mb-4 flex items-end justify-between">
            <div className="relative group">
              <div className="h-20 w-20 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-slate-100">
                <img src={displayAvatar} alt={displayName} className="h-full w-full object-cover" />
              </div>

              {!saving && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-[14px] bg-black/55 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                  title="Ganti foto profil"
                >
                  <Camera className="h-4.5 w-4.5 text-white" />
                  <span className="text-[8px] font-bold text-white uppercase tracking-wide">Ganti</span>
                </button>
              )}
              {saving && (
                <div className="absolute inset-0 rounded-[14px] bg-black/60 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                </div>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={saving} />
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl cursor-pointer transition-all shadow-sm self-end mb-0.5"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
              <span>{saving ? 'Menyimpan...' : 'Ganti Foto'}</span>
            </button>
          </div>

          {uploadError && (
            <div className="text-rose-600 text-xs font-semibold mb-4 bg-rose-50 border border-rose-100 px-3.5 py-2.5 rounded-xl">{uploadError}</div>
          )}
          {uploadSuccess && (
            <div className="text-emerald-600 text-xs font-semibold mb-4 bg-emerald-50 border border-emerald-100 px-3.5 py-2.5 rounded-xl">✓ Foto profil berhasil disimpan ke cloud!</div>
          )}

          <div className="space-y-3.5">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Admin</span>
              <span className="font-bold text-slate-800 text-base leading-tight">{displayName}</span>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
              <Mail className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Email</span>
                <span className="font-semibold text-slate-700 text-xs">{currentUser.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
              <ShieldCheck className="h-4 w-4 text-indigo-500 shrink-0" />
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Role</span>
                <span className="font-bold text-indigo-600 text-xs uppercase tracking-wide font-mono">{currentUser.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OutletInfoCard storeInfo={storeInfo} storeLoading={storeLoading} storeId={currentUser.store_id} />
    </div>
  );
}

// ── Entry point ────────────────────────────────────────────────────────────
export default function ProfileSection(props: ProfileSectionProps) {
  if (props.currentUser.role === 'cashier') return <CashierProfile {...props} />;
  return <AdminProfile {...props} />;
}
