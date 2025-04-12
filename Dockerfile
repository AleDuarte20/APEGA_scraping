FROM node:14.16.1

ENV APP_DIR=/root

ENV RUNTIME_DEPS \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libc6 \
    libdrm2 \
    libgbm-dev \
    libxshmfence-dev \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcb-dri3-0 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    xdg-utils \
    libappindicator3-1

RUN apt-get update && apt-get install -y \
  --no-install-recommends \
  $RUNTIME_DEPS \
  && rm -r /var/lib/apt/lists/*

COPY . $APP_DIR
WORKDIR $APP_DIR

#install tor network
RUN apt update && apt install -y tor && apt install -y curl 

COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN npm install

# To exec on localhost docker
CMD ["node", "main.js"]