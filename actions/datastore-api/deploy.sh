#!/bin/bash

NAME=${1:-remember-the-pineapple-generic}/datastore-api
PARAMETERS=`echo -n $(cat parameters.json)`

zip -r action.zip *

wsk action list | grep ${NAME} > /dev/null && wsk action delete ${NAME} || true
wsk action update ${NAME} \
  --kind nodejs:6 action.zip \
  -a description 'An OpenWhisk action which handles the access to the mongo db store for the application' \
  -a parameters "$PARAMETERS"

rm action.zip