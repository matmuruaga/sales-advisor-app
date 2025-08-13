"use client";

import * as React from 'react';

type TabsContextValue = {
  value: string;
  setValue: (v: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (v: string) => void;
}

export function Tabs({ value, onValueChange, className, children, ...props }: TabsProps) {
  const contextValue = React.useMemo(() => ({ value, setValue: onValueChange }), [value, onValueChange]);
  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className} {...props}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div role="tablist" className={className} {...props}>
      {children}
    </div>
  );
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) return null;
  const isActive = ctx.value === value;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={[
        'px-3 py-2 text-sm rounded-t-md border-b-2',
        isActive ? 'border-purple-600 text-purple-700 bg-purple-50' : 'border-transparent text-gray-600 hover:text-gray-800'
      ].concat(className ? [className] : []).join(' ')}
      onClick={() => ctx.setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) return null;
  if (ctx.value !== value) return null;
  return (
    <div role="tabpanel" className={className} {...props}>
      {children}
    </div>
  );
}


