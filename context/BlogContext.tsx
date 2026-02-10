'use client';

import React, { createContext, useContext, useState } from 'react';

interface BlogContextType {
  url: string;
  setUrl: (url: string) => void;
  auditData: any;
  setAuditData: (data: any) => void;
  finalHtml: string;
  setFinalHtml: (html: string) => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function BlogProvider({ children }: { children: React.ReactNode }) {
  const [url, setUrl] = useState('');
  const [auditData, setAuditData] = useState(null);
  const [finalHtml, setFinalHtml] = useState('');

  return (
    <BlogContext.Provider value={{ 
      url, setUrl, 
      auditData, setAuditData, 
      finalHtml, setFinalHtml 
    }}>
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  const context = useContext(BlogContext);
  if (!context) throw new Error('useBlog must be used within a BlogProvider');
  return context;
}