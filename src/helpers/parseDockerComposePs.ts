import { Container } from "data";

export const parseDockerComposePs = (stdout: string): Array<Container> => (
    stdout.split("\n").splice(2)
        .map(containerString => containerString.split(/\s{3,}/))
        .filter(line => line.length > 3)
        .map(([name, , status]): Container => ({ name, status }))
);
