import {
  Home,
  BarChart3,
  Zap,
  Users as ContactsIcon,
  FileText,
  Search,
  User,
} from 'lucide-react';
import { Button } from './ui/button';

/* --- 1. Added `onClick` prop to NavItem --- */
const NavItem = ({
  icon: Icon,
  label,
  isActive = false,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}) => (
  <Button
    variant="ghost"
    onClick={onClick}
    className={`
      h-auto rounded-full px-3 py-1.5 text-xs flex items-center gap-2
      transition-all duration-200
      ${
        isActive
          ? 'border-2 border-gray-400 text-gray-700'
          : 'border-2 border-gray-200/80 text-gray-600 hover:bg-gray-100/80'
      }
    `}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </Button>
);

/* --- 2. AppHeader now accepts and uses props to control state --- */
export function AppHeader({
  activeView,
  setActiveView,
}: {
  activeView: string;
  setActiveView: (view: 'meetings' | 'analytics') => void;
}) {
  return (
    <header className="flex items-center justify-between mb-8">
      {/* Search & navigation bar */}
      <div className="flex-1 flex items-center gap-2 border border-gray-200/80 rounded-full p-1.5 bg-white/50 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-1">
          {/* --- 3. Dynamic NavItem buttons --- */}
          <NavItem
            icon={Home}
            label="Home"
            isActive={activeView === 'meetings'}
            onClick={() => setActiveView('meetings')}
          />
          <NavItem
            icon={BarChart3}
            label="Analytics"
            isActive={activeView === 'analytics'}
            onClick={() => setActiveView('analytics')}
          />
          {/* For the demo, the other buttons are non-active placeholders */}
          <NavItem icon={Zap} label="Actions" isActive={false} onClick={() => {}} />
          <NavItem
            icon={ContactsIcon}
            label="Contacts"
            isActive={false}
            onClick={() => {}}
          />
          <NavItem
            icon={FileText}
            label="Reports"
            isActive={false}
            onClick={() => {}}
          />
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200/80 mx-2"></div>

        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search meetings, participants, actions..."
            className="w-full bg-transparent pl-10 pr-4 py-1 text-sm focus:outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* User avatar / profile button */}
      <div className="ml-4">
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-200/60">
          <User className="h-5 w-5 text-gray-600" />
        </Button>
      </div>
    </header>
  );
}
