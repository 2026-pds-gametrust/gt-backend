#!/usr/bin/env bash
# Rebuild search_documents for PUBLISHED listings and synonym projections from taxonomy
curl -X POST 'http://localhost:3000/search/reconcile' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'
