{
    "targets":[
        {
            "target_name":"wmctrl",
            "cflags!": [ "-fno-exceptions" ],
            "cflags_cc!": [ "-fno-exceptions" ],
            "sources": [
                "<!@(node -p 'require(`fs`).readdirSync(`./src/napi`).map(f => `./src/napi/${f}`).join(` `)')"
            ],
            "include_dirs": [
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            'dependencies':[
                'libwmctrl/libwmctrl.gyp:libwmctrl'
            ],
            "libraries": [
                "-lX11",
                "-lXmu"
            ]
        }
    ]
}