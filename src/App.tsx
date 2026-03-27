import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  PenTool, 
  ClipboardList, 
  ChevronRight, 
  Menu, 
  X,
  GraduationCap,
  Atom,
  Loader2,
  User,
  LayoutDashboard,
  Calendar,
  ClipboardList as ClipboardIcon,
  Activity,
  LogOut,
  Settings,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  Clock,
  AlertCircle,
  Moon,
  Sun
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { motion, AnimatePresence } from 'motion/react';
import { CHAPTERS } from './constants';
import { Chapter, Grade } from './types';
import { getPhysicsContent } from './services/gemini';
import logo from './logo.png';
import { cn } from './lib/utils';
import { 
  auth, 
  db, 
  loginWithGoogle, 
  logout, 
  onAuthStateChanged, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  Timestamp,
  handleFirestoreError,
  OperationType
} from './firebase';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error) errorMessage = parsed.error;
      } catch (e) {}

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-300">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-red-100 dark:border-red-900/30 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Application Error</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#1e3a8a] dark:bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-[#1e3a8a]/90 dark:hover:bg-blue-700 transition-all"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

const TikZ = ({ code }: { code: string }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Clear previous content
      containerRef.current.innerHTML = '';
      
      // Create the script tag that TikZJax expects
      const script = document.createElement('script');
      script.type = 'text/tikz';
      script.textContent = code;
      
      containerRef.current.appendChild(script);
    }
  }, [code]);

  return (
    <div className="flex justify-center my-8 overflow-x-auto py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
      <div ref={containerRef} className="tikz-container" />
    </div>
  );
};

