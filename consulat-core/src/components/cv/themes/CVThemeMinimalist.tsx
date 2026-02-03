import { CVThemeProps } from './CVThemeModern';

export function CVThemeMinimalist({ data }: CVThemeProps) {
    return (
        <div className="w-full h-full bg-white text-gray-800 p-12 shadow-lg print:shadow-none min-h-[1123px] font-sans">
            <div className="grid grid-cols-12 gap-8 h-full">
                {/* Left Column (Header + Contact + Skills) */}
                <div className="col-span-4 border-r border-gray-100 pr-8 flex flex-col h-full">
                    <div className="mb-12">
                        <h1 className="text-3xl font-light mb-2">{data.firstName}</h1>
                        <h1 className="text-3xl font-bold mb-6">{data.lastName}</h1>
                        <div className="w-12 h-1 bg-black mb-6"></div>

                        <div className="text-xs space-y-2 text-gray-500 font-medium tracking-wide">
                            <p>{data.email}</p>
                            <p>{data.phone}</p>
                            <p>{data.address}</p>
                            {data.linkedinUrl && <p>{data.linkedinUrl}</p>}
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-gray-400">Compétences</h3>
                        <div className="space-y-2">
                            {data.skills.map(skill => (
                                <div key={skill.id} className="text-sm font-medium">
                                    {skill.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-gray-400">Langues</h3>
                        <div className="space-y-2">
                            {data.languages.map(lang => (
                                <div key={lang.id} className="text-sm">
                                    <span className="font-medium">{lang.name}</span> <span className="text-gray-400">/ {lang.level}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column (Experience + Education) */}
                <div className="col-span-8">
                    {/* Summary */}
                    <div className="mb-10">
                        <p className="text-sm leading-7 text-gray-600">
                            {data.summary}
                        </p>
                    </div>

                    {/* Experience */}
                    <div className="mb-10">
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-4">
                            Expérience
                            <div className="h-px bg-gray-100 flex-1"></div>
                        </h2>
                        <div className="space-y-8">
                            {data.experiences.map(exp => (
                                <div key={exp.id} className="grid grid-cols-12 gap-4">
                                    <div className="col-span-3 text-xs font-bold text-gray-400 pt-1">
                                        {exp.startDate} — {exp.current ? 'Présent' : exp.endDate}
                                    </div>
                                    <div className="col-span-9">
                                        <h3 className="font-bold text-sm mb-1">{exp.title}</h3>
                                        <div className="text-xs font-medium text-gray-500 mb-2">{exp.company}, {exp.location}</div>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {exp.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Education */}
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-4">
                            Formation
                            <div className="h-px bg-gray-100 flex-1"></div>
                        </h2>
                        <div className="space-y-6">
                            {data.education.map(edu => (
                                <div key={edu.id} className="grid grid-cols-12 gap-4">
                                    <div className="col-span-3 text-xs font-bold text-gray-400 pt-1">
                                        {edu.startDate} — {edu.endDate}
                                    </div>
                                    <div className="col-span-9">
                                        <h3 className="font-bold text-sm mb-1">{edu.degree}</h3>
                                        <div className="text-xs text-gray-500">{edu.school}, {edu.location}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
