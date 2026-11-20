"""Static server with SPA fallback, used only to preview the exported web build."""

import http.server
import os
import socketserver
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "dist"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8090


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        path = self.path.split("?")[0]
        candidate = ROOT / path.lstrip("/")
        if path != "/" and not candidate.exists() and not path.startswith("/_expo"):
            self.path = "/index.html"
        return super().do_GET()

    def log_message(self, *args):
        pass


os.chdir(ROOT)
with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    print(f"servindo {ROOT} em http://127.0.0.1:{PORT}")
    httpd.serve_forever()
