'use client';

import { useState } from 'react';
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
  Calendar,
  Building2,
  User,
  FileText,
  Loader2,
} from 'lucide-react';

export default function TestResearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<ProjectSearchType>('text');

  const {
    isLoading,
    error,
    projects,
    publications,
    searchProjects,
    searchPublications,
    clearResults,
    searchByPI,
    searchByOrganization,
    getRecentProjects,
  } = useNIHResearch();

  const handleSearch = () => {
    if (!searchQuery.trim() && searchType !== 'recent') {
      return;
    }

    searchProjects({
      type: searchType,
      query: searchQuery.trim() || undefined,
      limit: 10,
    });
  };

  const handleQuickSearch = (type: 'recent' | 'cardiology' | 'stanford' | 'smith') => {
    clearResults();

    switch (type) {
      case 'recent':
        getRecentProjects(10);
        break;
      case 'cardiology':
        searchProjects({ type: 'focus', query: 'cardiology', limit: 10 });
        break;
      case 'stanford':
        searchByOrganization('stanford', 10);
        break;
      case 'smith':
        searchByPI('smith', 10);
        break;
    }
  };

  const handleGetPublications = (projectNumber: string) => {
    searchPublications({ projectNumber, limit: 5 });
  };

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">NIH RePORTER API Test</h1>
        <p className="text-gray-600">
          Test the NIH RePORTER integration with real research data from the National Institutes of
          Health.
        </p>
      </div>

      {/* Search Interface */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Research Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <select
              value={searchType}
              onChange={e => setSearchType(e.target.value as ProjectSearchType)}
              className="rounded-md border bg-white px-3 py-2"
            >
              <option value="text">Text Search</option>
              <option value="pi">Principal Investigator</option>
              <option value="organization">Organization</option>
              <option value="focus">Focus Area</option>
              <option value="recent">Recent Projects</option>
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
              onClick={handleSearch}
              disabled={isLoading || (!searchQuery.trim() && searchType !== 'recent')}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search
            </Button>
          </div>

          {/* Quick Search Buttons */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-500">Quick searches:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSearch('recent')}
              disabled={isLoading}
            >
              Recent Projects
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSearch('cardiology')}
              disabled={isLoading}
            >
              Cardiology Research
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSearch('stanford')}
              disabled={isLoading}
            >
              Stanford Projects
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSearch('smith')}
              disabled={isLoading}
            >
              PI: Smith
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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Research Projects ({projects.pagination.total} found)</span>
              <Button variant="outline" size="sm" onClick={clearResults}>
                Clear Results
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.projects?.map(project => (
                <div key={project.id} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="mb-1 text-lg font-semibold">{project.title}</h3>
                      <p className="mb-2 text-sm text-gray-600">{project.abstract}</p>
                    </div>
                    <div className="flex gap-2">
                      {project.isMedTech && <Badge variant="secondary">MedTech</Badge>}
                      {project.isActive && <Badge variant="default">Active</Badge>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">Principal Investigator</p>
                        <p className="text-gray-600">{project.principalInvestigators}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">Organization</p>
                        <p className="text-gray-600">{project.organization.name}</p>
                        <p className="text-xs text-gray-500">
                          {project.organization.city}, {project.organization.state}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">Funding</p>
                        <p className="text-gray-600">{project.funding.formattedAmount}</p>
                        <p className="text-xs text-gray-500">FY {project.funding.fiscalYear}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-gray-600">
                          {project.funding.formattedStartDate} - {project.funding.formattedEndDate}
                        </p>
                      </div>
                    </div>
                  </div>

                  {project.focusAreas.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium">Focus Areas:</p>
                      <div className="flex flex-wrap gap-1">
                        {project.focusAreas.map((area, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Project: {project.projectNumber} | Activity: {project.activityCode} | Agency:{' '}
                      {project.agency.code}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGetPublications(project.id)}
                        disabled={isLoading}
                      >
                        <FileText className="mr-1 h-4 w-4" />
                        Publications
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(project.detailUrl, '_blank')}
                      >
                        <ExternalLink className="mr-1 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {projects.pagination.hasMore && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Showing {projects.pagination.limit} of {projects.pagination.total} results. Use
                  pagination parameters to load more.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Publications Results */}
      {publications && (
        <Card>
          <CardHeader>
            <CardTitle>Publications ({publications.pagination.total} found)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {publications.publications?.map(pub => (
                <div
                  key={pub.pmid}
                  className="flex items-center justify-between rounded border p-3"
                >
                  <div>
                    <p className="font-medium">PMID: {pub.pmid}</p>
                    <p className="text-sm text-gray-600">
                      Project: {pub.coreProjectNumber} | App ID: {pub.applicationId}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(pub.pubmedUrl, '_blank')}
                    >
                      <ExternalLink className="mr-1 h-4 w-4" />
                      PubMed
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(pub.reporterUrl, '_blank')}
                    >
                      <ExternalLink className="mr-1 h-4 w-4" />
                      RePORTER
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
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
            <p className="text-gray-600">Searching NIH RePORTER database...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
