/**
 * Simple test script to verify Sitecore Search MCP server functionality
 */

import { SearchClient } from '../dist/client/search-client.js';
import { executeBasicSearch } from '../dist/tools/search/basic-search.js';
import { executeFacetedSearch } from '../dist/tools/search/faceted-search.js';

// Configuration from environment variables
const DOMAIN_ID = process.env.SITECORE_DOMAIN_ID;
const CLIENT_KEY = process.env.SITECORE_CLIENT_KEY;
const API_KEY = process.env.SITECORE_API_KEY;
const BASE_URL = process.env.SITECORE_SEARCH_BASE_URL || 'https://discover.sitecorecloud.io';

// Create search client
const searchClient = new SearchClient(
  BASE_URL,
  undefined // No auth manager for subdomain authentication
);

// Test basic search
async function testBasicSearch() {
  console.log('\n=== Testing Basic Search ===');
  try {
    const result = await executeBasicSearch(searchClient, {
      domainId: DOMAIN_ID,
      rfkId: 'rfkid_7',
      entity: 'content',
      keyphrase: 'test',
      limit: 10
    });
    console.log('✓ Basic search successful');
    console.log('Results:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('✗ Basic search failed:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
}

// Test faceted search with all facets requested
async function testFacetedSearch() {
  console.log('\n=== Testing Faceted Search with All Facets ===');
  try {
    // Request with facet.all=true to get all configured facets
    const result = await searchClient.search(DOMAIN_ID, {
      widget: {
        items: [
          {
            rfk_id: 'rfkid_7',
            entity: 'content',
            search: {
              limit: 10,
              offset: 0,
              facet: {
                all: true,
                max: 10
              }
            }
          }
        ]
      }
    });
    console.log('✓ Faceted search successful');
    console.log('\nFull Results:', JSON.stringify(result, null, 2));
    
    // Check for content items
    const widget = result.widgets?.[0];
    if (widget?.content) {
      console.log('\n✓ Content items found:', widget.content.length);
      console.log('First item:', JSON.stringify(widget.content[0], null, 2));
    } else {
      console.log('\n⚠ No content items in response');
    }
    
    // Check for facets
    if (widget?.facet) {
      console.log('\n✓ Facets found:', widget.facet.length);
      widget.facet.forEach(f => {
        console.log(`  - ${f.name}: ${f.value?.length || 0} values`);
      });
    } else {
      console.log('\n⚠ No facets in response');
    }
    
    return result;
  } catch (error) {
    console.error('✗ Faceted search failed:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
}

// Run tests
async function runTests() {
  if (!DOMAIN_ID) {
    console.error('\n❌ Error: SITECORE_DOMAIN_ID environment variable is required');
    console.error('   Please set SITECORE_DOMAIN_ID to run these tests.\n');
    process.exit(1);
  }

  try {
    await testBasicSearch();
    await testFacetedSearch();
    console.log('\n✓ All tests completed successfully!\n');
  } catch (error) {
    console.error('\n✗ Tests failed\n');
    process.exit(1);
  }
}

runTests();
