// NIH RePORTER API Service
// Documentation: https://api.reporter.nih.gov/

const NIH_REPORTER_BASE_URL = 'https://api.reporter.nih.gov/v2';

// Base API configuration
const API_CONFIG = {
  baseURL: NIH_REPORTER_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // NIH recommends no more than 1 request per second
  rateLimit: 1000, // milliseconds between requests
};

// Types based on NIH RePORTER API documentation
export interface NIHProjectSearchCriteria {
  use_relevance?: boolean;
  fiscal_years?: number[];
  include_active_projects?: boolean;
  pi_names?: Array<{
    any_name?: string;
    first_name?: string;
    last_name?: string;
  }>;
  po_names?: Array<{
    any_name?: string;
    first_name?: string;
    last_name?: string;
  }>;
  org_names?: string[];
  org_cities?: string[];
  org_states?: string[];
  org_countries?: string[];
  project_nums?: string[];
  core_project_nums?: string[];
  full_study_sections?: string[];
  appl_ids?: number[];
  activity_codes?: string[];
  funding_ics?: string[];
  award_types?: string[];
  agency_ic_admin?: string[];
  agency_ic_fundings?: string[];
  cong_dists?: string[];
  project_start_date?: {
    from_date?: string;
    to_date?: string;
  };
  project_end_date?: {
    from_date?: string;
    to_date?: string;
  };
  budget_start_date?: {
    from_date?: string;
    to_date?: string;
  };
  budget_end_date?: {
    from_date?: string;
    to_date?: string;
  };
  award_notice_date?: {
    from_date?: string;
    to_date?: string;
  };
  award_amount_range?: {
    min_amount?: number;
    max_amount?: number;
  };
  exclude_subprojects?: boolean;
  multi_pi_only?: boolean;
  newly_added_projects_only?: boolean;
  sub_project_only?: boolean;
  covid_response?: string[];
  date_added?: {
    from_date?: string;
    to_date?: string;
  };
  advanced_text_search?: {
    operator?: 'And' | 'Or';
    search_field?: 'projecttitle' | 'abstract' | 'terms' | 'piname' | 'orgname';
    search_text?: string;
  };
}

export interface NIHProjectSearchRequest {
  criteria?: NIHProjectSearchCriteria;
  include_fields?: string[];
  exclude_fields?: string[];
  offset?: number;
  limit?: number;
  sort_field?: string;
  sort_order?: 'asc' | 'desc';
  search_id?: string;
}

export interface NIHProject {
  appl_id: number;
  subproject_id?: number;
  fiscal_year: number;
  project_num: string;
  project_serial_num: string;
  organization: {
    org_name: string;
    org_city: string;
    org_state: string;
    org_state_name: string;
    org_country: string;
    org_zipcode: string;
    org_fips: string;
    dept_type: string;
    org_duns: string;
    org_uei: string;
    org_ipf_code: string;
  };
  project_start_date: string;
  project_end_date: string;
  project_title: string;
  project_detail_url: string;
  abstract_text: string;
  phr_text: string;
  spending_cats?: Array<{
    nih_spending_cats: string;
  }>;
  principal_investigators: Array<{
    profile_id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    is_contact_pi: boolean;
  }>;
  program_officers: Array<{
    first_name: string;
    middle_name: string;
    last_name: string;
  }>;
  agency_ic_admin: {
    code: string;
    name: string;
  };
  agency_ic_fundings: Array<{
    code: string;
    name: string;
  }>;
  cong_dist: string;
  project_terms: string[];
  award_type: string;
  activity_code: string;
  award_amount: number;
  is_active: boolean;
  award_notice_date: string;
  core_project_num: string;
  full_study_section: {
    srg_code: string;
    srg_flex: string;
    sra_designator_code: string;
    sra_flex_code: string;
    group_code: string;
    name: string;
  };
  cfda_code: string;
  funding_mechanism: string;
  direct_cost_amt: number;
  indirect_cost_amt: number;
  budget_start: string;
  budget_end: string;
  arra_funded: string;
  opportunity_number: string;
}

export interface NIHProjectSearchResponse {
  meta: {
    search_id: string;
    total: number;
    offset: number;
    limit: number;
    sort_field: string;
    sort_order: string;
    url: string;
  };
  results: NIHProject[];
}

export interface NIHPublicationSearchCriteria {
  pmids?: number[];
  appl_ids?: number[];
  core_project_nums?: string[];
}

export interface NIHPublicationSearchRequest {
  criteria?: NIHPublicationSearchCriteria;
  offset?: number;
  limit?: number;
  sort_field?: string;
  sort_order?: 'asc' | 'desc';
}

