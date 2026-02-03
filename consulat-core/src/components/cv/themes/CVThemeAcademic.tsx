import { CVThemeProps } from './CVThemeModern';

export function CVThemeAcademic({ data }: CVThemeProps) {
    return (
        <div className="w-full h-full bg-white text-black p-16 shadow-lg print:shadow-none min-h-[1123px] font-serif leading-relaxed">
            {/* Header - Centered & Traditional */}
            <div className="text-center mb-12 border-b-2 border-black pb-8">
                <h1 className="text-3xl font-bold mb-4 uppercase">{data.firstName} {data.lastName}</h1>
                <div className="text-sm space-y-1">
                    <p>{data.address} • {data.phone}</p>
                    <p>{data.email}</p>
                    {data.linkedinUrl && <p>{data.linkedinUrl}</p>}
                </div>
            </div>

            {/* Content - Single Column, Text Heavy */}
            <div className="space-y-8">
                {/* Education First for Academic */}
                <section>
                    <h2 className="text-lg font-bold uppercase mb-4 border-b border-gray-300 pb-1">Education</h2>
                    <div className="space-y-4">
                        {data.education.map(edu => (
                            <div key={edu.id} className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold">{edu.school}, {edu.location}</div>
                                    <div className="italic">{edu.degree}</div>
                                </div>
                                <div className="text-right whitespace-nowrap">
                                    {edu.startDate} – {edu.endDate}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Research / Experience */}
                <section>
                    <h2 className="text-lg font-bold uppercase mb-4 border-b border-gray-300 pb-1">Professional Experience</h2>
                    <div className="space-y-6">
                        {data.experiences.map(exp => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-base">{exp.title}</h3>
                                    <span className="text-sm">{exp.startDate} – {exp.endDate || 'Present'}</span>
                                </div>
                                <div className="italic mb-2">{exp.company}, {exp.location}</div>
                                <p className="text-sm text-justify">
                                    {exp.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Skills */}
                <section>
                    <h2 className="text-lg font-bold uppercase mb-4 border-b border-gray-300 pb-1">Skills & Languages</h2>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-sm mb-2 underline">Technical Skills</h3>
                            <p className="text-sm">
                                {data.skills.map(s => s.name).join(', ')}
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm mb-2 underline">Languages</h3>
                            <ul className="text-sm list-disc list-inside">
                                {data.languages.map(lang => (
                                    <li key={lang.id}>{lang.name} ({lang.level})</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
