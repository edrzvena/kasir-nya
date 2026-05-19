import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, Tag, AlertCircle } from 'lucide-react';
import type { Category } from '../../lib/db';
import { dbService } from '../../lib/db';

interface CategoryManagerProps {
  categories: Category[];
  storeId: number;
  onRefresh: () => void;
}

export default function CategoryManager({ categories, storeId, onRefresh }: CategoryManagerProps) {
  const [localCats, setLocalCats] = useState<Category[]>(categories);
  useEffect(() => { setLocalCats(categories); }, [categories]);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [catError, setCatError] = useState('');

  const sorted = (cats: Category[]) =>
    [...cats].sort((a, b) => a.name.localeCompare(b.name));

  const handleAdd = async () => {
    if (!newName.trim()) return;
    if (localCats.some(c => c.name.toLowerCase() === newName.trim().toLowerCase())) {
      setCatError('Kategori ini sudah ada!');
      return;
    }
    setCatError('');
    try {
      const added = await dbService.addCategory({ name: newName.trim(), emoji: '' }, storeId);
      setLocalCats(prev => sorted([...prev, added]));
      setNewName('');
      setIsAdding(false);
      onRefresh();
    } catch (err) {
      setCatError(err instanceof Error ? err.message : 'Gagal menyimpan kategori.');
    }
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    if (localCats.some(c => c.id !== id && c.name.toLowerCase() === editName.trim().toLowerCase())) {
      setCatError('Kategori ini sudah ada!');
      return;
    }
    setCatError('');
    try {
      await dbService.updateCategory(id, { name: editName.trim(), emoji: '' }, storeId);
      setLocalCats(prev => sorted(prev.map(c =>
        c.id === id ? { ...c, name: editName.trim() } : c
      )));
      setEditId(null);
      onRefresh();
    } catch (err) {
      setCatError(err instanceof Error ? err.message : 'Gagal memperbarui kategori.');
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Hapus kategori "${cat.name}"? Produk yang sudah pakai kategori ini tetap tersimpan.`)) return;
    setCatError('');
    try {
      await dbService.deleteCategory(cat.id, storeId);
      setLocalCats(prev => prev.filter(c => c.id !== cat.id));
      onRefresh();
    } catch (err) {
      setCatError(err instanceof Error ? err.message : 'Gagal menghapus kategori.');
    }
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setEditName(cat.name);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-violet-50 rounded-lg flex items-center justify-center">
            <Tag className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm leading-tight">Kelola Kategori</h3>
            <p className="text-[9px] text-slate-400 font-medium mt-0.5">{localCats.length} kategori aktif</p>
          </div>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 bg-violet-50 hover:bg-violet-100 text-violet-600 font-bold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
          >
            <Plus className="h-3 w-3" />
            Tambah
          </button>
        )}
      </div>

      {/* Add New Category Form */}
      {isAdding && (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-3 animate-fadeIn">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nama kategori baru..."
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 placeholder:text-slate-300"
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="h-9 w-9 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-lg flex items-center justify-center cursor-pointer transition-colors shrink-0"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setIsAdding(false); setNewName(''); }}
              className="h-9 w-9 bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center cursor-pointer transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {catError && (
        <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5 mb-2">
          <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-[10px] font-semibold text-rose-700 leading-snug flex-1">{catError}</p>
          <button onClick={() => setCatError('')} className="text-rose-400 hover:text-rose-600 shrink-0">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
        {localCats.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <Tag className="h-6 w-6 mx-auto mb-2 text-slate-200" />
            <p className="text-[10px] font-bold">Belum ada kategori</p>
            <p className="text-[9px] text-slate-300 mt-0.5">Tambah kategori pertama untuk mulai</p>
          </div>
        ) : (
          localCats.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2.5 py-2 px-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              {editId === cat.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleEdit(cat.id)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                  />
                  <button onClick={() => handleEdit(cat.id)} className="h-7 w-7 bg-violet-600 text-white rounded-lg flex items-center justify-center cursor-pointer hover:bg-violet-700 transition-colors">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setEditId(null)} className="h-7 w-7 bg-white border border-slate-200 text-slate-400 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <div className="h-7 w-7 bg-violet-50 rounded-lg flex items-center justify-center shrink-0">
                    <Tag className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                  <span className="flex-1 text-xs font-bold text-slate-700 truncate">{cat.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(cat)}
                      className="h-7 w-7 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="h-7 w-7 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
