import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider, ToastContainer } from './components/Toast';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
import ChatPage from './pages/ChatPage';
import SubscriptionPage from './pages/SubscriptionPage';
import {
  LayoutDashboard, CheckSquare, Calendar, MessageCircle,
  CreditCard, Settings, Sun, Moon, Search, Menu,
  ChevronLeft, LogOut, X
} from 'lucide-react';

function AppContent() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentTier } = useSubscription();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [now, setNow] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Real-time clock in header
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for navigation events from child components
  useEffect(() => {
    const handler = (e) => setCurrentPage(e.detail);
    window.addEventListener('navigate', handler);
    return () => window.removeEventListener('navigate', handler);
  }, []);

  const navigate = useCallback((page) => {
    setCurrentPage(page);
    setMobileSidebarOpen(false);
  }, []);

  if (!user) return <LoginPage />;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare, badge: null },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'chat', label: 'AI Assistant', icon: MessageCircle },
  ];

  const settingsItems = [
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
  ];

  const pages = {
    dashboard: <DashboardPage />,
    tasks: <TasksPage />,
    calendar: <CalendarPage />,
    chat: <ChatPage />,
    subscription: <SubscriptionPage />,
  };

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'var(--bg-overlay)',
          zIndex: 150, display: 'none',
        }}
          className="mobile-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <style>{`
        @media (max-width: 768px) {
          .mobile-overlay { display: block !important; }
        }
      `}</style>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <img src="/logo.png" alt="TaskFlow Pro" className="sidebar-logo" />
          {!sidebarCollapsed && (
            <div className="sidebar-brand">
              <h2>TaskFlow Pro</h2>
              <span>{currentTier} plan</span>
            </div>
          )}
          <button
            className="btn btn-ghost btn-icon btn-sm"
            style={{ marginLeft: 'auto' }}
            onClick={() => {
              setSidebarCollapsed(!sidebarCollapsed);
              setMobileSidebarOpen(false);
            }}
          >
            <ChevronLeft size={16} style={{
              transform: sidebarCollapsed ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s',
            }} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {!sidebarCollapsed && <div className="nav-section-title">Menu</div>}
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.id)}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon size={20} />
              {!sidebarCollapsed && <span>{item.label}</span>}
              {!sidebarCollapsed && item.badge && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          ))}

          {!sidebarCollapsed && <div className="nav-section-title" style={{ marginTop: '8px' }}>Account</div>}
          {settingsItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.id)}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon size={20} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => setShowUserMenu(!showUserMenu)}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="sidebar-user-avatar" style={{ background: 'none' }} />
            ) : (
              <div className="sidebar-user-avatar">{userInitial}</div>
            )}
            {!sidebarCollapsed && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user.name}</div>
                <div className="sidebar-user-email">{user.email}</div>
              </div>
            )}
          </div>
          {showUserMenu && !sidebarCollapsed && (
            <div style={{ marginTop: '8px' }}>
              <button className="nav-item" onClick={logout} style={{ color: 'var(--danger)' }}>
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className={`main-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Header */}
        <header className={`header ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="header-left">
            <button
              className="btn btn-ghost btn-icon btn-sm"
              style={{ display: 'none' }}
              id="mobile-menu-btn"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <style>{`
              @media (max-width: 768px) {
                #mobile-menu-btn { display: flex !important; }
              }
            `}</style>
            <div className="header-search">
              <Search />
              <input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="header-right">
            <div className="header-time">
              {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="main-content">
          {pages[currentPage] || <DashboardPage />}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <TaskProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </TaskProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
