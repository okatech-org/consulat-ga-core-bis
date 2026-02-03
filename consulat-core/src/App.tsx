import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DashboardLayout from './layouts/DashboardLayout';
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { DemoProvider } from "@/contexts/DemoContext";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeStyleProvider } from "@/context/ThemeStyleContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import GlobalHub from "./pages/GlobalHub";
import Home from "./pages/Home";
import LandingPage from "./pages/public/LandingPage";
import Information from "./pages/public/Information";
import Tutorials from "./pages/public/Tutorials";
import Community from "./pages/public/Community";
import ServicesConsulaires from "./pages/public/ServicesConsulaires";
import PassportServicePage from "./pages/services/PassportServicePage";
import VisaServicePage from "./pages/services/VisaServicePage";
import ConsularCardServicePage from "./pages/services/ConsularCardServicePage";
import LegalizationServicePage from "./pages/services/LegalizationServicePage";
import Actualites from "./pages/Actualites";
import Login from "./pages/Login";
import DemoPortal from "./pages/DemoPortal";
import WorldNetworkPage from "./pages/WorldNetworkPage";
import EntityPortal from "./pages/EntityPortal";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import RegistrationChoice from "./pages/auth/RegistrationChoice";
import RegisterGabonais from "./pages/auth/RegisterGabonais";
import RegisterForeigner from "./pages/auth/RegisterForeigner";
import CitizenDashboard from "./pages/dashboard/CitizenDashboard";
import CitizenServicesPage from "./pages/dashboard/CitizenServicesPage";
import ForeignerDashboard from "./pages/dashboard/ForeignerDashboard";
import ResidentDashboard from "./pages/dashboard/ResidentDashboard";
import PassageDashboard from "./pages/dashboard/PassageDashboard";
import VisitorDashboard from "./pages/dashboard/VisitorDashboard";
import ChildRegistrationPage from "./pages/registration/ChildRegistrationPage";
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard";
import SuperAdminOrganizations from "./pages/dashboard/super-admin/SuperAdminOrganizations";
import OrganizationDetails from "./pages/dashboard/super-admin/OrganizationDetails";
import SuperAdminUsers from "./pages/dashboard/super-admin/SuperAdminUsers";
import SuperAdminServices from "./pages/dashboard/super-admin/SuperAdminServices";
import SuperAdminSettings from "./pages/dashboard/super-admin/SuperAdminSettings";
import AgentDashboard from "./pages/dashboard/AgentDashboard";
import AgentAppointmentsPage from "./pages/dashboard/agent/AgentAppointmentsPage";
import AgentRequestsPage from "./pages/dashboard/agent/AgentRequestsPage";
import AgentsPage from "./pages/dashboard/admin/AgentsPage";
import OrganizationSettingsPage from "./pages/dashboard/admin/OrganizationSettingsPage";
import AdminRequestsPage from "./pages/dashboard/admin/AdminRequestsPage";
import BookAppointmentPage from "./pages/appointments/BookAppointmentPage";
import { OrganizationsAdminPage } from "./pages/admin/OrganizationsAdminPage";
import { OrganizationSettingsPage as AdminOrgSettingsPage } from "./pages/admin/OrganizationSettingsPage";

import CompaniesPage from "./pages/companies/CompaniesPage";
import NewCompanyPage from "./pages/companies/NewCompanyPage";
import CompanyDetailsPage from "./pages/companies/CompanyDetailsPage";
import AssociationsPage from "./pages/associations/AssociationsPage";
import NewAssociationPage from "./pages/associations/NewAssociationPage";
import AssociationDetailsPage from "./pages/associations/AssociationDetailsPage";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import ThemedDashboardLayout from "./components/layout/ThemedDashboardLayout";

import CitizenAssociationsPage from './pages/dashboard/citizen/CitizenAssociationsPage';
import CitizenCompaniesPage from './pages/dashboard/citizen/CitizenCompaniesPage';
import CitizenCVPage from './pages/dashboard/citizen/CitizenCVPage';
import CitizenDocumentsPage from './pages/dashboard/citizen/CitizenDocumentsPage';
import CitizenRequestsPage from './pages/dashboard/citizen/CitizenRequestsPage';
import CitizenSettingsPage from './pages/dashboard/citizen/CitizenSettingsPage';
import SettingsPage from './pages/SettingsPage';
import MessagingPage from "./pages/MessagingPage";
import IAstedInterfaceWrapper from "@/components/iasted/IAstedInterfaceWrapper";
import ConsularRegistrationPage from "./pages/registration/ConsularRegistrationPage";
import RequestTimelinePage from "./pages/requests/RequestTimelinePage";
import RequestTrackingPage from "./pages/requests/RequestTrackingPage";
import CitizenNotificationsPage from "./pages/dashboard/citizen/CitizenNotificationsPage";
import CitizenChildrenPage from "./pages/dashboard/citizen/CitizenChildrenPage";
import CitizenTimelinePage from "./pages/dashboard/citizen/CitizenTimelinePage";

