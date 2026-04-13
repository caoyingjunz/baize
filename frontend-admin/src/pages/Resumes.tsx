import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { adminApi, type AdminResumeItem } from '../services/api'

const STATUS_OPTIONS = ['ready', 'pending', 'processing', 'failed']
const statusLabel: Record<string, string> = { ready: '就绪', pending: '待处理', processing: '处理中', failed: '失败' }
const statusTag: Record<string, string> = {
  ready: 'bg-[#E8FAF4] text-[#00A870]',
  pending: 'bg-gray-100 text-gray-500',
  processing: 'bg-[#EAF2FF] text-primary-600',
  failed: 'bg-red-50 text-[#E34D59]',
}

interface CreateForm { user_id: string; title: string; file_type: string; status: string }
interface EditForm { title: string; status: string }
const defaultCreate: CreateForm = { user_id: '', title: '', file_type: 'text', status: 'ready' }

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded border border-[#DCDCDC] shadow-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#DCDCDC]">
          <h2 className="text-sm font-medium text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function CreateModal({ onClose, onSave }: { onClose: () => void; onSave: (d: CreateForm) => Promise<void> }) {
  const [form, setForm] = useState<CreateForm>(defaultCreate)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.user_id || !form.title) { setError('用户ID和标题为必填项'); return }
    setSaving(true); setError('')
    try { await onSave(form); onClose() }
    catch (err: unknown) { setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || '操作失败') }
    finally { setSaving(false) }
  }

  return (
    <Modal title="新增简历" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div><label className="label">用户 ID <span className="text-[#E34D59]">*</span></label>
          <input className="input" type="number" min="1" required value={form.user_id}
            onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))} placeholder="输入用户 ID" /></div>
        <div><label className="label">标题 <span className="text-[#E34D59]">*</span></label>
          <input className="input" required value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="简历标题" /></div>
        <div><label className="label">文件类型</label>
          <select className="input" value={form.file_type} onChange={e => setForm(f => ({ ...f, file_type: e.target.value }))}>
            {['text', 'pdf', 'docx'].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select></div>
        <div><label className="label">状态</label>
          <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
          </select></div>
        {error && <p className="text-xs text-[#E34D59]">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">取消</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? '保存中...' : '确定'}</button>
        </div>
      </form>
    </Modal>
  )
}

function EditModal({ item, onClose, onSave }: { item: AdminResumeItem; onClose: () => void; onSave: (d: EditForm) => Promise<void> }) {
  const [form, setForm] = useState<EditForm>({ title: item.title, status: item.status })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    try { await onSave(form); onClose() }
    catch (err: unknown) { setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || '操作失败') }
    finally { setSaving(false) }
  }

  return (
    <Modal title="编辑简历" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div><label className="label">标题 <span className="text-[#E34D59]">*</span></label>
          <input className="input" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
        <div><label className="label">状态</label>
          <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
          </select></div>
        {error && <p className="text-xs text-[#E34D59]">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">取消</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? '保存中...' : '确定'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default function AdminResumes() {
  const [items, setItems] = useState<AdminResumeItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const pageSize = 20

  const [showCreate, setShowCreate] = useState(false)
  const [editItem, setEditItem] = useState<AdminResumeItem | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    adminApi.resumes(page, pageSize).then(({ data }) => { setItems(data.items); setTotal(data.total) }).finally(() => setLoading(false))
  }

  useEffect(load, [page])

  const totalPages = Math.ceil(total / pageSize)

  const handleCreate = async (data: CreateForm) => {
    await adminApi.createResume({ user_id: Number(data.user_id), title: data.title, file_type: data.file_type, status: data.status })
    load()
  }
  const handleEdit = async (data: EditForm) => { await adminApi.updateResume(editItem!.id, data); load() }
  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try { await adminApi.deleteResume(id); setItems(prev => prev.filter(r => r.id !== id)); setTotal(t => t - 1) }
    finally { setDeletingId(null); setConfirmDeleteId(null) }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="page-title">简历管理</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus className="w-3.5 h-3.5" />新建简历</button>
      </div>

      <div className="card px-4 py-2.5 flex items-center justify-end">
        <span className="text-xs text-gray-400">共 {total} 条</span>
      </div>

      <div className="card overflow-hidden">
        <table className="t-table">
          <thead>
            <tr>{['ID', '标题', '用户', '类型', '状态', '创建时间', '操作'].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-xs">加载中...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-xs">暂无数据</td></tr>
            ) : items.map(r => (
              <tr key={r.id}>
                <td className="text-gray-400 text-xs">{r.id}</td>
                <td className="text-gray-800 max-w-[180px] truncate">{r.title}</td>
                <td className="text-gray-500 text-xs">{r.user_email}</td>
                <td><span className="uppercase text-xs text-gray-500">{r.file_type || '—'}</span></td>
                <td><span className={`tag ${statusTag[r.status] ?? 'bg-gray-100 text-gray-500'}`}>{statusLabel[r.status] ?? r.status}</span></td>
                <td className="text-gray-400 text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleDateString('zh-CN')}</td>
                <td>
                  {confirmDeleteId === r.id ? (
                    <span className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">确认删除？</span>
                      <button onClick={() => handleDelete(r.id)} disabled={deletingId === r.id}
                        className="text-xs text-white bg-[#E34D59] px-2 py-0.5 rounded disabled:opacity-50">
                        {deletingId === r.id ? '删除中' : '确认'}
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-gray-500 px-2 py-0.5 rounded border border-[#DCDCDC]">取消</button>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <button onClick={() => setEditItem(r)} className="text-xs text-primary-600 hover:underline px-1">
                        <Pencil className="w-3.5 h-3.5 inline mr-0.5" />编辑
                      </button>
                      <span className="text-gray-200">|</span>
                      <button onClick={() => setConfirmDeleteId(r.id)} className="text-xs text-[#E34D59] hover:underline px-1">
                        <Trash2 className="w-3.5 h-3.5 inline mr-0.5" />删除
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-xs">
          <button className="btn-secondary py-1 px-3 text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>上一页</button>
          <span className="text-gray-500">{page} / {totalPages}</span>
          <button className="btn-secondary py-1 px-3 text-xs" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>下一页</button>
        </div>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onSave={handleCreate} />}
      {editItem && <EditModal item={editItem} onClose={() => setEditItem(null)} onSave={handleEdit} />}
    </div>
  )
}