export interface NIHPublication {
  coreproject: string;
  pmid: number;
  applid: number;
}

export interface NIHPublicationSearchResponse {
  meta: {
    total: number;
    offset: number;
    limit: number;
    sort_field: string;
    sort_order: string;
  };
  results: NIHPublication[];
}

// Rate limiting utility
class RateLimiter {
  private lastRequest: number = 0;

  async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;

    if (timeSinceLastRequest < API_CONFIG.rateLimit) {
      const delay = API_CONFIG.rateLimit - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequest = Date.now();
  }
}

const rateLimiter = new RateLimiter();

// Base fetch wrapper with error handling
async function nihFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Apply rate limiting
  await rateLimiter.throttle();

  const url = `${API_CONFIG.baseURL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...API_CONFIG.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`NIH RePORTER API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('NIH RePORTER API request failed:', error);
    throw error;
  }
}

// Project search methods
export class NIHReporterService {
  /**
   * Search for NIH projects
   * @param request Search parameters
   * @returns Promise<NIHProjectSearchResponse>
   */
  static async searchProjects(request: NIHProjectSearchRequest): Promise<NIHProjectSearchResponse> {
    return nihFetch<NIHProjectSearchResponse>('/projects/search', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Search for publications
   * @param request Search parameters
   * @returns Promise<NIHPublicationSearchResponse>
   */
  static async searchPublications(
    request: NIHPublicationSearchRequest
  ): Promise<NIHPublicationSearchResponse> {
    return nihFetch<NIHPublicationSearchResponse>('/publications/search', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Search projects by PI name
   * @param piName Principal investigator name (supports partial matching)
   * @param limit Number of results to return (default: 50, max: 500)
   * @returns Promise<NIHProjectSearchResponse>
   */
  static async searchProjectsByPI(
    piName: string,
    limit: number = 50
  ): Promise<NIHProjectSearchResponse> {
    return this.searchProjects({
      criteria: {
        pi_names: [{ any_name: piName }],
        use_relevance: true,
      },
      limit: Math.min(limit, 500),
      sort_field: 'project_start_date',
      sort_order: 'desc',
    });
  }

  /**
   * Search projects by organization
   * @param orgName Organization name (supports partial matching)
   * @param limit Number of results to return (default: 50, max: 500)
   * @returns Promise<NIHProjectSearchResponse>
   */
  static async searchProjectsByOrganization(
    orgName: string,
    limit: number = 50
  ): Promise<NIHProjectSearchResponse> {
    return this.searchProjects({
      criteria: {
        org_names: [orgName],
        use_relevance: true,
      },
      limit: Math.min(limit, 500),
      sort_field: 'project_start_date',
      sort_order: 'desc',
    });
  }

  /**
   * Search projects by medical focus area/terms
   * @param searchText Search terms related to medical focus areas
   * @param limit Number of results to return (default: 50, max: 500)
   * @returns Promise<NIHProjectSearchResponse>
   */
  static async searchProjectsByFocusArea(
    searchText: string,
    limit: number = 50
  ): Promise<NIHProjectSearchResponse> {
    return this.searchProjects({
      criteria: {
        advanced_text_search: {
          operator: 'Or',
          search_field: 'terms',
          search_text: searchText,
        },
        use_relevance: true,
      },
      limit: Math.min(limit, 500),
      sort_field: 'project_start_date',
      sort_order: 'desc',
    });
  }

  /**
   * Search projects by title or abstract
   * @param searchText Search terms for project title or abstract
   * @param searchField Field to search in ('projecttitle' | 'abstract')
   * @param limit Number of results to return (default: 50, max: 500)
   * @returns Promise<NIHProjectSearchResponse>
   */
  static async searchProjectsByText(
    searchText: string,
    searchField: 'projecttitle' | 'abstract' = 'projecttitle',
    limit: number = 50
  ): Promise<NIHProjectSearchResponse> {
    return this.searchProjects({
      criteria: {
        advanced_text_search: {
          operator: 'And',
          search_field: searchField,
          search_text: searchText,
        },
        use_relevance: true,
      },
      limit: Math.min(limit, 500),
      sort_field: 'project_start_date',
      sort_order: 'desc',
    });
  }

  /**
   * Get recent projects (last 2 fiscal years)
   * @param limit Number of results to return (default: 50, max: 500)
   * @returns Promise<NIHProjectSearchResponse>
   */
  static async getRecentProjects(limit: number = 50): Promise<NIHProjectSearchResponse> {
    const currentYear = new Date().getFullYear();
    const fiscalYears = [currentYear, currentYear - 1];

    return this.searchProjects({
      criteria: {
        fiscal_years: fiscalYears,
        include_active_projects: true,
      },
      limit: Math.min(limit, 500),
      sort_field: 'project_start_date',
      sort_order: 'desc',
    });
  }

  /**
   * Search projects with award amount range
   * @param minAmount Minimum award amount
   * @param maxAmount Maximum award amount
   * @param limit Number of results to return (default: 50, max: 500)
   * @returns Promise<NIHProjectSearchResponse>
   */
  static async searchProjectsByAwardAmount(
    minAmount: number,
    maxAmount: number,
    limit: number = 50
  ): Promise<NIHProjectSearchResponse> {
    return this.searchProjects({
      criteria: {
        award_amount_range: {
          min_amount: minAmount,
          max_amount: maxAmount,
        },
      },
      limit: Math.min(limit, 500),
      sort_field: 'award_amount',
      sort_order: 'desc',
    });
  }

  /**
   * Search projects by state(s)
   * @param states Array of state codes or names (e.g., ["CA", "NY", "Texas"])
   * @param additionalCriteria Optional additional search criteria
   * @param limit Number of results to return (default: 50, max: 500)
   * @returns Promise<NIHProjectSearchResponse>
   */
  static async searchProjectsByState(
    states: string[],
    additionalCriteria?: Partial<NIHProjectSearchCriteria>,
    limit: number = 50
  ): Promise<NIHProjectSearchResponse> {
    return this.searchProjects({
      criteria: {
        org_states: states,
        use_relevance: true,
        ...additionalCriteria,
      },
      limit: Math.min(limit, 500),
      sort_field: 'project_start_date',
      sort_order: 'desc',
    });
  }

  /**
   * Search projects by city/cities
   * @param cities Array of city names
   * @param additionalCriteria Optional additional search criteria
   * @param limit Number of results to return (default: 50, max: 500)
   * @returns Promise<NIHProjectSearchResponse>
   */
  static async searchProjectsByCity(
    cities: string[],
    additionalCriteria?: Partial<NIHProjectSearchCriteria>,
    limit: number = 50
  ): Promise<NIHProjectSearchResponse> {
    return this.searchProjects({
      criteria: {
        org_cities: cities,
        use_relevance: true,
        ...additionalCriteria,
      },
      limit: Math.min(limit, 500),
      sort_field: 'project_start_date',
      sort_order: 'desc',
    });
  }

  /**
   * Search projects by predefined US regions
   * @param region Predefined region name
   * @param additionalCriteria Optional additional search criteria
   * @param limit Number of results to return (default: 50, max: 500)
   * @returns Promise<NIHProjectSearchResponse>
   */
  static async searchProjectsByRegion(
    region: 'Southeast' | 'Northeast' | 'West Coast' | 'Midwest' | 'Southwest' | 'Mountain West',
    additionalCriteria?: Partial<NIHProjectSearchCriteria>,
    limit: number = 50
  ): Promise<NIHProjectSearchResponse> {
    const regionStates = {
      Southeast: ['SC', 'NC', 'GA', 'FL', 'TN', 'AL', 'MS', 'KY', 'VA', 'WV'],
      Northeast: ['NY', 'MA', 'CT', 'RI', 'VT', 'NH', 'ME', 'PA', 'NJ'],
      'West Coast': ['CA', 'OR', 'WA'],
      Midwest: ['IL', 'IN', 'IA', 'KS', 'MI', 'MN', 'MO', 'NE', 'ND', 'OH', 'SD', 'WI'],
      Southwest: ['TX', 'AZ', 'NM', 'OK', 'AR', 'LA'],
      'Mountain West': ['CO', 'UT', 'NV', 'ID', 'MT', 'WY'],
    };

    return this.searchProjectsByState(regionStates[region], additionalCriteria, limit);
  }

  /**
   * Combined geographic and focus area search
   * @param location Geographic criteria (states and/or cities)
   * @param focusArea Optional focus area search terms
   * @param additionalCriteria Optional additional search criteria
   * @param limit Number of results to return (default: 50, max: 500)
   * @returns Promise<NIHProjectSearchResponse>
   */
  static async searchProjectsByLocation(
    location: { states?: string[]; cities?: string[] },
    focusArea?: string,
    additionalCriteria?: Partial<NIHProjectSearchCriteria>,
    limit: number = 50
  ): Promise<NIHProjectSearchResponse> {
    const criteria: NIHProjectSearchCriteria = {
      use_relevance: true,
      ...additionalCriteria,
    };

    if (location.states && location.states.length > 0) {
      criteria.org_states = location.states;
    }

    if (location.cities && location.cities.length > 0) {
      criteria.org_cities = location.cities;
    }

    if (focusArea) {
      criteria.advanced_text_search = {
        operator: 'Or',
        search_field: 'terms',
        search_text: focusArea,
      };
    }

    return this.searchProjects({
      criteria,
      limit: Math.min(limit, 500),
      sort_field: 'project_start_date',
      sort_order: 'desc',
    });
  }

  /**
   * Search for nearby institutions (within the same state or region)
   * @param referenceState The state to search within or around
   * @param focusArea Optional focus area to filter by
   * @param includeAdjacentStates Whether to include neighboring states
   * @param limit Number of results to return (default: 50, max: 500)
   * @returns Promise<NIHProjectSearchResponse>
   */
  static async searchNearbyProjects(
    referenceState: string,
    focusArea?: string,
    includeAdjacentStates: boolean = false,
    limit: number = 50
  ): Promise<NIHProjectSearchResponse> {
    // Define adjacent states for major states (can be expanded)
    const adjacentStatesMap: Record<string, string[]> = {
      SC: ['NC', 'GA'],
      NC: ['SC', 'TN', 'VA', 'GA'],
      GA: ['FL', 'AL', 'TN', 'NC', 'SC'],
      CA: ['NV', 'AZ', 'OR'],
      NY: ['CT', 'MA', 'VT', 'NJ', 'PA'],
      TX: ['OK', 'AR', 'LA', 'NM'],
      FL: ['GA', 'AL'],
      // Add more as needed
    };

    let states = [referenceState];
    if (includeAdjacentStates && adjacentStatesMap[referenceState]) {
      states = [...states, ...adjacentStatesMap[referenceState]];
    }

    const additionalCriteria: Partial<NIHProjectSearchCriteria> = {};
    if (focusArea) {
      additionalCriteria.advanced_text_search = {
        operator: 'Or',
        search_field: 'terms',
        search_text: focusArea,
      };
    }

    return this.searchProjectsByState(states, additionalCriteria, limit);
  }

  /**
   * Get publications for a specific project
   * @param coreProjectNum Core project number
   * @param limit Number of results to return (default: 50, max: 500)
   * @returns Promise<NIHPublicationSearchResponse>
   */
  static async getProjectPublications(
    coreProjectNum: string,
    limit: number = 50
  ): Promise<NIHPublicationSearchResponse> {
    return this.searchPublications({
      criteria: {
        core_project_nums: [coreProjectNum],
      },
      limit: Math.min(limit, 500),
    });
  }
}

// Utility functions for data formatting
export const NIHReporterUtils = {
  /**
   * Format PI names for display
   */
  formatPINames(pis: NIHProject['principal_investigators']): string {
    return pis
      .map(pi => {
        const parts = [pi.first_name, pi.middle_name, pi.last_name].filter(Boolean);
        return parts.join(' ');
      })
      .join(', ');
  },

  /**
   * Format award amount for display
   */
  formatAwardAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  },

  /**
   * Extract focus areas from project terms
   */
  extractFocusAreas(terms: string[]): string[] {
    // Handle case where terms might be undefined or null
    if (!terms || !Array.isArray(terms)) {
      return [];
    }

    // Common medical/research focus areas to filter for
    const medicalTerms = terms.filter(term =>
      /\b(cardio|cancer|oncology|neuro|pediatric|orthopedic|diabetes|mental|brain|heart|lung|kidney|liver|blood|immune|genetic|drug|therapy|treatment|diagnosis|clinical|trial|patient|disease|disorder|syndrome)\b/i.test(
        term
      )
    );

    return medicalTerms.slice(0, 5); // Limit to top 5 relevant terms
  },

  /**
   * Check if project is related to MedTech
   */
  isMedTechProject(project: NIHProject): boolean {
    const medTechKeywords = [
      'medical device',
      'diagnostic',
      'imaging',
      'sensor',
      'wearable',
      'telemedicine',
      'digital health',
      'mHealth',
      'biomedical engineering',
      'medical technology',
      'health technology',
      'clinical device',
    ];

    // Safely handle project_terms which might be undefined or null
    const termsText =
      project.project_terms && Array.isArray(project.project_terms)
        ? project.project_terms.join(' ')
        : '';

    const searchText =
      `${project.project_title || ''} ${project.abstract_text || ''} ${termsText}`.toLowerCase();

    return medTechKeywords.some(keyword => searchText.includes(keyword));
  },
};

export default NIHReporterService;
