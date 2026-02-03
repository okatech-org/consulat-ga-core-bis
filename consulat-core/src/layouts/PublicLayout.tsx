import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SimulationBanner } from "@/components/SimulationBanner";

export default function PublicLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <SimulationBanner />
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
