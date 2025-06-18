import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { NIHReporterService, NIHPublicationSearchCriteria } from '@/lib/services/nih-reporter';

// Validation schema for publication search parameters
const searchParamsSchema = z.object({
  projectNumber: z.string().optional(),
  pmids: z.string().optional(), // Comma-separated PMIDs
  applIds: z.string().optional(), // Comma-separated application IDs
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
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
      projectNumber: searchParams.get('projectNumber'),
      pmids: searchParams.get('pmids'),
      applIds: searchParams.get('applIds'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { projectNumber, pmids, applIds, limit, offset } = parsed.data;

    // Build search criteria
    const criteria: NIHPublicationSearchCriteria = {};

    if (projectNumber) {
      criteria.core_project_nums = [projectNumber];
    }

    if (pmids) {
      const pmidArray = pmids
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));
      if (pmidArray.length > 0) {
        criteria.pmids = pmidArray;
      }
    }

    if (applIds) {
      const applIdArray = applIds
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));
      if (applIdArray.length > 0) {
        criteria.appl_ids = applIdArray;
      }
    }

    // Require at least one search criterion
    if (Object.keys(criteria).length === 0) {
      return NextResponse.json(
        { error: 'At least one search parameter required (projectNumber, pmids, or applIds)' },
        { status: 400 }
      );
    }

    const response = await NIHReporterService.searchPublications({
      criteria,
      limit,
      offset,
    });

    // Format the response for frontend consumption
    const formattedResults = response.results.map(publication => ({
      coreProjectNumber: publication.coreproject,
      pmid: publication.pmid,
      applicationId: publication.applid,
      pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${publication.pmid}/`,
      reporterUrl: `https://reporter.nih.gov/project-details/${publication.coreproject}`,
    }));

    return NextResponse.json({
      success: true,
      data: {
        publications: formattedResults,
        pagination: {
          total: response.meta.total,
          offset: response.meta.offset,
          limit: response.meta.limit,
          hasMore: response.meta.offset + response.meta.limit < response.meta.total,
        },
        searchInfo: {
          criteria,
        },
      },
    });
  } catch (error) {
    console.error('NIH RePORTER Publications API error:', error);

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
      { error: 'Internal server error', message: 'Failed to fetch publications' },
      { status: 500 }
    );
  }
}

// Example usage documentation
export async function OPTIONS() {
  return NextResponse.json({
    description: 'NIH RePORTER Publications API',
    methods: ['GET'],
    examples: {
      searchByProject: '/api/research/publications?projectNumber=UG1HD078437&limit=10',
      searchByPMID: '/api/research/publications?pmids=33298401,33105091&limit=10',
      searchByApplicationId: '/api/research/publications?applIds=10188551,10098333&limit=10',
    },
    parameters: {
      projectNumber: 'Core project number to find publications for',
      pmids: 'Comma-separated list of PubMed IDs',
      applIds: 'Comma-separated list of application IDs',
      limit: 'Number of results (1-100, default: 20)',
      offset: 'Pagination offset (default: 0)',
    },
  });
}
