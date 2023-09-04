#!/usr/bin/env bash

BUCKET_NAME="bucket-notes-stack-local"

sam deploy \
  --template-file sam-template.yaml \
  --stack-name StackLocal \
  --parameter-overrides \
    ParameterKey=BucketName,ParameterValue=$BUCKET_NAME \
  --region eu-west-3 \
  --capabilities CAPABILITY_IAM \
  --resolve-s3
