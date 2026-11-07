import { registerRoot } from "remotion";
import { courseRoot } from "../../visual/register-course";
import { TEST01_COMPOSITIONS } from "./index";

export { TEST01_COMPOSITIONS };
registerRoot(courseRoot(TEST01_COMPOSITIONS));
