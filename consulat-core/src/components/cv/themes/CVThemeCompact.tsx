import { CVThemeProps } from './CVThemeModern';

export function CVThemeCompact({ data }: CVThemeProps) {
    return (
        <div className="w-full h-full bg-white text-gray-900 p-8 shadow-lg print:shadow-none min-h-[1123px] font-sans text-sm">
            {/* Header - Very Compact */}
            <div className="flex justify-between items-end border-b-2 border-gray-900 pb-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold uppercase leading-none">{data.firstName} {data.lastName}</h1>
                    <p className="text-gray-600 mt-1">{data.email} | {data.phone} | {data.address}</p>
                </div>
                {data.linkedinUrl && <div className="text-right text-gray-500">{data.linkedinUrl}</div>}
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Main Column */}
                <div className="col-span-2 space-y-6">
                    <section>
                        <h2 className="font-bold uppercase text-gray-900 border-b border-gray-300 mb-2">Summary</h2>
                        <p className="text-gray-700 text-justify leading-snug">
                            {data.summary}
                        </p>
                    </section>

                    <section>
                        <h2 className="font-bold uppercase text-gray-900 border-b border-gray-300 mb-3">Experience</h2>
                        <div className="space-y-4">
                            {data.experiences.map(exp => (
                                <div key={exp.id}>
                                    <div className="flex justify-between font-bold">
                                        <span>{exp.title}</span>
                                        <span className="text-xs">{exp.startDate} - {exp.endDate || 'Present'}</span>
                                    </div>
                                    <div className="text-xs font-semibold text-gray-600 mb-1">{exp.company}, {exp.location}</div>
                                    <p className="text-gray-700 leading-snug">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    <section>
                        <h2 className="font-bold uppercase text-gray-900 border-b border-gray-300 mb-3">Education</h2>
                        <div className="space-y-3">
                            {data.education.map(edu => (
                                <div key={edu.id}>
                                    <div className="font-bold">{edu.degree}</div>
                                    <div className="text-xs text-gray-600">{edu.school}</div>
                                    <div className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="font-bold uppercase text-gray-900 border-b border-gray-300 mb-3">Skills</h2>
                        <div className="flex flex-wrap gap-1">
                            {data.skills.map(skill => (
                                <span key={skill.id} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs border border-gray-200">
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="font-bold uppercase text-gray-900 border-b border-gray-300 mb-3">Languages</h2>
                        <ul className="space-y-1">
                            {data.languages.map(lang => (
                                <li key={lang.id} className="flex justify-between">
                                    <span>{lang.name}</span>
                                    <span className="text-gray-500">{lang.level}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
