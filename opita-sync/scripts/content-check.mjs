import { requiredMarkers, requiredReadmeCommands } from "./lib/opita-release-data.mjs";
import { assert, readText } from "./lib/repo-utils.mjs";
import { getActiveRequest, requestArtifactNames, requestFile } from "./lib/request-registry.mjs";

for (const marker of requiredMarkers) {
  const content = readText(marker.file);
  for (const snippet of marker.snippets) {
    assert(content.includes(snippet), `${marker.file} is missing required snippet: ${snippet}`);
  }
}

const readme = readText("README.md");
for (const command of requiredReadmeCommands) {
  assert(readme.includes(command), `README.md is missing command reference: ${command}`);
}

const activeRequest = getActiveRequest();
assert(activeRequest.status === "specified", `Active request should be in specified status, found ${activeRequest.status}`);

for (const artifactName of requestArtifactNames) {
  const content = readText(requestFile(activeRequest.id, artifactName));
  assert(content.length > 0, `Active request artifact is empty: ${artifactName}`);
}

console.log("Content checks passed.");
