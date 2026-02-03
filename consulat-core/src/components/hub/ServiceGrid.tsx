import { cn } from "@/lib/utils";

interface ServiceGridProps {
    children: React.ReactNode;
    className?: string;
    columns?: 2 | 3 | 4;
}

export function ServiceGrid({ children, className, columns = 3 }: ServiceGridProps) {
    const gridCols = {
        2: "md:grid-cols-2",
        3: "md:grid-cols-2 lg:grid-cols-3",
        4: "md:grid-cols-2 lg:grid-cols-4",
    };

    return (
        <div className={cn("grid grid-cols-1 gap-6", gridCols[columns], className)}>
            {children}
        </div>
    );
}
