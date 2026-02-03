import { motion } from "framer-motion";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    onClick: () => void;
    color?: "blue" | "green" | "purple" | "orange";
    className?: string;
    image?: string;
}

const colorMap = {
    blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 hover:border-blue-200 dark:hover:border-blue-800",
    green: "bg-green-50 dark:bg-green-950/30 text-green-600 hover:border-green-200 dark:hover:border-green-800",
    purple: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 hover:border-purple-200 dark:hover:border-purple-800",
    orange: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 hover:border-orange-200 dark:hover:border-orange-800",
};

const iconColorMap = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    purple: "text-purple-600 dark:text-purple-400",
    orange: "text-orange-600 dark:text-orange-400",
};

export function ProfileCard({
    title,
    description,
    icon: Icon,
    onClick,
    color = "blue",
    className,
    image
}: ProfileCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Card
                className={cn(
                    "cursor-pointer transition-all duration-300 border-2 border-transparent hover:shadow-lg h-full overflow-hidden",
                    colorMap[color],
                    className
                )}
                onClick={onClick}
            >
                {image && (
                    <div className="relative h-40 overflow-hidden">
                        <img 
                            src={image} 
                            alt={title} 
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                )}
                <CardHeader className={image ? "pt-4" : ""}>
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-white dark:bg-background shadow-sm", iconColorMap[color])}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription className="text-muted-foreground text-base mb-4">
                        {description}
                    </CardDescription>
                    <div className={cn("flex items-center font-medium text-sm", iconColorMap[color])}>
                        En savoir plus <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
