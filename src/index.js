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
      const body = part.slice(position)
      const matches = balancedMatch("(", ")", body)

      const bodySelectors = matches && matches.body ?
        list
          .comma(matches.body)
          .reduce((acc, s) => [
            ...acc,
            ...explodeSelector(pseudoClass, s, options),
          ], [])
        : [body]

      const postSelectors = matches && matches.post
        ? explodeSelector(pseudoClass, matches.post, options)
        : []

      let newParts
      if (postSelectors.length === 0) {
        newParts = bodySelectors.map((s) => pre + s)
      }
      else {
        const postWhitespaceMatches = matches.post.match(/^\s+/)
        const postWhitespace = postWhitespaceMatches
          ? postWhitespaceMatches[0]
          : ""
        newParts = []
        postSelectors.forEach(postS => {
          bodySelectors.forEach(s => {
            newParts.push(pre + s + postWhitespace + postS)
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
