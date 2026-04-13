import { useEffect, useRef, useState } from 'react'
import { adminApi } from '../services/api'
import { RotateCcw, Save } from 'lucide-react'

const DEFAULT_HINT = `支持以下占位符：
  {{resume}}      — 简历正文（必须保留）
  {{jd_section}}  — JD 分析段落（有 JD 时自动填充，无 JD 时为空）`

export default function AdminPrompt() {
  const [content, setContent] = useState('')
  const [original, setOriginal] = useState('')
  const [updatedAt, setUpdatedAt] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    adminApi.getPrompt()
      .then(({ data }) => { setContent(data.content); setOriginal(data.content); setUpdatedAt(data.updated_at) })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!content.includes('{{resume}}')) { setError('Prompt 必须包含 {{resume}} 占位符'); return }
    setSaving(true); setError(''); setSaved(false)
    try {
      const { data } = await adminApi.updatePrompt(content)
      setOriginal(data.content); setUpdatedAt(data.updated_at); setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || '保存失败')
    } finally { setSaving(false) }
  }

  const isDirty = content !== original

  return (
    <div className="space-y-3 max-w-4xl">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">分析 Prompt 配置</h1>
          {updatedAt && (
            <p className="text-xs text-gray-400 mt-0.5">
              上次保存：{new Date(updatedAt).toLocaleString('zh-CN')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <button onClick={() => { setContent(original); setError('') }} className="btn-secondary text-xs py-1 px-3">
              <RotateCcw className="w-3.5 h-3.5" />撤销修改
            </button>
          )}
          <button onClick={handleSave} disabled={saving || !isDirty} className="btn-primary text-xs py-1 px-3">
            <Save className="w-3.5 h-3.5" />
            {saving ? '保存中...' : saved ? '已保存' : '保存'}
          </button>
        </div>
      </div>

      {/* 占位符说明 */}
      <div className="card px-4 py-3 bg-[#EAF2FF] border-[#99C2FF]">
        <p className="text-xs text-primary-700 font-medium mb-1">占位符说明</p>
        <pre className="text-xs text-primary-600 whitespace-pre-wrap font-mono leading-relaxed">{DEFAULT_HINT}</pre>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="card px-4 py-2.5 bg-red-50 border-red-200">
          <p className="text-xs text-[#E34D59]">{error}</p>
        </div>
      )}

      {/* 编辑区 */}
      {loading ? (
        <div className="card flex items-center justify-center h-64 text-gray-400 text-sm">加载中...</div>
      ) : (
        <div className="card overflow-hidden">
          {/* 编辑器头部 */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#DCDCDC] bg-[#F7F8FA]">
            <span className="text-xs text-gray-500 font-mono">prompt.txt</span>
            {isDirty && <span className="text-xs text-[#ED7B2F]">● 未保存</span>}
          </div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => { setContent(e.target.value); setError('') }}
            className="w-full h-[560px] p-4 font-mono text-sm text-gray-800 resize-none focus:outline-none leading-relaxed bg-white"
            spellCheck={false}
            placeholder="在此输入 Prompt 模板..."
          />
        </div>
      )}
    </div>
  )
}
