export interface options {
    type : "Server" | "Client"
    serverOptions?:ServerOptions
    toggl:{
        togglToken:string,
    }
    anki: {
        ankiIntegration:ankiIntegration
        options: {
            retentionMode: RetentionMode,
            trackedDecks: number[]
        }
    }
    outputOptions:outputOptions
}

export type outputOptions = {
    outputFile:{
        name:string,
        extension:".png" | ".jpg" | ".jpeg" | ".webp" | ".pdf"
    }
}

export type RetentionMode = "default_anki" | "true_retention"

export interface Time {
    hours: number;
    minutes: number;
}

export interface ServerOptions {
    generationTime: Time;
    generationInterval: TimeInterval;
}


export interface TimeInterval {
    intervalType: "Day" | "Week" | "Month",
    intervalNumber: number
}

export interface ankiIntegration{
    ankiPath?:string,
    ankiDB?:string,
    ankiProgramBinaryName?:string
}