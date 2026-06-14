import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.returnzero.app",
  appName: "Return Zero",
  webDir: "out",
  server: {
    url: "https://return-six-theta.vercel.app",
    cleartext: false,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#0a0a12",
  },
};

export default config;
