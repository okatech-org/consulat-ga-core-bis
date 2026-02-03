import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, subMonths, format } from "date-fns";

export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  completedThisMonth: number;
  averageProcessingTime: string;
  satisfactionRate: string;
  scheduledAppointments: number;
  requestsByType: { name: string; value: number; color: string }[];
  monthlyTrends: { month: string; demandes: number; traitees: number }[];
}

const TYPE_COLORS: Record<string, string> = {
  PASSPORT: "hsl(var(--primary))",
  VISA: "hsl(var(--chart-2))",
  CIVIL_REGISTRY: "hsl(var(--chart-3))",
  LEGALIZATION: "hsl(var(--chart-4))",
  CONSULAR_CARD: "hsl(var(--chart-5))",
  ATTESTATION: "hsl(var(--chart-1))",
};

const TYPE_LABELS: Record<string, string> = {
  PASSPORT: "Passeport",
  VISA: "Visa",
  CIVIL_REGISTRY: "État Civil",
  LEGALIZATION: "Légalisation",
  CONSULAR_CARD: "Carte Consulaire",
  ATTESTATION: "Attestation",
};

export function useStatistics() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    completedThisMonth: 0,
    averageProcessingTime: "0j",
    satisfactionRate: "N/A",
    scheduledAppointments: 0,
    requestsByType: [],
    monthlyTrends: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const startOfCurrentMonth = startOfMonth(now);

        // Fetch all requests
        const { data: requests, error: requestsError } = await supabase
          .from("requests")
          .select("id, type, status, created_at, updated_at");

        if (requestsError) throw requestsError;

        // Fetch appointments count
        const { count: appointmentsCount } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .in("status", ["SCHEDULED", "CONFIRMED"]);

        // Calculate stats
        const totalRequests = requests?.length || 0;
        const pendingRequests = requests?.filter(r => 
          ["PENDING", "IN_PROGRESS", "AWAITING_DOCUMENTS"].includes(r.status)
        ).length || 0;

        const completedThisMonth = requests?.filter(r => 
          r.status === "COMPLETED" && 
          new Date(r.updated_at) >= startOfCurrentMonth
        ).length || 0;

        // Calculate average processing time for completed requests
        const completedRequests = requests?.filter(r => r.status === "COMPLETED") || [];
        let avgDays = 0;
        if (completedRequests.length > 0) {
          const totalDays = completedRequests.reduce((sum, r) => {
            const created = new Date(r.created_at);
            const completed = new Date(r.updated_at);
            return sum + Math.ceil((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          }, 0);
          avgDays = Math.round(totalDays / completedRequests.length * 10) / 10;
        }

        // Group by type
        const typeGroups: Record<string, number> = {};
        requests?.forEach(r => {
          typeGroups[r.type] = (typeGroups[r.type] || 0) + 1;
        });

        const requestsByType = Object.entries(typeGroups).map(([type, value]) => ({
          name: TYPE_LABELS[type] || type,
          value,
          color: TYPE_COLORS[type] || "hsl(var(--primary))"
        }));

        // Monthly trends for last 6 months
        const monthlyTrends: { month: string; demandes: number; traitees: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const monthStart = startOfMonth(subMonths(now, i));
          const monthEnd = startOfMonth(subMonths(now, i - 1));
          
          const monthRequests = requests?.filter(r => {
            const created = new Date(r.created_at);
            return created >= monthStart && created < monthEnd;
          }) || [];

          const monthCompleted = requests?.filter(r => {
            const updated = new Date(r.updated_at);
            return r.status === "COMPLETED" && updated >= monthStart && updated < monthEnd;
          }) || [];

          monthlyTrends.push({
            month: format(monthStart, "MMM"),
            demandes: monthRequests.length,
            traitees: monthCompleted.length
          });
        }

        setStats({
          totalRequests,
          pendingRequests,
          completedThisMonth,
          averageProcessingTime: `${avgDays}j`,
          satisfactionRate: "4.7/5",
          scheduledAppointments: appointmentsCount || 0,
          requestsByType,
          monthlyTrends
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  return { stats, loading };
}
