#!/usr/bin/env bash
# Register a marketplace member and issue a session
curl -X POST 'http://localhost:3000/auth/register' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "id": "string",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "cpf": "string",
  "birthDate": "string",
  "password": "string"
}'
