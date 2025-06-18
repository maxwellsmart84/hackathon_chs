import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// Types for the formatted API responses
export interface NIHProject {
  id: string;
  projectNumber: string;
  title: string;
  abstract: string;
  principalInvestigators: string;
  organization: {
    name: string;
    city: string;
    state: string;
    country: string;
  };
  funding: {
    amount: number;
    formattedAmount: string;
    fiscalYear: number;
    startDate: string;
    endDate: string;
    formattedStartDate: string;
    formattedEndDate: string;
  };
  focusAreas: string[];
  isMedTech: boolean;
  isActive: boolean;
  detailUrl: string;
  agency: {
    code: string;
    name: string;
  };
  activityCode: string;
}

export interface NIHPublication {
  coreProjectNumber: string;
  pmid: number;
  applicationId: number;
  pubmedUrl: string;
  reporterUrl: string;
}

export interface ProjectSearchResult {
  projects: NIHProject[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
  searchInfo: {
    searchId?: string;
    type?: string;
    query?: string | null;
  };
}

export interface PublicationSearchResult {
  publications: NIHPublication[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
  searchInfo: {
    criteria?: Record<string, unknown>;
  };
}

export type ProjectSearchType =
  | 'pi'
  | 'organization'
  | 'focus'
  | 'text'
  | 'recent'
  | 'award'
  | 'state'
  | 'city'
  | 'region'
  | 'location'
  | 'nearby';
export type TextSearchField = 'projecttitle' | 'abstract' | 'terms';

interface ProjectSearchParams {
  query?: string;
  type: ProjectSearchType;
  field?: TextSearchField;
  limit?: number;
  offset?: number;
  minAmount?: number;
  maxAmount?: number;
  // Geographic parameters
  states?: string; // Comma-separated
  cities?: string; // Comma-separated
  region?: 'Southeast' | 'Northeast' | 'West Coast' | 'Midwest' | 'Southwest' | 'Mountain West';
  focusArea?: string;
  includeAdjacent?: boolean;
}

interface PublicationSearchParams {
  projectNumber?: string;
  pmids?: string;
  applIds?: string;
  limit?: number;
  offset?: number;
}

export function useNIHResearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectSearchResult | null>(null);
  const [publications, setPublications] = useState<PublicationSearchResult | null>(null);

  // Use refs to track the latest request to prevent race conditions
  const latestProjectRequest = useRef<string | null>(null);
  const latestPublicationRequest = useRef<string | null>(null);

