"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, MapPin, Rocket, CheckCircle, TrendingUp, Target, Percent, Award, Users, Banknote, Mail, Phone } from 'lucide-react';

// Pequeño componente para las estadísticas clave (KPIs)
const StatCard = ({ icon: Icon, value, label }: { icon: React.ElementType, value: string, label: string }) => (
    <div className="bg-slate-50 border rounded-lg p-3">
        <div className="flex items-center text-purple-600 mb-1">
            <Icon className="w-4 h-4 mr-2" />
            <p className="text-xl font-bold">{value}</p>
        </div>
        <p className="text-xxs text-gray-500">{label}</p>
    </div>
);

export function DetailedCompanyProfile() {
    return (
        <div className="space-y-6 h-full overflow-y-auto pr-4">
            {/* --- SECCIÓN: DESCRIPCIÓN GENERAL --- */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center"><Building2 className="w-5 h-5 mr-2" /> Zytlyn Technologies AG</CardTitle>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Calendar className="w-3 h-3 mr-1.5"/> Founded in 2021
                                <span className="mx-2">|</span>
                                <MapPin className="w-3 h-3 mr-1.5"/> Geneva, Switzerland
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-700">
                        Specializing in data analytics and AI solutions, Zytlyn offers a Prediction as-a-Service platform primarily targeting the travel and tourism sector.
                    </p>
                </CardContent>
            </Card>

            {/* --- SECCIÓN: PRODUCTO PRINCIPAL --- */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center"><Rocket className="w-4 h-4 mr-2" /> Main Product: ZYTLYN Travel AI</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-sm text-gray-700 mb-3">A predictive platform powered by globally licensed proprietary data (travel, commerce, weather, events, etc.).</p>
                    <ul className="space-y-2 text-xs">
                        <li className="flex items-start"><CheckCircle className="w-3.5 h-3.5 mr-2 mt-0.5 text-green-500 flex-shrink-0" /><span>**Autonomous AI Agents** capable of executing actions automatically.</span></li>
                        <li className="flex items-start"><CheckCircle className="w-3.5 h-3.5 mr-2 mt-0.5 text-green-500 flex-shrink-0" /><span>**CoPilot Mode** where the AI suggests actions to the user.</span></li>
                        <li className="flex items-start"><CheckCircle className="w-3.5 h-3.5 mr-2 mt-0.5 text-green-500 flex-shrink-0" /><span>**High-precision predictive insights** with granular origin-destination data.</span></li>
                    </ul>
                </CardContent>
            </Card>

            {/* --- SECCIÓN: CASOS DE USO Y RESULTADOS --- */}
            <div>
                 <h3 className="text-sm font-semibold text-gray-800 mb-2 ml-1">📈 Use Cases & Business Results</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatCard icon={TrendingUp} value="+325%" label="Increase in campaign conversion rates for airlines & OTAs." />
                    <StatCard icon={Target} value="+19%" label="Increase in airport revenues via demand alerts." />
                    <StatCard icon={Percent} value=">95%" label="Accuracy in passenger volume predictions." />
                 </div>
            </div>

            {/* --- SECCIÓN: EQUIPO Y RECONOCIMIENTO --- */}
            <Card>
                 <CardHeader>
                    <CardTitle className="text-base flex items-center"><Users className="w-4 h-4 mr-2" /> Team, Funding & Recognition</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center text-sm mb-3">
                        <Banknote className="w-4 h-4 mr-2 text-gray-500" />
                        <span>~ **$2.5M USD** raised from investors like Plug and Play & Velocity Ventures.</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline"><Award className="w-3 h-3 mr-1.5"/>Accelerate@IATA 2022</Badge>
                        <Badge variant="outline"><Award className="w-3 h-3 mr-1.5"/>Venturelab 2022</Badge>
                        <Badge variant="outline"><Award className="w-3 h-3 mr-1.5"/>Business Insider Top 14</Badge>
                    </div>
                </CardContent>
            </Card>

             {/* --- SECCIÓN: CONTACTO --- */}
            <Card>
                 <CardHeader>
                    <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                     <div className="flex items-center text-gray-700">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400"/>
                        <span>Route de la Galaise 34, 1228 Plan-les-Ouates, Geneva, Switzerland</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                        <Mail className="w-4 h-4 mr-2 text-gray-400"/>
                        <span>hello@zytlyn.com</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}