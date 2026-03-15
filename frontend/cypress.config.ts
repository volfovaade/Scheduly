import { defineConfig } from "cypress";

export default defineConfig({
    // These belong at the TOP level (outside e2e)
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,

    e2e: {
        baseUrl: "http://localhost:3000",
        viewportWidth: 1280,
        viewportHeight: 720,
        env: {
            apiUrl: "http://localhost:8081/api"
        },
        setupNodeEvents(on, config) {
          let runtimeToken = "";

          on("task", {
            setAuthToken: (token: string) => {
              runtimeToken = token;
              return null;
            },
            getAuthToken: () => {
              return runtimeToken;
            },
          });

          return config;
        },
    }
});