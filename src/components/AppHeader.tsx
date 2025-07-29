"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BarChart3,
  Zap,
  Users as ContactsIcon,
  FileText,
  Search,
  User,
  Building2,
  Settings,
  LogOut,
  Users2,
  Sparkles,
  Bot,
  LayoutDashboard,
  MessageSquare, // Icono para 'AI Coach'
  Headset,      // Icono para 'AI Call Assistant'
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NavItem = ({
  icon: Icon,
  label,
  isActive = false,
  isCollapsed = false,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick: () => void;
}) => (
  <Button
    variant="ghost"
    onClick={onClick}
    className={`
      h-auto rounded-full px-3 py-1.5 text-xs flex items-center gap-2
      transition-all duration-300 ease-in-out
      ${isActive ? 'border-2 border-gray-400 text-gray-700' : 'border-2 border-gray-200/80 text-gray-600 hover:bg-gray-100/80'}
    `}
  >
    <Icon className="w-4 h-4 flex-shrink-0" />
    <AnimatePresence>
      {!isCollapsed && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto', transition: { delay: 0.1, duration: 0.2 } }}
          exit={{ opacity: 0, width: 0, margin: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden whitespace-nowrap"
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>
  </Button>
);

// --- CAMBIOS REALIZADOS AQUÍ ---
const AiCockpitDropdown = ({ isCollapsed }: { isCollapsed: boolean }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <div className="rounded-full bg-gradient-to-br from-purple-400 to-pink-500 p-px shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className={`h-full w-full bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs flex items-center gap-2 text-purple-700`}>
                    <Sparkles className="w-4 h-4 flex-shrink-0" />
                    <AnimatePresence>
                        {!isCollapsed && (
                            // 1. Texto del botón cambiado a "AI Cockpit"
                            <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto', transition: { delay: 0.1, duration: 0.2 } }} exit={{ opacity: 0, width: 0, margin: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden whitespace-nowrap font-medium">
                                AI Cockpit
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
            {/* 2. Nuevas opciones en el menú desplegable */}
            <DropdownMenuItem>
                <Search className="mr-2 h-4 w-4" />
                <span>AI Research</span>
            </DropdownMenuItem>
             <DropdownMenuItem>
                <Bot className="mr-2 h-4 w-4" />
                <span>AI Simulator</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>AI Coach</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <Headset className="mr-2 h-4 w-4" />
                <span>AI Call Assistant</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);

export function AppHeader({
  activeView,
  setActiveView,
}: {
  activeView: string;
  setActiveView: (view: 'meetings' | 'analytics' | 'actions' | 'company' | 'contacts') => void;
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex-1 flex items-center justify-between gap-2 border border-gray-200/80 rounded-full p-1.5 bg-white/50 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-1">
          <NavItem
            icon={Home}
            label="Home"
            isActive={activeView === 'meetings'}
            onClick={() => setActiveView('meetings')}
            isCollapsed={isSearchOpen}
          />
          {/* 3. Componente renombrado para mayor claridad */}
          <AiCockpitDropdown isCollapsed={isSearchOpen} />
          <NavItem
            icon={Zap}
            label="Actions"
            isActive={activeView === 'actions'}
            onClick={() => setActiveView('actions')}
            isCollapsed={isSearchOpen}
          />
          <NavItem
            icon={BarChart3}
            label="Analytics"
            isActive={activeView === 'analytics'}
            onClick={() => setActiveView('analytics')}
            isCollapsed={isSearchOpen}
          />
          <NavItem
            icon={ContactsIcon}
              label="Contacts"
              isActive={activeView === 'contacts'}
              onClick={() => setActiveView('contacts')}
              isCollapsed={isSearchOpen}
          />
           <NavItem
            icon={Users2}
            label="My Team"
            isActive={false}
            onClick={() => {}}
            isCollapsed={isSearchOpen}
          />
          <NavItem
            icon={FileText}
            label="Reports"
            isActive={false}
            onClick={() => {}}
            isCollapsed={isSearchOpen}
          />
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 250, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="relative overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-transparent py-1 text-sm focus:outline-none placeholder:text-gray-400"
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="h-8 w-8 rounded-full"
          >
            <Search className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
      </div>

      <div className="ml-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-200/60">
              <User className="h-5 w-5 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Karel Duchon</p>
                <p className="text-xs leading-none text-muted-foreground">
                  karel.duchon@zytlyn.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setActiveView('company')}>
              <Building2 className="mr-2 h-4 w-4" />
              <span>My Company</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}