#!/bin/bash

PACKAGE=remember-the-pineapple
PACKAGE_GENERIC=${PACKAGE}-generic
PACKAGE_API=${PACKAGE}-api

# Create package if not existing
wsk package create ${PACKAGE_GENERIC} || true
wsk package create ${PACKAGE_API} || true

# Create actions
#pushd actions/conversation
#./deploy.sh ${PACKAGE_GENERIC}
#popd

# Create actions
pushd actions/contextstore
./deploy.sh ${PACKAGE_GENERIC}
popd

# Create package bindings
wsk package delete ${PACKAGE} || true
wsk package bind ${PACKAGE_GENERIC} ${PACKAGE} -P package.parameters.json

# Create a sequence to provide actions as APIs
wsk action update remember-the-pineapple-api/contextstore \
  --sequence remember-the-pineapple/contextstore \
  --web true

# Test
wsk action invoke ${PACKAGE}/conversation --result -p text "Please add tea to my list"
wsk action invoke remember-the-pineapple/contextstore --result -p text "Please add tea to my list"

curl -v https://openwhisk.ng.bluemix.net/api/v1/web/wellnr_dev/remember-the-pineapple-api/contextstore/