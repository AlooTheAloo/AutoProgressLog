{
    'targets': [
        {
            'target_name':'libwmctrl',
            'type':'static_library',
            'include_dirs':['src'],
            'conditions':[
                ['OS=="linux"', {
                    'sources':[
                        "<!@(node -p 'require(`fs`).readdirSync(`./src`).map(f => `./src/${f}`).join(` `)')"
                    ]
                }]
            ]
        }
    ]
}