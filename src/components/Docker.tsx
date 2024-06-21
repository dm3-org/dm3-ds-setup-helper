import { downloadDockerFile } from "../utils/fileUtils";
import { DOCKER_COMPOSE_DOWNLOAD_URL } from "../utils/constants";

export function Docker() {

    return <div>
        <h2>Step 4: </h2>
        <ol>
            <li>
                Download {" "}
                <a
                    href={DOCKER_COMPOSE_DOWNLOAD_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={downloadDockerFile}
                >
                    the docker compose file
                </a>{" "}
                and save it as docker-compose.yml
            </li>
            <li>
                move all 3 files (docker-compose.yml, .env, config.yml) into a
                directory on the machine you want to run the service on (e.g. a
                web server)
            </li>
            <li>
                in this directory, execute `docker-compose up -d` to start the
                delivery service
            </li>
            <li>
                visit &lt;yourUrl&gt;:8083/hello with your web browser to get a
                first friendly response from your delivery service
            </li>
        </ol>
    </div>
}