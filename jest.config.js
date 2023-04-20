module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
  },
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    resources: "usable",
  },
  moduleNameMapper: {
    "components/(.*)": "<rootDir>/src/components/$1",
  },
};