function AppContent() {
  const { width } = useWindowSize();
  const isMobile = width < 1024;
  const [view, setView] = useState<'home' | 'study' | 'login' | 'student-dashboard' | 'admin-dashboard'>('home');
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // Dashboard Data
  const [classes, setClasses] = useState<any[]>([]);
  const [homework, setHomework] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  
  const [selectedGrade, setSelectedGrade] = useState<Grade>('11');
  const [selectedChapter, setSelectedChapter] = useState<Chapter>(CHAPTERS.find(c => c.class === '11')!);
  const [activeTab, setActiveTab] = useState<'theory' | 'derivation' | 'practice' | 'assignment'>('theory');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [sidebarMode, setSidebarMode] = useState<'grades' | 'chapters'>('chapters');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const profileDoc = await getDoc(doc(db, 'users', user.uid));
        if (profileDoc.exists()) {
          setUserProfile(profileDoc.data());
        } else {
          // Create default profile for new users
          const newProfile = {
            uid: user.uid,
            name: user.displayName || 'Student',
            email: user.email,
            role: user.email === 'vbyainnovations@gmail.com' ? 'admin' : 'student',
            course: 'Class 12th Boards',
            createdAt: Timestamp.now()
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthReady(true);
    });
    return unsubscribe;
  }, []);

  // Data Fetching
  useEffect(() => {
    if (!isAuthReady || !userProfile) return;

    const qClasses = userProfile.role === 'admin' 
      ? collection(db, 'classes') 
      : query(collection(db, 'classes'), where('course', '==', userProfile.course));
    
    const unsubscribeClasses = onSnapshot(qClasses, (snapshot) => {
      setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'classes'));

    const qHomework = userProfile.role === 'admin' 
      ? collection(db, 'homework') 
      : query(collection(db, 'homework'), where('course', '==', userProfile.course));
      
    const unsubscribeHomework = onSnapshot(qHomework, (snapshot) => {
      setHomework(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'homework'));

    const qTests = userProfile.role === 'admin' 
      ? collection(db, 'tests') 
      : query(collection(db, 'tests'), where('course', '==', userProfile.course));
      
    const unsubscribeTests = onSnapshot(qTests, (snapshot) => {
      setTests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'tests'));

    return () => {
      unsubscribeClasses();
      unsubscribeHomework();
      unsubscribeTests();
    };
  }, [isAuthReady, userProfile]);

  useEffect(() => {
    if (view === 'study') {
      async function loadContent() {
        setLoading(true);
        const data = await getPhysicsContent(selectedChapter.title, selectedGrade, activeTab);
        setContent(data);
        setLoading(false);
      }
      loadContent();
    }
  }, [selectedChapter, activeTab, selectedGrade, view]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      setView('student-dashboard');
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    setView('home');
  };

  const tabs = [
    { id: 'theory', label: 'Theory', icon: BookOpen },
    { id: 'derivation', label: 'Derivations', icon: FileText },
    { id: 'practice', label: 'Practice', icon: PenTool },
    { id: 'assignment', label: 'Assignment', icon: ClipboardList },
  ] as const;

  const filteredChapters = CHAPTERS.filter(c => c.class === selectedGrade);

  const handleSectionSelect = (grade: Grade) => {
    setSelectedGrade(grade);
    const firstChapter = CHAPTERS.find(c => c.class === grade);
    if (firstChapter) setSelectedChapter(firstChapter);
    setSidebarMode('chapters');
    setView('study');
  };

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-x-hidden transition-colors duration-300">
        {/* Top Header */}
        <div className="absolute top-0 left-0 right-0 p-4 lg:p-10 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 lg:gap-6">
            <Logo className="w-12 h-12 lg:w-32 lg:h-32 border-2 lg:border-4 border-white dark:border-slate-800 shadow-xl" />
            <h1 className="font-bold text-lg lg:text-4xl tracking-tight text-[#1e3a8a] dark:text-blue-400">aakashsir.com</h1>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-[#1e3a8a] dark:text-blue-400 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4 lg:w-5 lg:h-5" /> : <Sun className="w-4 h-4 lg:w-5 lg:h-5" />}
            </button>

            {user ? (
              <button 
                onClick={() => setView(userProfile?.role === 'admin' ? 'admin-dashboard' : 'student-dashboard')}
                className="flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-[#1e3a8a] dark:text-blue-400 font-bold text-xs lg:text-sm hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Go to Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </button>
            ) : (
              <button 
                onClick={() => setView('login')}
                className="flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-[#1e3a8a] dark:text-blue-400 font-bold text-xs lg:text-sm hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                <User className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Student Login</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl w-full space-y-8 lg:space-y-12 text-center pt-32 lg:pt-0"
        >
          <div className="space-y-4 lg:space-y-6">
            <div className="space-y-2">
              <p className="text-slate-500 dark:text-slate-400 text-lg lg:text-xl font-medium max-w-3xl mx-auto px-4 leading-relaxed">
                Master Physics with clarity, precision, and confidence with mentor <span className="text-[#1e3a8a] dark:text-blue-400 font-bold">Aakash Sir</span>.
                <br className="hidden md:block" />
                Learn concepts deeply, solve numericals effectively, and prepare smartly for school and competitive exams.
              </p>
            </div>
            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open('https://aakashsir.com/enroll', '_blank')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#1e3a8a] dark:bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/20 hover:bg-blue-800 dark:hover:bg-blue-700 transition-all"
              >
                <PenTool className="w-5 h-5" />
                <span>Join as Student</span>
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <HomeButton 
              icon={GraduationCap} 
              title="Class 11th" 
              description="CBSE Foundation" 
              onClick={() => handleSectionSelect('11')} 
              color="navy"
            />
            <HomeButton 
              icon={GraduationCap} 
              title="Class 12th" 
              description="CBSE Boards" 
              onClick={() => handleSectionSelect('12')} 
              color="green"
            />
            <HomeButton 
              icon={Atom} 
              title="JEE Section" 
              description="IIT Advanced" 
              onClick={() => handleSectionSelect('JEE')} 
              color="navy"
            />
            <HomeButton 
              icon={Atom} 
              title="NEET Section" 
              description="Medical Entrance" 
              onClick={() => handleSectionSelect('NEET')} 
              color="green"
            />
            <HomeButton 
              icon={Atom} 
              title="BITSAT Section" 
              description="Engineering" 
              onClick={() => handleSectionSelect('BITSAT')} 
              color="navy"
            />
            <HomeButton 
              icon={Atom} 
              title="CUET Section" 
              description="University Entrance" 
              onClick={() => handleSectionSelect('CUET')} 
              color="green"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex items-center justify-center p-6 lg:p-12 relative overflow-x-hidden transition-colors duration-300">
        <div className="absolute top-6 left-6 lg:top-10 lg:left-10 flex items-center gap-4">
          <button 
            onClick={() => setView('home')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-[#1e3a8a] dark:text-blue-400 font-bold text-sm hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-[#1e3a8a] dark:text-blue-400 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-800 p-8 lg:p-12 text-center space-y-8"
        >
          <div className="flex flex-col items-center gap-4">
            <Logo className="w-20 h-20 border-4 border-white dark:border-slate-800 shadow-lg" />
            <div>
              <h2 className="text-2xl font-extrabold text-[#1e3a8a] dark:text-blue-400 tracking-tight">Student Login</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Access your personalized dashboard</p>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleLogin}
              className="w-full py-4 rounded-2xl bg-[#1e3a8a] dark:bg-blue-600 text-white font-bold text-lg hover:bg-[#1e3a8a]/90 dark:hover:bg-blue-700 transition-all shadow-lg shadow-[#1e3a8a]/20 flex items-center justify-center gap-3"
            >
              <User className="w-5 h-5" />
              Sign in with Google
            </button>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
          
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={handleLogin}
              className="text-slate-400 hover:text-[#1e3a8a] dark:hover:text-blue-400 text-sm font-bold transition-colors"
            >
              Admin Access
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === 'student-dashboard') {
    if (!userProfile) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-8 h-8 animate-spin text-[#1e3a8a] dark:text-blue-400" /></div>;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col lg:flex-row h-screen overflow-hidden transition-colors duration-300">
        {/* Student Sidebar */}
        <aside className="w-full lg:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo className="w-10 h-10 border-2 border-white dark:border-slate-800 shadow-sm" />
              <h1 className="font-bold text-xl tracking-tight text-[#1e3a8a] dark:text-blue-400">aakashsir.com</h1>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex-1 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1e3a8a]/5 dark:bg-blue-500/10 text-[#1e3a8a] dark:text-blue-400 font-bold">
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all">
              <Calendar className="w-5 h-5" />
              My Classes
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all">
              <ClipboardIcon className="w-5 h-5" />
              Homework
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all">
              <Activity className="w-5 h-5" />
              Live Tests
            </button>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 px-2">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={userProfile.name} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold">
                  {userProfile.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{userProfile.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userProfile.course}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome back, {userProfile.name.split(' ')[0]}!</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Here's what's happening today.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 text-[#166534] dark:text-green-400 text-sm font-bold border border-green-100 dark:border-green-900/30">
                Course: {userProfile.course}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Classes */}
            <section className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
                  Upcoming Classes
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.length > 0 ? classes.map((cls) => (
                  <div key={cls.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">{cls.type || 'Live Session'}</span>
                      <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">
                        {cls.startTime?.toDate().toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">{cls.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">{cls.description}</p>
                    <button 
                      onClick={() => cls.joinUrl && window.open(cls.joinUrl, '_blank')}
                      className="w-full py-3 rounded-xl bg-[#1e3a8a] dark:bg-blue-600 text-white font-bold text-sm hover:bg-[#1e3a8a]/90 dark:hover:bg-blue-700 transition-all"
                    >
                      Join Class
                    </button>
                  </div>
                )) : (
                  <div className="col-span-full bg-white dark:bg-slate-900 p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500">
                    No upcoming classes for your course.
                  </div>
                )}
              </div>
            </section>

            {/* Homework & Tests */}
            <section className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ClipboardIcon className="w-5 h-5 text-[#166534] dark:text-green-400" />
                  Homework Allotted
                </h3>
                <div className="space-y-3">
                  {homework.length > 0 ? homework.map((hw) => (
                    <div key={hw.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-[#166534] dark:text-green-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{hw.title}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Due: {hw.dueDate?.toDate().toLocaleDateString()}</p>
                      </div>
                      <button 
                        onClick={() => hw.fileUrl && window.open(hw.fileUrl, '_blank')}
                        className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )) : (
                    <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-4">No homework assigned.</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-500" />
                  Live Tests
                </h3>
                {tests.length > 0 ? tests.map((test) => (
                  <div key={test.id} className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-6 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-red-900 dark:text-red-400">{test.title}</p>
                        <p className="text-xs text-red-600 dark:text-red-500 font-medium">Starts: {test.startTime?.toDate().toLocaleString()}</p>
                      </div>
                    </div>
                    <button className="w-full py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
                      {test.status === 'Live' ? 'Join Test' : 'Register Now'}
                    </button>
                  </div>
                )) : (
                  <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-4">No live tests scheduled.</p>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  if (view === 'admin-dashboard') {
    return <AdminDashboard onExit={() => setView('home')} classes={classes} homework={homework} tests={tests} theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans relative transition-colors duration-300">
      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? (isMobile ? '100%' : 320) : (isMobile ? 0 : 80),
          x: 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-40 relative overflow-hidden h-full",
          "fixed lg:relative top-0 left-0"
        )}
      >
        <div className="p-4 lg:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between min-w-[320px]">
          <motion.div 
            animate={{ opacity: isSidebarOpen ? 1 : 0, x: isSidebarOpen ? 0 : -20 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              setView('home');
              if (isMobile) setIsSidebarOpen(false);
            }}
          >
            <Logo className="w-8 h-8 lg:w-10 lg:h-10 border-2 border-white dark:border-slate-800 shadow-sm" />
            <h1 className="font-bold text-lg lg:text-xl tracking-tight text-[#1e3a8a] dark:text-blue-400">aakashsir.com</h1>
          </motion.div>
          
          {isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {!isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden lg:block absolute left-5 top-7 cursor-pointer"
              onClick={() => setView('home')}
            >
              <Logo className="w-10 h-10 border-2 border-white dark:border-slate-800 shadow-sm" />
            </motion.div>
          )}
        </div>

        <div className="p-4 space-y-6 flex-1 overflow-y-auto min-w-[320px]">
          <AnimatePresence mode="wait">
            {sidebarMode === 'grades' ? (
              <motion.div
                key="grades-list"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-1"
              >
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 px-3">
                  Select Grade / Exam
                </p>
                {(['11', '12', 'JEE', 'NEET', 'BITSAT', 'CUET'] as const).map((grade) => (
                  <motion.button
                    key={grade}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedGrade(grade);
                      const firstChapter = CHAPTERS.find(c => c.class === grade);
                      if (firstChapter) setSelectedChapter(firstChapter);
                      setSidebarMode('chapters');
                    }}
                    className={cn(
                      "w-full text-left px-3 py-3.5 rounded-xl text-sm transition-all flex items-center justify-between group relative",
                      selectedGrade === grade
                        ? "text-[#1e3a8a] dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-900/10"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <span className="relative z-10">
                      {grade === '11' || grade === '12' ? `${grade}th Grade` : `${grade} Exam`}
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="chapters-list"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-1"
              >
                <div className="flex items-center gap-3 mb-4 px-1">
                  <button 
                    onClick={() => setSidebarMode('grades')}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                    title="Back to Grades"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                    {selectedGrade} Chapters
                  </p>
                </div>
                <div className="space-y-1">
                  {filteredChapters.map((chapter) => (
                    <motion.button
                      key={chapter.id}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedChapter(chapter);
                        if (isMobile) setIsSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-3 rounded-xl text-sm transition-all flex items-center justify-between group relative",
                        selectedChapter.id === chapter.id
                          ? "text-[#1e3a8a] dark:text-blue-400 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      {selectedChapter.id === chapter.id && (
                        <motion.div 
                          layoutId="chapter-pill"
                          className="absolute inset-0 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-100/50 dark:border-blue-900/30"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="truncate relative z-10">{chapter.title}</span>
                      <ChevronRight className={cn(
                        "w-4 h-4 transition-all relative z-10",
                        selectedChapter.id === chapter.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                      )} />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-3 lg:py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between sticky top-0 z-10 gap-3 lg:gap-4 transition-colors duration-300">
          <div className="flex items-center gap-3 lg:gap-4 w-full lg:w-auto">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#166534] dark:text-green-400 uppercase tracking-[0.2em] mb-0.5">
                <GraduationCap className="w-3 h-3" />
                <span>{selectedGrade} Physics</span>
              </div>
              <h2 className="text-base lg:text-xl font-extrabold text-slate-900 dark:text-white truncate tracking-tight">
                {selectedChapter.title}
              </h2>
            </div>
          </div>
          
          <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl lg:rounded-2xl w-full lg:w-auto overflow-x-auto no-scrollbar border border-slate-200/50 dark:border-slate-700/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 lg:px-6 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-xs lg:text-sm font-bold transition-all whitespace-nowrap relative",
                  activeTab === tab.id
                    ? "text-[#1e3a8a] dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="tab-pill"
                    className="absolute inset-0 bg-white dark:bg-slate-700 shadow-sm rounded-lg lg:rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className="w-3.5 h-3.5 lg:w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div 
              key={`${selectedChapter.id}-${activeTab}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl lg:rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-200/60 dark:border-slate-800 p-5 lg:p-16 min-h-full transition-colors duration-300"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-2xl animate-pulse" />
                    <Loader2 className="w-12 h-12 text-[#1e3a8a] dark:text-blue-400 animate-spin relative z-10" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-slate-900 dark:text-white font-bold text-lg">Preparing your lesson...</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Curating the best physics resources for you</p>
                  </div>
                </div>
              ) : (
                <div className="markdown-body prose prose-slate dark:prose-invert max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        if (!inline && match && match[1] === 'tikz') {
                          return <TikZ code={String(children).replace(/\n$/, '')} />;
                        }
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function AdminDashboard({ onExit, classes, homework, tests, theme, toggleTheme }: { onExit: () => void, classes: any[], homework: any[], tests: any[], theme: string, toggleTheme: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'homework' | 'tests'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: string } | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any, type: string) => {
    setEditingItem({ ...item, _type: type });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, type: string) => {
    setItemToDelete({ id, type });
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteDoc(doc(db, itemToDelete.type, itemToDelete.id));
        setItemToDelete(null);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `${itemToDelete.type}/${itemToDelete.id}`);
      }
    }
  };

  const recentContent = [
    ...classes.map(c => ({ ...c, _type: 'classes', typeLabel: 'Class' })),
    ...homework.map(h => ({ ...h, _type: 'homework', typeLabel: 'Homework' })),
    ...tests.map(t => ({ ...t, _type: 'tests', typeLabel: 'Test' }))
  ].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col lg:flex-row h-screen overflow-hidden transition-colors duration-300">
      {/* Admin Sidebar */}
      <aside className="w-full lg:w-80 bg-[#1e3a8a] dark:bg-slate-900 text-white flex flex-col p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10 border-2 border-white/20 dark:border-slate-800 shadow-sm" />
            <h1 className="font-bold text-xl tracking-tight text-white">Admin Panel</h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/10 dark:bg-slate-800 text-white hover:bg-white/20 dark:hover:bg-slate-700 transition-all"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all", activeTab === 'overview' ? "bg-white/10 dark:bg-blue-500/20" : "hover:bg-white/5 dark:hover:bg-slate-800")}
          >
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('classes')}
            className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all", activeTab === 'classes' ? "bg-white/10 dark:bg-blue-500/20" : "hover:bg-white/5 dark:hover:bg-slate-800")}
          >
            <Calendar className="w-5 h-5" />
            Manage Classes
          </button>
          <button 
            onClick={() => setActiveTab('homework')}
            className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all", activeTab === 'homework' ? "bg-white/10 dark:bg-blue-500/20" : "hover:bg-white/5 dark:hover:bg-slate-800")}
          >
            <ClipboardIcon className="w-5 h-5" />
            Homework
          </button>
          <button 
            onClick={() => setActiveTab('tests')}
            className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all", activeTab === 'tests' ? "bg-white/10 dark:bg-blue-500/20" : "hover:bg-white/5 dark:hover:bg-slate-800")}
          >
            <Activity className="w-5 h-5" />
            Tests
          </button>
        </div>

        <div className="pt-6 border-t border-white/10 dark:border-slate-800 space-y-4">
          <button 
            onClick={onExit}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 dark:hover:bg-slate-800 font-bold transition-all"
          >
            <LogOut className="w-5 h-5" />
            Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your students and content.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleAdd}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1e3a8a] dark:bg-blue-600 text-white font-bold text-sm hover:bg-[#1e3a8a]/90 dark:hover:bg-blue-700 transition-all shadow-lg shadow-[#1e3a8a]/20 dark:shadow-blue-500/10"
            >
              <Plus className="w-4 h-4" />
              Add New Content
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Students</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">1,284</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Active Classes</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{classes.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Homework Allotted</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{homework.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Live Tests</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{tests.length}</p>
          </div>
        </div>

        {/* Management Table */}
        <section className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Content</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(activeTab === 'overview' ? recentContent : recentContent.filter(i => i._type === activeTab)).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{item.title}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                        item._type === 'classes' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" :
                        item._type === 'homework' ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                      )}>
                        {item.typeLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{item.course}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                      {(item.startTime || item.dueDate)?.toDate().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(item, item._type)}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id, item._type)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {isModalOpen && (
        <ContentModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          item={editingItem} 
        />
      )}

      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 max-w-sm w-full p-8 rounded-[2rem] shadow-2xl text-center space-y-6 border border-slate-200 dark:border-slate-800"
          >
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Delete Item?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">This action cannot be undone. Are you sure you want to proceed?</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ContentModal({ isOpen, onClose, item }: { isOpen: boolean, onClose: () => void, item?: any }) {
  const [type, setType] = useState<'classes' | 'homework' | 'tests'>(item?._type || 'classes');
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    course: item?.course || 'Class 12th Boards',
    startTime: item?.startTime ? new Date(item.startTime.seconds * 1000).toISOString().slice(0, 16) : '',
    dueDate: item?.dueDate ? new Date(item.dueDate.seconds * 1000).toISOString().slice(0, 16) : '',
    joinUrl: item?.joinUrl || '',
    fileUrl: item?.fileUrl || '',
    type: item?.type || 'Live Session',
    duration: item?.duration || '',
    status: item?.status || 'Upcoming'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = {
        title: formData.title,
        course: formData.course,
        createdAt: Timestamp.now()
      };

      if (type === 'classes') {
        data.description = formData.description;
        data.startTime = Timestamp.fromDate(new Date(formData.startTime));
        data.joinUrl = formData.joinUrl;
        data.type = formData.type;
      } else if (type === 'homework') {
        data.description = formData.description;
        data.dueDate = Timestamp.fromDate(new Date(formData.dueDate));
        data.fileUrl = formData.fileUrl;
      } else {
        data.startTime = Timestamp.fromDate(new Date(formData.startTime));
        data.duration = formData.duration;
        data.status = formData.status;
      }

      if (item?.id) {
        await updateDoc(doc(db, type, item.id), data);
      } else {
        await addDoc(collection(db, type), data);
      }
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, type);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{item ? 'Edit' : 'Add'} Content</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          {!item && (
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {(['classes', 'homework', 'tests'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "py-2 text-xs font-bold rounded-lg transition-all",
                    type === t ? "bg-white dark:bg-slate-700 text-[#1e3a8a] dark:text-blue-400 shadow-sm" : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Title</label>
              <input 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1e3a8a] dark:focus:ring-blue-500 outline-none"
                placeholder="Enter title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Course</label>
              <select 
                value={formData.course}
                onChange={e => setFormData({...formData, course: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1e3a8a] dark:focus:ring-blue-500 outline-none"
              >
                {['Class 11th Boards', 'Class 12th Boards', 'JEE Section', 'NEET Section', 'BITSAT Section', 'CUET Section'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {type === 'classes' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Start Time</label>
                  <input 
                    required
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1e3a8a] dark:focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Join URL</label>
                  <input 
                    type="url"
                    value={formData.joinUrl}
                    onChange={e => setFormData({...formData, joinUrl: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1e3a8a] dark:focus:ring-blue-500 outline-none"
                    placeholder="https://..."
                  />
                </div>
              </>
            )}

            {type === 'homework' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Due Date</label>
                  <input 
                    required
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1e3a8a] dark:focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">File URL</label>
                  <input 
                    type="url"
                    value={formData.fileUrl}
                    onChange={e => setFormData({...formData, fileUrl: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1e3a8a] dark:focus:ring-blue-500 outline-none"
                    placeholder="https://..."
                  />
                </div>
              </>
            )}

            {type === 'tests' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Start Time</label>
                  <input 
                    required
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1e3a8a] dark:focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Duration</label>
                  <input 
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1e3a8a] dark:focus:ring-blue-500 outline-none"
                    placeholder="e.g. 2 hours"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1e3a8a] dark:focus:ring-blue-500 outline-none h-32 resize-none"
                placeholder="Enter details..."
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 rounded-2xl bg-[#1e3a8a] dark:bg-blue-600 text-white font-bold text-lg hover:bg-[#1e3a8a]/90 dark:hover:bg-blue-700 transition-all shadow-lg shadow-[#1e3a8a]/20 dark:shadow-blue-500/10"
          >
            {item ? 'Update' : 'Save'} Content
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl lg:rounded-3xl overflow-hidden bg-white dark:bg-slate-800", className)}>
      <img 
        src={logo} 
        alt="aakashsir.com" 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

function HomeButton({ icon: Icon, title, description, onClick, color }: any) {
  const colors: any = {
    navy: "bg-[#1e3a8a]/5 dark:bg-blue-500/10 text-[#1e3a8a] dark:text-blue-400 border-[#1e3a8a]/10 dark:border-blue-900/30 hover:bg-[#1e3a8a]/10 dark:hover:bg-blue-500/20",
    green: "bg-[#166534]/5 dark:bg-green-500/10 text-[#166534] dark:text-green-400 border-[#166534]/10 dark:border-green-900/30 hover:bg-[#166534]/10 dark:hover:bg-green-500/20",
  };

  return (
    <motion.button
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "p-6 lg:p-8 rounded-2xl lg:rounded-[2rem] border-2 text-left transition-all flex flex-col gap-4",
        colors[color]
      )}
    >
      <div className="p-3 bg-white rounded-2xl shadow-sm w-fit">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-lg lg:text-xl font-extrabold tracking-tight">{title}</h3>
        <p className="text-xs lg:text-sm opacity-70 font-medium">{description}</p>
      </div>
    </motion.button>
  );
}
