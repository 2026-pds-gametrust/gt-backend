#!/usr/bin/env bash
# Bootstrap LocalStack SNS topic + SQS queue for GamerTrust domain events (E22).
# Requires: AWS CLI, LocalStack on AWS_ENDPOINT_URL (default http://localhost:4566)
#
# Topology mirrors what SqsEventPublisher actually implements: a SINGLE bus topic
# (SNS_TOPIC_ARN) carrying every event type, with `eventType` as a MessageAttribute.
# DomainEventRouter dispatches by eventType in-process and ignores unknown types,
# so one consumer queue is enough. RawMessageDelivery is mandatory: without it SNS
# wraps the body and SqsEventConsumer's JSON.parse yields the wrapper instead of the
# IEventEnvelope, leaving eventType undefined and the message silently discarded.
set -euo pipefail

ENDPOINT="${AWS_ENDPOINT_URL:-http://localhost:4566}"
REGION="${AWS_REGION:-us-east-1}"
ENV_NAME="${GT_ENV:-local}"
PREFIX="gt-${ENV_NAME}"
TOPIC_NAME="${PREFIX}-events"
QUEUE_NAME="${PREFIX}-all-events"
DLQ_NAME="${QUEUE_NAME}-dlq"
PUBLIC_BUCKET="${S3_PUBLIC_BUCKET:-gt-media-public}"
RESTRICTED_BUCKET="${S3_RESTRICTED_BUCKET:-gt-media-restricted}"

export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-test}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-test}"

aws_local() {
  aws --endpoint-url="$ENDPOINT" --region "$REGION" "$@"
}

echo "Bootstrapping messaging on $ENDPOINT (prefix=$PREFIX)..."

topic_arn=$(aws_local sns create-topic --name "$TOPIC_NAME" --query TopicArn --output text)
echo "SNS topic: $TOPIC_NAME"

aws_local sqs create-queue --queue-name "$DLQ_NAME" >/dev/null
dlq_url=$(aws_local sqs get-queue-url --queue-name "$DLQ_NAME" --query QueueUrl --output text)
dlq_arn=$(aws_local sqs get-queue-attributes --queue-url "$dlq_url" \
  --attribute-names QueueArn --query 'Attributes.QueueArn' --output text)

queue_url=$(aws_local sqs create-queue \
  --queue-name "$QUEUE_NAME" \
  --attributes "{\"RedrivePolicy\":\"{\\\"deadLetterTargetArn\\\":\\\"${dlq_arn}\\\",\\\"maxReceiveCount\\\":\\\"5\\\"}\"}" \
  --query QueueUrl --output text)
queue_arn=$(aws_local sqs get-queue-attributes --queue-url "$queue_url" \
  --attribute-names QueueArn --query 'Attributes.QueueArn' --output text)
echo "SQS queue: $QUEUE_NAME (+ dlq, maxReceiveCount=5)"

subscription_arn=$(aws_local sns subscribe \
  --topic-arn "$topic_arn" \
  --protocol sqs \
  --notification-endpoint "$queue_arn" \
  --query SubscriptionArn --output text)

# Mandatory: deliver the raw IEventEnvelope, not the SNS wrapper.
aws_local sns set-subscription-attributes \
  --subscription-arn "$subscription_arn" \
  --attribute-name RawMessageDelivery \
  --attribute-value true
echo "Subscribed ${QUEUE_NAME} <- ${TOPIC_NAME} (RawMessageDelivery=true)"

# Browsers PUT the binary straight to the bucket on the presigned URL, so the bucket
# itself needs CORS — without it the upload fails with an opaque "Network Error" in the
# app while POST /media/uploads looks perfectly healthy.
CORS_ORIGINS_JSON=$(printf '"%s"' "${CORS_ALLOWED_ORIGINS:-http://localhost:5173,http://127.0.0.1:5173}" \
  | sed 's/,/","/g')
cors_config=$(cat <<JSON
{"CORSRules":[{"AllowedOrigins":[${CORS_ORIGINS_JSON}],"AllowedMethods":["PUT","GET","HEAD"],"AllowedHeaders":["*"],"ExposeHeaders":["ETag"],"MaxAgeSeconds":3000}]}
JSON
)

for bucket in "$PUBLIC_BUCKET" "$RESTRICTED_BUCKET"; do
  if aws_local s3api head-bucket --bucket "$bucket" >/dev/null 2>&1; then
    echo "S3 bucket: $bucket (exists)"
  else
    aws_local s3api create-bucket --bucket "$bucket" >/dev/null
    echo "S3 bucket: $bucket (created)"
  fi
  aws_local s3api put-bucket-cors --bucket "$bucket" --cors-configuration "$cors_config"
  echo "S3 CORS:   $bucket"
done

echo ""
echo "Done. Add to your env file:"
echo ""
echo "SNS_TOPIC_ARN=${topic_arn}"
echo "SQS_CONSUMER_QUEUE_URLS=${queue_url}"
echo "SQS_CONSUMERS_ENABLED=true"
echo "EVENT_INPROCESS_DISPATCH=false"