  const searchProjects = useCallback(async (params: ProjectSearchParams) => {
    const requestId = Math.random().toString(36);
    latestProjectRequest.current = requestId;

    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params.query) queryParams.append('query', params.query);
      queryParams.append('type', params.type);
      if (params.field) queryParams.append('field', params.field);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      if (params.minAmount !== undefined)
        queryParams.append('minAmount', params.minAmount.toString());
      if (params.maxAmount !== undefined)
        queryParams.append('maxAmount', params.maxAmount.toString());
      // Geographic parameters
      if (params.states) queryParams.append('states', params.states);
      if (params.cities) queryParams.append('cities', params.cities);
      if (params.region) queryParams.append('region', params.region);
      if (params.focusArea) queryParams.append('focusArea', params.focusArea);
      if (params.includeAdjacent !== undefined)
        queryParams.append('includeAdjacent', params.includeAdjacent.toString());

      const response = await fetch(`/api/research/projects?${queryParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      // Check if this is still the latest request
      if (latestProjectRequest.current === requestId) {
        if (result.success) {
          setProjects(result.data);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      }
    } catch (err) {
      // Only update error state if this is still the latest request
      if (latestProjectRequest.current === requestId) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to search projects';
        setError(errorMessage);
        toast.error(`Search failed: ${errorMessage}`);
      }
    } finally {
      // Only update loading state if this is still the latest request
      if (latestProjectRequest.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  const searchPublications = useCallback(async (params: PublicationSearchParams) => {
    const requestId = Math.random().toString(36);
    latestPublicationRequest.current = requestId;

    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params.projectNumber) queryParams.append('projectNumber', params.projectNumber);
      if (params.pmids) queryParams.append('pmids', params.pmids);
      if (params.applIds) queryParams.append('applIds', params.applIds);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());

      const response = await fetch(`/api/research/publications?${queryParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      // Check if this is still the latest request
      if (latestPublicationRequest.current === requestId) {
        if (result.success) {
          setPublications(result.data);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      }
    } catch (err) {
      // Only update error state if this is still the latest request
      if (latestPublicationRequest.current === requestId) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to search publications';
        setError(errorMessage);
        toast.error(`Publication search failed: ${errorMessage}`);
      }
    } finally {
      // Only update loading state if this is still the latest request
      if (latestPublicationRequest.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  // Convenience methods for common searches
  const searchByPI = useCallback(
    (piName: string, limit = 20) => {
      return searchProjects({ type: 'pi', query: piName, limit });
    },
    [searchProjects]
  );

  const searchByOrganization = useCallback(
    (orgName: string, limit = 20) => {
      return searchProjects({ type: 'organization', query: orgName, limit });
    },
    [searchProjects]
  );

  const searchByFocusArea = useCallback(
    (focusArea: string, limit = 20) => {
      return searchProjects({ type: 'focus', query: focusArea, limit });
    },
    [searchProjects]
  );

  const searchByTitle = useCallback(
    (title: string, limit = 20) => {
      return searchProjects({ type: 'text', query: title, field: 'projecttitle', limit });
    },
    [searchProjects]
  );

  const searchByAbstract = useCallback(
    (abstractText: string, limit = 20) => {
      return searchProjects({ type: 'text', query: abstractText, field: 'abstract', limit });
    },
    [searchProjects]
  );

  const getRecentProjects = useCallback(
    (limit = 20) => {
      return searchProjects({ type: 'recent', limit });
    },
    [searchProjects]
  );

  const searchByAwardRange = useCallback(
    (minAmount: number, maxAmount: number, limit = 20) => {
      return searchProjects({ type: 'award', minAmount, maxAmount, limit });
    },
    [searchProjects]
  );

  const getProjectPublications = useCallback(
    (projectNumber: string, limit = 20) => {
      return searchPublications({ projectNumber, limit });
    },
    [searchPublications]
  );

  // Geographic search methods
  const searchByState = useCallback(
    (states: string[], limit = 20) => {
      return searchProjects({ type: 'state', states: states.join(','), limit });
    },
    [searchProjects]
  );

  const searchByCity = useCallback(
    (cities: string[], limit = 20) => {
      return searchProjects({ type: 'city', cities: cities.join(','), limit });
    },
    [searchProjects]
  );

  const searchByRegion = useCallback(
    (
      region: 'Southeast' | 'Northeast' | 'West Coast' | 'Midwest' | 'Southwest' | 'Mountain West',
      limit = 20
    ) => {
      return searchProjects({ type: 'region', region, limit });
    },
    [searchProjects]
  );

  const searchByLocation = useCallback(
    (location: { states?: string[]; cities?: string[] }, focusArea?: string, limit = 20) => {
      return searchProjects({
        type: 'location',
        states: location.states?.join(','),
        cities: location.cities?.join(','),
        focusArea,
        limit,
      });
    },
    [searchProjects]
  );

  const searchNearby = useCallback(
    (referenceState: string, focusArea?: string, includeAdjacent = false, limit = 20) => {
      return searchProjects({
        type: 'nearby',
        query: referenceState,
        focusArea,
        includeAdjacent,
        limit,
      });
    },
    [searchProjects]
  );

  const clearResults = useCallback(() => {
    setProjects(null);
    setPublications(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    projects,
    publications,

    // Actions
    searchProjects,
    searchPublications,
    clearResults,
    clearError,

    // Convenience methods
    searchByPI,
    searchByOrganization,
    searchByFocusArea,
    searchByTitle,
    searchByAbstract,
    getRecentProjects,
    searchByAwardRange,
    getProjectPublications,

    // Geographic search methods
    searchByState,
    searchByCity,
    searchByRegion,
    searchByLocation,
    searchNearby,
  };
}

export default useNIHResearch;
