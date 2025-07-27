"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, RefreshCw } from 'lucide-react';

export interface KnowledgeFile {
    id: number;
    name: string;
    status: 'Synced' | 'Syncing';
}

export function KnowledgeBaseList({ files }: { files: KnowledgeFile[] }) {
    return (
        // 1. Añadimos clases para que la tarjeta sea un contenedor flex que pueda expandirse y contraerse
        <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="flex-shrink-0">
                <CardTitle className="text-base">AI Knowledge Base</CardTitle>
            </CardHeader>
            {/* 2. Hacemos que el contenido sea el área con scroll */}
            <CardContent className="flex-1 overflow-y-auto">
                <ul className="space-y-3">
                    {files.map(file => (
                        <li key={file.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center truncate">
                                <FileText className="w-4 h-4 mr-3 text-gray-500" />
                                <span className="truncate text-gray-800">{file.name}</span>
                            </div>
                            {file.status === 'Synced' ? (
                                <div className="flex items-center text-green-600 text-xs flex-shrink-0">
                                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                    <span>Synced</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-orange-500 text-xs flex-shrink-0">
                                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                    <span>Syncing...</span>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}