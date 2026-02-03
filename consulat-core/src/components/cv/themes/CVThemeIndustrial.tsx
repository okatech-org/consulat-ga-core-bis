import { CVThemeProps } from './CVThemeModern';

export function CVThemeIndustrial({ data }: CVThemeProps) {
    return (
        <div className="w-full h-full bg-slate-50 text-slate-900 shadow-lg print:shadow-none min-h-[1123px] font-sans flex flex-col">
            {/* Header - Heavy & Bold */}
            <div className="bg-slate-800 text-white p-10 flex justify-between items-end border-b-8 border-orange-500">
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">{data.lastName}</h1>
                    <h2 className="text-3xl font-light uppercase tracking-widest text-orange-500">{data.firstName}</h2>
                </div>
                <div className="text-right text-sm font-medium text-slate-300 space-y-1">
                    <p>{data.email}</p>
                    <p>{data.phone}</p>
                    <p>{data.address}</p>
                </div>
            </div>

            <div className="flex-1 p-10 grid grid-cols-12 gap-10">
                {/* Left Column - Main Info */}
                <div className="col-span-8 space-y-10">
                    <section>
                        <h3 className="text-2xl font-black uppercase text-slate-800 mb-6 flex items-center gap-4">
                            <span className="bg-orange-500 text-white w-8 h-8 flex items-center justify-center text-sm rounded">01</span>
                            Profil
                        </h3>
                        <div className="bg-white p-6 border-l-4 border-slate-800 shadow-sm">
                            <p className="text-slate-600 leading-relaxed font-medium">
                                {data.summary}
                            </p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-black uppercase text-slate-800 mb-6 flex items-center gap-4">
                            <span className="bg-orange-500 text-white w-8 h-8 flex items-center justify-center text-sm rounded">02</span>
                            Expérience
                        </h3>
                        <div className="space-y-6">
                            {data.experiences.map(exp => (
                                <div key={exp.id} className="bg-white p-6 shadow-sm border border-slate-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-xl font-bold text-slate-800">{exp.title}</h4>
                                        <span className="bg-slate-100 text-slate-600 px-3 py-1 text-xs font-bold rounded uppercase">
                                            {exp.startDate} - {exp.endDate || 'Présent'}
                                        </span>
                                    </div>
                                    <div className="text-orange-600 font-bold text-sm uppercase mb-4">{exp.company} | {exp.location}</div>
                                    <p className="text-slate-600 text-sm">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column - Stats & Skills */}
                <div className="col-span-4 space-y-10">
                    <section>
                        <h3 className="text-xl font-black uppercase text-slate-800 mb-6 border-b-4 border-slate-800 pb-2">
                            Compétences
                        </h3>
                        <div className="space-y-3">
                            {data.skills.map(skill => (
                                <div key={skill.id}>
                                    <div className="flex justify-between text-sm font-bold mb-1">
                                        <span>{skill.name}</span>
                                        <span className="text-orange-500">100%</span>
                                    </div>
                                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-800 w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xl font-black uppercase text-slate-800 mb-6 border-b-4 border-slate-800 pb-2">
                            Formation
                        </h3>
                        <div className="space-y-4">
                            {data.education.map(edu => (
                                <div key={edu.id} className="bg-slate-200 p-4 rounded border-l-4 border-orange-500">
                                    <div className="font-bold text-slate-800">{edu.degree}</div>
                                    <div className="text-xs text-slate-600 mt-1">{edu.school}</div>
                                    <div className="text-xs font-bold text-slate-500 mt-2">{edu.startDate} - {edu.endDate}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xl font-black uppercase text-slate-800 mb-6 border-b-4 border-slate-800 pb-2">
                            Langues
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {data.languages.map(lang => (
                                <div key={lang.id} className="bg-white border border-slate-200 p-2 text-center">
                                    <div className="font-bold text-sm">{lang.name}</div>
                                    <div className="text-xs text-orange-500 font-bold">{lang.level}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
