import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import MobileBottomNav from './components/MobileBottomNav';
import { initGA, trackPageView } from './utils/analytics';
import { reportWebVitals } from './utils/webVitals';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const StaticPage = lazy(() => import('./pages/StaticPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ForumsPage = lazy(() => import('./pages/ForumsPage'));
const ForumTopicPage = lazy(() => import('./pages/ForumTopicPage'));
const ForumPostPage = lazy(() => import('./pages/ForumPostPage'));
const ReadingListsPage = lazy(() => import('./pages/ReadingListsPage'));
const PreferencesPage = lazy(() => import('./pages/PreferencesPage'));
const SitemapPage = lazy(() => import('./pages/SitemapPage'));
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const Dashboard = lazy(() => import('./admin/Dashboard'));
const PostList = lazy(() => import('./admin/PostList'));
const PostEditor = lazy(() => import('./admin/PostEditor'));
const CategoryManager = lazy(() => import('./admin/CategoryManager'));
const MenuManager = lazy(() => import('./admin/MenuManager'));
const PageManager = lazy(() => import('./admin/PageManager'));
const StoryManager = lazy(() => import('./admin/StoryManager'));
const ForumManager = lazy(() => import('./admin/ForumManager'));
const ForumPostsManager = lazy(() => import('./admin/ForumPostsManager'));
const SEODashboard = lazy(() => import('./admin/SEODashboard'));
const UserManager = lazy(() => import('./admin/UserManager'));
const AdManager = lazy(() => import('./admin/AdManager'));
const NewsletterManager = lazy(() => import('./admin/NewsletterManager'));
const Analytics = lazy(() => import('./admin/Analytics'));
const Settings = lazy(() => import('./admin/Settings'));
const TranslationManager = lazy(() => import('./admin/TranslationManager'));
const LoginForm = lazy(() => import('./components/auth/LoginForm'));
const SignupForm = lazy(() => import('./components/auth/SignupForm'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UserSettingsPage = lazy(() => import('./pages/UserSettingsPage'));

import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
  </div>
);

// Layout wrapper for public pages
const PublicLayout: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-coral-200 overflow-x-hidden w-full max-w-full">
    <Navbar />
    <main className="flex-grow pb-16 md:pb-0 w-full max-w-full overflow-x-hidden">
      <Outlet />
    </main>
    <Footer />
    {/* PWA features disabled */}
    {/* <PWAInstallPrompt /> */}
    {/* <OfflineIndicator /> */}
    <MobileBottomNav />
  </div>
);

// Analytics wrapper component
const AnalyticsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Initialize Google Analytics
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId) {
      initGA(gaId);
    }

    // Report Web Vitals
    reportWebVitals((metric) => {
      if ((window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_category: 'Web Vitals',
          event_label: metric.id,
          non_interaction: true,
        });
      }
      
      // Log to console in development
      if (import.meta.env.DEV) {
        console.log('[Web Vital]', metric);
      }
    });
  }, []);

  // Track page views
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <AnalyticsWrapper>
            <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Auth Routes - Must be before PublicLayout to avoid layout issues */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignupForm />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Public Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="blog" element={<BlogPage />} />
                <Route path="blog/:slug" element={<PostDetailPage />} />
                <Route path="category/:slug" element={<CategoryPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="haqqimizda" element={<AboutPage />} />
                <Route path="elaqe" element={<ContactPage />} />
                <Route path="forums" element={<ForumsPage />} />
                <Route path="forums/:slug" element={<ForumTopicPage />} />
                <Route path="forums/:slug/:postId" element={<ForumPostPage />} />
                <Route path="reading-lists" element={<ReadingListsPage />} />
                <Route path="preferences" element={<PreferencesPage />} />
                {/* Static pages route - must be last to avoid conflicts */}
                <Route path=":slug" element={<StaticPage />} />
              </Route>

              {/* Profile Routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <PublicLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ProfilePage />} />
                <Route path="settings" element={<UserSettingsPage />} />
              </Route>
              <Route path="/profile/:id" element={<PublicLayout />}>
                <Route index element={<ProfilePage />} />
              </Route>

              {/* Admin Routes - Protected */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAuth requireRole={['admin', 'author']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="posts" element={<PostList />} />
                <Route path="posts/new" element={<PostEditor />} />
                <Route path="posts/edit/:id" element={<PostEditor />} />
                <Route path="categories" element={<CategoryManager />} />
                <Route path="menus" element={<MenuManager />} />
                <Route path="pages" element={<PageManager />} />
                <Route path="stories" element={<StoryManager />} />
                <Route path="forums" element={<ForumManager />} />
                <Route path="forum-posts" element={<ForumPostsManager />} />
                <Route path="seo" element={<SEODashboard />} />
                <Route path="users" element={<UserManager />} />
                <Route path="ads" element={<AdManager />} />
                <Route path="newsletter" element={<NewsletterManager />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
                <Route path="translations" element={<TranslationManager />} />
              </Route>
            </Routes>
            </Suspense>
            </AnalyticsWrapper>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;
