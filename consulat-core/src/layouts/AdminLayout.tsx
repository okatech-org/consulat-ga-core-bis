import { Outlet } from "react-router-dom";
import { SimulationBanner } from "@/components/SimulationBanner";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <SimulationBanner />
            {/* Note: We might want a specific Admin Header or Sidebar here later */}
            <div className="flex-1 flex flex-col">
                <Outlet />
            </div>
            <Toaster />
        </div>
    );
}
