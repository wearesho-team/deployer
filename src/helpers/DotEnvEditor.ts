import * as fs from "fs";
import * as util from "util";

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

export class DotEnvEditor {
    public static async parse(file: string): Promise<Map<string, string>> {
        const map = new Map<string, string>();

        (await readFile(file))
            .toString()
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0 && !line.startsWith("#"))
            .map((line) => line.match(/([^=.]+)=(.*)/))
            .forEach((line) => {
                line && map.set(line[1], line[2]);
            });

        return map;
    }

    public static save(map: Map<string, string>, file: string): Promise<void> {
        const contents = Array.from(map)
            .filter(([key, value]) => value !== undefined && value !== null)
            .map((line) => line.join("="))
            .join("\n") + "\n";

        return writeFile(file, contents);
    }
}
