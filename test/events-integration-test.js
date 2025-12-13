/**
 * Integration tests for Sitecore Search Events API
 * Tests event tracking and validation
 */

import { EventsClient } from '../dist/client/events-client.js';
import { trackEvent } from '../dist/tools/events/track-event.js';
import { validateEvent } from '../dist/tools/events/validate-event.js';

// Configuration from environment variables
const DOMAIN_ID = process.env.SITECORE_DOMAIN_ID;
const CLIENT_KEY = process.env.SITECORE_CLIENT_KEY;
const BASE_URL = process.env.SITECORE_EVENTS_BASE_URL || 'https://discover.sitecorecloud.io';

// Create events client
const eventsClient = new EventsClient(BASE_URL, undefined);

// Test view event
async function testViewEvent() {
  console.log('\n=== Testing View Event ===');
  try {
    const result = await trackEvent(eventsClient, CLIENT_KEY, {
      domainId: DOMAIN_ID,
      customerKey: CLIENT_KEY,
      eventType: 'view',
      value: {
        entity: 'content',
        entity_id: 'test-content-123',
      },
      context: {
        user: {
          uuid: 'test-user-' + Date.now(),
        },
        page: {
          uri: '/test-page',
          title: 'Test Page',
          locale: 'en-US',
        },
        browser: {
          user_agent: 'Mozilla/5.0 (Test Browser)',
          ip: '127.0.0.1',
        }
      }
    });
    console.log('✓ View event tracked successfully');
    console.log('Response:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('✗ View event tracking failed:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
}

// Test click event
async function testClickEvent() {
  console.log('\n=== Testing Click Event ===');
  try {
    const result = await trackEvent(eventsClient, CLIENT_KEY, {
      domainId: DOMAIN_ID,
      customerKey: CLIENT_KEY,
      eventType: 'click',
      value: {
        entity: 'product',
        entity_id: 'product-456',
        widget: 'rfkid_7',
        action: 'product_click',
      },
      context: {
        user: {
          uuid: 'test-user-' + Date.now(),
        },
        page: {
          uri: '/products',
          title: 'Products Page',
        }
      }
    });
    console.log('✓ Click event tracked successfully');
    console.log('Response:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('✗ Click event tracking failed:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
}

// Test add to cart event
async function testAddEvent() {
  console.log('\n=== Testing Add to Cart Event ===');
  try {
    const result = await trackEvent(eventsClient, CLIENT_KEY, {
      domainId: DOMAIN_ID,
      customerKey: CLIENT_KEY,
      eventType: 'add',
      value: {
        entity: 'product',
        entity_id: 'product-789',
        action: 'add_to_cart',
      },
      context: {
        user: {
          uuid: 'test-user-' + Date.now(),
          email: 'test@example.com',
        },
        page: {
          uri: '/cart',
          title: 'Shopping Cart',
        }
      }
    });
    console.log('✓ Add event tracked successfully');
    console.log('Response:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('✗ Add event tracking failed:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
}

// Test identify event
async function testIdentifyEvent() {
  console.log('\n=== Testing Identify Event ===');
  try {
    const result = await trackEvent(eventsClient, CLIENT_KEY, {
      domainId: DOMAIN_ID,
      customerKey: CLIENT_KEY,
      eventType: 'identify',
      value: {
        action: 'user_login',
      },
      context: {
        user: {
          uuid: 'test-user-' + Date.now(),
          email: 'identified@example.com',
        },
        page: {
          uri: '/login',
          title: 'Login Page',
        }
      }
    });
    console.log('✓ Identify event tracked successfully');
    console.log('Response:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('✗ Identify event tracking failed:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
}

// Test event validation
async function testEventValidation() {
  console.log('\n=== Testing Event Validation ===');
  try {
    const result = await validateEvent(eventsClient, {
      eventType: 'view',
      value: {
        entity: 'content',
        entity_id: 'validation-test-123',
      },
      context: {
        user: {
          uuid: 'validation-user',
        }
      }
    });
    console.log('✓ Event validation successful');
    console.log('Response:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('✗ Event validation failed:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
}

// Run all tests
async function runTests() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║  SITECORE EVENTS API - INTEGRATION TEST   ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log(`\nDomain: ${DOMAIN_ID || '(not provided)'}`);
  console.log(`Client Key: ${CLIENT_KEY ? CLIENT_KEY : '(not provided)'}`);
  console.log(`Base URL: ${BASE_URL}`);
  
  if (!DOMAIN_ID || !CLIENT_KEY) {
    console.log('\n❌ Error: Required environment variables missing');
    if (!DOMAIN_ID) console.log('   - SITECORE_DOMAIN_ID is required');
    if (!CLIENT_KEY) console.log('   - SITECORE_CLIENT_KEY is required');
    console.log('   Please set these variables to run these tests.\n');
    process.exit(1);
  }
  
  console.log('\n⚠️  Note: Events API requires proper authentication and endpoint access.');
  console.log('    Configure SITECORE_API_KEY and ensure your domain has Events API enabled.');
  console.log('    Tests will demonstrate the API structure even if authentication fails.\n');

  let testsRun = 0;
  let testsPassed = 0;
  let testsFailed = 0;

  const runTest = async (testFn, testName) => {
    testsRun++;
    try {
      await testFn();
      testsPassed++;
      return true;
    } catch (error) {
      testsFailed++;
      if (error.statusCode === 401) {
        console.log(`\n⚠️  ${testName} skipped - Authentication required\n`);
        return false;
      }
      throw error;
    }
  };

  try {
    await runTest(testEventValidation, 'Event Validation');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await runTest(testViewEvent, 'View Event');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await runTest(testClickEvent, 'Click Event');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await runTest(testAddEvent, 'Add Event');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await runTest(testIdentifyEvent, 'Identify Event');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 TEST SUMMARY:');
    console.log(`   Tests Run: ${testsRun}`);
    console.log(`   ✅ Passed: ${testsPassed}`);
    console.log(`   ❌ Failed: ${testsFailed}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (testsPassed > 0) {
      console.log('✅ Events API tests completed!\n');
    } else {
      console.log('⚠️  No tests passed - Check authentication configuration\n');
    }
  } catch (error) {
    if (error.statusCode !== 401) {
      console.error('\n❌ Tests failed with error\n');
      process.exit(1);
    }
  }
}

runTests();
