import { CVThemeProps } from './CVThemeModern';

export function CVThemeStartup({ data }: CVThemeProps) {
    return (
        <div className="w-full h-full bg-white text-gray-800 shadow-lg print:shadow-none min-h-[1123px] font-sans">
            {/* Vibrant Header */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-12 pb-24 clip-path-slant">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-5xl font-extrabold tracking-tight mb-2">{data.firstName} {data.lastName}</h1>
                        <p className="text-xl font-medium opacity-90">Innovator & Builder</p>
                    </div>
                    <div className="text-right text-sm font-medium opacity-90 space-y-1">
                        <p>{data.email}</p>
                        <p>{data.phone}</p>
                        <p>{data.address}</p>
                    </div>
                </div>
            </div>

            <div className="px-12 -mt-12 grid grid-cols-12 gap-8">
                {/* Left Column - Main */}
                <div className="col-span-8 space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
                        <h2 className="text-2xl font-bold text-indigo-600 mb-4">About Me</h2>
                        <p className="text-gray-600 leading-relaxed">
                            {data.summary}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <span className="w-2 h-8 bg-pink-500 rounded-full"></span>
                            Experience
                        </h2>
                        {data.experiences.map(exp => (
                            <div key={exp.id} className="relative pl-8 border-l-2 border-indigo-100">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow"></div>
                                <h3 className="text-xl font-bold text-gray-800">{exp.title}</h3>
                                <div className="text-indigo-600 font-semibold text-sm mb-2">{exp.company}</div>
                                <p className="text-gray-600 text-sm mb-2">
                                    {exp.description}
                                </p>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                    {exp.startDate} - {exp.endDate || 'Present'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="col-span-4 space-y-6 pt-12">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 uppercase tracking-wider text-sm">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.map(skill => (
                                <span key={skill.id} className="px-3 py-1 bg-white border border-indigo-100 text-indigo-600 rounded-full text-xs font-bold shadow-sm">
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 uppercase tracking-wider text-sm">Education</h3>
                        <div className="space-y-4">
                            {data.education.map(edu => (
                                <div key={edu.id}>
                                    <div className="font-bold text-gray-800 text-sm">{edu.degree}</div>
                                    <div className="text-xs text-gray-500">{edu.school}</div>
                                    <div className="text-xs text-indigo-400 font-bold mt-1">{edu.startDate} - {edu.endDate}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
                        <h3 className="font-bold mb-4 uppercase tracking-wider text-sm opacity-90">Languages</h3>
                        <div className="space-y-2">
                            {data.languages.map(lang => (
                                <div key={lang.id} className="flex justify-between text-sm">
                                    <span>{lang.name}</span>
                                    <span className="font-bold opacity-75">{lang.level}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
