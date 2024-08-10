import { CacheManager } from "../Helpers/cache.ts";
import { ankiGeneration } from "../generate/ankiGeneration.ts";

CacheManager.pop();
ankiGeneration();