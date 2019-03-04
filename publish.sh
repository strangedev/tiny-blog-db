#!/bin/sh
yarn run build
yarn run codecov -t "${CODECOV_TOKEN}"
cp package.json build/
yarn publish build