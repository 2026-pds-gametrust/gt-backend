#!/usr/bin/env bash
# Find profiles near a GeoJSON point
curl -X GET 'http://localhost:3000/profiles/near?lng=-180&lat=-90&radiusMeters=0&limit=0' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'
