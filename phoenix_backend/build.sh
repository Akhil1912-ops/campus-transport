#!/usr/bin/env bash
# exit on error
set -o errexit

# Initial setup
mix deps.get --only prod
MIX_ENV=prod mix compile

# Run database migrations (DATABASE_URL must be set in Render env)
MIX_ENV=prod mix ecto.migrate

# Generate release and build
MIX_ENV=prod mix phx.gen.release
MIX_ENV=prod mix release --overwrite
