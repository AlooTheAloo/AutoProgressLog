export const addS = (value:number, text:string) => {
    return `${value} ${text}${value == 1 ? '' : 's'}`; 
}