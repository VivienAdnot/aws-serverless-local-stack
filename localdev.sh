#!/usr/bin/env bash

BUCKET_NAME="bucket-notes-stack-local"

sam local start-api \
  --template sam-template.yaml \
  --parameter-overrides \
    ParameterKey=S3BucketName,ParameterValue=$BUCKET_NAME \
  --region eu-west-3 \
  2>&1 | tr "\r" "\n"