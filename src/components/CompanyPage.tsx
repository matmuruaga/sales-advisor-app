"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DetailedCompanyProfile } from './company/DetailedCompanyProfile';
import { FileUploader } from './company/FileUploader';
import { KnowledgeBaseList, KnowledgeFile } from './company/KnowledgeBaseList';
import { AgentSyncIndicator } from './common/AgentSyncIndicator';

export function CompanyPage() {
    const [files, setFiles] = useState<KnowledgeFile[]>([
        { id: 1, name: 'Product Brochure Q3.pdf', status: 'Synced' },
        { id: 2, name: 'Pricing & Tiers.docx', status: 'Synced' },
        { id: 3, name: 'Security Whitepaper.pdf', status: 'Synced' },
        { id: 4, name: 'API Documentation.docx', status: 'Synced' },
    ]);

    const handleFileUpload = (fileName: string) => {
        const newFile: KnowledgeFile = {
            id: Date.now(),
            name: fileName,
            status: 'Syncing',
        };
        setFiles(prev => [...prev, newFile]);

        setTimeout(() => {
            setFiles(prev => prev.map(f => f.id === newFile.id ? { ...f, status: 'Synced' } : f));
        }, 2000);
    };

    return (
        <div className="h-full w-full flex flex-col relative">
            <div className="absolute top-0 right-0">
                <AgentSyncIndicator />
            </div>

            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">My Company</h1>
                <p className="text-sm text-gray-500">
                    This is the information the AI agent will use to understand your business context.
                </p>
            </div>

            {/* Two-column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 flex-1 min-h-0">
                
                {/* Left Column: Company Profile */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: 0.1 }}
                    className="h-full min-h-0" 
                >
                    <DetailedCompanyProfile />
                </motion.div>
                
                {/* Right Column: Knowledge Base */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: 0.2 }} 
                    className="flex flex-col space-y-6 h-full min-h-0"
                >
                    <div className="flex-shrink-0">
                        <FileUploader onFileAdded={handleFileUpload} />
                    </div>
                    <KnowledgeBaseList files={files} />
                </motion.div>
            </div>
        </div>
    );
}