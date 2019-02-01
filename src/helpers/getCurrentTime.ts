export function getCurrentTime(): string {
    const date = new Date;
    return date.toLocaleTimeString('ru-RU'); // will return HH:MM:SS
}
