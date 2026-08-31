"""
Pod routing adapter for the TrustScore Next.js application.

The Kubernetes ingress routes any request prefixed with `/api` to this process
on port 8001, and everything else to the Next.js dev server on port 3000.
Because Next.js serves both pages and API route handlers from a single origin
(port 3000), this lightweight reverse proxy forwards the `/api/*` traffic it
receives back to the Next.js server so the whole app works behind the ingress.
"""
import httpx
from fastapi import FastAPI, Request
from starlette.responses import Response

TARGET = "http://127.0.0.1:3000"

_EXCLUDED_RESPONSE_HEADERS = {
    b"content-encoding",
    b"transfer-encoding",
    b"content-length",
    b"connection",
    b"keep-alive",
}

app = FastAPI(title="TrustScore Ingress Adapter")
client = httpx.AsyncClient(base_url=TARGET, timeout=120.0, follow_redirects=False)


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.api_route(
    "/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
)
async def proxy(request: Request, path: str):
    url = httpx.URL(path="/" + path, query=request.url.query.encode("utf-8"))
    fwd_headers = [(k, v) for (k, v) in request.headers.raw if k.lower() != b"host"]
    body = await request.body()

    upstream = await client.request(
        request.method,
        url,
        headers=fwd_headers,
        content=body,
    )

    resp = Response(content=upstream.content, status_code=upstream.status_code)
    resp.raw_headers = [
        (k, v)
        for (k, v) in upstream.headers.raw
        if k.lower() not in _EXCLUDED_RESPONSE_HEADERS
    ]
    return resp
