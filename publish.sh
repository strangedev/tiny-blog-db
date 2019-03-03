#!/bin/sh
yarn run build
cp package.json build/
yarn publish build