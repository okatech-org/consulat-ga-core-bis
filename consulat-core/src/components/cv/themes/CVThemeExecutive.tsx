import { CVThemeProps } from './CVThemeModern';

export function CVThemeExecutive({ data }: CVThemeProps) {
    return (
        <div className="w-full h-full bg-white text-gray-900 p-16 shadow-lg print:shadow-none min-h-[1123px] font-serif">
            {/* Header - Minimal & Centered */}
            <div className="text-center mb-16">
                <h1 className="text-4xl font-normal uppercase tracking-[0.2em] text-gray-800 mb-4">{data.firstName} {data.lastName}</h1>
                <div className="w-24 h-px bg-gray-400 mx-auto mb-6"></div>
                <div className="flex justify-center gap-8 text-sm text-gray-500 font-sans tracking-wide uppercase">
                    <span>{data.email}</span>
                    <span>{data.phone}</span>
                    <span>{data.address}</span>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-12">
                {/* Main Content */}
                <div className="col-span-8 space-y-12">
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Executive Summary</h2>
                        <p className="text-lg leading-relaxed text-gray-700 font-light">
                            {data.summary}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8">Professional Experience</h2>
                        <div className="space-y-10">
                            {data.experiences.map(exp => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-baseline mb-2">
                                        <h3 className="text-xl font-medium text-gray-900">{exp.title}</h3>
                                        <span className="text-sm text-gray-400 font-sans">{exp.startDate} – {exp.endDate || 'Present'}</span>
                                    </div>
                                    <div className="text-base text-gray-600 italic mb-3">{exp.company}, {exp.location}</div>
                                    <p className="text-gray-600 leading-relaxed font-light">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar - Right Aligned */}
                <div className="col-span-4 text-right space-y-12 border-l border-gray-100 pl-8">
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Education</h2>
                        <div className="space-y-6">
                            {data.education.map(edu => (
                                <div key={edu.id}>
                                    <h3 className="text-base font-medium text-gray-900">{edu.degree}</h3>
                                    <div className="text-sm text-gray-600 italic mt-1">{edu.school}</div>
                                    <div className="text-xs text-gray-400 mt-1 font-sans">{edu.startDate} – {edu.endDate}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Expertise</h2>
                        <div className="space-y-3">
                            {data.skills.map(skill => (
                                <div key={skill.id} className="text-sm text-gray-600 font-medium">
                                    {skill.name}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Languages</h2>
                        <div className="space-y-3">
                            {data.languages.map(lang => (
                                <div key={lang.id} className="text-sm">
                                    <span className="text-gray-900 font-medium">{lang.name}</span>
                                    <span className="block text-xs text-gray-400 uppercase mt-0.5">{lang.level}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
