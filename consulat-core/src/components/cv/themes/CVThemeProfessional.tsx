import { CVThemeProps } from './CVThemeModern';
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';

export function CVThemeProfessional({ data }: CVThemeProps) {
    return (
        <div className="w-full h-full bg-white text-slate-800 p-12 shadow-lg print:shadow-none min-h-[1123px] font-sans">
            {/* Header */}
            <div className="flex justify-between items-start border-b-4 border-blue-800 pb-8 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-blue-900 uppercase tracking-tight">{data.firstName} {data.lastName}</h1>
                    <p className="text-xl text-slate-600 mt-2 font-light">Professionnel</p>
                </div>
                <div className="text-right text-sm space-y-1 text-slate-600">
                    <div className="flex items-center justify-end gap-2">
                        <span>{data.email}</span>
                        <Mail size={14} className="text-blue-800" />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <span>{data.phone}</span>
                        <Phone size={14} className="text-blue-800" />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <span>{data.address}</span>
                        <MapPin size={14} className="text-blue-800" />
                    </div>
                    {data.linkedinUrl && (
                        <div className="flex items-center justify-end gap-2">
                            <span>{data.linkedinUrl}</span>
                            <Linkedin size={14} className="text-blue-800" />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="col-span-2 space-y-8">
                    {/* Summary */}
                    <section>
                        <h2 className="text-lg font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-8 h-1 bg-blue-800"></span> Profil
                        </h2>
                        <p className="text-slate-700 leading-relaxed text-justify">
                            {data.summary}
                        </p>
                    </section>

                    {/* Experience */}
                    <section>
                        <h2 className="text-lg font-bold text-blue-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <span className="w-8 h-1 bg-blue-800"></span> Expérience
                        </h2>
                        <div className="space-y-6">
                            {data.experiences.map(exp => (
                                <div key={exp.id} className="relative pl-4 border-l-2 border-slate-200">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-lg text-slate-800">{exp.title}</h3>
                                        <span className="text-sm font-medium text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                                            {exp.startDate} - {exp.current ? 'Présent' : exp.endDate}
                                        </span>
                                    </div>
                                    <div className="text-sm font-semibold text-slate-500 mb-2">{exp.company}, {exp.location}</div>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column */}
                <div className="space-y-8 bg-slate-50 p-6 rounded-lg h-fit">
                    {/* Education */}
                    <section>
                        <h2 className="text-lg font-bold text-blue-900 uppercase tracking-wider mb-4 border-b border-blue-200 pb-2">
                            Formation
                        </h2>
                        <div className="space-y-4">
                            {data.education.map(edu => (
                                <div key={edu.id}>
                                    <h3 className="font-bold text-slate-800">{edu.degree}</h3>
                                    <div className="text-sm text-slate-600">{edu.school}</div>
                                    <div className="text-xs text-slate-500 mt-1">{edu.startDate} - {edu.endDate}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Skills */}
                    <section>
                        <h2 className="text-lg font-bold text-blue-900 uppercase tracking-wider mb-4 border-b border-blue-200 pb-2">
                            Compétences
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.map(skill => (
                                <span key={skill.id} className="px-3 py-1 bg-white border border-blue-100 text-blue-900 rounded text-sm font-medium shadow-sm">
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* Languages */}
                    <section>
                        <h2 className="text-lg font-bold text-blue-900 uppercase tracking-wider mb-4 border-b border-blue-200 pb-2">
                            Langues
                        </h2>
                        <div className="space-y-2">
                            {data.languages.map(lang => (
                                <div key={lang.id} className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-700">{lang.name}</span>
                                    <span className="text-slate-500">{lang.level}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
