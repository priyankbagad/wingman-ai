export async function fetchNews(company) {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch('https://google.serper.dev/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify({ q: `${company} news`, num: 3 }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.news ?? []).slice(0, 3).map((item) => ({
      title: item.title,
      snippet: item.snippet,
      date: item.date,
      url: item.link,
    }));
  } catch {
    return [];
  }
}
