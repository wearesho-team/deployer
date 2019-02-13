import { Container } from "data";

/**
 * @param stdout Example
          Name                        Command                 State             Ports
---------------------------------------------------------------------------------------------
mywordpress_db_1          docker-entrypoint.sh mysqld      Up (healthy)  3306/tcp
mywordpress_wordpress_1   /entrypoint.sh apache2-for ...   Restarting    0.0.0.0:8000->80/tcp
 */
export const parseDockerComposePs = (stdout: string): Array<Container> => (
    stdout.split("\n").splice(2)
        .map(containerString => containerString.split(/\s{3,}/))
        .filter(line => line.length > 3)
        .map(([name, , status]): Container => ({ name, status }))
);
