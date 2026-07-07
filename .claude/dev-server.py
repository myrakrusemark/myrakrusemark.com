"""Static dev server with caching disabled, so edited ES modules are
always re-fetched on reload."""
import os
from http.server import SimpleHTTPRequestHandler, test


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8380))
    test(NoCacheHandler, port=port, bind='127.0.0.1')
