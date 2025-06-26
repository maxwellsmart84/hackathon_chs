'use client';

import { useState, useEffect, useCallback } from 'react';
import useNIHResearch from '@/lib/hooks/useNIHResearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  ExternalLink,
  DollarSign,
  Building2,
  User,
  FileText,
  Loader2,
  RefreshCw,
  X,
  Plus,
  MapPin,
  Target,
} from 'lucide-react';
import { CreateStartup } from '@/lib/db/schema-types';

interface NIHResearchSectionProps {
  startupData?: CreateStartup;
}

interface SearchTag {
  id: string;
  type: 'text' | 'pi' | 'organization' | 'focus' | 'state' | 'city';
  label: string;
  value: string;
}

// US States and Territories for dropdown
const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'VI', name: 'Virgin Islands' },
  { code: 'GU', name: 'Guam' },
  { code: 'AS', name: 'American Samoa' },
  { code: 'MP', name: 'Northern Mariana Islands' },
];

export default function NIHResearchSection({ startupData }: NIHResearchSectionProps) {
  const [searchTags, setSearchTags] = useState<SearchTag[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentSearchType, setCurrentSearchType] = useState<SearchTag['type']>('text');
  const [hasAutoSearched, setHasAutoSearched] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('');

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

  const performAutoSearch = useCallback(async () => {
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
  }, [startupData, searchByLocation, searchByFocusArea, getRecentProjects]);

  // Auto-search based on startup data when component loads
  useEffect(() => {
    if (startupData && !hasAutoSearched) {
      performAutoSearch();
      setHasAutoSearched(true);
    }
  }, [startupData, hasAutoSearched, performAutoSearch]);

  const addSearchTag = () => {
    if (!currentInput.trim()) return;

    const newTag: SearchTag = {
      id: Math.random().toString(36).substr(2, 9),
      type: currentSearchType,
      label: getTagLabel(currentSearchType, currentInput.trim()),
      value: currentInput.trim(),
    };

    setSearchTags(prev => [...prev, newTag]);
    setCurrentInput('');
  };

  const removeSearchTag = (tagId: string) => {
    setSearchTags(prev => prev.filter(tag => tag.id !== tagId));
  };

  const getTagLabel = (type: SearchTag['type'], value: string): string => {
    const typeLabels = {
      text: 'Text',
      pi: 'PI',
      organization: 'Org',
      focus: 'Focus',
      state: 'State',
      city: 'City',
    };
    return `${typeLabels[type]}: ${value}`;
  };

  const getTagColor = (type: SearchTag['type']): string => {
    const colors = {
      text: 'bg-blue-100 text-blue-800',
      pi: 'bg-green-100 text-green-800',
      organization: 'bg-purple-100 text-purple-800',
      focus: 'bg-orange-100 text-orange-800',
      state: 'bg-red-100 text-red-800',
      city: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type];
  };

  const getSearchTypeIcon = (type: SearchTag['type']) => {
    const icons = {
      text: Search,
      pi: User,
      organization: Building2,
      focus: Target,
      state: MapPin,
      city: MapPin,
    };
    return icons[type];
  };

  const buildSearchQuery = () => {
    if (searchTags.length === 0) {
      return { searchParams: null, description: 'Show recent NIH projects', searchType: 'recent' };
    }

    // Categorize all tags
    const textTags = searchTags.filter(tag => tag.type === 'text');
    const piTags = searchTags.filter(tag => tag.type === 'pi');
    const orgTags = searchTags.filter(tag => tag.type === 'organization');
    const focusTags = searchTags.filter(tag => tag.type === 'focus');
    const stateTags = searchTags.filter(tag => tag.type === 'state');
    const cityTags = searchTags.filter(tag => tag.type === 'city');

    // Build comprehensive search parameters
    const hasLocation = stateTags.length > 0 || cityTags.length > 0;
    const hasFocus = focusTags.length > 0;
    const hasText = textTags.length > 0;
    const hasPI = piTags.length > 0;
    const hasOrg = orgTags.length > 0;

    // Determine best search strategy and build query
    let searchType: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchParams: any = { limit: 15 };
    let description: string;

    if (hasLocation && hasFocus) {
      // Geographic + Focus: Most specific search
      searchType = 'location';
      searchParams.type = 'location';

      // Only include non-empty location parameters
      if (stateTags.length > 0) {
        searchParams.states = stateTags.map(tag => tag.value).join(',');
      }
      if (cityTags.length > 0) {
        searchParams.cities = cityTags.map(tag => tag.value).join(',');
      }

      searchParams.focusArea = focusTags.map(tag => tag.value).join(' ');

      // Add text terms as additional context
      if (hasText) {
        searchParams.query = textTags.map(tag => tag.value).join(' ');
      }

      description = `Search for ${focusTags.map(t => t.value).join(', ')} research in ${[...stateTags, ...cityTags].map(t => t.value).join(', ')}${hasText ? ` related to "${textTags.map(t => t.value).join(', ')}"` : ''}`;
    } else if (hasFocus && hasText) {
      // Focus + Text: Research area with specific terms
      searchType = 'focus';
      searchParams.type = 'focus';
      searchParams.query = `${focusTags.map(tag => tag.value).join(' ')} ${textTags.map(tag => tag.value).join(' ')}`;

      description = `Search for ${focusTags.map(t => t.value).join(', ')} research related to "${textTags.map(t => t.value).join(', ')}"`;
    } else if (hasPI && (hasText || hasFocus)) {
      // PI + Context: Investigator with research focus
      searchType = 'pi';
      searchParams.type = 'pi';
      searchParams.query = piTags[0].value;

      // Note: PI search doesn't support additional filters in NIH API, but we can mention them
      const contextTerms = [...textTags, ...focusTags].map(t => t.value);
      description = `Search for projects by ${piTags.map(t => t.value).join(', ')}${contextTerms.length > 0 ? ` (context: ${contextTerms.join(', ')})` : ''}`;
    } else if (hasOrg && (hasText || hasFocus)) {
      // Organization + Context
      searchType = 'organization';
      searchParams.type = 'organization';
      searchParams.query = orgTags[0].value;

      const contextTerms = [...textTags, ...focusTags].map(t => t.value);
      description = `Search for projects at ${orgTags.map(t => t.value).join(', ')}${contextTerms.length > 0 ? ` (context: ${contextTerms.join(', ')})` : ''}`;
    } else if (hasLocation) {
      // Location only
      searchType = 'location';
      searchParams.type = 'location';

      // Only include non-empty location parameters
      if (stateTags.length > 0) {
        searchParams.states = stateTags.map(tag => tag.value).join(',');
      }
      if (cityTags.length > 0) {
        searchParams.cities = cityTags.map(tag => tag.value).join(',');
      }

      description = `Search for research in ${[...stateTags, ...cityTags].map(t => t.value).join(', ')}`;
    } else if (hasFocus) {
      // Focus only
      searchType = 'focus';
      searchParams.type = 'focus';
      searchParams.query = focusTags.map(tag => tag.value).join(' ');

      description = `Search for ${focusTags.map(t => t.value).join(', ')} research`;
    } else if (hasPI) {
      // PI only
      searchType = 'pi';
      searchParams.type = 'pi';
      searchParams.query = piTags[0].value;

      description = `Search for projects by ${piTags.map(t => t.value).join(', ')}`;
    } else if (hasOrg) {
      // Organization only
      searchType = 'organization';
      searchParams.type = 'organization';
      searchParams.query = orgTags[0].value;

      description = `Search for projects at ${orgTags.map(t => t.value).join(', ')}`;
    } else if (hasText) {
      // Text only
      searchType = 'text';
      searchParams.type = 'text';
      searchParams.query = textTags.map(tag => tag.value).join(' ');

      description = `Search for projects related to "${textTags.map(t => t.value).join(', ')}"`;
    } else {
      // Fallback
      searchType = 'recent';
      searchParams.type = 'recent';
      description = 'Show recent NIH projects';
    }

    return { searchParams, description, searchType };
  };

  const handleSearch = () => {
    const { searchParams, searchType } = buildSearchQuery();

    if (searchType === 'recent' || !searchParams) {
      getRecentProjects(15);
    } else {
      searchProjects(searchParams);
    }
  };

  const handleRefreshRecommendations = () => {
    setHasAutoSearched(false);
    setSearchTags([]);
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

  const addQuickTag = (type: SearchTag['type'], value: string) => {
    const newTag: SearchTag = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: getTagLabel(type, value),
      value,
    };
    setSearchTags(prev => [...prev, newTag]);
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

      {/* Modern Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4" />
            Search NIH Database
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input with Type Selector */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <select
                value={currentSearchType}
                onChange={e => setCurrentSearchType(e.target.value as SearchTag['type'])}
                className="min-w-[120px] rounded-md border bg-white px-3 py-2 text-sm"
              >
                <option value="text">Text</option>
                <option value="focus">Focus Area</option>
                <option value="pi">Principal Investigator</option>
                <option value="organization">Organization</option>
                <option value="state">State</option>
                <option value="city">City</option>
              </select>

              {currentSearchType === 'state' ? (
                <>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a state..." />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(state => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.name} ({state.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => {
                      if (selectedState) {
                        addQuickTag('state', selectedState);
                        setSelectedState('');
                      }
                    }}
                    disabled={!selectedState}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Input
                    placeholder={`Enter ${currentSearchType === 'pi' ? 'investigator name' : currentSearchType === 'city' ? 'city name' : currentSearchType}...`}
                    value={currentInput}
                    onChange={e => setCurrentInput(e.target.value)}
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSearchTag();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={addSearchTag}
                    disabled={!currentInput.trim()}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Quick Add Buttons */}
          {startupData && (
            <div className="space-y-2">
              <p className="text-xs text-gray-600">Quick add from your profile:</p>
              <div className="flex flex-wrap gap-2">
                {startupData.focusAreas?.slice(0, 3).map((area, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => addQuickTag('focus', area)}
                    className="h-6 text-xs"
                  >
                    <Target className="mr-1 h-3 w-3" />
                    {area}
                  </Button>
                ))}
                {startupData.location && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const locationParts = startupData
                        .location!.split(',')
                        .map(part => part.trim());
                      const potentialState = locationParts[locationParts.length - 1];

                      // Find matching state code from our list
                      const matchedState = US_STATES.find(
                        state =>
                          state.code === potentialState ||
                          state.name === potentialState ||
                          state.name.toLowerCase() === potentialState.toLowerCase()
                      );

                      if (matchedState) {
                        addQuickTag('state', matchedState.code);
                      } else {
                        // If no match, try to guess common abbreviations
                        const stateCode =
                          potentialState.length <= 3
                            ? potentialState.toUpperCase()
                            : potentialState;
                        addQuickTag('state', stateCode);
                      }
                    }}
                    className="h-6 text-xs"
                  >
                    <MapPin className="mr-1 h-3 w-3" />
                    {startupData.location}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Search Tags */}
          {searchTags.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-600">Search criteria:</p>
              <div className="flex flex-wrap gap-2">
                {searchTags.map(tag => {
                  const Icon = getSearchTypeIcon(tag.type);
                  return (
                    <div
                      key={tag.id}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getTagColor(tag.type)}`}
                    >
                      <Icon className="h-3 w-3" />
                      {tag.label}
                      <button
                        onClick={() => removeSearchTag(tag.id)}
                        className="ml-1 rounded-full p-0.5 hover:bg-black/10"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search Preview */}
          {searchTags.length > 0 && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-start gap-2">
                <Search className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Search Preview</p>
                  <p className="mt-1 text-xs text-blue-700">{buildSearchQuery().description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search Button */}
          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              {searchTags.length === 0 ? 'Show Recent Projects' : 'Search Projects'}
            </Button>
            {searchTags.length > 0 && (
              <Button variant="outline" onClick={() => setSearchTags([])}>
                Clear All
              </Button>
            )}
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
