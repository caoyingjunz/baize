import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart3, Users, FileText, FileSearch, SlidersHorizontal,
  LogOut, AlignJustify, Search,
} from 'lucide-react'
import { useAdminAuth } from '../store/auth'
import { useState } from 'react'

const navItems = [
  { to: '/', label: '概览', icon: BarChart3, end: true },
  { to: '/users', label: '用户管理', icon: Users },
  { to: '/resumes', label: '简历管理', icon: FileText },
  { to: '/analyses', label: '分析记录', icon: FileSearch },
  { to: '/prompt', label: 'Prompt 配置', icon: SlidersHorizontal },
]

export default function AdminLayout() {
  const { username, logout } = useAdminAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === '1')

  const toggleCollapsed = () => setCollapsed(v => {
    localStorage.setItem('sidebar_collapsed', v ? '0' : '1')
    return !v
  })

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F0F2F5' }}>

      {/* ── 全宽顶部导航栏 ── */}
      <header
        className="flex items-center flex-shrink-0 z-20 relative"
        style={{ height: 45, background: '#141c2c', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* 左侧：Logo + 控制台 */}
        <div className="flex items-center gap-1 pl-3 pr-4 flex-shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-2 ml-1">
            <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: '#0052D9' }}>
              <BarChart3 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white text-sm font-medium">Baize</span>
          </div>

          {/* 分隔线 */}
          <div className="w-px h-4 mx-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }} />

          {/* 控制台 */}
          <span style={{ color: '#FFFFFFE6', fontSize: 12, fontFamily: '-apple-system, "system-ui", sans-serif' }}>控制台</span>
        </div>

        {/* 搜索框（靠右） */}
        <div className="flex-1 flex justify-end px-4">
          <div
            className="flex items-center gap-2 px-3 rounded w-full max-w-md"
            style={{ height: 32, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#6B7A99' }} />
            <input
              type="text"
              placeholder="搜索功能、用户、简历..."
              className="flex-1 bg-transparent outline-none text-xs text-white placeholder-[#6B7A99]"
            />
          </div>
        </div>

        {/* 右侧：快捷链接 + 用户 */}
        <div className="flex items-center gap-0 pr-4 flex-shrink-0">
          {['帮助文档', '系统设置'].map(label => (
            <span key={label} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 16px',
              fontSize: 12,
              lineHeight: '20px',
              color: 'rgba(255,255,255,0.7)',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all .3s ease-in',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            >{label}</span>
          ))}

          {/* 分隔线 */}
          <div className="w-px h-4 mx-1 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }} />

          {/* 用户 */}
          <div className="flex items-center gap-2 pl-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
              style={{ background: '#0052D9' }}
            >
              {username?.charAt(0).toUpperCase() ?? 'A'}
            </div>
            <span className="text-xs max-w-[80px] truncate" style={{ color: '#9BA3BF' }}>{username}</span>
            <button
              onClick={handleLogout}
              title="退出登录"
              className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-white/10"
              style={{ color: '#6B7A99' }}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── 侧边栏 + 内容区 ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* 侧边栏（无 logo 区） */}
        <aside
          className="flex flex-col flex-shrink-0 transition-all duration-200"
          style={{ background: '#141c2c', width: collapsed ? 52 : 180 }}
        >
          {/* 分类标题 */}
          {!collapsed && (
            <div>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '10px 16px 12px', paddingLeft: 20 }}>
                <h2 style={{ color: '#FFFFFFE6', fontSize: 16, fontFamily: '-apple-system, "system-ui", sans-serif', fontWeight: 500, display: 'flex', alignItems: 'center', margin: 0 }}>系统管理</h2>
              </div>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
          )}
          {collapsed && <div style={{ height: 20 }} />}

          {/* 导航 */}
          <nav className="overflow-x-hidden" style={{ flex: '1 1 0', overflowY: 'auto', padding: '16px 0' }}>
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  `flex transition-colors ${collapsed ? 'items-center justify-center' : 'items-start px-4'} ${
                    isActive ? '' : 'hover:bg-white/5'
                  }`
                }
                style={({ isActive }) => ({
                  padding: collapsed ? '10px 0' : '8px 16px',
                  color: isActive ? '#fff' : '#FFFFFFE6',
                  background: isActive ? '#0052D9' : 'transparent',
                })}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ marginTop: collapsed ? 0 : 2 }} />
                {!collapsed && (
                  <span style={{
                    display: 'inline-block',
                    fontFamily: '-apple-system, "system-ui", sans-serif',
                    fontSize: 14,
                    lineHeight: '20px',
                    verticalAlign: 'text-top',
                    color: 'inherit',
                    marginLeft: 8,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>{label}</span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* 底部折叠按钮 */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => toggleCollapsed()}
              className="flex items-center w-full transition-colors hover:bg-white/5"
              style={{ height: 40, color: '#6B7A99', paddingLeft: 20 }}
              title={collapsed ? '展开侧边栏' : '收起侧边栏'}
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 overflow-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
