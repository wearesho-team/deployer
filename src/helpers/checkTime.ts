import { TimeLimitRule } from "../ConfigInterface";

function validateTime(time: string): boolean {
    return !!time.match(/^((?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$)/);
}

export function checkTime(current: string, rules: Array<TimeLimitRule>): boolean {
    if (!validateTime(current)) {
        throw new Error("Invalid current time");
    }
    rules.forEach((rule) => {
        if (!validateTime(rule.from)) {
            throw new Error(`Invalid from time: ${rule.from}`);
        }
        if (!validateTime(rule.to)) {
            throw new Error(`Invalid to time: ${rule.to}`);
        }
    });

    const blackList = rules.filter(rule => !rule.allow);
    const whiteList = rules.filter(rule => rule.allow);

    const checkRule = (rule: TimeLimitRule) => {
        return current >= rule.from && current <= rule.to;
    };

    const isBlackListMatch = blackList.some(checkRule);
    if (isBlackListMatch) {
        return false;
    }
    if (!whiteList.length) {
        return true;
    }

    return whiteList.some(checkRule);
}
