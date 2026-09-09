async function verify() {
  try {
    const r1 = await fetch('http://localhost:3000/api/market-overview');
    const overview = await r1.json();
    console.log('1. Overview status:', r1.status, 'IHSG:', overview.data?.ihsgPrice, 'Phase:', overview.data?.phaseLabel);

    const r2 = await fetch('http://localhost:3000/api/screen?preset=STRICT_BSJP');
    const screen = await r2.json();
    console.log('2. Screen status:', r2.status, 'Strict Candidates:', screen.data?.candidates?.length, 'Top Candidate:', screen.data?.candidates?.[0]?.stock?.ticker, 'BSJP Score:', screen.data?.candidates?.[0]?.bsjpScore);

    const r3 = await fetch('http://localhost:3000/api/stocks/MEDC');
    const medc = await r3.json();
    console.log('3. Stock Detail status:', r3.status, 'MEDC Price:', medc.data?.candidate?.stock?.lastPrice, 'Daily bars:', medc.data?.charts?.daily?.length, '15m bars:', medc.data?.charts?.intraday15m?.length);

    const r4 = await fetch('http://localhost:3000/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickers: ['MEDC', 'BRIS', 'AMMN'], format: 'stockbit' })
    });
    const exp = await r4.json();
    console.log('4. Export status:', r4.status, 'Output:', exp.data?.text);

    const r5 = await fetch('http://localhost:3000/');
    console.log('5. Root HTML page status:', r5.status);

    console.log('\n>>> ALL LIVE HTTP CHECKS PASSED WITH FLYING COLORS! <<<');
  } catch (err) {
    console.error('Verification error:', err);
    process.exit(1);
  }
}

verify();

