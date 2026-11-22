const BASE_URL = 'http://localhost:3000';

async function testWebsite() {
  console.log('========================================================');
  console.log('🌐 FULL END-TO-END WEBSITE SYSTEM TEST (PHASE 6)');
  console.log('========================================================\n');

  let passed = 0;
  let total = 0;

  async function assertCheck(name: string, fn: () => Promise<boolean>) {
    total++;
    process.stdout.write(`Testing: ${name}... `);
    try {
      const ok = await fn();
      if (ok) {
        console.log('✅ PASSED');
        passed++;
      } else {
        console.log('❌ FAILED');
      }
    } catch (err: any) {
      console.log(`❌ FAILED: ${err.message}`);
    }
  }

  // 1. Health Route Check
  await assertCheck('1. GET /api/health (Database Liveness & Cron Keep-Alive)', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    const json = await res.json();
    return res.status === 200 && json.status === 'ok';
  });

  // 2. Home Page Route Check
  await assertCheck('2. GET / (Mobile-First Input Page SSR/HTML Rendering)', async () => {
    const res = await fetch(`${BASE_URL}/`);
    const html = await res.text();
    return res.status === 200 && html.includes('AI Storefront Generator') && html.includes('What do you do or teach?');
  });

  // 3. Store Generation Check
  let generatedSlug = '';
  let editToken = '';
  await assertCheck('3. POST /api/generate (Real AI Store Generation with Hinglish)', async () => {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'Fitness coach helping office workers lose belly fat with 20min home workouts and home food.',
        handle: 'fitwithaman',
        language: 'hinglish',
      }),
    });
    const json = await res.json();
    if (res.status === 200 && json.slug && json.edit_token && json.store) {
      generatedSlug = json.slug;
      editToken = json.edit_token;
      return true;
    }
    return false;
  });

  console.log(`   ↳ Active Test Store Created: slug="${generatedSlug}"`);

  // 4. Editor Load Check
  await assertCheck('4. GET /api/store/[slug] (Editor Draft Access with Token)', async () => {
    const res = await fetch(`${BASE_URL}/api/store/${generatedSlug}`, {
      headers: { 'x-edit-token': editToken },
    });
    const json = await res.json();
    return res.status === 200 && json.store && json.store.slug === generatedSlug;
  });

  // 5. Unauthorized Editor Protection Check
  await assertCheck('5. GET /api/store/[slug] (Security: Reject Unauthorized Draft Access)', async () => {
    const res = await fetch(`${BASE_URL}/api/store/${generatedSlug}`);
    return res.status === 401; // Must be rejected without valid token
  });

  // 6. Autosave Edits Check
  await assertCheck('6. PATCH /api/store/[slug] (Debounced Autosave & Theme Switch to Warm)', async () => {
    const res = await fetch(`${BASE_URL}/api/store/${generatedSlug}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-edit-token': editToken,
      },
      body: JSON.stringify({
        display_name: 'Coach Aman (Verified)',
        theme: 'warm',
        bio: {
          headline: 'Fat loss made simple for busy professionals',
          text: 'Custom home workout plans and Indian diet adjustments that actually stick.',
        },
      }),
    });
    const json = await res.json();
    return res.status === 200 && json.ok === true && json.store.theme === 'warm';
  });

  // 7. Single-section AI Regeneration Check
  await assertCheck('7. POST /api/regenerate (Granular Bio Regeneration)', async () => {
    const res = await fetch(`${BASE_URL}/api/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: generatedSlug,
        token: editToken,
        target: 'bio',
        instruction: 'Make it punchier for young bachelors in Bangalore',
        currentStore: {
          niche: 'Fitness',
          language: 'hinglish',
          bio: { headline: 'Old Headline', text: 'Old Text' },
        },
      }),
    });
    const json = await res.json();
    return res.status === 200 && json.data && Boolean(json.data.headline);
  });

  // 8. Publish Store Check
  await assertCheck('8. POST /api/store/[slug]/publish (One-Tap Storefront Publishing)', async () => {
    const res = await fetch(`${BASE_URL}/api/store/${generatedSlug}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-edit-token': editToken,
      },
    });
    const json = await res.json();
    return res.status === 200 && json.ok === true && json.store.status === 'published';
  });

  // 9. Public Storefront SSR Check
  await assertCheck('9. GET /s/[slug] (Public Live SSR Storefront with Theme & Products)', async () => {
    const res = await fetch(`${BASE_URL}/s/${generatedSlug}`);
    const html = await res.text();
    return (
      res.status === 200 &&
      html.includes('Coach Aman (Verified)') &&
      html.includes('₹') &&
      html.includes('Made with AI Storefront')
    );
  });

  // 10. Analytics Tracking Check
  await assertCheck('10. POST /api/events (Lightweight CTA Click & View Event Tracking)', async () => {
    const res = await fetch(`${BASE_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: generatedSlug,
        type: 'cta_click',
        product_id: 'prod_1',
      }),
    });
    const json = await res.json();
    return res.status === 200 && json.ok === true;
  });

  // 11. Friendly 404 Check
  await assertCheck('11. GET /s/non-existent-slug-xyz (Graceful 404 Page without Stack Trace)', async () => {
    const res = await fetch(`${BASE_URL}/s/non-existent-slug-xyz`);
    const html = await res.text();
    return res.status === 404 && html.includes("doesn't exist yet");
  });

  console.log('\n========================================================');
  console.log(`🎯 OVERALL END-TO-END TEST RESULTS: ${passed}/${total} PASSED`);
  console.log('========================================================');

  if (passed === total) {
    console.log('🎉 ALL SYSTEMS OPERATIONAL AND PASSING PRODUCTION CHECKS!');
  } else {
    process.exit(1);
  }
}

testWebsite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
