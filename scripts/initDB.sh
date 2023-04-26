#!/bin/bash
systemctl start mongod
mongosh pointFiles ./scripts/init.mongo.js
