import postcss from "postcss"
import list from "postcss/lib/list"

import balancedMatch from "balanced-match"

const pseudoClass = ":matches"

function explodeSelector(selector, options) {
  if (selector && selector.indexOf(pseudoClass) > -1) {
    let newSelectors = []
    const preWhitespaceMatches = selector.match(/^\s+/)
    const preWhitespace = preWhitespaceMatches
      ? preWhitespaceMatches[0]
      : ""
    const selectorPart = list.comma(selector)
    selectorPart.forEach(part => {
      const position = part.indexOf(pseudoClass)
      const pre = part.slice(0, position)
      const body = part.slice(position)
      const matches = balancedMatch("(", ")", body)

      const bodySelectors = matches && matches.body ?
        list
          .comma(matches.body)
          .reduce((acc, s) => [
            ...acc,
            ...explodeSelector(s, options),
          ], [])
        : [body]

      const postSelectors = matches && matches.post
        ? explodeSelector(matches.post, options)
        : []

      let newParts
      if (postSelectors.length === 0) {
        newParts = bodySelectors.map((s) => preWhitespace + pre + s)
      }
      else {
        newParts = []
        postSelectors.forEach(postS => {
          bodySelectors.forEach(s => {
            newParts.push(pre + s + postS)
          })
        })
      }
      newSelectors = [
        ...newSelectors,
        ...newParts,
      ]
    })

    return newSelectors
  }
  return [selector]
}

function replaceRuleSelector(rule, options) {
  const indentation = rule.before
    ? rule.before.split("\n").pop()
    : ""
  return (
    explodeSelector(rule.selector, options)
      .join("," + (options.lineBreak ? "\n" + indentation : " "))
  )

}

function explodeSelectors(options = {}) {
  return (css) => {
    css.eachRule(rule => {
      if (rule.selector && rule.selector.indexOf(pseudoClass) > -1) {
        rule.selector = replaceRuleSelector(rule, options)
      }
    })
  }

}

const plugin = postcss.plugin(
  "postcss-selector-matches",
  explodeSelectors
)

// expose for postcss-custom-selectors
export {replaceRuleSelector}
// old school fallback
plugin.replaceRuleSelector = replaceRuleSelector

export default plugin
