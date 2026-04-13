import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { adminApi, type AdminAnalysisItem } from '../services/api'

const MODEL_OPTIONS = ['minimax', 'deepseek', 'openai', 'claude']
const MODEL_TAG: Record<string, string> = {
  minimax: 'bg-[#EAF2FF] text-primary-600',
  deepseek: 'bg-[#E8FAF4] text-[#00A870]',
  openai: 'bg-[#FFF3E8] text-[#ED7B2F]',
  claude: 'bg-[#F4EEFF] text-[#9747FF]',
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-[#00A870]' : score >= 60 ? 'text-[#ED7B2F]' : 'text-[#E34D59]'
  return <span className={`font-medium ${color}`}>{score}</span>
}

interface AnalysisFormData {
  resume_id: string; user_id: string; total_score: string; jd_match_score: string; model_used: string
}
const defaultForm: AnalysisFormData = { resume_id: '', user_id: '', total_score: '0', jd_match_score: '0', model_used: 'minimax' }

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

function CreateModal({ onClose, onSave }: { onClose: () => void; onSave: (d: AnalysisFormData) => Promise<void> }) {
  const [form, setForm] = useState<AnalysisFormData>(defaultForm)
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
    <Modal title="新增分析记录" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">简历 ID <span className="text-[#E34D59]">*</span></label>
            <input className="input" type="number" min="1" required value={form.resume_id}
              onChange={e => setForm(f => ({ ...f, resume_id: e.target.value }))} /></div>
          <div><label className="label">用户 ID <span className="text-[#E34D59]">*</span></label>
            <input className="input" type="number" min="1" required value={form.user_id}
              onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">综合评分</label>
            <input className="input" type="number" min="0" max="100" value={form.total_score}
              onChange={e => setForm(f => ({ ...f, total_score: e.target.value }))} /></div>
          <div><label className="label">JD 匹配分</label>
            <input className="input" type="number" min="0" max="100" value={form.jd_match_score}
              onChange={e => setForm(f => ({ ...f, jd_match_score: e.target.value }))} /></div>
        </div>
        <div><label className="label">使用模型</label>
          <select className="input" value={form.model_used} onChange={e => setForm(f => ({ ...f, model_used: e.target.value }))}>
            {MODEL_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
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

function EditModal({ item, onClose, onSave }: { item: AdminAnalysisItem; onClose: () => void; onSave: (d: { total_score: number; jd_match_score: number; model_used: string }) => Promise<void> }) {
  const [totalScore, setTotalScore] = useState(String(item.total_score))
  const [jdScore, setJdScore] = useState(String(item.jd_match_score))
  const [modelUsed, setModelUsed] = useState(item.model_used)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    try { await onSave({ total_score: Number(totalScore), jd_match_score: Number(jdScore), model_used: modelUsed }); onClose() }
    catch (err: unknown) { setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || '操作失败') }
    finally { setSaving(false) }
  }

  return (
    <Modal title="编辑分析记录" onClose={onClose}>
      <p className="text-xs text-gray-400 mb-3.5">简历：{item.resume_title || `#${item.resume_id}`} · 用户：{item.user_email}</p>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">综合评分</label>
            <input className="input" type="number" min="0" max="100" value={totalScore} onChange={e => setTotalScore(e.target.value)} /></div>
          <div><label className="label">JD 匹配分</label>
            <input className="input" type="number" min="0" max="100" value={jdScore} onChange={e => setJdScore(e.target.value)} /></div>
        </div>
        <div><label className="label">使用模型</label>
          <select className="input" value={modelUsed} onChange={e => setModelUsed(e.target.value)}>
            {MODEL_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
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

export default function AdminAnalyses() {
  const [items, setItems] = useState<AdminAnalysisItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const pageSize = 20

  const [showCreate, setShowCreate] = useState(false)
  const [editItem, setEditItem] = useState<AdminAnalysisItem | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    adminApi.analyses(page, pageSize).then(({ data }) => { setItems(data.items); setTotal(data.total) }).finally(() => setLoading(false))
  }

  useEffect(load, [page])

  const totalPages = Math.ceil(total / pageSize)

  const handleCreate = async (data: AnalysisFormData) => {
    await adminApi.createAnalysis({ resume_id: Number(data.resume_id), user_id: Number(data.user_id), total_score: Number(data.total_score), jd_match_score: Number(data.jd_match_score), model_used: data.model_used })
    load()
  }
  const handleEdit = async (data: { total_score: number; jd_match_score: number; model_used: string }) => {
    await adminApi.updateAnalysis(editItem!.id, data); load()
  }
  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try { await adminApi.deleteAnalysis(id); setItems(prev => prev.filter(a => a.id !== id)); setTotal(t => t - 1) }
    finally { setDeletingId(null); setConfirmDeleteId(null) }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="page-title">分析记录</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus className="w-3.5 h-3.5" />新增记录</button>
      </div>

      <div className="card px-4 py-2.5 flex items-center justify-end">
        <span className="text-xs text-gray-400">共 {total} 条</span>
      </div>

      <div className="card overflow-hidden">
        <table className="t-table">
          <thead>
            <tr>{['ID', '简历', '用户', '综合评分', 'JD 匹配', '模型', '时间', '操作'].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-xs">加载中...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-xs">暂无数据</td></tr>
            ) : items.map(a => (
              <tr key={a.id}>
                <td className="text-gray-400 text-xs">{a.id}</td>
                <td className="text-gray-800 max-w-[140px] truncate">{a.resume_title || '—'}</td>
                <td className="text-gray-500 text-xs">{a.user_email}</td>
                <td><ScoreBadge score={a.total_score} /></td>
                <td>{a.jd_match_score > 0 ? <ScoreBadge score={a.jd_match_score} /> : <span className="text-gray-400">—</span>}</td>
                <td><span className={`tag ${MODEL_TAG[a.model_used] ?? 'bg-gray-100 text-gray-500'}`}>{a.model_used}</span></td>
                <td className="text-gray-400 text-xs whitespace-nowrap">{new Date(a.created_at).toLocaleDateString('zh-CN')}</td>
                <td>
                  {confirmDeleteId === a.id ? (
                    <span className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">确认删除？</span>
                      <button onClick={() => handleDelete(a.id)} disabled={deletingId === a.id}
                        className="text-xs text-white bg-[#E34D59] px-2 py-0.5 rounded disabled:opacity-50">
                        {deletingId === a.id ? '删除中' : '确认'}
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-gray-500 px-2 py-0.5 rounded border border-[#DCDCDC]">取消</button>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <button onClick={() => setEditItem(a)} className="text-xs text-primary-600 hover:underline px-1">
                        <Pencil className="w-3.5 h-3.5 inline mr-0.5" />编辑
                      </button>
                      <span className="text-gray-200">|</span>
                      <button onClick={() => setConfirmDeleteId(a.id)} className="text-xs text-[#E34D59] hover:underline px-1">
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
