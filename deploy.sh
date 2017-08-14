#!/bin/bash

PACKAGE=remember-the-pineapple
PACKAGE_GENERIC=${PACKAGE}-generic

# Create package if not existing
wsk package create ${PACKAGE_GENERIC} || true

# Create actions
pushd actions/conversation
./deploy.sh ${PACKAGE_GENERIC}
popd

# Create package bindings
wsk package delete ${PACKAGE} || true
wsk package bind ${PACKAGE_GENERIC} ${PACKAGE} -P package.parameters.json

# Test
wsk action invoke ${PACKAGE}/conversation --result -p text "Please add tea to my list"