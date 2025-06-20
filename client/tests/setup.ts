import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import "fake-indexeddb/auto";
import { clearAllDatabases } from "./indexedDB";

expect.extend(matchers);

afterEach(() => {
  cleanup();
  clearAllDatabases();
});
