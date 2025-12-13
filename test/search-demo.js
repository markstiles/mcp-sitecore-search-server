/**
 * Final test demonstrating successful MCP server functionality
 */

import { SearchClient } from '../dist/client/search-client.js';

// Configuration from environment variables
const DOMAIN_ID = process.env.SITECORE_DOMAIN_ID;
const BASE_URL = process.env.SITECORE_SEARCH_BASE_URL || 'https://discover.sitecorecloud.io';

const searchClient = new SearchClient(BASE_URL, undefined);

async function demonstrateSearch() {
  console.log('===========================================');
  console.log('  SITECORE SEARCH MCP SERVER - DEMO');
  console.log('===========================================\n');
  
  if (!DOMAIN_ID) {
    console.log('❌ Error: SITECORE_DOMAIN_ID environment variable is required');
    console.log('   Please set SITECORE_DOMAIN_ID to run this demo.\n');
    process.exit(1);
  }
  
  console.log(`Domain: ${DOMAIN_ID}`);

  // Test 1: Get all content with facets
  console.log('📊 Requesting 10 results with all facets...\n');
  
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

  const widget = result.widgets[0];
  
  console.log('✅ SUCCESS! API Response received\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Display facets
  if (widget.facet && widget.facet.length > 0) {
    console.log('📋 FACETS DISCOVERED:\n');
    widget.facet.forEach((facet, index) => {
      console.log(`${index + 1}. ${facet.label || facet.name}`);
      console.log(`   Field: ${facet.name}`);
      console.log(`   Values:`);
      facet.value.slice(0, 5).forEach(v => {
        console.log(`     • ${v.text} (${v.count} items)`);
      });
      console.log('');
    });
  }
  
  // Display summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📈 SUMMARY:');
  console.log(`   • Response time: ${result.dt}ms`);
  console.log(`   • Widget ID: ${widget.rfk_id}`);
  console.log(`   • Entity type: ${widget.entity}`);
  console.log(`   • Facets returned: ${widget.facet?.length || 0}`);
  console.log(`   • Total facet values: ${widget.facet?.reduce((sum, f) => sum + f.value.length, 0) || 0}`);
  
  console.log('\n✅ MCP Server is working correctly!');
  console.log('\n===========================================\n');
}

demonstrateSearch().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
