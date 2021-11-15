module.exports = {
	transform: {
		"^.+\\.tsx?$": "esbuild-jest",
	},
	testEnvironment: "node",
	testPathIgnorePatterns: ["<rootDir>/build/", "<rootDir>/node_modules/"],
}
