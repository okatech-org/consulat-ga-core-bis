import { CVThemeProps } from './CVThemeModern';

export function CVThemeBold({ data }: CVThemeProps) {
    return (
        <div className="w-full h-full bg-black text-white p-12 shadow-lg print:shadow-none min-h-[1123px] font-sans">
            {/* Massive Header */}
            <div className="mb-16">
                <h1 className="text-8xl font-black uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                    {data.firstName}<br />{data.lastName}
                </h1>
            </div>

            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-4 space-y-12">
                    <div className="space-y-2 text-lg font-bold text-gray-400">
                        <p className="text-white">{data.email}</p>
                        <p>{data.phone}</p>
                        <p>{data.address}</p>
                    </div>

                    <section>
                        <h2 className="text-2xl font-black uppercase text-red-500 mb-6">Skills</h2>
                        <div className="flex flex-col gap-2">
                            {data.skills.map(skill => (
                                <span key={skill.id} className="text-xl font-bold border-b-2 border-gray-800 pb-1">
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black uppercase text-red-500 mb-6">Languages</h2>
                        <div className="space-y-4">
                            {data.languages.map(lang => (
                                <div key={lang.id}>
                                    <div className="text-xl font-bold">{lang.name}</div>
                                    <div className="text-sm text-gray-500">{lang.level}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="col-span-8 space-y-16">
                    <section>
                        <p className="text-2xl font-light leading-relaxed text-gray-300">
                            {data.summary}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-4xl font-black uppercase text-white mb-8 flex items-center gap-4">
                            Experience <div className="h-2 bg-red-500 flex-1"></div>
                        </h2>
                        <div className="space-y-12">
                            {data.experiences.map(exp => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-end mb-2">
                                        <h3 className="text-3xl font-bold text-white">{exp.title}</h3>
                                        <span className="text-red-500 font-bold">{exp.startDate.split('-')[0]}</span>
                                    </div>
                                    <div className="text-xl text-gray-500 mb-4 uppercase tracking-widest">{exp.company}</div>
                                    <p className="text-lg text-gray-400 leading-relaxed">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-4xl font-black uppercase text-white mb-8 flex items-center gap-4">
                            Education <div className="h-2 bg-red-500 flex-1"></div>
                        </h2>
                        <div className="space-y-8">
                            {data.education.map(edu => (
                                <div key={edu.id}>
                                    <h3 className="text-2xl font-bold text-white">{edu.degree}</h3>
                                    <div className="text-lg text-gray-500">{edu.school}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
