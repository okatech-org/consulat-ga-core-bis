import { CV } from '@/types/cv';
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';

export interface CVThemeProps {
    data: CV;
}

export function CVThemeModern({ data }: CVThemeProps) {
    return (
        <div className="w-full h-full bg-white text-slate-800 p-0 flex flex-col md:flex-row shadow-lg print:shadow-none min-h-[1123px]">
            {/* Sidebar (Left) */}
            <div className="w-full md:w-1/3 bg-slate-900 text-white p-8 flex flex-col gap-8">
                <div className="text-center">
                    {/* Photo Placeholder */}
                    <div className="w-32 h-32 mx-auto bg-slate-700 rounded-full mb-4 flex items-center justify-center text-2xl font-bold border-4 border-slate-600">
                        {data.firstName[0]}{data.lastName[0]}
                    </div>
                    <h1 className="text-2xl font-bold uppercase tracking-wider">{data.firstName} <br /> {data.lastName}</h1>
                    <p className="text-slate-400 mt-2 font-medium">Professionnel</p>
                </div>

                <div className="space-y-4 text-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg"><Mail size={14} /></div>
                        <span>{data.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg"><Phone size={14} /></div>
                        <span>{data.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg"><MapPin size={14} /></div>
                        <span>{data.address}</span>
                    </div>
                    {data.linkedinUrl && (
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded-lg"><Linkedin size={14} /></div>
                            <span className="truncate">{data.linkedinUrl}</span>
                        </div>
                    )}
                </div>

                {/* Skills */}
                <div>
                    <h3 className="text-lg font-bold uppercase border-b border-slate-700 pb-2 mb-4">Compétences</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map(skill => (
                            <span key={skill.id} className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium">
                                {skill.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Languages */}
                <div>
                    <h3 className="text-lg font-bold uppercase border-b border-slate-700 pb-2 mb-4">Langues</h3>
                    <div className="space-y-2">
                        {data.languages.map(lang => (
                            <div key={lang.id} className="flex justify-between text-sm">
                                <span>{lang.name}</span>
                                <span className="text-slate-400">{lang.level}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content (Right) */}
            <div className="w-full md:w-2/3 p-8 bg-white">
                {/* Summary */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 pb-2 mb-4">Profil</h2>
                    <p className="text-slate-600 leading-relaxed text-sm text-justify">
                        {data.summary}
                    </p>
                </div>

                {/* Experience */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 pb-2 mb-6">Expérience</h2>
                    <div className="space-y-6">
                        {data.experiences.map(exp => (
                            <div key={exp.id} className="relative pl-6 border-l-2 border-slate-200">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-4 border-white"></div>
                                <div className="mb-1">
                                    <h3 className="font-bold text-slate-800">{exp.title}</h3>
                                    <div className="text-sm font-semibold text-slate-500">{exp.company} | {exp.location}</div>
                                </div>
                                <div className="text-xs text-slate-400 font-mono mb-2">
                                    {exp.startDate} - {exp.current ? 'Présent' : exp.endDate}
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {exp.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Education */}
                <div>
                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 pb-2 mb-6">Formation</h2>
                    <div className="space-y-4">
                        {data.education.map(edu => (
                            <div key={edu.id}>
                                <h3 className="font-bold text-slate-800">{edu.degree}</h3>
                                <div className="text-sm text-slate-600">{edu.school}, {edu.location}</div>
                                <div className="text-xs text-slate-400 font-mono">
                                    {edu.startDate} - {edu.endDate}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
