export interface options {
    runtime: "Bun" | "Node",
    type : "Server" | "Manual"
    serverOptions?:ServerOptions
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