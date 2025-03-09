# wmctrljs

Be carefull this package can be use only on a linux X11 machine.

You also need packages like libx11-dev, libxmu-dev

## Update your indexes
`sudo apt update`

## Install your unbuntu packages
`sudo apt install libx11-dev -y`

`sudo apt install libxmu-dev -y`

## Install wmctrljs package

`npm install wmctrljs`

## Description
Wmctrljs is an adaptation of wmctrl command and more, with that library you can easily manage your windows very fastly beacause wmctrls does'nt make a fork of wmctrl process but directly call X11 library using N-API. 

To do that wmctrls has access to an addon natif using `N-API` for scalability between nodejs version.

An implementation of async/IO is available, then it is possible to call each function on a `V8` different thread wich will highly improve performance results 

## Window

wmctrljs provide you an access to alot of properties on your windows many more than wmctrl process.
See the prototype as follow.
```TS
interface Window {
    win_id:number;
    win_pid:number;
    win_client_machine:string;
    win_class:string;
    win_types:TypeDesc[];
    win_actions:TypeDesc[];
    win_states:TypeDesc[];
    win_name:string;
    win_visible_name:string;
    win_icon_name:string;
    win_visible_icon_name:string;
    win_geometry:Geometry|undefined;

    wm_normal_hints_supplied:number;
    WM_NORMAL_HINTS:XSizeHints|undefined;
    WM_HINTS:XSizeHints|undefined;
    desktop_number:number;
    showing_desktop:number;
    frame_extents:FrameExtents|undefined
}
```

### Types

Window types are describe by this interface.
```TS
interface TypeDesc {
    flag:string
    number:number
}
```

You have access to window's size and positions.
```TS
interface Geometry {
    x:number
    y:number
    abs_x:number
    abs_y:number
    width:number
    height:number
}
```
wmctrljs also provide you XSizeHints propertis based on Xutils.h structure.

```TS 
interface XSizeHints { //Based on Xutils.h
    flags:number	/* marks which fields in this structure are defined */
    x:number
    y:number		/* obsolete for new window mgrs, but clients */
    width:number
    height:number	/* should set so old wm's don't mess up */
    min_width:number
    min_height:number
    max_width:number
    max_height:number
    width_inc:number
    height_inc:number
    min_aspect:Aspect 
    max_aspect:Aspect
    base_width:number
    base_height:number
    win_gravity:number
}
```

It is possible to have access to window's frame extents provided by his window manager.

```TS
interface FrameExtents {
    left:number,
    right:number,
    top:number,
    bottom:number
}
```

Screen description is also available.
```TS
interface Screen {
    backing_store:number;
    black_pixel:number;
    cmap:number;
    height:number;
    max_maps:number;
    mheight:number;
    min_maps:number;
    mwidth:number;
    ndepths:number;
    root_depth:number;
    root_input_mask:number;
    save_unders:number;
    white_pixel:number;
    width:number
}
```

## Available functions

Get screen's information
```TS
function getScreenSync():Screen
function getScreen():Promise<Screen>
```

Get windows information
```TS
function getWindowListSync():Window[]
function getWindowList():Promise<Window[]>
```

Get Window by id
```TS
function getWindowByIdSync():Window
function getWindowById():Promise<Window>
```

Get the current active window, it is possible no window is active for now then return value can be `null`
```TS
function getActiveWindowSync():Window
function getActiveWindow():Promise<Window>
```

Get a list of window with the pid provided, if this pid doesn't match with any window a not found exception is throw
```TS
function getWindowsByPidSync(win_pid:number):Window[]
function getWindowsByPid(win_pid:number):Promise<Window[]>
```

Get a list of window with the class provided, it has the same issue as `getWindowsByPidSync`
```TS
function getWindowsByClassNameSync(win_class_name:string):Window[]
function getWindowsByClassName(win_class_name:string):Promise<Window[]>
```

Active a window by his id, if no window match with this id a window not found exception will be throw.
```TS
function activeWindowByIdSync(win_id:number):boolean
function activeWindowById(win_id:number):Promise<boolean>
```

Active multiple windows by classname or by pid with respective functions
```TS
function activeWindowsByClassNameSync(win_class_name:string):boolean
function activeWindowsByClassName(win_class_name:string):Promise<boolean>

function activeWindowsByPidSync(win_pid:number):boolean
function activeWindowsByPid(win_pid:number):Promise<boolean>
```

It's the same issue for closing window(s)
```TS
function closeWindowByIdSync(win_id:number):boolean
function closeWindowById(win_id:number):Promise<boolean>

function closeWindowsByClassNameSync(win_class_name:string):boolean
function closeWindowsByClassName(win_class_name:string):Promise<boolean>

function closeWindowsByPidSync(win_pid:number):boolean
function closeWindowsByPid(win_pid:number):Promise<boolean>
```

Move and resize your window
```TS
function windowMoveResizeSync(win_id:number, win_gravity:number, win_x:number, 
                                    win_y:number, win_width:number, win_height:number):boolean
function windowMoveResize(win_id:number, win_gravity:number, win_x:number, 
                                    win_y:number, win_width:number, win_height:number):Promise<boolean>
```

You can also move and resize windows with transitions, this is a pure `wmctrljs` function
```TS
function windowMoveResizeTransition(win_id:number, win_gravity:number, win_x:number, 
    win_y:number, win_width:number, win_height:number, await_time:number=1, pad:number=1):Promise<boolean>
```
Here the `await_time` is the duration between all window's positions and dimensions, and `pad` allow you to control the number of step it will have.

Because of the duration of this animation it is available only with an `AsyncWorker`.

Make some action on window's states

Actions available are `add` `remove` and `toggle`

Properties: `modal`  `sticky` `maximized_vert` `maximized_horz` `shaded` `skip_taskbar` `skip_pager` `hidden` `fullscreen` `above` `below`

```TS
function windowStateSync(win_id:number, action:string, prop1:string, prop2?:string):boolean
function windowState(win_id:number, action:string, prop1:string, prop2?:string):Promise<boolean>
```

Minimize a window
```TS
function windowMinimizeSync(win_id:number):boolean
function windowMinimize(win_id:number):Promise<boolean>
```

Take off all restriction on the window size, thus you can resize it as you want.
```TS
function windowAllowAllSizesSync(win_id:number):boolean
function windowAllowAllSizes(win_id:number):Promise<boolean>
```

Put a window in first plan
```TS
function windowRaiseSync(win_id:number):boolean
function windowRaise(win_id:number):Promise<boolean>
```