#!/usr/bin/env bash
# Lexical search over published listing documents
curl -X GET 'http://localhost:3000/search?q=string&categoryId=string&filters=string&userId=string' \
  -H 'Accept: application/json'
