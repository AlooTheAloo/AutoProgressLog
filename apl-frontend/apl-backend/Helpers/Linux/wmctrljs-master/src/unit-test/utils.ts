import * as cp from "child_process";
import { promisify } from "util";
const exec = promisify(cp.exec);

export function wait(time:number):Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => { resolve(); }, time * 1000);
    });
}

export async function createXeyes(nbr:number):Promise<void> {
    for (let i = 0; i < nbr; i++)
        exec("xeyes");
    return await wait(nbr / 2);
}

export async function createFirefox(nbr:number):Promise<void> {
    for (let i = 0; i < nbr; i++)
        exec("firefox");
    return await wait(nbr / 2);
}