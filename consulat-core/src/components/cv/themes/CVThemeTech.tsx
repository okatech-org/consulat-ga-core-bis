import { CVThemeProps } from './CVThemeModern';
import { Terminal, Code, Cpu, Globe } from 'lucide-react';

export function CVThemeTech({ data }: CVThemeProps) {
    return (
        <div className="w-full h-full bg-[#1e1e1e] text-gray-300 p-8 shadow-lg print:shadow-none min-h-[1123px] font-mono">
            {/* Top Bar */}
            <div className="bg-[#252526] p-6 rounded-lg border border-[#333] mb-6 flex justify-between items-center">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs text-gray-500">user@{data.firstName.toLowerCase()}:~</div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Sidebar */}
                <div className="col-span-4 space-y-6">
                    <div className="bg-[#252526] p-6 rounded-lg border border-[#333]">
                        <div className="text-center mb-6">
                            <div className="w-24 h-24 mx-auto bg-[#333] rounded-full flex items-center justify-center mb-4 text-green-500">
                                <Terminal size={40} />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-1">{data.firstName} {data.lastName}</h1>
                            <p className="text-green-500 text-sm">Full Stack Developer</p>
                        </div>

                        <div className="space-y-3 text-xs break-all">
                            <div className="flex items-center gap-3">
                                <span className="text-blue-400">const</span> <span className="text-yellow-400">email</span> = <span className="text-orange-400">"{data.email}"</span>;
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-blue-400">const</span> <span className="text-yellow-400">phone</span> = <span className="text-orange-400">"{data.phone}"</span>;
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-blue-400">const</span> <span className="text-yellow-400">loc</span> = <span className="text-orange-400">"{data.address}"</span>;
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#252526] p-6 rounded-lg border border-[#333]">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Code size={16} className="text-blue-400" /> SKILLS
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.map(skill => (
                                <span key={skill.id} className="bg-[#333] text-green-400 px-2 py-1 rounded text-xs border border-green-900/30">
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#252526] p-6 rounded-lg border border-[#333]">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Globe size={16} className="text-purple-400" /> LANGUAGES
                        </h3>
                        <div className="space-y-2">
                            {data.languages.map(lang => (
                                <div key={lang.id} className="flex justify-between text-xs">
                                    <span className="text-gray-300">{lang.name}</span>
                                    <span className="text-yellow-500">[{lang.level}]</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-span-8 space-y-6">
                    <div className="bg-[#252526] p-6 rounded-lg border border-[#333]">
                        <h3 className="text-white font-bold mb-4 border-b border-[#333] pb-2 text-sm">README.md</h3>
                        <p className="text-sm leading-relaxed text-gray-400">
                            {data.summary}
                        </p>
                    </div>

                    <div className="bg-[#252526] p-6 rounded-lg border border-[#333]">
                        <h3 className="text-white font-bold mb-6 border-b border-[#333] pb-2 text-sm flex items-center gap-2">
                            <Cpu size={16} className="text-red-400" /> EXPERIENCE_LOG
                        </h3>
                        <div className="space-y-8">
                            {data.experiences.map((exp, i) => (
                                <div key={exp.id} className="relative pl-6 border-l border-[#333]">
                                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-500"></div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-blue-400 font-bold">{exp.title}</h4>
                                        <span className="text-xs text-gray-500">{exp.startDate} :: {exp.endDate || 'NOW'}</span>
                                    </div>
                                    <div className="text-xs text-purple-400 mb-2">@{exp.company}</div>
                                    <p className="text-sm text-gray-400">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#252526] p-6 rounded-lg border border-[#333]">
                        <h3 className="text-white font-bold mb-6 border-b border-[#333] pb-2 text-sm">EDUCATION_HISTORY</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {data.education.map(edu => (
                                <div key={edu.id} className="bg-[#1e1e1e] p-4 rounded border border-[#333]">
                                    <h4 className="text-yellow-400 font-bold text-sm">{edu.degree}</h4>
                                    <div className="text-xs text-gray-500 mt-1">{edu.school}</div>
                                    <div className="text-xs text-gray-600 mt-1">{edu.startDate} - {edu.endDate}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
