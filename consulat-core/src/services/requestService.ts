/**
 * Request Service for Consulat.ga-core
 * Enhanced service with workflow, notes, assignments, and tracking
 * Migrated from consulat (Next.js/Convex)
 */

import { supabase } from "@/integrations/supabase/client";
import {
    ServiceRequest,
    RequestFilters,
    CreateServiceRequestDTO,
    UpdateServiceRequestDTO,
    RequestNote,
    RequestActivity,
} from "@/types/request";
import { RequestStatus, RequestPriority, ActivityType, NoteType } from "@/lib/constants";

export const requestService = {
    // ============================================================================
    // READ OPERATIONS
    // ============================================================================

    async getAll(filters?: RequestFilters): Promise<ServiceRequest[]> {
        let query = supabase
            .from("service_requests")
            .select(`
        *,
        service:consular_services(name, category),
        profile:profiles(first_name, last_name, email),
        organization:organizations(name)
      `)
            .order("created_at", { ascending: false });

        if (filters?.status) {
            if (Array.isArray(filters.status)) {
                query = query.in("status", filters.status);
            } else {
                query = query.eq("status", filters.status);
            }
        }
        if (filters?.priority) {
            query = query.eq("priority", filters.priority);
        }
        if (filters?.service_id) {
            query = query.eq("service_id", filters.service_id);
        }
        if (filters?.organization_id) {
            query = query.eq("organization_id", filters.organization_id);
        }
        if (filters?.profile_id) {
            query = query.eq("profile_id", filters.profile_id);
        }
        if (filters?.assigned_agent_id) {
            query = query.eq("assigned_agent_id", filters.assigned_agent_id);
        }
        if (filters?.country_code) {
            query = query.eq("country_code", filters.country_code);
        }
        if (filters?.from_date) {
            query = query.gte("created_at", filters.from_date);
        }
        if (filters?.to_date) {
            query = query.lte("created_at", filters.to_date);
        }
        if (filters?.limit) {
            query = query.limit(filters.limit);
        }
        if (filters?.offset) {
            query = query.range(filters.offset, filters.offset + (filters?.limit || 10) - 1);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as unknown as ServiceRequest[];
    },

    async getById(id: string): Promise<ServiceRequest | null> {
        const { data, error } = await supabase
            .from("service_requests")
            .select(`
        *,
        service:consular_services(name, category),
        profile:profiles(first_name, last_name, email, phone),
        organization:organizations(name)
      `)
            .eq("id", id)
            .single();

        if (error) throw error;
        return data as unknown as ServiceRequest;
    },

    async getByNumber(number: string): Promise<ServiceRequest | null> {
        const { data, error } = await supabase
            .from("service_requests")
            .select(`
        *,
        service:consular_services(name, category),
        profile:profiles(first_name, last_name, email)
      `)
            .eq("number", number)
            .single();

        if (error && error.code !== "PGRST116") throw error;
        return data as unknown as ServiceRequest | null;
    },

    async getByProfileId(profileId: string): Promise<ServiceRequest[]> {
        const { data, error } = await supabase
            .from("service_requests")
            .select(`
        *,
        service:consular_services(name, category)
      `)
            .eq("profile_id", profileId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data as unknown as ServiceRequest[];
    },

    async getRecent(profileId: string, limit: number = 5): Promise<ServiceRequest[]> {
        const { data, error } = await supabase
            .from("service_requests")
            .select(`
        *,
        service:consular_services(name, category)
      `)
            .eq("profile_id", profileId)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data as unknown as ServiceRequest[];
    },

    // ============================================================================
    // CREATE OPERATIONS
    // ============================================================================

    async create(request: CreateServiceRequestDTO): Promise<ServiceRequest> {
        const initialActivity: RequestActivity = {
            type: ActivityType.RequestCreated,
            actorId: "system",
            timestamp: Date.now(),
        };

        const { data, error } = await supabase
            .from("service_requests")
            .insert({
                service_id: request.service_id,
                organization_id: request.organization_id,
                profile_id: request.profile_id,
                requester_id: request.requester_id || request.profile_id,
                priority: request.priority || RequestPriority.Normal,
                data: request.data || {},
                document_ids: request.document_ids || [],
                config: request.config,
                status: RequestStatus.Draft,
                notes: [],
                metadata: {
                    activities: [initialActivity],
                },
            })
            .select()
            .single();

        if (error) throw error;
        return data as ServiceRequest;
    },

    // ============================================================================
    // UPDATE OPERATIONS
    // ============================================================================

    async update(id: string, updates: UpdateServiceRequestDTO): Promise<ServiceRequest> {
        const { data, error } = await supabase
            .from("service_requests")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as ServiceRequest;
    },

    async updateStatus(id: string, status: RequestStatus | string): Promise<ServiceRequest> {
        const updateData: Record<string, any> = { status };

        // Set timestamps based on status
        if (status === RequestStatus.Submitted) {
            updateData.submitted_at = new Date().toISOString();
        } else if (status === RequestStatus.Completed) {
            updateData.completed_at = new Date().toISOString();
        }

        // Add activity
        const { data: current, error: fetchError } = await supabase
            .from("service_requests")
            .select("metadata")
            .eq("id", id)
            .single();

        if (fetchError) throw fetchError;

        const metadata = (current?.metadata as any) || { activities: [] };
        metadata.activities.push({
            type: ActivityType.StatusChanged,
            actorId: "system",
            data: { newStatus: status },
            timestamp: Date.now(),
        });
        updateData.metadata = metadata;

        const { data, error } = await supabase
            .from("service_requests")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as ServiceRequest;
    },

    async updateData(id: string, requestData: Record<string, any>): Promise<ServiceRequest> {
        const { data, error } = await supabase
            .from("service_requests")
            .update({ data: requestData })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as ServiceRequest;
    },

    // ============================================================================
    // WORKFLOW OPERATIONS
    // ============================================================================

    async submit(id: string): Promise<ServiceRequest> {
        return this.updateStatus(id, RequestStatus.Submitted);
    },

    async assign(id: string, agentId: string, assignedById?: string): Promise<ServiceRequest> {
        const { data: current, error: fetchError } = await supabase
            .from("service_requests")
            .select("metadata")
            .eq("id", id)
            .single();

        if (fetchError) throw fetchError;

        const metadata = (current?.metadata as any) || { activities: [] };
        metadata.activities.push({
            type: ActivityType.RequestAssigned,
            actorId: assignedById || "system",
            data: { agentId },
            timestamp: Date.now(),
        });

        const { data, error } = await supabase
            .from("service_requests")
            .update({
                assigned_agent_id: agentId,
                assigned_at: new Date().toISOString(),
                status: RequestStatus.UnderReview,
                metadata,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as ServiceRequest;
    },

    async complete(id: string): Promise<ServiceRequest> {
        return this.updateStatus(id, RequestStatus.Completed);
    },

    async reject(id: string, reason?: string): Promise<ServiceRequest> {
        const { data: current, error: fetchError } = await supabase
            .from("service_requests")
            .select("metadata, notes")
            .eq("id", id)
            .single();

        if (fetchError) throw fetchError;

        const metadata = (current?.metadata as any) || { activities: [] };
        metadata.activities.push({
            type: ActivityType.StatusChanged,
            actorId: "system",
            data: { newStatus: RequestStatus.Rejected, reason },
            timestamp: Date.now(),
        });

        // Add rejection note if reason provided
        const notes = (current?.notes as RequestNote[]) || [];
        if (reason) {
            notes.push({
                type: NoteType.Internal,
                content: `Demande rejetée: ${reason}`,
                createdAt: Date.now(),
            });
        }

        const { data, error } = await supabase
            .from("service_requests")
            .update({
                status: RequestStatus.Rejected,
                metadata,
                notes,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as ServiceRequest;
    },

    // ============================================================================
    // NOTES
    // ============================================================================

    async addNote(id: string, note: Omit<RequestNote, "createdAt">, authorId?: string): Promise<ServiceRequest> {
        const { data: current, error: fetchError } = await supabase
            .from("service_requests")
            .select("notes, metadata")
            .eq("id", id)
            .single();

        if (fetchError) throw fetchError;

        const notes = (current?.notes as RequestNote[]) || [];
        notes.push({
            ...note,
            authorId,
            createdAt: Date.now(),
        });

        const metadata = (current?.metadata as any) || { activities: [] };
        metadata.activities.push({
            type: ActivityType.CommentAdded,
            actorId: authorId || "system",
            timestamp: Date.now(),
        });

        const { data, error } = await supabase
            .from("service_requests")
            .update({ notes, metadata })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as ServiceRequest;
    },

    // ============================================================================
    // DOCUMENTS
    // ============================================================================

    async addDocument(id: string, documentId: string, addedById?: string): Promise<ServiceRequest> {
        const { data: current, error: fetchError } = await supabase
            .from("service_requests")
            .select("document_ids, metadata")
            .eq("id", id)
            .single();

        if (fetchError) throw fetchError;

        const documentIds = (current?.document_ids as string[]) || [];
        if (!documentIds.includes(documentId)) {
            documentIds.push(documentId);
        }

        const metadata = (current?.metadata as any) || { activities: [] };
        metadata.activities.push({
            type: ActivityType.DocumentUploaded,
            actorId: addedById || "system",
            data: { documentId },
            timestamp: Date.now(),
        });

        const { data, error } = await supabase
            .from("service_requests")
            .update({ document_ids: documentIds, metadata })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as ServiceRequest;
    },

    async removeDocument(id: string, documentId: string): Promise<ServiceRequest> {
        const { data: current, error: fetchError } = await supabase
            .from("service_requests")
            .select("document_ids, metadata")
            .eq("id", id)
            .single();

        if (fetchError) throw fetchError;

        const documentIds = (current?.document_ids as string[]) || [];
        const updatedDocumentIds = documentIds.filter((d) => d !== documentId);

        const metadata = (current?.metadata as any) || { activities: [] };
        metadata.activities.push({
            type: ActivityType.DocumentDeleted,
            actorId: "system",
            data: { documentId },
            timestamp: Date.now(),
        });

        const { data, error } = await supabase
            .from("service_requests")
            .update({ document_ids: updatedDocumentIds, metadata })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as ServiceRequest;
    },

    // ============================================================================
    // STATISTICS
    // ============================================================================

    async getStatusCounts(organizationId?: string): Promise<Record<string, number>> {
        let query = supabase.from("service_requests").select("status");

        if (organizationId) {
            query = query.eq("organization_id", organizationId);
        }

        const { data, error } = await query;
        if (error) throw error;

        const counts: Record<string, number> = {};
        (data || []).forEach((item: any) => {
            counts[item.status] = (counts[item.status] || 0) + 1;
        });

        return counts;
    },
};
