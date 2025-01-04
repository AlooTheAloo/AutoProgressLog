export interface options {
    general:  {
        autogen : {
            enabled: boolean,
            options?:ServerOptions
        }
    }
    account:{
        userName:string
    }
    toggl:{
        togglToken:string,
    }
    anki: ankiOptions
    outputOptions:outputOptions
}


export interface ankiOptions {
    enabled: boolean,
    ankiIntegration?:ankiIntegration
    options?: {
        retentionMode: RetentionMode,
        trackedDecks: number[]
    }
}

export type outputOptions = {
    outputFile:{
        path:string,
        name:string,
        extension:".png" | ".jpg" | ".jpeg" | ".webp" | ".pdf"
    },
    outputQuality:number
}

export type RetentionMode = "default_anki" | "true_retention"

export interface Time {
    hours: number;
    minutes: number;
}

export interface ServerOptions {
    generationTime: Time;
}


export interface ankiIntegration{
    ankiPath?:string,
    ankiDB?:string,
    ankiProgramBinaryName?:string,
    profile?:string
}