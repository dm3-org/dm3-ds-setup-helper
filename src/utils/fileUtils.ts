import axios from 'axios';
import { configurationTemplate } from './configurationTemplate';
import { CONFIG_FILE_NAME, DOCKER_COMPOSE_DOWNLOAD_URL } from './constants';

export const storeConfig = () => {
    const blob = new Blob([configurationTemplate], { type: 'text/plain' });
    const buttonUrl = URL.createObjectURL(blob);
    const buttonLink = document.createElement('a');
    buttonLink.download = CONFIG_FILE_NAME;
    buttonLink.href = buttonUrl;
    buttonLink.click();
};

export const downloadDockerFile = async () => {
    try {
        // file name which will get download
        const fileName = 'docker-compose.yml';
        // fetch the content of the file through the link
        const response = await axios.get(DOCKER_COMPOSE_DOWNLOAD_URL);
        // sets the content of the file
        const text = response.data;
        // creates a link to download file
        const element = document.createElement('a');
        // sets attributes for link
        element.setAttribute(
            'href',
            'data:text/plain;charset=utf-8,' + encodeURIComponent(text),
        );
        element.setAttribute('download', fileName);
        // style is set to none as it is not to be displayed on UI
        element.style.display = 'none';
        // appends link to DOM to download file
        document.body.appendChild(element);
        // downloads file
        element.click();
        // removes link after file is downloaded
        document.body.removeChild(element);
    } catch (error) {
        console.error('Failed to download file : ', error);
    }
};