// Advanced iDocument and iBoîte pages from idn.ga
import IDocumentPage from "./pages/documents/IDocumentPage";
import IBoitePage from "./pages/iboite/IBoitePage";
import ICVPage from "./pages/cv/iCVPage";
import ICartePage from "./pages/icarte/ICartePage";

// New layouts and auth
import CitizenLayout from "./layouts/CitizenLayout";
import DiplomaticLayout from "./layouts/DiplomaticLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { CitizenGuard, DiplomaticGuard, AdminGuard } from "./components/auth/RouteGuards";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ThemeStyleProvider>
        <LanguageProvider>
          <TooltipProvider>
            <DemoProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AuthProvider>
                  <Routes>
                    {/* PUBLIC PORTAL (Citizens) */}
                    <Route element={<PublicLayout />}>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/old-home" element={<Home />} />

                      {/* HUB ROUTES */}
                      <Route path="/hub/information" element={<Information />} />
                      <Route path="/hub/tutorials" element={<Tutorials />} />
                      <Route path="/hub/community" element={<Community />} />
                      <Route path="/hub/etudiant" element={<Information />} />
                      <Route path="/hub/resident" element={<Information />} />
                      <Route path="/hub/visiteur" element={<Information />} />
                      <Route path="/services" element={<ServicesConsulaires />} />
                      <Route path="/services/passeport" element={<PassportServicePage />} />
                      <Route path="/services/visa" element={<VisaServicePage />} />
                      <Route path="/services/carte-consulaire" element={<ConsularCardServicePage />} />
                      <Route path="/services/legalisation" element={<LegalizationServicePage />} />
                      <Route path="/actualites" element={<Actualites />} />
                      <Route path="/login" element={<Login />} />

                      {/* REGISTRATION FLOW */}
                      <Route path="/register" element={<RegistrationChoice />} />
                      <Route path="/register/gabonais" element={<RegisterGabonais />} />
                      <Route path="/register/etranger" element={<RegisterForeigner />} />

                      <Route path="/portal/:entityId" element={<EntityPortal />} />

                      {/* COMPANIES & ASSOCIATIONS */}
                      <Route path="/companies" element={<CompaniesPage />} />
                      <Route path="/companies/new" element={<NewCompanyPage />} />
                      <Route path="/companies/:id" element={<CompanyDetailsPage />} />

                      <Route path="/associations" element={<AssociationsPage />} />
                      <Route path="/associations/new" element={<NewAssociationPage />} />
                      <Route path="/associations/:id" element={<AssociationDetailsPage />} />
                    </Route>

                    <Route path="/messaging" element={<MessagingPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/mes-demandes" element={<RequestTrackingPage />} />
                    <Route path="/prendre-rendez-vous" element={<BookAppointmentPage />} />

                    {/* DASHBOARDS (Protected in real app) */}

                    {/* Citizen Dashboard Layout Route */}
                    <Route path="/dashboard/citizen" element={<ThemedDashboardLayout userType="citizen"><Outlet /></ThemedDashboardLayout>}>
                      <Route index element={<CitizenDashboard />} />
                      <Route path="services" element={<CitizenServicesPage />} />
                      <Route path="requests" element={<CitizenRequestsPage />} />
                      <Route path="associations" element={<CitizenAssociationsPage />} />
                      <Route path="companies" element={<CitizenCompaniesPage />} />
                      <Route path="cv" element={<ICVPage />} />
                      <Route path="documents" element={<IDocumentPage />} />
                      <Route path="settings" element={<CitizenSettingsPage />} />
                      <Route path="cartes" element={<ICartePage />} />
                      <Route path="child/:childId" element={<ChildRegistrationPage />} />
                      <Route path="registration" element={<ConsularRegistrationPage />} />
                      <Route path="timeline" element={<CitizenTimelinePage />} />
                      <Route path="notifications" element={<CitizenNotificationsPage />} />
                      <Route path="children" element={<CitizenChildrenPage />} />
                      <Route path="boite" element={<IBoitePage />} />
                    </Route>

                    {/* ============ ESPACE CITOYEN /me ============ */}
                    <Route path="/me" element={<CitizenLayout />}>
                      <Route index element={<CitizenDashboard />} />
                      <Route path="demarches" element={<CitizenServicesPage />} />
                      <Route path="timeline" element={<CitizenTimelinePage />} />
                      <Route path="documents" element={<IDocumentPage />} />
                      <Route path="boite" element={<IBoitePage />} />
                      <Route path="cv" element={<ICVPage />} />
                      <Route path="cartes" element={<ICartePage />} />
                      <Route path="enfants" element={<CitizenChildrenPage />} />
                      <Route path="entreprises" element={<CitizenCompaniesPage />} />
                      <Route path="associations" element={<CitizenAssociationsPage />} />
                      <Route path="parametres" element={<CitizenSettingsPage />} />
                      <Route path="notifications" element={<CitizenNotificationsPage />} />
                      <Route path="inscription" element={<ConsularRegistrationPage />} />
                      <Route path="enfant/:childId" element={<ChildRegistrationPage />} />
                    </Route>

                    {/* ============ ESPACES DIPLOMATIQUES ============ */}
                    <Route path="/ambassade/:entityId" element={<DiplomaticLayout />}>
                      <Route index element={<div className="p-6"><h1 className="text-2xl font-bold">Cockpit Ambassade</h1><p className="text-muted-foreground">Tableau de bord de l'ambassade</p></div>} />
                      <Route path="demandes" element={<AdminRequestsPage />} />
                      <Route path="equipe" element={<AgentsPage />} />
                      <Route path="boite" element={<MessagingPage />} />
                      <Route path="stats" element={<div className="p-6"><h1 className="text-2xl font-bold">Statistiques</h1></div>} />
                      <Route path="parametres" element={<OrganizationSettingsPage />} />
                    </Route>

                    <Route path="/consulat/:entityId" element={<DiplomaticLayout />}>
                      <Route index element={<div className="p-6"><h1 className="text-2xl font-bold">Cockpit Consulat</h1><p className="text-muted-foreground">Tableau de bord du consulat</p></div>} />
                      <Route path="demandes" element={<AdminRequestsPage />} />
                      <Route path="rendez-vous" element={<AgentAppointmentsPage />} />
                      <Route path="equipe" element={<AgentsPage />} />
                      <Route path="boite" element={<MessagingPage />} />
                      <Route path="stats" element={<div className="p-6"><h1 className="text-2xl font-bold">Statistiques</h1></div>} />
                      <Route path="parametres" element={<OrganizationSettingsPage />} />
                    </Route>

                    <Route path="/representation/:entityId" element={<DiplomaticLayout />}>
                      <Route index element={<div className="p-6"><h1 className="text-2xl font-bold">Cockpit Représentation</h1><p className="text-muted-foreground">Tableau de bord de la représentation</p></div>} />
                      <Route path="demandes" element={<AdminRequestsPage />} />
                      <Route path="equipe" element={<AgentsPage />} />
                      <Route path="boite" element={<MessagingPage />} />
                      <Route path="parametres" element={<OrganizationSettingsPage />} />
                    </Route>

                    <Route path="/dashboard/foreigner" element={<ForeignerDashboard />} />

                    {/* User Account Spaces (3 types) */}
                    <Route path="/dashboard/resident" element={<DashboardLayout><ResidentDashboard /></DashboardLayout>} />
                    <Route path="/dashboard/passage" element={<DashboardLayout><PassageDashboard /></DashboardLayout>} />
                    <Route path="/dashboard/visitor" element={<DashboardLayout><VisitorDashboard /></DashboardLayout>} />

                    <Route path="/dashboard/super-admin" element={<SuperAdminDashboard />} />
                    <Route path="/dashboard/super-admin/organizations" element={<SuperAdminOrganizations />} />
                    <Route path="/dashboard/super-admin/organizations/:entityId" element={<OrganizationDetails />} />
                    <Route path="/dashboard/super-admin/users" element={<SuperAdminUsers />} />
                    <Route path="/dashboard/super-admin/services" element={<SuperAdminServices />} />
                    <Route path="/dashboard/super-admin/settings" element={<SuperAdminSettings />} />
                    <Route path="/dashboard/agent" element={<AgentDashboard />} />
                    <Route path="/dashboard/agent/appointments" element={<AgentAppointmentsPage />} />
                    <Route path="/dashboard/agent/requests" element={<AgentRequestsPage />} />

                    {/* Consul General / Admin Routes */}
                    <Route path="/dashboard/admin/agents" element={<AgentsPage />} />
                    <Route path="/dashboard/admin/settings" element={<OrganizationSettingsPage />} />
                    <Route path="/dashboard/admin/requests" element={<AdminRequestsPage />} />

                    {/* ADMIN PORTAL (Back-Office) */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="organizations" element={<OrganizationsAdminPage />} />
                      <Route path="organizations/:id" element={<AdminOrgSettingsPage />} />
                    </Route>

                    {/* DEMO & UTILS */}
                    <Route path="/demo-portal" element={<DemoPortal />} />
                    <Route path="/reseau-mondial" element={<WorldNetworkPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AuthProvider>
                <IAstedInterfaceWrapper />
              </BrowserRouter>
            </DemoProvider>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeStyleProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
