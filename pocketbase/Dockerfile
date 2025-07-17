FROM alpine:latest

ARG PB_VERSION=0.28.1
ARG ADMIN_EMAIL
ARG ADMIN_PASSWORD
ARG POCKETBASE_BEARER_TOKEN
ARG PORT=8080

ENV HOME=/home/pocketbase
ENV APP_HOME=/home/pocketbase/app
ENV PORT=$PORT
ENV POCKETBASE_BEARER_TOKEN=$POCKETBASE_BEARER_TOKEN

RUN apk add --no-cache \
    unzip \
    ca-certificates \
    wget

# Create the home directory for the new nonroot user
RUN mkdir -p /home/pocketbase

# Create non-root user and group so our program doesn't run as root
# -S = Create a system user or group  
# -D = Don't assign a password, so cannot login
# -h = Home directory
# -G = Add user to group
RUN addgroup -S pocketbase && adduser -S -D -h /home/pocketbase -G pocketbase pocketbase

RUN mkdir -p $APP_HOME
WORKDIR $APP_HOME

# download and unzip PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d $APP_HOME && rm /tmp/pb.zip

# create necessary directories
RUN mkdir -p $APP_HOME/pb_data $APP_HOME/pb_migrations ${APP_HOME}/pb_public ${APP_HOME}/pb_hooks

# copy the local pb_migrations dir into the correct location
COPY ./pb_migrations/* $APP_HOME/pb_migrations/

# copy the local pb_public dir into the correct location (if it exists and has files)
COPY ./pb_public $APP_HOME/pb_public/

# Uncomment to copy the local pb_hooks dir into the image
COPY ./pb_hooks $APP_HOME/pb_hooks

# Chown all the files to the pocketbase user
RUN chown -R pocketbase:pocketbase $APP_HOME

EXPOSE $PORT

# Create a startup script to initialize superuser
RUN echo '#!/bin/sh' > $APP_HOME/startup.sh && \
    echo 'if [ ! -z "$ADMIN_EMAIL" ] && [ ! -z "$ADMIN_PASSWORD" ]; then' >> $APP_HOME/startup.sh && \
    echo '  echo "Setting up superuser..."' >> $APP_HOME/startup.sh && \
    echo '  $APP_HOME/pocketbase superuser upsert $ADMIN_EMAIL $ADMIN_PASSWORD || echo "Superuser already exists or could not be created"' >> $APP_HOME/startup.sh && \
    echo 'fi' >> $APP_HOME/startup.sh && \
    echo 'echo "Starting PocketBase server..."' >> $APP_HOME/startup.sh && \
    echo 'exec $APP_HOME/pocketbase serve --http=0.0.0.0:$PORT --dir=$APP_HOME/pb_data' >> $APP_HOME/startup.sh && \
    chmod +x $APP_HOME/startup.sh && \
    chown pocketbase:pocketbase $APP_HOME/startup.sh

# switch to non-root user
USER pocketbase

# add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/api/health || exit 1

# start PocketBase with our startup script
CMD ["./startup.sh"]
