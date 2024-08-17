import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:3000",
  },
  env: {
    MAIN_API_URL: 'http://firetracker-api:4000',
    AUTH_API_URL: 'http://firetracker-api:5000',
  },
});
