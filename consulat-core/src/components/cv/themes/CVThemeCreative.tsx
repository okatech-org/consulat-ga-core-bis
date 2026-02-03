import { CVThemeProps } from './CVThemeModern';

export function CVThemeCreative({ data }: CVThemeProps) {
    return (
        <div className="w-full h-full bg-[#f0f0f0] text-gray-800 shadow-lg print:shadow-none min-h-[1123px] font-sans flex">
            {/* Left Sidebar - Dark & Bold */}
            <div className="w-[35%] bg-black text-white p-8 flex flex-col justify-between">
                <div>
                    <div className="mb-12">
                        <h1 className="text-5xl font-black leading-none mb-4 text-yellow-400 tracking-tighter">
                            {data.firstName}<br />{data.lastName}
                        </h1>
                        <p className="text-xl font-light tracking-widest uppercase text-gray-400">Créatif</p>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-yellow-400 font-bold uppercase tracking-widest mb-4 text-sm">Contact</h3>
                            <div className="space-y-3 text-sm font-light text-gray-300 break-words">
                                <p>{data.email}</p>
                                <p>{data.phone}</p>
                                <p>{data.address}</p>
                                {data.linkedinUrl && <p className="break-words">{data.linkedinUrl}</p>}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-yellow-400 font-bold uppercase tracking-widest mb-4 text-sm">Compétences</h3>
                            <div className="flex flex-wrap gap-2">
                                {data.skills.map(skill => (
                                    <span key={skill.id} className="bg-gray-800 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-yellow-400 font-bold uppercase tracking-widest mb-4 text-sm">Langues</h3>
                            <div className="space-y-2 text-sm">
                                {data.languages.map(lang => (
                                    <div key={lang.id} className="flex justify-between border-b border-gray-800 pb-1">
                                        <span>{lang.name}</span>
                                        <span className="text-gray-500">{lang.level}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-[10px] text-gray-600 uppercase tracking-widest">
                    Portfolio Available Upon Request
                </div>
            </div>

            {/* Right Content - Clean & Spacious */}
            <div className="w-[65%] p-12 bg-white flex flex-col gap-10">
                <section>
                    <h2 className="text-4xl font-black text-black mb-6 flex items-end gap-2">
                        PROFIL <span className="w-2 h-2 bg-yellow-400 mb-2"></span>
                    </h2>
                    <p className="text-lg leading-relaxed font-light text-gray-600">
                        {data.summary}
                    </p>
                </section>

                <section>
                    <h2 className="text-4xl font-black text-black mb-8 flex items-end gap-2">
                        EXPÉRIENCE <span className="w-2 h-2 bg-yellow-400 mb-2"></span>
                    </h2>
                    <div className="space-y-8">
                        {data.experiences.map(exp => (
                            <div key={exp.id} className="group">
                                <div className="flex justify-between items-baseline mb-2">
                                    <h3 className="text-xl font-bold group-hover:text-yellow-500 transition-colors">{exp.title}</h3>
                                    <span className="text-sm font-bold text-gray-400">{exp.startDate.split('-')[0]}</span>
                                </div>
                                <div className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">{exp.company}</div>
                                <p className="text-gray-600 leading-relaxed">
                                    {exp.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-4xl font-black text-black mb-8 flex items-end gap-2">
                        FORMATION <span className="w-2 h-2 bg-yellow-400 mb-2"></span>
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                        {data.education.map(edu => (
                            <div key={edu.id} className="border-l-4 border-yellow-400 pl-4">
                                <h3 className="text-lg font-bold">{edu.degree}</h3>
                                <div className="text-gray-500">{edu.school}</div>
                                <div className="text-sm text-gray-400 mt-1">{edu.startDate} - {edu.endDate}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
