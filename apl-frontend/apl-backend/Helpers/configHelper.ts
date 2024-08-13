import * as readline from 'readline/promises';


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


export async function getAnswer(params:{question:string, verifFunc:(ans:string)=>boolean|Promise<boolean>}): Promise <string>;
export async function getAnswer<T>(params:{question:string, options:{input:string, returnVal:T, default?:boolean}[]}) : Promise<T>;
export async function getAnswer<T>(params:{question:string, verifFunc?:(ans:string)=>boolean|Promise<boolean>} | {question:string, options:{input:string, returnVal:T, default?:boolean}[]} ) : Promise<T | string>
{
    function hasOptions(obj: any): obj is { options: any[] } {
        return 'options' in obj;
    }
    
    while(true){
        let options = "";
        if(hasOptions(params)){
            options += "["
            params.options.forEach((element, i) => {
                options += element.input;
                if(i != (params.options?.length ?? 0) - 1){
                    options += "/";
                }
            });    
            options += "]"

            const defaults = params.options.filter(x => x.default);
            if(defaults.length == 1){
                options += ` (default : ${defaults[0].input}) `
            }

            const answer = await rl.question(`${params.question} ${options}`);
            
            if(answer.toLowerCase() == ""){
                return defaults[0].returnVal
            }
            
            for(const option of params.options){
                if(option.input.toLowerCase() == answer.toLowerCase()){
                    return option.returnVal;
                }
            }    
        }
        else if(params.verifFunc != null){
            const answer = await rl.question(`${params.question}`);
            const ret = params.verifFunc(answer);
            if (typeof ret == "boolean"){
                if(ret){
                    return answer;
                }
            }
            else {
                const awaitedRet = await ret;
                if(awaitedRet){
                    return answer;
                }
            }
        }

    }
}
