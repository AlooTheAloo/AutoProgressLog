import { Feature } from '.';
import { MotionState } from '../state';
export declare class FeatureManager {
    features: Feature[];
    constructor(state: MotionState);
    mount(): void;
    beforeMount(): void;
    unmount(): void;
    update(): void;
    beforeUpdate(): void;
    beforeUnmount(): void;
}
