"use client";

import { useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card'; // --- LÍNEA AÑADIDA ---

export function FileUploader({ onFileAdded }: { onFileAdded: (fileName: string) => void }) {
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState('');

    const handleUpload = () => {
        setIsUploading(true);
        const demoFileName = 'Company One-Pager.pdf';
        setFileName(demoFileName);

        // Simular el proceso de carga
        setTimeout(() => {
            setIsUploading(false);
            onFileAdded(demoFileName);
            setFileName('');
        }, 2500);
    };

    return (
        <Card 
            onClick={!isUploading ? handleUpload : undefined}
            className="border-2 border-dashed hover:border-purple-400 transition-colors cursor-pointer p-6 flex flex-col items-center justify-center text-center"
        >
            <AnimatePresence mode="wait">
                {isUploading ? (
                    <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                        <Loader2 className="w-8 h-8 mx-auto text-purple-500 animate-spin" />
                        <p className="text-sm font-medium">Uploading & Indexing...</p>
                        <p className="text-xs text-gray-500">{fileName}</p>
                    </motion.div>
                ) : (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-gray-500">
                        <UploadCloud className="w-8 h-8 mx-auto mb-2"/>
                        <p className="text-sm font-medium text-gray-700">
                            Click to upload files
                        </p>
                        <p className="text-xs">PDF, DOCX, TXT (Max 10MB)</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}