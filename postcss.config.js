import postcss from "postcss";
import postcssNesting from "postcss-nesting";
import autoprefixer from "autoprefixer";

export default postcss([postcssNesting(/* pluginOptions */), autoprefixer]);
