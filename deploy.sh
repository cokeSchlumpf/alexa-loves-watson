#!/bin/bash

PACKAGE=remember-the-pineapple
PACKAGE_GENERIC=${PACKAGE}-generic
PACKAGE_API=${PACKAGE}-api

# Create package if not existing
wsk package create ${PACKAGE_GENERIC} || true
wsk package create ${PACKAGE_API} || true

# Create actions
pushd actions/alexahandler
./deploy.sh ${PACKAGE_GENERIC}
popd

#pushd actions/conversation
#./deploy.sh ${PACKAGE_GENERIC}
#popd

#pushd actions/datastore
#./deploy.sh ${PACKAGE_GENERIC}
#popd

#pushd actions/datastore-api
#./deploy.sh ${PACKAGE_GENERIC}
#popd

# Create package bindings
wsk package delete ${PACKAGE} || true
wsk package bind ${PACKAGE_GENERIC} ${PACKAGE} -P package.parameters.json

# Create a sequence to provide actions as APIs
wsk action update ${PACKAGE_API}/alexahandler \
  --sequence ${PACKAGE}/alexahandler \
  --web true

wsk action update ${PACKAGE_API}/datastore \
  --sequence ${PACKAGE}/datastore-api \
  --web true

# Test
# wsk action invoke ${PACKAGE}/conversation --result -p text "Please add tea to my list"
# wsk action invoke remember-the-pineapple/datastore --result
# curl -v https://openwhisk.ng.bluemix.net/api/v1/web/wellnr_dev/remember-the-pineapple-api/datastore?ehon=olsen
# wsk action invoke ${PACKAGE}/alexahandler --result -p text "Please add tea to my list"
# curl -v https://openwhisk.ng.bluemix.net/api/v1/web/wellnr_dev/remember-the-pineapple-api/alexahandler/

# wsk action invoke remember-the-pineapple/conversation --result -p text "Please add 4 packages of tea to my list" -p userid "0001"

# wsk action invoke remember-the-pineapple/datastore --result -p operation deleteall