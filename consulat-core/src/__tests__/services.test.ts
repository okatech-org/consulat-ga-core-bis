/**
 * Unit Tests for Consular Services
 * Tests for profileService, requestService, and appointmentService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

// Import services after mocking
import { profileService } from '@/services/profileService';
import { requestService } from '@/services/requestService';
import { appointmentService } from '@/services/appointmentService';
import { ProfileStatus, RequestStatus, AppointmentStatus } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';

describe('ProfileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all profiles without filters', async () => {
      const mockProfiles = [
        { id: '1', first_name: 'Jean', last_name: 'Dupont', status: ProfileStatus.Active },
        { id: '2', first_name: 'Marie', last_name: 'Martin', status: ProfileStatus.Pending },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockProfiles, error: null });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any);

      const result = await profileService.getAll();
      
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(result).toEqual(mockProfiles);
    });

    it('should apply status filter when provided', async () => {
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: mockEq,
        order: mockOrder,
      } as any);

      await profileService.getAll({ status: ProfileStatus.Active });
      
      expect(mockEq).toHaveBeenCalledWith('status', ProfileStatus.Active);
    });
  });

  describe('getById', () => {
    it('should fetch a single profile by ID', async () => {
      const mockProfile = { id: '123', first_name: 'Jean', last_name: 'Dupont' };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
      } as any);

      const result = await profileService.getById('123');
      
      expect(result).toEqual(mockProfile);
    });

    it('should throw error when profile not found', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      } as any);

      await expect(profileService.getById('invalid')).rejects.toThrow();
    });
  });

  describe('validateProfile', () => {
    it('should return valid for complete profile', () => {
      const completeProfile = {
        id: '1',
        user_id: 'user-1',
        status: ProfileStatus.Active,
        personal: {
          firstName: 'Jean',
          lastName: 'Dupont',
          birthDate: 1234567890,
          birthPlace: 'Libreville',
        },
        documents: {
          passport: { id: 'doc-1', fileUrl: 'https://...' },
          identityPicture: { id: 'doc-2', fileUrl: 'https://...' },
        },
        contacts: {
          email: 'jean@example.com',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = profileService.validateProfile(completeProfile as any);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for incomplete profile', () => {
      const incompleteProfile = {
        id: '1',
        user_id: 'user-1',
        status: ProfileStatus.Draft,
        personal: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = profileService.validateProfile(incompleteProfile as any);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('RequestService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all requests', async () => {
      const mockRequests = [
        { id: '1', status: RequestStatus.Pending, service_id: 'svc-1' },
        { id: '2', status: RequestStatus.Completed, service_id: 'svc-2' },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockRequests, error: null }),
      } as any);

      const result = await requestService.getAll();
      
      expect(supabase.from).toHaveBeenCalledWith('requests');
      expect(result).toEqual(mockRequests);
    });
  });

  describe('getById', () => {
    it('should fetch a single request by ID', async () => {
      const mockRequest = { 
        id: '123', 
        status: RequestStatus.Pending,
        service_id: 'svc-1',
        profile_id: 'prof-1',
      };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockRequest, error: null }),
      } as any);

      const result = await requestService.getById('123');
      
      expect(result).toEqual(mockRequest);
    });
  });

  describe('updateStatus', () => {
    it('should update request status', async () => {
      const updatedRequest = { 
        id: '123', 
        status: RequestStatus.Validated,
      };
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedRequest, error: null }),
      } as any);

      const result = await requestService.updateStatus('123', RequestStatus.Validated);
      
      expect(result.status).toBe(RequestStatus.Validated);
    });
  });
});

describe('AppointmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all appointments', async () => {
      const mockAppointments = [
        { id: '1', status: AppointmentStatus.Scheduled, start_time: '2024-01-15T10:00:00Z' },
        { id: '2', status: AppointmentStatus.Completed, start_time: '2024-01-14T14:00:00Z' },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockAppointments, error: null }),
      } as any);

      const result = await appointmentService.getAll();
      
      expect(supabase.from).toHaveBeenCalledWith('appointments');
      expect(result).toEqual(mockAppointments);
    });
  });

  describe('getById', () => {
    it('should fetch a single appointment by ID', async () => {
      const mockAppointment = { 
        id: '123', 
        status: AppointmentStatus.Confirmed,
        start_time: '2024-01-20T09:00:00Z',
        end_time: '2024-01-20T10:00:00Z',
      };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockAppointment, error: null }),
      } as any);

      const result = await appointmentService.getById('123');
      
      expect(result).toEqual(mockAppointment);
    });
  });

  describe('updateStatus', () => {
    it('should confirm an appointment', async () => {
      const confirmedAppointment = { 
        id: '123', 
        status: AppointmentStatus.Confirmed,
      };
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: confirmedAppointment, error: null }),
      } as any);

      const result = await appointmentService.confirm('123');
      
      expect(result.status).toBe(AppointmentStatus.Confirmed);
    });

    it('should cancel an appointment', async () => {
      const cancelledAppointment = { 
        id: '123', 
        status: AppointmentStatus.Cancelled,
      };
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: cancelledAppointment, error: null }),
      } as any);

      const result = await appointmentService.cancel('123');
      
      expect(result.status).toBe(AppointmentStatus.Cancelled);
    });
  });

  describe('getUpcoming', () => {
    it('should fetch upcoming appointments', async () => {
      const mockAppointments = [
        { id: '1', status: AppointmentStatus.Scheduled, start_time: '2024-02-15T10:00:00Z' },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockAppointments, error: null }),
      } as any);

      const result = await appointmentService.getUpcoming();
      
      expect(result).toEqual(mockAppointments);
    });
  });
});

// Integration-like tests for service interactions
describe('Service Integration', () => {
  it('should handle profile creation flow', async () => {
    const newProfile = {
      user_id: 'user-123',
      personal: {
        firstName: 'Jean',
        lastName: 'Dupont',
      },
      residence_country: 'FR',
    };

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: { id: 'new-profile-id', ...newProfile, status: ProfileStatus.Draft },
        error: null 
      }),
    } as any);

    const result = await profileService.create(newProfile);
    
    expect(result.id).toBe('new-profile-id');
    expect(result.status).toBe(ProfileStatus.Draft);
  });
});
