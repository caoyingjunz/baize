import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, FileSearch, Search, AlertCircle, Info, CheckCircle2, Target, ChevronDown, ChevronUp } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import { adminApi, type AdminAnalysisItem } from '../services/api'

const MODEL_OPTIONS = ['minimax', 'deepseek', 'openai', 'claude']

const fmtDate = (s: string) => {
  const d = new Date(s)
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
}
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

function parseJson<T>(s: string | undefined, fallback: T): T {
  if (!s) return fallback
  try { return JSON.parse(s) as T } catch { return fallback }
}

interface Issue { section: string; level: string; message: string }
interface Suggestion { section: string; original?: string; improved: string; reason: string }

function IssueIcon({ level }: { level: string }) {
  if (level === 'error') return <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
  if (level === 'warning') return <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
  return <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
}

const DIM_LABELS: Record<string, string> = {
  content_completeness: '内容完整',
  language_expression: '语言表达',
  structure_clarity: '结构清晰',
  keyword_density: '关键词',
  achievement_quantification: '成就量化',
}

function AnalysisReportModal({ item, onClose }: { item: AdminAnalysisItem; onClose: () => void }) {
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<number>>(new Set())

  const detailScores = parseJson<Record<string, number>>(item.detail_scores, {})
  const issues = parseJson<Issue[]>(item.issues, [])
  const suggestions = parseJson<Suggestion[]>(item.suggestions, [])
  const missingKeys = parseJson<string[]>(item.jd_missing_keys, [])

  const radarData = Object.entries(detailScores).map(([k, v]) => ({
    subject: DIM_LABELS[k] || k,
    value: v,
    fullMark: 100,
  }))

  const scoreColor = (s: number) =>
    s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-600' : 'text-red-500'
  const scoreRing = (s: number) =>
    s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444'

  const toggleSuggestion = (i: number) => {
    setExpandedSuggestions(prev => {
      const next = new Set(prev); next.has(i) ? next.delete(i) : next.add(i); return next
    })
  }

  const hasData = Object.keys(detailScores).length > 0 || issues.length > 0 || suggestions.length > 0

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded border border-[#DCDCDC] shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#DCDCDC] flex-shrink-0">
          <div>
            <h2 className="text-sm font-medium text-gray-900">分析报告</h2>
            <p className="text-xs text-gray-400 mt-0.5">{item.resume_title || `简历 #${item.resume_id}`} · {item.user_email} · {item.model_used}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
          {!hasData && (
            <p className="text-xs text-gray-400 text-center py-10">暂无详细分析数据</p>
          )}

          {/* Score + Radar */}
          {(item.total_score > 0 || Object.keys(detailScores).length > 0) && (
            <div className="bg-white rounded-lg border border-gray-100 p-5">
              <div className="flex items-center gap-8">
                {/* Ring */}
                <div className="flex-shrink-0 relative w-32 h-32">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                    <circle cx="60" cy="60" r="50" fill="none"
                      stroke={scoreRing(item.total_score)} strokeWidth="12" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - item.total_score / 100)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold ${scoreColor(item.total_score)}`}>{item.total_score}</span>
                    <span className="text-xs text-gray-400">综合评分</span>
                  </div>
                </div>
                {/* Radar */}
                {radarData.length > 0 && (
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height={180}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#f3f4f6" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                        <Radar dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.15} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              {/* Dimension bars */}
              {Object.keys(detailScores).length > 0 && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-4">
                  {Object.entries(detailScores).map(([k, v]) => (
                    <div key={k}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">{DIM_LABELS[k] || k}</span>
                        <span className={`font-medium ${scoreColor(v)}`}>{v}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${v}%`, background: scoreRing(v) }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* JD Match */}
          {item.jd_match_score > 0 && (
            <div className="bg-white rounded-lg border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary-600" /> JD 匹配度
                </h3>
                <span className={`text-2xl font-bold ${scoreColor(item.jd_match_score)}`}>{item.jd_match_score}%</span>
              </div>
              {missingKeys.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">缺失关键词：</p>
                  <div className="flex flex-wrap gap-2">
                    {missingKeys.map((k, i) => (
                      <span key={i} className="bg-orange-50 text-orange-700 border border-orange-200 text-xs px-2.5 py-1 rounded-full">{k}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Issues */}
          {issues.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" /> 发现问题（{issues.length}）
              </h3>
              <ul className="space-y-2">
                {issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <IssueIcon level={issue.level} />
                    <div>
                      <span className="font-medium text-gray-700">{issue.section}</span>
                      <span className="text-gray-400 mx-1">·</span>
                      <span className="text-gray-600">{issue.message}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> 优化建议（{suggestions.length}）
              </h3>
              <ul className="space-y-2">
                {suggestions.map((s, i) => (
                  <li key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button onClick={() => toggleSuggestion(i)}
                      className="w-full flex items-center justify-between p-4 text-sm font-medium text-gray-700 hover:bg-gray-50 text-left">
                      <span className="flex items-center gap-2">
                        <span className="bg-primary-50 text-primary-700 text-xs px-2 py-0.5 rounded-full">{s.section}</span>
                        <span className="text-gray-600 line-clamp-1">{s.improved.slice(0, 50)}...</span>
                      </span>
                      {expandedSuggestions.has(i) ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
                    </button>
                    {expandedSuggestions.has(i) && (
                      <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
                        {s.original && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-400 mb-1">原文</p>
                            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 line-through decoration-red-300">{s.original}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-400 mb-1">建议改为</p>
                          <p className="text-sm text-gray-700 bg-green-50 rounded-lg p-3 font-medium">{s.improved}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">改进理由</p>
                          <p className="text-sm text-gray-600">{s.reason}</p>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
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
  const [reportItem, setReportItem] = useState<AdminAnalysisItem | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false)
  const [batchDeleting, setBatchDeleting] = useState(false)
  const [q, setQ] = useState('')
  const [inputQ, setInputQ] = useState('')

  const allSelected = items.length > 0 && items.every(a => selectedIds.has(a.id))
  const someSelected = items.some(a => selectedIds.has(a.id)) && !allSelected

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(prev => { const s = new Set(prev); items.forEach(a => s.delete(a.id)); return s })
    } else {
      setSelectedIds(prev => { const s = new Set(prev); items.forEach(a => s.add(a.id)); return s })
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  const load = () => {
    setLoading(true)
    adminApi.analyses(page, pageSize, q).then(({ data }) => { setItems(data.items); setTotal(data.total) }).finally(() => setLoading(false))
  }

  useEffect(load, [page, q])

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
  const handleBatchDelete = async () => {
    setBatchDeleting(true)
    try {
      await Promise.all(Array.from(selectedIds).map(id => adminApi.deleteAnalysis(id)))
      setSelectedIds(new Set())
      setConfirmBatchDelete(false)
      load()
    } finally { setBatchDeleting(false) }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="page-title">分析记录</h1>
      </div>

      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus className="w-3.5 h-3.5" />新增记录</button>
          {confirmBatchDelete ? (
            <span className="flex items-center gap-2">
              <span className="text-xs text-gray-600">确认删除 {selectedIds.size} 条？</span>
              <button onClick={handleBatchDelete} disabled={batchDeleting}
                className="text-xs text-white bg-[#E34D59] px-3 py-1 rounded disabled:opacity-50">
                {batchDeleting ? '删除中...' : '确认删除'}
              </button>
              <button onClick={() => setConfirmBatchDelete(false)}
                className="text-xs text-gray-500 px-3 py-1 rounded border border-[#DCDCDC]">取消</button>
            </span>
          ) : (
            <button
              onClick={() => { if (selectedIds.size > 0) setConfirmBatchDelete(true) }}
              disabled={selectedIds.size === 0}
              className={`text-xs px-3 py-1 rounded border ${selectedIds.size > 0 ? 'text-[#E34D59] border-[#E34D59] hover:bg-red-50 cursor-pointer' : 'text-gray-300 border-gray-200 cursor-not-allowed'}`}>
              批量删除{selectedIds.size > 0 ? `（${selectedIds.size}）` : ''}
            </button>
          )}
        </div>
        <span className="text-xs text-gray-400">共 {total} 条</span>
      </div>

      {/* 搜索栏 */}
      <div style={{ margin: '10px 0' }}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              className="input pl-8 text-xs"
              placeholder="搜索简历标题或用户邮箱"
              value={inputQ}
              onChange={e => setInputQ(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setQ(inputQ); setPage(1) } }}
            />
          </div>
          <button className="btn-secondary text-xs py-1 px-3"
            onClick={() => { setQ(inputQ); setPage(1) }}>搜索</button>
          {q && <button className="text-xs text-gray-400 hover:text-gray-600"
            onClick={() => { setInputQ(''); setQ(''); setPage(1) }}>清除</button>}
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* 表格 */}
        <table className="t-table">
          <thead>
            <tr>
              <th style={{ width: 36, textAlign: 'center' }}>
                <input type="checkbox" checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected }}
                  onChange={toggleSelectAll}
                  style={{ width: 13, height: 13, cursor: 'pointer', accentColor: '#0052D9' }} />
              </th>
              {['ID', '简历', '用户', '综合评分', 'JD 匹配', '模型', '时间', '操作'].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center py-10 text-gray-400 text-xs">加载中...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-10 text-gray-400 text-xs">暂无数据</td></tr>
            ) : items.map(a => (
              <tr key={a.id} style={{ background: selectedIds.has(a.id) ? '#F0F6FF' : '' }}>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={selectedIds.has(a.id)} onChange={() => toggleSelect(a.id)}
                    style={{ width: 13, height: 13, cursor: 'pointer', accentColor: '#0052D9' }} />
                </td>
                <td className="text-gray-400 text-xs">{a.id}</td>
                <td className="text-gray-800 max-w-[140px] truncate">{a.resume_title || '—'}</td>
                <td className="text-gray-500 text-xs">{a.user_email}</td>
                <td><ScoreBadge score={a.total_score} /></td>
                <td>{a.jd_match_score > 0 ? <ScoreBadge score={a.jd_match_score} /> : <span className="text-gray-400">—</span>}</td>
                <td><span className={`tag ${MODEL_TAG[a.model_used] ?? 'bg-gray-100 text-gray-500'}`}>{a.model_used}</span></td>
                <td className="text-gray-400 text-xs whitespace-nowrap">{fmtDate(a.created_at)}</td>
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
                      <button onClick={() => setReportItem(a)} className="text-xs text-primary-600 hover:underline px-1">
                        <FileSearch className="w-3.5 h-3.5 inline mr-0.5" />查看报告
                      </button>
                      <span className="text-gray-200">|</span>
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
      {reportItem && <AnalysisReportModal item={reportItem} onClose={() => setReportItem(null)} />}
    </div>
  )
}
