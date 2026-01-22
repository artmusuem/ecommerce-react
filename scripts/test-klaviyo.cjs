/**
 * Test Klaviyo API subscription
 */

const apiKey = process.env.KLAVIYO_API_KEY;
const listId = process.env.KLAVIYO_LIST_ID;

console.log('API Key:', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET');
console.log('List ID:', listId || 'NOT SET');

if (!apiKey || !listId) {
  console.error('Missing KLAVIYO_API_KEY or KLAVIYO_LIST_ID');
  process.exit(1);
}

async function test() {
  const url = 'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/';

  const body = {
    data: {
      type: 'profile-subscription-bulk-create-job',
      attributes: {
        profiles: {
          data: [{
            type: 'profile',
            attributes: {
              email: 'test-script@example.com',
              subscriptions: {
                email: {
                  marketing: { consent: 'SUBSCRIBED' }
                }
              }
            }
          }]
        },
        historical_import: false
      },
      relationships: {
        list: {
          data: { type: 'list', id: listId }
        }
      }
    }
  };

  console.log('\nSending request to Klaviyo...');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Klaviyo-API-Key ${apiKey}`,
      'revision': '2024-10-15',
    },
    body: JSON.stringify(body),
  });

  console.log('Status:', response.status);
  const text = await response.text();
  console.log('Response:', text || '(empty - success)');

  if (response.ok || response.status === 202) {
    console.log('\n✓ SUCCESS - Subscription created');
  } else {
    console.log('\n✗ FAILED');
  }
}

test().catch(console.error);
