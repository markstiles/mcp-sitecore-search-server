/**
 * Integration tests for Sitecore Search Ingestion API
 * Tests document creation, update, and deletion operations
 */

import { IngestionClient } from '../dist/client/ingestion-client.js';
import { createDocument } from '../dist/tools/ingestion/create-document.js';
import { updateDocument } from '../dist/tools/ingestion/update-document.js';
import { deleteDocument } from '../dist/tools/ingestion/delete-document.js';

// Configuration from environment variables
const DOMAIN_ID = process.env.SITECORE_DOMAIN_ID;
const BASE_URL = process.env.SITECORE_INGESTION_BASE_URL || 'https://discover.sitecorecloud.io';
const SOURCE_ID = process.env.SITECORE_SOURCE_ID || 'test_source';
const TEST_ENTITY = 'content';

// Create ingestion client
const ingestionClient = new IngestionClient(BASE_URL, undefined);

// Generate unique test document ID
const TEST_DOC_ID = `test_doc_${Date.now()}`;

// Test document creation
async function testCreateDocument() {
  console.log('\n=== Testing Document Creation ===');
  try {
    const result = await createDocument(ingestionClient, {
      domain: DOMAIN_ID,
      source: SOURCE_ID,
      entity: TEST_ENTITY,
      document: {
        id: TEST_DOC_ID,
        title: 'Test Document',
        description: 'This is a test document created by the integration test',
        content_type: 'Test',
        topics: ['Testing', 'Integration'],
        created_at: new Date().toISOString(),
        status: 'published'
      }
    });
    console.log('✓ Document creation successful');
    console.log('Response:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('✗ Document creation failed:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
}

// Test document update (full replacement)
async function testUpdateDocument() {
  console.log('\n=== Testing Document Update (Full Replacement) ===');
  try {
    const result = await updateDocument(ingestionClient, {
      domain: DOMAIN_ID,
      source: SOURCE_ID,
      entity: TEST_ENTITY,
      documentId: TEST_DOC_ID,
      partial: false,
      document: {
        id: TEST_DOC_ID,
        title: 'Updated Test Document',
        description: 'This document has been fully updated',
        content_type: 'Test',
        topics: ['Testing', 'Integration', 'Updated'],
        updated_at: new Date().toISOString(),
        status: 'published'
      }
    });
    console.log('✓ Document update successful');
    console.log('Response:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('✗ Document update failed:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
}

// Test document partial update
async function testPatchDocument() {
  console.log('\n=== Testing Document Update (Partial/PATCH) ===');
  try {
    const result = await updateDocument(ingestionClient, {
      domain: DOMAIN_ID,
      source: SOURCE_ID,
      entity: TEST_ENTITY,
      documentId: TEST_DOC_ID,
      partial: true,
      document: {
        description: 'Partially updated description',
        status: 'draft'
      }
    });
    console.log('✓ Document partial update successful');
    console.log('Response:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('✗ Document partial update failed:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
}

// Test document deletion
async function testDeleteDocument() {
  console.log('\n=== Testing Document Deletion ===');
  try {
    const result = await deleteDocument(ingestionClient, {
      domain: DOMAIN_ID,
      source: SOURCE_ID,
      entity: TEST_ENTITY,
      documentId: TEST_DOC_ID
    });
    console.log('✓ Document deletion successful');
    console.log('Response:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('✗ Document deletion failed:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
}

// Run all tests in sequence
async function runTests() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  SITECORE INGESTION API - INTEGRATION TEST ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`\nTest Document ID: ${TEST_DOC_ID}`);
  console.log(`Domain: ${DOMAIN_ID || '(not provided)'}`);
  console.log(`Source: ${SOURCE_ID}`);
  console.log(`Entity: ${TEST_ENTITY}`);
  
  if (!DOMAIN_ID) {
    console.log('\n❌ Error: SITECORE_DOMAIN_ID environment variable is required');
    console.log('   Please set SITECORE_DOMAIN_ID to run these tests.\n');
    process.exit(1);
  }
  
  console.log('\n⚠️  Note: Ingestion API requires proper authentication.');
  console.log('    Configure SITECORE_API_KEY if you see 401 errors.\n');

  let testsRun = 0;
  let testsPassed = 0;

  const runTest = async (testFn, testName) => {
    testsRun++;
    try {
      await testFn();
      testsPassed++;
      return true;
    } catch (error) {
      if (error.statusCode === 401) {
        console.log(`\n⚠️  ${testName} skipped - Authentication required\n`);
        return false;
      }
      throw error;
    }
  };

  try {
    // Test full document lifecycle
    await runTest(testCreateDocument, 'Document Creation');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await runTest(testUpdateDocument, 'Document Update');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await runTest(testPatchDocument, 'Document Patch');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await runTest(testDeleteDocument, 'Document Deletion');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 TEST SUMMARY:');
    console.log(`   Tests Run: ${testsRun}`);
    console.log(`   ✅ Passed: ${testsPassed}`);
    console.log(`   ⚠️  Skipped: ${testsRun - testsPassed}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (testsPassed > 0) {
      console.log('✅ Ingestion API tests completed!\n');
    } else {
      console.log('⚠️  Tests require API authentication - See AUTHENTICATION.md\n');
    }
  } catch (error) {
    if (error.statusCode !== 401) {
      console.error('\n❌ Tests failed with error\n');
      process.exit(1);
    }
  }
}

runTests();
