#!/usr/local/bin/dumb-init /bin/sh
##!/bin/sh
##!/bin/bash
##!/usr/bin/env bash

echo "start tor network"
service tor start

echo "check tor network status"
service tor status

echo "test curl"
curl --socks5 127.0.0.1:9050 https://ipinfo.io/json

echo "Starting Application"
# exec node main.js
exec pm2-runtime start main.js --name scraper --max-memory-restart 450M