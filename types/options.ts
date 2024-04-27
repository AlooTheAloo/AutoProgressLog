export interface options {
    runtime: "Bun" | "Node",
    type : "Server" | "Manual"
    serverOptions?:{
        generationTime:Time
    }
    toggl:{
        togglToken:string,
    }
    anki:ankiIntegration
    outputOptions:{
        enabled:boolean
        outputFileName?:string
    }
}

export interface Time {
    hours: number;
    minutes: number;
}

export interface ankiIntegration{
    enabled:boolean
    ankiPath?:string,
    ankiDB?:string,
    ankiProgramBinaryName?:string
}