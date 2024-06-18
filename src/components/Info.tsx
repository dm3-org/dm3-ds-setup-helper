import { GITHUB_LICENSE, GITHUB_SOURCE_CODE } from '../utils/constants';

export function Info() {
    return <div>
        Info: This tool is provided as is under the{" "}
        <a href={GITHUB_LICENSE}>
            BSD 2-Clause License
        </a>
        . You can find the source code, open issues and contribute{" "}
        <a href={GITHUB_SOURCE_CODE}>here.</a>{" "}
    </div>
}