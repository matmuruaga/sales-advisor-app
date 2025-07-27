"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AiButton } from '../common/AiButton';

export function CompanyProfileCard() {
    const [name, setName] = useState('NuestraCorp Inc.');
    const [website, setWebsite] = useState('www.nuestracorp.com');
    const [pitch, setPitch] = useState('NuestraCorp Inc. is a leading provider of innovative B2B software solutions, helping businesses streamline operations and boost productivity.');

    const handleEnrich = () => {
        // Simulación de enriquecimiento
        setPitch('NuestraCorp Inc. is a leading provider of innovative B2B software solutions, helping enterprise clients streamline complex operational workflows and boost productivity by an average of 25%. Our flagship product, OptiFlow, integrates seamlessly with existing CRM and ERP systems.');
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-base">Company Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-xxs font-medium text-gray-600">Company Name</label>
                    <Input value={name} onChange={e => setName(e.target.value)} className="text-sm" />
                </div>
                 <div>
                    <label className="text-xxs font-medium text-gray-600">Website</label>
                    <Input value={website} onChange={e => setWebsite(e.target.value)} className="text-sm" />
                </div>
                 <div>
                    <label className="text-xxs font-medium text-gray-600">Company Description / Pitch</label>
                    <Textarea value={pitch} onChange={e => setPitch(e.target.value)} rows={6} className="text-sm" />
                </div>
                <div className="flex justify-end">
                    <AiButton onClick={handleEnrich}>Enrich with AI</AiButton>
                </div>
            </CardContent>
        </Card>
    );
}