import { motion } from "framer-motion";

interface SmartScoreRingProps {
    score: number;
    size?: number;
    strokeWidth?: number;
}

const SmartScoreRing = ({ score, size = 120, strokeWidth = 8 }: SmartScoreRingProps) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-gray-200 dark:text-gray-800"
                />
                {/* Progress Circle */}
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    className={`
                        ${score >= 80 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500"}
                        drop-shadow-md
                    `}
                />
            </svg>

            {/* Score Text */}
            <div className="absolute flex flex-col items-center justify-center">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-3xl font-bold text-foreground"
                >
                    {score}%
                </motion.span>
                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Score</span>
            </div>
        </div>
    );
};

export default SmartScoreRing;
