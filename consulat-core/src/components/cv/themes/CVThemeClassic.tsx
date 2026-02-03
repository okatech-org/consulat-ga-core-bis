import { CVThemeProps } from './CVThemeModern';

export function CVThemeClassic({ data }: CVThemeProps) {
    return (
        <div className="w-full h-full bg-white text-gray-900 p-12 shadow-lg print:shadow-none min-h-[1123px] font-serif">
            {/* Header */}
            <div className="text-center border-b-2 border-gray-800 pb-6 mb-8">
                <h1 className="text-4xl font-bold mb-2 uppercase tracking-widest">{data.firstName} {data.lastName}</h1>
                <div className="flex justify-center gap-4 text-sm text-gray-600 italic">
                    <span>{data.email}</span>
                    <span>•</span>
                    <span>{data.phone}</span>
                    <span>•</span>
                    <span>{data.address}</span>
                </div>
            </div>

            {/* Summary */}
            <div className="mb-8">
                <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3">Profil Professionnel</h2>
                <p className="text-sm leading-relaxed text-justify">
                    {data.summary}
                </p>
            </div>

            {/* Experience */}
            <div className="mb-8">
                <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-4">Expérience Professionnelle</h2>
                <div className="space-y-6">
                    {data.experiences.map(exp => (
                        <div key={exp.id}>
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-base">{exp.title}</h3>
                                <span className="text-sm font-medium italic">{exp.startDate} - {exp.current ? 'Présent' : exp.endDate}</span>
                            </div>
                            <div className="text-sm font-semibold mb-2">{exp.company}, {exp.location}</div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {exp.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Education */}
                <div>
                    <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-4">Formation</h2>
                    <div className="space-y-4">
                        {data.education.map(edu => (
                            <div key={edu.id}>
                                <h3 className="font-bold text-base">{edu.degree}</h3>
                                <div className="text-sm">{edu.school}, {edu.location}</div>
                                <div className="text-sm italic text-gray-600">{edu.startDate} - {edu.endDate}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills & Languages */}
                <div>
                    <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-4">Compétences & Langues</h2>

                    <div className="mb-4">
                        <h3 className="font-bold text-sm mb-2 underline">Compétences</h3>
                        <ul className="list-disc list-inside text-sm">
                            {data.skills.map(skill => (
                                <li key={skill.id}>{skill.name}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-sm mb-2 underline">Langues</h3>
                        <ul className="list-disc list-inside text-sm">
                            {data.languages.map(lang => (
                                <li key={lang.id}>{lang.name} - <span className="italic">{lang.level}</span></li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
