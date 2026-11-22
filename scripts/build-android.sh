#!/usr/bin/env bash
set -euo pipefail

# Sync project source into native Linux /work (keeping cached /work/node_modules)
find /work -mindepth 1 -maxdepth 1 ! -name node_modules -exec rm -rf {} +
tar -C /src \
  --exclude=node_modules --exclude=.git --exclude=.idea \
  --exclude=.expo --exclude=dist --exclude=android --exclude=ios \
  -cf - . | tar -C /work -xf -

cd /work

if [ ! -d /work/node_modules/expo ] || [ ! -f /work/node_modules/.lock-hash ] || ! cmp -s /work/package-lock.json /work/node_modules/.lock-hash; then
  rm -rf /work/node_modules/* /work/node_modules/.[!.]*
  npm ci
  cp /work/package-lock.json /work/node_modules/.lock-hash
fi

npx expo prebuild --platform android --clean --no-install

cd /work/android

# Download Gradle distribution via curl (avoids Java redirect issues in Docker) and cache in /root/.gradle
GRADLE_URL=$(grep '^distributionUrl=' gradle/wrapper/gradle-wrapper.properties | cut -d= -f2- | sed 's/\\:/:/g')
GRADLE_ZIP="/root/.gradle/$(basename "$GRADLE_URL")"
if [ ! -f "$GRADLE_ZIP" ]; then
  echo "Downloading $GRADLE_URL via curl..."
  curl -fSL "$GRADLE_URL" -o "$GRADLE_ZIP.part"
  mv "$GRADLE_ZIP.part" "$GRADLE_ZIP"
fi
sed -i "s|^distributionUrl=.*|distributionUrl=file\\://$GRADLE_ZIP|" gradle/wrapper/gradle-wrapper.properties

./gradlew assembleRelease --no-daemon

VERSION=$(node -p 'require("/work/package.json").version')
mkdir -p /src/dist
cp app/build/outputs/apk/release/app-release.apk "/src/dist/palan-arivom-v${VERSION}.apk"
echo "Built dist/palan-arivom-v${VERSION}.apk"
