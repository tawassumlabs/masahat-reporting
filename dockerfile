FROM node:20@sha256:cb7cd40ba6483f37f791e1aace576df449fc5f75332c19ff59e2c6064797160e

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chrome that Puppeteer
# installs, work.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 dbus dbus-x11 \
      --no-install-recommends \
    && service dbus start \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r pptruser && useradd -rm -g pptruser -G audio,video pptruser

# Create the pptruser
USER pptruser
WORKDIR /home/pptruser

# Copy the necessary package files
COPY --chown=pptruser:pptruser package*.json ./

# Install the application's dependencies including Puppeteer.
# If you have a package-lock.json, copy it together with the package.json
RUN npm install

# Copy the rest of the application source code
COPY --chown=pptruser:pptruser . .

# Set the environment variables needed for Puppeteer
ENV DBUS_SESSION_BUS_ADDRESS autolaunch:

RUN rm -rf ./__chrome/
RUN rm -rf ./logs/

# The default command to run when starting the container
CMD ["node", "src/index.js"]
