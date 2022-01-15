#!/bin/bash
cd client;
echo running npm run build
npm run build;
cd ..
echo Race Aide is built!
node index.js
