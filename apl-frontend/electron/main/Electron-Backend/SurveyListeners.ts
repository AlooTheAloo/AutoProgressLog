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
}


const surveyAnswer:surveyAnswer = {};

export async function surveyListeners() {

    ipcMain.handle("answer-survey-track", async (event, args) => {
        surveyAnswer.track = args;
    })

    ipcMain.handle("get-track-answer", async (event, args) => {
        return surveyAnswer.track;
    })

    ipcMain.handle("answer-survey-refold", async (event, args) => {
        surveyAnswer.refoldData = args;
    })

    ipcMain.handle("answer-survey-language", async (event, lang, years) => {
        surveyAnswer.language = lang;
        surveyAnswer.years = years;
    })

    ipcMain.handle("answer-survey-apps", async (event, args) => {
        surveyAnswer.appsUsing = args;
        sendSurveyAnswer();
    })


}

function sendSurveyAnswer() {
    // TODO : send survey answer to backend
}