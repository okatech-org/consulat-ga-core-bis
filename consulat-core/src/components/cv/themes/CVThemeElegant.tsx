import { CVThemeProps } from './CVThemeModern';

export function CVThemeElegant({ data }: CVThemeProps) {
    return (
        <div className="w-full h-full bg-[#faf9f6] text-gray-800 p-16 shadow-lg print:shadow-none min-h-[1123px] font-serif">
            {/* Border Frame */}
            <div className="border border-gray-300 h-full p-12 flex flex-col relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#faf9f6] px-4">
                    <span className="text-2xl text-gray-400">❦</span>
                </div>

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-normal tracking-widest mb-4 text-gray-900 uppercase">{data.firstName} {data.lastName}</h1>
                    <div className="flex flex-wrap justify-center gap-6 text-sm italic text-gray-500 font-sans break-words">
                        <span>{data.email}</span>
                        <span>{data.phone}</span>
                        <span>{data.address}</span>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-12 flex-1">
                    {/* Left Column */}
                    <div className="col-span-4 space-y-12 border-r border-gray-200 pr-8 text-right">
                        <section>
                            <h2 className="text-base font-bold uppercase tracking-wider mb-6 text-gray-900 border-b border-gray-200 pb-2">Formation</h2>
                            <div className="space-y-6">
                                {data.education.map(edu => (
                                    <div key={edu.id}>
                                        <h3 className="font-bold text-base">{edu.degree}</h3>
                                        <div className="text-sm italic text-gray-600 mb-1">{edu.school}</div>
                                        <div className="text-xs text-gray-400 font-sans">{edu.startDate} - {edu.endDate}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-base font-bold uppercase tracking-wider mb-6 text-gray-900 border-b border-gray-200 pb-2">Compétences</h2>
                            <div className="space-y-2">
                                {data.skills.map(skill => (
                                    <div key={skill.id} className="text-sm font-medium text-gray-700">
                                        {skill.name}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-base font-bold uppercase tracking-wider mb-6 text-gray-900 border-b border-gray-200 pb-2">Langues</h2>
                            <div className="space-y-2">
                                {data.languages.map(lang => (
                                    <div key={lang.id} className="text-sm">
                                        <span className="font-bold">{lang.name}</span> <span className="italic text-gray-500">({lang.level})</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column */}
                    <div className="col-span-8 space-y-12">
                        <section>
                            <h2 className="text-base font-bold uppercase tracking-wider mb-6 text-gray-900 border-b border-gray-200 pb-2">Profil</h2>
                            <p className="text-gray-600 leading-loose text-justify font-sans text-sm">
                                {data.summary}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-bold uppercase tracking-wider mb-6 text-gray-900 border-b border-gray-200 pb-2">Expérience</h2>
                            <div className="space-y-10">
                                {data.experiences.map(exp => (
                                    <div key={exp.id}>
                                        <div className="flex justify-between items-baseline mb-2 font-sans">
                                            <h3 className="font-bold text-lg text-gray-800">{exp.title}</h3>
                                            <span className="text-xs text-gray-400 uppercase tracking-wider">{exp.startDate} — {exp.endDate || 'Présent'}</span>
                                        </div>
                                        <div className="text-sm italic text-gray-500 mb-3">{exp.company}, {exp.location}</div>
                                        <p className="text-sm text-gray-600 leading-relaxed font-sans text-justify">
                                            {exp.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-[#faf9f6] px-4">
                    <span className="text-2xl text-gray-400">❦</span>
                </div>
            </div>
        </div>
    );
}
