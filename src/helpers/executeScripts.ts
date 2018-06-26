const util = require("util");
const exec = util.promisify(require("child_process").exec);

export const executeScripts = async (commands?: Array<string>): Promise<void> => {
    if (!commands) {
        return;
    }
    if (!Array.isArray(commands)) {
        throw new Error("Commands should be an array");
    }
    for (const command of commands) {
        try {
            console.log(command);
            await exec(command);
        }
        catch (error) {
            if (error.stderr) {
                throw new Error(error.stderr);
            }
            throw error;
        }
    }
};
