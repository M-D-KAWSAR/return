import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.returnzero.app",
  appName: "Return Zero",
  webDir: "out",
  server: {
    // Points to the live Next.js server on local network
    // Change this to your production URL when deploying
    url: "http://192.168.1.104:3000",
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#0a0a12",
  },
};

export default config;
