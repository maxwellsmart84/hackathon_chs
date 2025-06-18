import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { NIHReporterService, NIHReporterUtils } from '@/lib/services/nih-reporter';

// Validation schema for search parameters
const searchParamsSchema = z.object({
  query: z.string().nullable().optional(),
  type: z
    .enum([
      'pi',
      'organization',
      'focus',
      'text',
      'recent',
      'award',
      'state',
      'city',
      'region',
      'location',
      'nearby',
    ])
    .default('text'),
  field: z.enum(['projecttitle', 'abstract', 'terms']).nullable().default('projecttitle'),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  minAmount: z.coerce.number().min(0).nullable().optional(),
  maxAmount: z.coerce.number().min(0).nullable().optional(),
  // Geographic parameters
  states: z.string().nullable().optional(), // Comma-separated states
  cities: z.string().nullable().optional(), // Comma-separated cities
  region: z
    .enum(['Southeast', 'Northeast', 'West Coast', 'Midwest', 'Southwest', 'Mountain West'])
    .nullable()
    .optional(),
  focusArea: z.string().nullable().optional(), // For combined location + focus searches
  includeAdjacent: z.coerce.boolean().default(false), // For nearby searches
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate search parameters
    const searchParams = request.nextUrl.searchParams;
    const parsed = searchParamsSchema.safeParse({
      query: searchParams.get('query'),
      type: searchParams.get('type'),
      field: searchParams.get('field'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      minAmount: searchParams.get('minAmount'),
      maxAmount: searchParams.get('maxAmount'),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const {
      query,
      type,
      field,
      limit,
      offset,
      minAmount,
      maxAmount,
      states,
      cities,
      region,
      focusArea,
      includeAdjacent,
    } = parsed.data;

    let response;

    // Route to appropriate search method based on type
    switch (type) {
      case 'pi':
        if (!query) {
          return NextResponse.json(
            { error: 'Query parameter required for PI search' },
            { status: 400 }
          );
        }
        response = await NIHReporterService.searchProjectsByPI(query, limit);
        break;

      case 'organization':
        if (!query) {
          return NextResponse.json(
            { error: 'Query parameter required for organization search' },
            { status: 400 }
          );
        }
        response = await NIHReporterService.searchProjectsByOrganization(query, limit);
        break;

      case 'focus':
        if (!query) {
          return NextResponse.json(
            { error: 'Query parameter required for focus area search' },
            { status: 400 }
          );
        }
        response = await NIHReporterService.searchProjectsByFocusArea(query, limit);
        break;

      case 'text':
        if (!query) {
          return NextResponse.json(
            { error: 'Query parameter required for text search' },
            { status: 400 }
          );
        }
        response = await NIHReporterService.searchProjectsByText(
          query,
          field === 'abstract' ? 'abstract' : 'projecttitle',
          limit
        );
        break;

      case 'recent':
        response = await NIHReporterService.getRecentProjects(limit);
        break;

      case 'award':
        if (
          minAmount === undefined ||
          minAmount === null ||
          maxAmount === undefined ||
          maxAmount === null
        ) {
          return NextResponse.json(
            { error: 'minAmount and maxAmount parameters required for award search' },
            { status: 400 }
          );
        }
        response = await NIHReporterService.searchProjectsByAwardAmount(
          minAmount,
          maxAmount,
          limit
        );
        break;

      case 'state':
        if (!states) {
          return NextResponse.json(
            { error: 'States parameter required for state search' },
            { status: 400 }
          );
        }
        const stateArray = states.split(',').map(s => s.trim());
        response = await NIHReporterService.searchProjectsByState(stateArray, {}, limit);
        break;

      case 'city':
        if (!cities) {
          return NextResponse.json(
            { error: 'Cities parameter required for city search' },
            { status: 400 }
          );
        }
        const cityArray = cities.split(',').map(c => c.trim());
        response = await NIHReporterService.searchProjectsByCity(cityArray, {}, limit);
        break;

      case 'region':
        if (!region) {
          return NextResponse.json(
            { error: 'Region parameter required for region search' },
            { status: 400 }
          );
        }
        response = await NIHReporterService.searchProjectsByRegion(region, {}, limit);
        break;

      case 'location':
        const locationCriteria: { states?: string[]; cities?: string[] } = {};
        if (states) {
          locationCriteria.states = states.split(',').map(s => s.trim());
        }
        if (cities) {
          locationCriteria.cities = cities.split(',').map(c => c.trim());
        }
        if (!locationCriteria.states && !locationCriteria.cities) {
          return NextResponse.json(
            { error: 'Either states or cities parameter required for location search' },
            { status: 400 }
          );
        }
        response = await NIHReporterService.searchProjectsByLocation(
          locationCriteria,
          focusArea || undefined,
          {},
          limit
        );
        break;

      case 'nearby':
        if (!query) {
          return NextResponse.json(
            { error: 'Query parameter (reference state) required for nearby search' },
            { status: 400 }
          );
        }
        response = await NIHReporterService.searchNearbyProjects(
          query,
          focusArea || undefined,
          includeAdjacent,
          limit
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid search type' }, { status: 400 });
    }

    // Apply offset if different from API call (for client-side pagination)
    let results = response.results || []; // Fallback to empty array
    if (offset > 0 && offset < results.length) {
      results = results.slice(offset);
    }

    // Format the response for frontend consumption
    const formattedResults = results.map(project => ({
      id: project.core_project_num,
      projectNumber: project.project_num,
      title: project.project_title,
      abstract:
        project.abstract_text?.substring(0, 500) +
        (project.abstract_text?.length > 500 ? '...' : ''),
      principalInvestigators: NIHReporterUtils.formatPINames(project.principal_investigators),
      organization: {
        name: project.organization.org_name,
        city: project.organization.org_city,
        state: project.organization.org_state,
        country: project.organization.org_country,
      },
      funding: {
        amount: project.award_amount,
        formattedAmount: NIHReporterUtils.formatAwardAmount(project.award_amount),
        fiscalYear: project.fiscal_year,
        startDate: project.project_start_date,
        endDate: project.project_end_date,
        formattedStartDate: NIHReporterUtils.formatDate(project.project_start_date),
        formattedEndDate: NIHReporterUtils.formatDate(project.project_end_date),
      },
      focusAreas: NIHReporterUtils.extractFocusAreas(project.project_terms),
      isMedTech: NIHReporterUtils.isMedTechProject(project),
      isActive: project.is_active,
      detailUrl: project.project_detail_url,
      agency: project.agency_ic_admin,
      activityCode: project.activity_code,
    }));

    return NextResponse.json({
      success: true,
      data: {
        projects: formattedResults,
        pagination: {
          total: response.meta.total,
          offset: offset,
          limit: limit,
          hasMore: offset + limit < response.meta.total,
        },
        searchInfo: {
          searchId: response.meta.search_id,
          type: type,
          query: query || null,
        },
      },
    });
  } catch (error) {
    console.error('NIH RePORTER API error:', error);

    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('NIH RePORTER API error')) {
        return NextResponse.json(
          { error: 'External API error', message: error.message },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch research projects' },
      { status: 500 }
    );
  }
}

// Example usage documentation
export async function OPTIONS() {
  return NextResponse.json({
    description: 'NIH RePORTER Research Projects API',
    methods: ['GET'],
    examples: {
      searchByPI: '/api/research/projects?type=pi&query=smith&limit=10',
      searchByOrganization: '/api/research/projects?type=organization&query=stanford&limit=10',
      searchByFocus: '/api/research/projects?type=focus&query=cardiology&limit=10',
      searchByTitle: '/api/research/projects?type=text&query=cancer&field=projecttitle&limit=10',
      searchByAbstract: '/api/research/projects?type=text&query=diabetes&field=abstract&limit=10',
      getRecent: '/api/research/projects?type=recent&limit=20',
      searchByAward:
        '/api/research/projects?type=award&minAmount=100000&maxAmount=1000000&limit=10',
      searchByState: '/api/research/projects?type=state&states=CA,NY&limit=10',
      searchByCity: '/api/research/projects?type=city&cities=Boston,Cambridge&limit=10',
      searchByRegion: '/api/research/projects?type=region&region=Southeast&limit=10',
      searchByLocation:
        '/api/research/projects?type=location&states=SC,NC&focusArea=cardiology&limit=10',
      searchNearby:
        '/api/research/projects?type=nearby&query=SC&focusArea=diabetes&includeAdjacent=true&limit=10',
    },
    parameters: {
      query: 'Search term (required for most types)',
      type: 'Search type: pi, organization, focus, text, recent, award, state, city, region, location, nearby',
      field: 'Text search field: projecttitle, abstract, terms (for type=text)',
      limit: 'Number of results (1-100, default: 20)',
      offset: 'Pagination offset (default: 0)',
      minAmount: 'Minimum award amount (for type=award)',
      maxAmount: 'Maximum award amount (for type=award)',
      states: 'Comma-separated state codes (for geographic searches)',
      cities: 'Comma-separated city names (for geographic searches)',
      region:
        'Predefined region: Southeast, Northeast, West Coast, Midwest, Southwest, Mountain West',
      focusArea: 'Focus area to combine with location searches',
      includeAdjacent: 'Include adjacent states for nearby searches (true/false)',
    },
  });
}
