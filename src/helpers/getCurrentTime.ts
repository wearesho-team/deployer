export function getCurrentTime(): string {
    const date = new Date;
    return date.toTimeString().substr(0, 8); // will return HH:MM:SS
}
