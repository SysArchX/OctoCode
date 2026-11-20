"""Serve any folder of static files with SPA fallback. Used only for previews."""

import http.server
import os
import socketserver
import sys
from pathlib import Path

ROOT = Path(sys.argv[1]).resolve()
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8091


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        path = self.path.split("?")[0]
        candidate = ROOT / path.lstrip("/")
        if path != "/" and not candidate.exists() and "." not in path.split("/")[-1]:
            self.path = "/index.html"
        return super().do_GET()

    def log_message(self, *args):
        pass


os.chdir(ROOT)
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    print(f"servindo {ROOT} em http://127.0.0.1:{PORT}")
    httpd.serve_forever()
