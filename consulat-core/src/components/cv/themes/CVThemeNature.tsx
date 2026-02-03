import { CVThemeProps } from './CVThemeModern';
import { Leaf } from 'lucide-react';

export function CVThemeNature({ data }: CVThemeProps) {
    return (
        <div className="w-full h-full bg-[#fdfdf8] text-stone-800 p-12 shadow-lg print:shadow-none min-h-[1123px] font-sans">
            <div className="flex h-full gap-12">
                {/* Sidebar - Green */}
                <div className="w-1/3 bg-[#e8f3e8] rounded-3xl p-8 flex flex-col gap-8">
                    <div className="text-center">
                        <div className="w-32 h-32 mx-auto bg-[#ccdccb] rounded-full flex items-center justify-center text-emerald-800 mb-4">
                            <Leaf size={48} />
                        </div>
                        <h1 className="text-2xl font-bold text-emerald-900">{data.firstName} {data.lastName}</h1>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white/50 p-4 rounded-xl">
                            <h3 className="text-emerald-800 font-bold uppercase text-xs tracking-wider mb-3">Contact</h3>
                            <div className="space-y-2 text-sm text-stone-600 break-words">
                                <p>{data.email}</p>
                                <p>{data.phone}</p>
                                <p>{data.address}</p>
                            </div>
                        </div>

                        <div className="bg-white/50 p-4 rounded-xl">
                            <h3 className="text-emerald-800 font-bold uppercase text-xs tracking-wider mb-3">Compétences</h3>
                            <div className="flex flex-wrap gap-2">
                                {data.skills.map(skill => (
                                    <span key={skill.id} className="bg-[#ccdccb] text-emerald-900 px-2 py-1 rounded-lg text-xs font-medium">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/50 p-4 rounded-xl">
                            <h3 className="text-emerald-800 font-bold uppercase text-xs tracking-wider mb-3">Langues</h3>
                            <div className="space-y-2 text-sm">
                                {data.languages.map(lang => (
                                    <div key={lang.id} className="flex justify-between">
                                        <span>{lang.name}</span>
                                        <span className="text-emerald-700">{lang.level}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="w-2/3 py-4 space-y-10">
                    <section>
                        <h2 className="text-3xl font-serif text-emerald-900 mb-6">Profil</h2>
                        <p className="text-stone-600 leading-relaxed">
                            {data.summary}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-serif text-emerald-900 mb-6">Expérience</h2>
                        <div className="space-y-8">
                            {data.experiences.map(exp => (
                                <div key={exp.id}>
                                    <h3 className="text-xl font-bold text-stone-800">{exp.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium mb-2">
                                        <span>{exp.company}</span>
                                        <span>•</span>
                                        <span>{exp.startDate} - {exp.endDate || 'Présent'}</span>
                                    </div>
                                    <p className="text-stone-600 text-sm">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-serif text-emerald-900 mb-6">Formation</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {data.education.map(edu => (
                                <div key={edu.id} className="border-l-2 border-[#ccdccb] pl-4">
                                    <h3 className="font-bold text-stone-800">{edu.degree}</h3>
                                    <div className="text-sm text-stone-500">{edu.school}</div>
                                    <div className="text-xs text-emerald-600 mt-1">{edu.startDate} - {edu.endDate}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
