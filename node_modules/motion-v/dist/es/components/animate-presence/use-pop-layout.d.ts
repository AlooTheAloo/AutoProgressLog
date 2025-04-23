import { AnimatePresenceProps } from './types';
import { MotionState } from '../../state';
export declare function usePopLayout(props: AnimatePresenceProps): {
    addPopStyle: (state: MotionState) => void;
    removePopStyle: (state: MotionState) => void;
    styles: WeakMap<MotionState, HTMLStyleElement>;
};
