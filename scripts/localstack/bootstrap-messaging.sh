#!/usr/bin/env bash
# Bootstrap LocalStack SNS topics + SQS queues for GamerTrust domain events (E22).
# Requires: AWS CLI, LocalStack on AWS_ENDPOINT_URL (default http://localhost:4566)
set -euo pipefail

ENDPOINT="${AWS_ENDPOINT_URL:-http://localhost:4566}"
REGION="${AWS_REGION:-us-east-1}"
ENV_NAME="${GT_ENV:-local}"
PREFIX="gt-${ENV_NAME}"

aws_local() {
  aws --endpoint-url="$ENDPOINT" --region "$REGION" "$@"
}

create_topic() {
  local event_dashed="$1"
  local topic_name="${PREFIX}-${event_dashed}"
  aws_local sns create-topic --name "$topic_name" >/dev/null
  echo "SNS topic: $topic_name"
}

create_queue_with_dlq() {
  local consumer="$1"
  local event_dashed="$2"
  local queue_name="${PREFIX}-${consumer}-${event_dashed}"
  local dlq_name="${queue_name}-dlq"

  aws_local sqs create-queue --queue-name "$dlq_name" >/dev/null
  local dlq_url
  dlq_url=$(aws_local sqs get-queue-url --queue-name "$dlq_name" --query QueueUrl --output text)
  local dlq_arn
  dlq_arn=$(aws_local sqs get-queue-attributes --queue-url "$dlq_url" --attribute-names QueueArn --query 'Attributes.QueueArn' --output text)

  aws_local sqs create-queue \
    --queue-name "$queue_name" \
    --attributes "{\"RedrivePolicy\":\"{\\\"deadLetterTargetArn\\\":\\\"${dlq_arn}\\\",\\\"maxReceiveCount\\\":\\\"5\\\"}\"}" \
    >/dev/null
  echo "SQS queue: $queue_name (+ dlq)"
}

subscribe() {
  local event_dashed="$1"
  local consumer="$2"
  local topic_arn
  topic_arn=$(aws_local sns list-topics --query "Topics[?contains(TopicArn, '${PREFIX}-${event_dashed}')].TopicArn | [0]" --output text)
  local queue_url
  queue_url=$(aws_local sqs get-queue-url --queue-name "${PREFIX}-${consumer}-${event_dashed}" --query QueueUrl --output text)
  local queue_arn
  queue_arn=$(aws_local sqs get-queue-attributes --queue-url "$queue_url" --attribute-names QueueArn --query 'Attributes.QueueArn' --output text)

  aws_local sns subscribe \
    --topic-arn "$topic_arn" \
    --protocol sqs \
    --notification-endpoint "$queue_arn" \
    >/dev/null
  echo "Subscribed ${PREFIX}-${consumer}-${event_dashed} ← ${PREFIX}-${event_dashed}"
}

wire() {
  local event_dashed="$1"
  local consumer="$2"
  create_topic "$event_dashed"
  create_queue_with_dlq "$consumer" "$event_dashed"
  subscribe "$event_dashed" "$consumer"
}

echo "Bootstrapping messaging on $ENDPOINT (prefix=$PREFIX)..."

# Search consumers
wire "listings-listing-status-changed" "search"
wire "listings-listing-published" "search"
wire "listings-listing-paused" "search"
wire "catalog-category-created" "search"
wire "catalog-category-updated" "search"
wire "catalog-service-created" "search"
wire "catalog-service-updated" "search"

# Verification consumers
wire "listings-listing-status-changed" "verification"
wire "listings-listing-submitted" "verification"

# Listings consumers (E22 stub / E23)
wire "verification-case-approved" "listings"

echo "Done. Example queue URLs:"
aws_local sqs list-queues --queue-name-prefix "$PREFIX" --query 'QueueUrls' --output text || true
echo ""
echo "Set SQS_CONSUMERS_ENABLED=true and SQS_CONSUMER_QUEUE_URLS=<comma-separated urls>"
echo "Set EVENT_INPROCESS_DISPATCH=false when pollers are on (default when consumers enabled)."
