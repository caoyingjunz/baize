import { useEffect, useState } from 'react'
import { Users, FileText, Zap, Star, Bot } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts'
import { adminApi, type StatsResult } from '../services/api'

const MODEL_COLORS: Record<string, string> = {
  minimax: '#0052D9',
  deepseek: '#00A870',
  openai: '#ED7B2F',
  claude: '#9747FF',
}
const FALLBACK_COLORS = ['#0052D9', '#00A870', '#ED7B2F', '#9747FF']

function StatCard({ label, value, sub, icon: Icon, color, textColor }: {
  label: string; value: number | string; sub?: string
  icon: React.ElementType; color: string; textColor: string
}) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div
        className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
        style={{ background: color }}
      >
        <Icon className="w-5 h-5" style={{ color: textColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-2xl font-semibold text-gray-900 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
      </div>
    </div>
  )
}

const tooltipStyle = {
  contentStyle: { border: '1px solid #DCDCDC', borderRadius: 3, fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,.08)' },
  itemStyle: { fontSize: 12, color: '#4B4B4B' },
  labelStyle: { fontSize: 12, color: '#888' },
}

export default function Dashboard() {
  const [stats, setStats] = useState<StatsResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.stats().then(({ data }) => setStats(data)).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="p-6 text-sm text-gray-400">加载中...</div>
  }
  if (!stats) return null

  const modelPieData = Object.entries(stats.model_usage).map(([name, value]) => ({ name, value }))
  const tierBarData = Object.entries(stats.tier_breakdown).map(([name, value]) => ({ name, value }))
  const models = Object.keys(stats.model_daily_trend)
  const modelLineData = stats.daily_trend.map(({ date }) => {
    const point: Record<string, string | number> = { date }
    models.forEach((m) => {
      const day = stats.model_daily_trend[m].find((d) => d.date === date)
      point[m] = day?.count ?? 0
    })
    return point
  })

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">概览</h1>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard label="累计用户数" value={stats.total_users}
          sub={`本月新增 ${stats.new_users_this_month} 人`}
          icon={Users} color="#EAF2FF" textColor="#0052D9" />
        <StatCard label="累计简历数" value={stats.total_resumes}
          sub={`本月新增 ${stats.new_resumes_this_month} 份`}
          icon={FileText} color="#E8FAF4" textColor="#00A870" />
        <StatCard label="累计分析次数" value={stats.total_analyses}
          sub={`本月 ${stats.analyses_this_month} 次`}
          icon={Zap} color="#FFF3E8" textColor="#ED7B2F" />
        <StatCard label="平均评分" value={stats.avg_score.toFixed(1)}
          sub="全量简历综合均值"
          icon={Star} color="#F4EEFF" textColor="#9747FF" />
      </div>

      {/* 折线图 */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-700">最近 30 天分析趋势</h2>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={stats.daily_trend} margin={{ left: -20, right: 8, top: 4 }}>
            <CartesianGrid strokeDasharray="4 2" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} tickLine={false}
              axisLine={{ stroke: '#DCDCDC' }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 11, fill: '#888' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip {...tooltipStyle} formatter={(v) => [v, '分析次数']} labelFormatter={(l) => `日期：${l}`} />
            <Line type="monotone" dataKey="count" stroke="#0052D9" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 模型调用趋势 */}
      {models.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-700">最近 30 天模型调用趋势</h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Bot className="w-3.5 h-3.5" />
              <span>累计 {Object.values(stats.model_usage).reduce((a, b) => a + b, 0)} 次</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={modelLineData} margin={{ left: -20, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="4 2" stroke="#F0F0F0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} tickLine={false}
                axisLine={{ stroke: '#DCDCDC' }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} labelFormatter={(l) => `日期：${l}`} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              {models.map((m, i) => (
                <Line key={m} type="monotone" dataKey={m} strokeWidth={2} dot={false} activeDot={{ r: 4 }}
                  stroke={MODEL_COLORS[m] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 分布图 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="card p-5">
          <h2 className="text-sm font-medium text-gray-700 mb-4">AI 模型使用占比</h2>
          {modelPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={modelPieData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={70} innerRadius={35}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {modelPieData.map((entry, i) => (
                    <Cell key={entry.name}
                      fill={MODEL_COLORS[entry.name] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">暂无数据</p>
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-medium text-gray-700 mb-4">用户套餐分布</h2>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={tierBarData} margin={{ left: -20, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="4 2" stroke="#F0F0F0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} tickLine={false} axisLine={{ stroke: '#DCDCDC' }} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} formatter={(v) => [v, '用户数']} />
              <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={48}>
                {tierBarData.map((entry) => (
                  <Cell key={entry.name} fill={entry.name === 'pro' ? '#0052D9' : '#A3C4FF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
