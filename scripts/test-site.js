const http = require('http');

async function testSite() {
  console.log('--- 1. Testing GET / ---');
  const resHome = await fetch('http://localhost:3000/');
  console.log('GET / status:', resHome.status);
  const html = await resHome.text();
  
  // Extract all scripts
  const scripts = [...html.matchAll(/src="(\/_next\/[^"]+)"/g)].map(m => m[1]);
  console.log(`Checking ${scripts.length} JS bundle chunks...`);
  let chunksOk = true;
  for (const s of scripts) {
    const r = await fetch('http://localhost:3000' + s);
    if (r.status !== 200) {
      console.error(`FAILED chunk: ${s} returned ${r.status}`);
      chunksOk = false;
    }
  }
  if (chunksOk) console.log('All JS chunks returned 200 OK!');

  console.log('\n--- 2. Testing API /api/health ---');
  const resHealth = await fetch('http://localhost:3000/api/health');
  console.log('/api/health status:', resHealth.status);
  console.log('/api/health body:', await resHealth.text());

  console.log('\n--- 3. Testing POST /api/generate ---');
  const resGen = await fetch('http://localhost:3000/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: 'Fitness coach helping office workers lose belly fat with 20min home workouts.',
      language: 'en'
    })
  });
  console.log('POST /api/generate status:', resGen.status);
  const genData = await resGen.json();
  console.log('POST /api/generate response:', JSON.stringify(genData, null, 2).substring(0, 500));

  if (genData.slug && genData.edit_token) {
    console.log(`\n--- 4. Testing GET /edit/${genData.slug}?t=${genData.edit_token} ---`);
    const resEdit = await fetch(`http://localhost:3000/edit/${genData.slug}?t=${genData.edit_token}`);
    console.log('GET /edit status:', resEdit.status);

    console.log(`\n--- 5. Testing GET /api/store/${genData.slug} with x-edit-token ---`);
    const resStore = await fetch(`http://localhost:3000/api/store/${genData.slug}`, {
      headers: { 'x-edit-token': genData.edit_token }
    });
    console.log('GET /api/store status:', resStore.status);
    console.log('GET /api/store body:', await resStore.text());
  }
}

testSite().catch(console.error);
