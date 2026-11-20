export default {
  async fetch(request, env, ctx) {
    // Serve index.html for all routes (SPA/PWA)
    if (request.method === 'GET') {
      return new Response(
        await fetch('index.html', { headers: { 'Accept': 'text/html' } }),
        {
          headers: {
            'content-type': 'text/html',
            'cache-control': 'public, max-age=300'
          }
        }
      );
    }
    return new Response('Not Found', { status: 404 });
  }
};