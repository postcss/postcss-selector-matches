import postcss from "postcss"
import list from "postcss/lib/list"

import balancedMatch from "balanced-match"

function explodeSelector(pseudoClass, selector, options) {
  if (selector && selector.indexOf(pseudoClass) > -1) {
    let newSelectors = []
    const selectorPart = list.comma(selector)
    selectorPart.forEach(part => {
      const position = part.indexOf(pseudoClass)
      const pre = part.slice(0, position)
      const matches = balancedMatch("(", ")", part.slice(position))

      const bodySelectors = matches.body ?
        list
          .comma(matches.body)
          .reduce((acc, s) => [
            ...acc,
            ...explodeSelector(pseudoClass, s, options),
          ], [])
        : []
      const postSelectors = matches.post
        ? explodeSelector(pseudoClass, matches.post, options)
        : []

      let newParts
      if (postSelectors.length === 0) {
        newParts = bodySelectors.map((s) => pre + s)
      }
      else {
        newParts = []
        postSelectors.forEach(postS => {
          bodySelectors.forEach(s => {
            newParts.push(pre + s + " " + postS)
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

function explodeSelectors(pseudoClass) {
  return (options = {}) => {
    return (css) => {
      css.eachRule(rule => {
        if (rule.selector && rule.selector.indexOf(pseudoClass) > -1) {
          rule.selector = explodeSelector(pseudoClass, rule.selector, options)
            .join("," + (options.lineBreak ? "\n" + rule.before : " "))
        }
      })
    }
  }
}

export default postcss.plugin(
  "postcss-selector-matches",
  explodeSelectors(":matches")
)
