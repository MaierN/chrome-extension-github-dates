import fs from "fs";
import archiver from "archiver";
import manifest from "./chrome_extension/manifest.json" with { type: "json" };

const versionName = `v${manifest.version}`;
const outputFile = `build_${versionName}.zip`;

console.log(`Building zip for ${versionName}...`);

const output = fs.createWriteStream(import.meta.dirname + "/" + outputFile);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
  console.log(`Saved to ${outputFile}, ${archive.pointer()} Bytes`);
});
archive.on("warning", function (err) {
  throw err;
});
archive.on("error", function (err) {
  throw err;
});

archive.pipe(output);
archive.directory(import.meta.dirname + "/chrome_extension", false);
archive.finalize();
