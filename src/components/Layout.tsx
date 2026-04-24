import React from 'react';
import { Compass, Briefcase, MessageSquare, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
  pendingJobs?: number;
  unreadMsgs?: number;
  lang?: 'en' | 'ro';
}

export function BottomNav({ activeTab, onTabChange, pendingJobs = 0, unreadMsgs = 0, lang = 'en' }: BottomNavProps) {
  const [hoveredTab, setHoveredTab] = React.useState<number | null>(null);
  const labels = {
    en: ['Explore', 'Jobs', 'Messages', 'Profile'],
    ro: ['Explorare', 'Servicii', 'Mesaje', 'Profil']
  };

  const tabs = [
    { id: 0, label: labels[lang][0], icon: Compass },
    { id: 1, label: labels[lang][1], icon: Briefcase, badge: pendingJobs },
    { id: 2, label: labels[lang][2], icon: MessageSquare, badge: unreadMsgs },
    { id: 3, label: labels[lang][3], icon: User },
  ];

  return (
    <nav className="sticky bottom-0 bg-white border-t border-slate-100 px-2 py-2 flex items-center z-50 shrink-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isHovered = hoveredTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            onTouchStart={() => setHoveredTab(tab.id)}
            onTouchEnd={() => setHoveredTab(null)}
            className={cn(
              "relative flex-1 flex flex-col items-center justify-center cursor-pointer py-2 mx-1 rounded-xl premium-nav",
              isActive ? "bg-brand shadow-lg shadow-brand/20" : (isHovered ? "bg-brand-light shadow-md shadow-brand/10" : "bg-transparent"),
              (isActive || isHovered) && "scale-105"
            )}
          >
            <div className="relative">
              <Icon 
                className={cn(
                  "w-5 h-5 mb-0.5 transition-colors duration-300",
                  (isActive || isHovered) ? "text-white" : "text-slate-400"
                )} 
              />
              {tab.badge > 0 && (
                <span className={cn(
                  "absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full text-[9px] font-bold flex items-center justify-center px-1 transition-colors duration-300 border-2 border-white",
                  (isActive || isHovered) ? "bg-white text-brand border-brand" : "bg-red-500 text-white"
                )}>
                  {tab.badge}
                </span>
              )}
            </div>
            <span className={cn(
              "text-[10px] font-bold block transition-colors duration-300",
              (isActive || isHovered) ? "text-white" : "text-slate-400"
            )}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export function AppContainer({ children }: { children: React.ReactNode }) {
  return (
    <div id="app-container" className="max-w-[430px] mx-auto min-h-dvh bg-white relative flex flex-col shadow-xl ring-1 ring-slate-200 scrollbar-hide">
      {children}
    </div>
  );
}
