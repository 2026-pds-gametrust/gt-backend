#!/usr/bin/env bash
# Revoke this session's refresh token and invalidate its access token
curl -X POST 'http://localhost:3000/auth/logout' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'
