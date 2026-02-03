import React, { useMemo, useState, useEffect } from 'react';
import { IAstedChatModal } from '@/components/iasted/IAstedChatModal';
import IAstedButtonFull from "@/components/iasted/IAstedButtonFull";
import { useRealtimeVoiceWebRTC } from '@/hooks/useRealtimeVoiceWebRTC';
import { IASTED_SYSTEM_PROMPT } from '@/config/iasted-config';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import { resolveRoute } from '@/utils/route-mapping';

interface IAstedInterfaceProps {
    userRole?: string;
    defaultOpen?: boolean;
    isOpen?: boolean; // Allow external control
    onClose?: () => void; // Allow external control
    onToolCall?: (toolName: string, args: any) => void;
}

/**
 * Complete IAsted Agent Interface.
 * Includes the floating button and the chat modal.
 * Manages its own connection and visibility state.
 */
export default function IAstedInterface({ userRole = 'user', defaultOpen = false, isOpen: controlledIsOpen, onClose: controlledOnClose, onToolCall }: IAstedInterfaceProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);

    // Use controlled state if provided, otherwise use internal state
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
    const setIsOpen = controlledOnClose ? (value: boolean) => {
        if (!value) controlledOnClose();
    } : setInternalIsOpen;

    const [selectedVoice, setSelectedVoice] = useState<'echo' | 'ash' | 'shimmer'>('ash');
    const [pendingDocument, setPendingDocument] = useState<any>(null);
    const { setTheme, theme } = useTheme();
    const navigate = useNavigate();

    // Initialize voice from localStorage
    useEffect(() => {
        const savedVoice = localStorage.getItem('iasted-voice-selection') as 'echo' | 'ash' | 'shimmer';
        if (savedVoice) setSelectedVoice(savedVoice);
    }, []);

    // Calculate time-based greeting
    const timeOfDay = useMemo(() => {
        const hour = new Date().getHours();
        return hour >= 5 && hour < 18 ? "Bonjour" : "Bonsoir";
    }, []);

    // Map user role to appropriate title (consulaire context)
    const userTitle = useMemo(() => {
        switch (userRole) {
            case 'super_admin':
                return 'Monsieur l\'Administrateur';
            case 'admin':
                return 'Monsieur le Consul';
            case 'agent':
                return 'Monsieur l\'Agent';
            case 'citizen':
                return 'Cher ressortissant';
            case 'foreigner':
                return 'Cher visiteur';
            case 'diplomat':
                return 'Excellence';
            default:
                return 'Monsieur';
        }
    }, [userRole]);

    // Format system prompt with context
    const formattedSystemPrompt = useMemo(() => {
        return IASTED_SYSTEM_PROMPT
            .replace(/{USER_TITLE}/g, userTitle)
            .replace(/{CURRENT_TIME_OF_DAY}/g, timeOfDay)
            .replace(/{APPELLATION_COURTE}/g, userTitle.split(' ').slice(-1)[0] || 'Monsieur');
    }, [timeOfDay, userTitle]);

    // Initialize OpenAI RTC with tool call handler
    const openaiRTC = useRealtimeVoiceWebRTC(async (toolName, args) => {
        console.log(`🔧 [IAstedInterface] Tool call: ${toolName}`, args);

        // 1. Internal Handlers
        if (toolName === 'change_voice') {
            console.log('🎙️ [IAstedInterface] Changement de voix demandé');

            // Si voice_id spécifique fourni, l'utiliser
            if (args.voice_id) {
                setSelectedVoice(args.voice_id as any);
                toast.success(`Voix modifiée : ${args.voice_id === 'ash' ? 'Homme (Ash)' : args.voice_id === 'shimmer' ? 'Femme (Shimmer)' : 'Standard (Echo)'}`);
            }
            // Sinon, alterner homme↔femme selon voix actuelle
            else {
                const currentVoice = selectedVoice;
                const isCurrentlyMale = currentVoice === 'ash' || currentVoice === 'echo';
                const newVoice = isCurrentlyMale ? 'shimmer' : 'ash';

                console.log(`🎙️ [IAstedInterface] Alternance voix: ${currentVoice} (${isCurrentlyMale ? 'homme' : 'femme'}) -> ${newVoice} (${isCurrentlyMale ? 'femme' : 'homme'})`);
                setSelectedVoice(newVoice);
                toast.success(`Voix changée : ${newVoice === 'shimmer' ? 'Femme (Shimmer)' : 'Homme (Ash)'}`);
            }

            return { success: true, message: `Voix modifiée` };
        }

        if (toolName === 'logout_user') {
            console.log('👋 [IAstedInterface] Déconnexion demandée par l\'utilisateur');
            toast.info("Déconnexion en cours...");
            setTimeout(async () => {
                await supabase.auth.signOut();
                window.location.href = '/';
            }, 1500);
        }

        if (toolName === 'open_chat') {
            setIsOpen(true);
        }

        if (toolName === 'close_chat') {
            setIsOpen(false);
        }

        if (toolName === 'generate_document') {
            console.log('📝 [IAstedInterface] Génération document:', args);
            setPendingDocument({
                type: args.type,
                recipient: args.recipient,
                subject: args.subject,
                contentPoints: args.content_points || [],
                format: args.format || 'pdf'
            });
            setIsOpen(true);
            toast.success(`Génération de ${args.type} pour ${args.recipient}...`);
        }

        if (toolName === 'control_ui') {
            console.log('🎨 [IAstedInterface] Contrôle UI:', args);
            console.log('🎨 [IAstedInterface] Thème actuel:', theme);

            if (args.action === 'set_theme_dark') {
                console.log('🎨 [IAstedInterface] Activation du mode sombre...');
                setTheme('dark');
                setTimeout(() => {
                    toast.success("Mode sombre activé");
                    console.log('✅ [IAstedInterface] Thème changé vers dark');
                }, 100);
                return { success: true, message: 'Mode sombre activé' };
            } else if (args.action === 'set_theme_light') {
                console.log('🎨 [IAstedInterface] Activation du mode clair...');
                setTheme('light');
                setTimeout(() => {
                    toast.success("Mode clair activé");
                    console.log('✅ [IAstedInterface] Thème changé vers light');
                }, 100);
                return { success: true, message: 'Mode clair activé' };
            } else if (args.action === 'toggle_theme') {
                const newTheme = theme === 'dark' ? 'light' : 'dark';
                console.log(`🎨 [IAstedInterface] Basculement: ${theme} -> ${newTheme}`);
                setTheme(newTheme);
                setTimeout(() => {
                    toast.success(`Thème basculé vers ${newTheme === 'dark' ? 'sombre' : 'clair'}`);
                    console.log(`✅ [IAstedInterface] Thème basculé vers ${newTheme}`);
                }, 100);
                return { success: true, message: `Thème basculé vers ${newTheme === 'dark' ? 'sombre' : 'clair'}` };
            }

            if (args.action === 'toggle_sidebar') {
                // Dispatch event for sidebar since it's often controlled by layout
                window.dispatchEvent(new CustomEvent('iasted-sidebar-toggle'));
                return { success: true, message: 'Sidebar basculée' };
            }

            if (args.action === 'set_speech_rate') {
                // Ajuster la vitesse de parole (0.5 à 2.0)
                const rate = parseFloat(args.value || '1.0');
                const clampedRate = Math.max(0.5, Math.min(2.0, rate));

                console.log(`🎚️ [IAstedInterface] Ajustement vitesse: ${rate} -> ${clampedRate}`);
                openaiRTC.setSpeechRate(clampedRate);

                const speedDescription = clampedRate < 0.8 ? 'ralenti'
                    : clampedRate > 1.2 ? 'accéléré'
                        : 'normal';

                setTimeout(() => {
                    toast.success(`Vitesse de parole ajustée (${speedDescription}: ${clampedRate}x)`);
                }, 100);

                return { success: true, message: `Vitesse ajustée à ${clampedRate}x` };
            }
        }

        if (toolName === 'navigate_within_space') {
            console.log('📍 [IAstedInterface] Navigation dans l\'espace présidentiel:', args);

            // Scroll vers le module dans la page actuelle (président uniquement)
            const moduleId = args.module_id;
            if (moduleId) {
                const element = document.getElementById(moduleId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    toast.success(`Module ${moduleId} affiché`);
                    console.log(`✅ [IAstedInterface] Scroll vers module: ${moduleId}`);
                } else {
                    console.error(`❌ [IAstedInterface] Module non trouvé: ${moduleId}`);
                    toast.error(`Module ${moduleId} introuvable`);
                }
            }
        }

        if (toolName === 'navigate_app') {
            console.log('🌍 [IAstedInterface] Navigation Globale (Admin):', args);

            // Navigation complète vers une autre route (admin uniquement)
            if (args.route) {
                navigate(args.route);
                toast.success(`Navigation vers ${args.route}`);
                console.log(`✅ [IAstedInterface] Navigation vers: ${args.route}`);

                // Si module_id est spécifié, scroll après navigation
                if (args.module_id) {
                    setTimeout(() => {
                        const element = document.getElementById(args.module_id);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 500);
                }
            }
        }

        if (toolName === 'global_navigate') {
            console.log('🌍 [IAstedInterface] Navigation Globale:', args);

            // Use intelligent route resolution
            const resolvedPath = resolveRoute(args.query);

            if (resolvedPath) {
                console.log(`✅ [IAstedInterface] Route resolved: "${args.query}" -> ${resolvedPath}`);
                navigate(resolvedPath);
                toast.success(`Navigation vers ${resolvedPath}`);

                // If chameleon mode is requested (target_role), we could store it or handle it
                if (args.target_role) {
                    console.log(`🦎 [IAstedInterface] Mode Caméléon: ${args.target_role}`);
                    localStorage.setItem('chameleon_role', args.target_role);
                }

                return { success: true, message: `Navigation vers ${resolvedPath} effectuée` };
            } else {
                console.error(`❌ [IAstedInterface] Route not found for: "${args.query}"`);
                toast.error(`Impossible de trouver la route pour "${args.query}"`);
                return { success: false, message: `Route "${args.query}" introuvable` };
            }
        }

        if (toolName === 'request_consular_service') {
            console.log('📋 [IAstedInterface] Demande de service consulaire:', args);
            const serviceNames: Record<string, string> = {
                passport: 'passeport',
                visa: 'visa',
                residence_certificate: 'attestation de résidence',
                nationality_certificate: 'certificat de nationalité',
                consular_card: 'carte consulaire',
                document_legalization: 'légalisation de documents',
                birth_certificate: 'acte de naissance',
                marriage_certificate: 'acte de mariage'
            };
            
            const serviceName = serviceNames[args.service_type] || args.service_type;
            const urgencyText = args.urgency === 'urgent' ? ' urgente' : '';
            
            toast.success(`Initiation de la demande de ${serviceName}${urgencyText}`);
            
            // Navigate to the appropriate service request page
            setTimeout(() => {
                navigate('/dashboard/citizen/requests', {
                    state: {
                        prefilledService: args.service_type,
                        urgency: args.urgency,
                        notes: args.notes
                    }
                });
            }, 1000);
            
            return { success: true, message: `Demande de ${serviceName} initiée` };
        }

        if (toolName === 'schedule_appointment') {
            console.log('📅 [IAstedInterface] Prise de rendez-vous:', args);
            toast.success('Ouverture du calendrier de rendez-vous');
            
            setTimeout(() => {
                navigate('/dashboard/citizen/requests', {
                    state: {
                        openAppointmentModal: true,
                        serviceType: args.service_type,
                        preferredDate: args.preferred_date,
                        notes: args.notes
                    }
                });
            }, 1000);
            
            return { success: true, message: 'Calendrier de rendez-vous ouvert' };
        }

        if (toolName === 'view_requests') {
            console.log('📋 [IAstedInterface] Consultation des demandes:', args);
            const filterText = args.filter === 'pending' ? 'en attente' :
                              args.filter === 'in_progress' ? 'en cours' :
                              args.filter === 'completed' ? 'terminées' : '';
            
            toast.success(`Affichage des demandes ${filterText || 'toutes'}`);
            
            navigate('/dashboard/citizen/requests', {
                state: { filter: args.filter }
            });
            
            return { success: true, message: 'Navigation vers vos demandes' };
        }

        if (toolName === 'get_service_info') {
            console.log('ℹ️ [IAstedInterface] Informations sur le service:', args);
            
            // This would typically fetch from a service catalog
            // For now, we'll just acknowledge and could open a modal with info
            toast.info(`Recherche d'informations sur le service ${args.service_type}...`);
            
            // Could navigate to a service info page or open a modal
            setTimeout(() => {
                // You could implement a service info modal here
                console.log('Service info for:', args.service_type);
            }, 500);
            
            return { success: true, message: `Informations sur ${args.service_type}` };
        }

        if (toolName === 'security_override') {
            console.log('🔓 [IAstedInterface] Override Sécurité:', args);
            if (args.action === 'unlock_admin_access') {
                localStorage.setItem('security_override', 'true');
                toast.warning("🔓 SÉCURITÉ DÉSACTIVÉE - ACCÈS ADMIN AUTORISÉ");
                window.dispatchEvent(new CustomEvent('security-override-activated'));
            }
        }

        // 2. External Handler (for navigation, specific actions)
        if (onToolCall) {
            onToolCall(toolName, args);
        }
    });

    const handleButtonClick = async () => {
        if (openaiRTC.isConnected) {
            openaiRTC.disconnect();
        } else {
            await openaiRTC.connect(selectedVoice, formattedSystemPrompt);
        }
    };

    return (
        <>
            <IAstedButtonFull
                voiceListening={openaiRTC.voiceState === 'listening'}
                voiceSpeaking={openaiRTC.voiceState === 'speaking'}
                voiceProcessing={openaiRTC.voiceState === 'connecting' || openaiRTC.voiceState === 'thinking'}
                audioLevel={openaiRTC.audioLevel}
                onClick={handleButtonClick}
                onDoubleClick={() => setIsOpen(true)}
            />

            <IAstedChatModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                openaiRTC={openaiRTC}
                currentVoice={selectedVoice}
                systemPrompt={formattedSystemPrompt}
                pendingDocument={pendingDocument}
                onClearPendingDocument={() => setPendingDocument(null)}
            />
        </>
    );
}
