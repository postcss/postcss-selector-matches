import postcss from "postcss"
import replaceRuleSelector from "./replaceRuleSelector"

function explodeSelectors(options = {}) {
  return (css) => {
    css.walkRules(rule => {
      if (rule.selector && rule.selector.indexOf(":matches") > -1) {
        rule.selector = replaceRuleSelector(rule, options)
      }
    })
  }

}

export default postcss.plugin("postcss-selector-matches", explodeSelectors)
