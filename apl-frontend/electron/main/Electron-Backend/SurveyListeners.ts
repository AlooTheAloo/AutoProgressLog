import { ipcMain, ipcRenderer } from "electron";

interface surveyAnswer {
    track?:string,
    refoldData?:{
        knows:boolean,
        stage?:string
    },
    years?:number,
    language?:string,
    appsUsing?:string[],
    rating?:number
}


const surveyAnswer:surveyAnswer = {};

export async function surveyListeners() {
    ipcMain.handle("answer-survey-track", async (event, args) => {
        console.log("MEOW");
        surveyAnswer.track = args;
    })

    ipcMain.handle("answer-survey-refold", async (event, args) => {
        surveyAnswer.refoldData = args;
    })

    ipcMain.handle("answer-survey-years", async (event, args) => {
        surveyAnswer.years = args;
    })

    ipcMain.handle("answer-survey-language", async (event, args) => {
        surveyAnswer.language = args;
    })

    ipcMain.handle("answer-survey-rating", async (event, args) => {
        surveyAnswer.rating = args;
    })
}