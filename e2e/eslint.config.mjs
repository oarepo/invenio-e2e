import invenioE2E from "@inveniosoftware/invenio-e2e";
import { defineConfig } from "eslint/config";

export default defineConfig([
	{
		files: ["**/*.ts"],
		extends: [invenioE2E],
	},
]);
