import { downloadDockerFile } from '../utils/fileUtils';

export function Docker() {
    return (
        <div className="steps-container step">
            <h2 className="heading-text">Step 4: Dockerize</h2>
            <ol className="description-text">
                <li>
                    Download {''}
                    <span className="link" onClick={downloadDockerFile}>
                        the docker compose file
                    </span>
                    {''} and save it as docker-compose.yml
                </li>
                <li>
                    Move all 3 files (docker-compose.yml, dm3-ds.env,
                    config.yml) into a directory on the machine you want to run
                    the service on (e.g. a web server)
                </li>
                <li>
                    In this directory, execute `docker-compose --env-file
                    dm3-ds.env up -d` to start the delivery service
                </li>
                <li>
                    Visit &lt;yourUrl&gt;:8083/hello with your web browser to
                    get a first friendly response from your delivery service
                </li>
            </ol>
        </div>
    );
}
