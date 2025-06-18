'use client';

import { useState, useEffect } from 'react';
import useNIHResearch, { ProjectSearchType } from '@/lib/hooks/useNIHResearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  ExternalLink,
  DollarSign,
  Building2,
  User,
  FileText,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { CreateStartup } from '@/lib/db/schema-types';

interface NIHResearchSectionProps {
  startupData?: CreateStartup;
}

export default function NIHResearchSection({ startupData }: NIHResearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<ProjectSearchType>('text');
  const [hasAutoSearched, setHasAutoSearched] = useState(false);

  const {
    isLoading,
    error,
    projects,
    publications,
    searchProjects,
    searchPublications,
    clearResults,
    searchByFocusArea,
    searchByLocation,
    getRecentProjects,
  } = useNIHResearch();

  // Auto-search based on startup data when component loads
  useEffect(() => {
    if (startupData && !hasAutoSearched) {
      performAutoSearch();
      setHasAutoSearched(true);
    }
  }, [startupData, hasAutoSearched]);

  const performAutoSearch = async () => {
    if (!startupData) return;

    // Strategy: Search by focus areas first, then by keywords
    let searchTerms: string[] = [];

    // Add focus areas (medical specialties)
    if (startupData.focusAreas && startupData.focusAreas.length > 0) {
      searchTerms = [...searchTerms, ...startupData.focusAreas];
    }

    // Add keywords if available
    if (startupData.keywords && startupData.keywords.length > 0) {
      searchTerms = [...searchTerms, ...startupData.keywords];
    }

    // Add product types for additional matching
    if (startupData.productTypes && startupData.productTypes.length > 0) {
      searchTerms = [...searchTerms, ...startupData.productTypes];
    }

    // If we have location data, do a geographic + focus search
    if (startupData.location && searchTerms.length > 0) {
      // Try to extract state from location
      const locationParts = startupData.location.split(',').map(part => part.trim());
      const potentialState = locationParts[locationParts.length - 1];

      // Check if it looks like a state (2 letters or common state names)
      if (
        potentialState.length <= 3 ||
        ['California', 'Texas', 'Florida', 'New York'].includes(potentialState)
      ) {
        try {
          await searchByLocation(
            { states: [potentialState] },
            searchTerms.slice(0, 2).join(' '), // Use first 2 terms
            15
          );
          return;
        } catch {
          console.log('Geographic search failed, falling back to focus area search');
        }
      }
    }

    // Fallback: Search by primary focus area
    if (searchTerms.length > 0) {
      await searchByFocusArea(searchTerms[0], 15);
    } else {
      // Last resort: get recent projects
      await getRecentProjects(10);
    }
  };

  const handleManualSearch = () => {
    if (!searchQuery.trim() && searchType !== 'recent') {
      return;
    }

    searchProjects({
      type: searchType,
      query: searchQuery.trim() || undefined,
      limit: 15,
    });
  };

  const handleRefreshRecommendations = () => {
    setHasAutoSearched(false);
    clearResults();
    // Will trigger auto-search via useEffect
  };

  const handleGetPublications = (projectNumber: string) => {
    searchPublications({ projectNumber, limit: 5 });
  };

  const getSearchContext = () => {
    if (!startupData) return null;

    const contexts = [];
    if (startupData.focusAreas?.length) {
      contexts.push(`Focus: ${startupData.focusAreas.slice(0, 2).join(', ')}`);
    }
    if (startupData.location) {
      contexts.push(`Location: ${startupData.location}`);
    }
    if (startupData.stage) {
      contexts.push(`Stage: ${startupData.stage}`);
    }

    return contexts.join(' • ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">NIH Research & Collaboration</h3>
          <p className="text-sm text-gray-600">
            Discover relevant NIH-funded research and potential collaborators
          </p>
          {getSearchContext() && (
            <p className="mt-1 text-xs text-blue-600">
              Showing results based on: {getSearchContext()}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshRecommendations}
          disabled={isLoading}
        >
          <RefreshCw className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Manual Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4" />
            Search NIH Database
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <select
              value={searchType}
              onChange={e => setSearchType(e.target.value as ProjectSearchType)}
              className="rounded-md border bg-white px-3 py-2 text-sm"
            >
              <option value="text">Text Search</option>
              <option value="pi">Principal Investigator</option>
              <option value="organization">Organization</option>
              <option value="focus">Focus Area</option>
              <option value="recent">Recent Projects</option>
              <option value="region">Region</option>
            </select>

            <Input
              placeholder={
                searchType === 'recent'
                  ? 'No query needed for recent projects'
                  : 'Enter search term...'
              }
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              disabled={searchType === 'recent'}
              className="flex-1"
            />

            <Button
              onClick={handleManualSearch}
              disabled={isLoading || (!searchQuery.trim() && searchType !== 'recent')}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {projects && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Research Projects ({projects.pagination.total} found)</span>
              <Button variant="outline" size="sm" onClick={clearResults}>
                Clear Results
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.projects?.slice(0, 8).map(project => (
                <div key={project.id} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="mb-1 line-clamp-2 text-sm font-medium">{project.title}</h4>
                      <p className="mb-2 line-clamp-2 text-xs text-gray-600">{project.abstract}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {project.isMedTech && (
                        <Badge variant="secondary" className="text-xs">
                          MedTech
                        </Badge>
                      )}
                      {project.isActive && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-gray-400" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium">PI</p>
                        <p className="truncate text-gray-600">{project.principalInvestigators}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3 text-gray-400" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium">Organization</p>
                        <p className="truncate text-gray-600">{project.organization.name}</p>
                        <p className="text-xs text-gray-500">
                          {project.organization.city}, {project.organization.state}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3 text-gray-400" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium">Funding</p>
                        <p className="text-xs text-gray-600">{project.funding.formattedAmount}</p>
                        <p className="text-xs text-gray-500">FY {project.funding.fiscalYear}</p>
                      </div>
                    </div>
                  </div>

                  {project.focusAreas.length > 0 && (
                    <div>
                      <div className="flex flex-wrap gap-1">
                        {project.focusAreas.slice(0, 3).map((area, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                        {project.focusAreas.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.focusAreas.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {project.projectNumber} • {project.activityCode}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGetPublications(project.projectNumber)}
                        disabled={isLoading}
                        className="h-7 text-xs"
                      >
                        <FileText className="mr-1 h-3 w-3" />
                        Publications
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(project.detailUrl, '_blank')}
                        className="h-7 text-xs"
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {projects.pagination.total > 8 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Showing 8 of {projects.pagination.total} results.
                </p>
                <Button variant="link" size="sm" className="text-xs">
                  View all in research explorer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Publications Results */}
      {publications && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Publications ({publications.pagination.total} found)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {publications.publications?.map(pub => (
                <div
                  key={pub.pmid}
                  className="flex items-center justify-between rounded border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">PMID: {pub.pmid}</p>
                    <p className="text-xs text-gray-600">Project: {pub.coreProjectNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(pub.pubmedUrl, '_blank')}
                      className="h-7 text-xs"
                    >
                      <ExternalLink className="mr-1 h-3 w-3" />
                      PubMed
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && !projects && !publications && (
        <Card>
          <CardContent className="py-8 text-center">
            <Loader2 className="mx-auto mb-4 h-6 w-6 animate-spin" />
            <p className="text-sm text-gray-600">Searching NIH database...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
