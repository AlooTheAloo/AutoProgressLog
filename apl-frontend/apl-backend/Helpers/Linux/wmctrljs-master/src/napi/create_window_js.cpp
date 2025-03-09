#include "./wmctrl-napi.hpp"

Object create_geometry_js(Env env, struct geometry *geo) {
    Object geo_js = Object::New(env);

    if (!geo) {
        return geo_js;
    }

    geo_js.Set("width", geo->width);
    geo_js.Set("height", geo->height);
    geo_js.Set("x", geo->x);
    geo_js.Set("y", geo->y);
    geo_js.Set("abs_x", geo->abs_x);
    geo_js.Set("abs_y", geo->abs_y);
    return geo_js;
}

Object create_window_info_js(Env env, XSizeHints *xsize) {
    Object xsize_js   = Object::New(env);
    Object min_aspect = Object::New(env);
    Object max_aspect = Object::New(env);

    if (!xsize) {
        return xsize_js;
    }

    min_aspect.Set("numerator", xsize->min_aspect.x);
    min_aspect.Set("denominator", xsize->min_aspect.y);
    max_aspect.Set("numerator", xsize->max_aspect.x);
    max_aspect.Set("denominator", xsize->max_aspect.y);

    min_aspect.Set("numerator", xsize->min_aspect.x);
    min_aspect.Set("denominator", xsize->min_aspect.y);
    max_aspect.Set("numerator", xsize->max_aspect.x);
    max_aspect.Set("denominator", xsize->max_aspect.y);

    xsize_js.Set("flags", xsize->flags);
    xsize_js.Set("x", xsize->x);
    xsize_js.Set("y", xsize->y);
    xsize_js.Set("width", xsize->width);
    xsize_js.Set("height", xsize->height);
    xsize_js.Set("min_width", xsize->min_width);
    xsize_js.Set("min_height", xsize->min_height);
    xsize_js.Set("max_width", xsize->max_width);
    xsize_js.Set("max_height", xsize->max_height);
    xsize_js.Set("width_inc", xsize->width_inc);
    xsize_js.Set("height_inc", xsize->height_inc);
    xsize_js.Set("width_inc", xsize->width_inc);
    xsize_js.Set("height_inc", xsize->height_inc);
    xsize_js.Set("min_aspect", min_aspect);
    xsize_js.Set("max_aspect", max_aspect);
    xsize_js.Set("base_width", xsize->base_width);
    xsize_js.Set("base_height", xsize->base_height);
    xsize_js.Set("win_gravity", xsize->win_gravity);
    return xsize_js;
}

Object create_window_js(Env env, struct window_info *wi) {
    Object window_js      = Object::New(env);
    Array win_types_js    = Array::New(env);
    Array win_actions_js  = Array::New(env);
    Array win_states_js   = Array::New(env);
    Array net_wm_strut_js = Array::New(env);
    Object frame_extents  = Object::New(env);

    if (!wi) {
        return window_js;
    }

    window_js.Set("win_id", wi->win_id);
    window_js.Set("win_pid", wi->win_pid);
    window_js.Set("desktop_number", wi->desktop_number);
    window_js.Set("showing_desktop", wi->showing_desktop);
    window_js.Set("win_client_machine", wi->win_client_machine ? wi->win_client_machine : "");
    window_js.Set("win_class", wi->win_class ? wi->win_class : "");
    window_js.Set("win_types", win_types_js);
    window_js.Set("win_actions", win_actions_js);
    window_js.Set("win_states", win_states_js);

    if (wi->win_types) {
        for (size_t i = 0; i < wi->nbr_type; i++) {
            struct type_desc *desc = wi->win_types + i;
            Object desc_js = Object::New(env);
            if (desc) {
                desc_js.Set("flag", desc->flag);
                desc_js.Set("number", desc->number);
            }
            win_types_js[i] = desc_js;
        }
    }

    if (wi->win_actions) {
        for (size_t i = 0; i < wi->nbr_action; i++) {
            struct action_desc *desc = wi->win_actions + i;
            Object desc_js = Object::New(env);
            if (desc) {
                desc_js.Set("flag", desc->flag);
                desc_js.Set("number", desc->number);
            }
            win_actions_js[i] = desc_js;
        }
    }

    if (wi->win_states) {
        for (size_t i = 0; i < wi->nbr_state; i++) {
            struct state_desc *desc = wi->win_states + i;
            Object desc_js = Object::New(env);
            if (desc) {
                desc_js.Set("flag", desc->flag);
                desc_js.Set("number", desc->number);
            }
            win_states_js[i] = desc_js;
        }
    }

    window_js.Set("win_name", wi->win_name ? wi->win_name : "");
    window_js.Set("win_visible_name", wi->win_visible_name ? wi->win_visible_name : "");
    window_js.Set("win_visible_icon_name", wi->win_visible_icon_name ? wi->win_visible_icon_name : "");
    window_js.Set("wm_normal_hints_supplied", wi->wm_normal_hints_supplied);
    window_js.Set("wm_hints_supplied", wi->wm_hints_supplied);
    window_js.Set("wm_normal_hints_supplied", wi->wm_normal_hints_supplied);

    if (wi->win_geometry) {
        window_js.Set("win_geometry", create_geometry_js(env, wi->win_geometry));
    }

    if (wi->WM_NORMAL_HINTS) {
        window_js.Set("WM_NORMAL_HINTS", create_window_info_js(env, wi->WM_NORMAL_HINTS));
    }

    if (wi->WM_HINTS) {
        window_js.Set("WM_HINTS", create_window_info_js(env, wi->WM_HINTS));
    }

    if (wi->net_wm_strut) {
        for (size_t i = 0; i < wi->nbr_net_wm_strut; i++) {
            net_wm_strut_js[i] = wi->net_wm_strut[i];
        }
        window_js.Set("net_wm_strut", net_wm_strut_js);
    }

    if (wi->frame_extents) {
        frame_extents.Set("left", wi->frame_extents[0]);
        frame_extents.Set("right", wi->frame_extents[1]);
        frame_extents.Set("top", wi->frame_extents[2]);
        frame_extents.Set("bottom", wi->frame_extents[3]);
        window_js.Set("frame_extents", frame_extents);
    }

    return window_js;
}
