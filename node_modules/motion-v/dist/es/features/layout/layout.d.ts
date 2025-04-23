import { Feature } from '../feature';
import { MotionState } from '../../state/motion-state';
export declare class LayoutFeature extends Feature {
    constructor(state: MotionState);
    beforeUpdate(): void;
    update(): void;
    didUpdate(): void;
    mount(): void;
    beforeUnmount(): void;
    unmount(): void;
}
