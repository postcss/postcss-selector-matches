import replaceRuleSelector from "./replaceRuleSelector"

function postcssSelectorMatches(options = {}) {
  return {
    postcssPlugin: "postcss-selector-matches",
    Rule(rule) {
      if (rule.selector && rule.selector.indexOf(":matches") > -1) {
        rule.selector = replaceRuleSelector(rule, options)
      }
    },
  }
}
postcssSelectorMatches.postcss = true

export default postcssSelectorMatches
