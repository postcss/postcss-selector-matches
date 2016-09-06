import list from "postcss/lib/list"

import balancedMatch from "balanced-match"

const pseudoClass = ":matches"

function isElementSelector(selector) {
  return !selector.match(/(\:|\.)/g)
}

function normalizeSelector(selector, preWhitespace, pre) {
  selector = selector === undefined ? "" : selector

  const selectorIsElement = isElementSelector(selector)
  const preIsElement = isElementSelector(pre)

  if (selectorIsElement && !preIsElement) {
    return `${preWhitespace}${selector}${pre}`
  }

  return `${preWhitespace}${pre}${selector}`
}

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
        newParts = bodySelectors.map((s) => {
          return normalizeSelector(s, preWhitespace, pre)
        })
      }
      else {
        newParts = []
        postSelectors.forEach(postS => {
          bodySelectors.forEach(s => {
            newParts.push(preWhitespace + pre + s + postS)
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

export default function replaceRuleSelector(rule, options) {
  const indentation = rule.raws && rule.raws.before
    ? rule.raws.before.split("\n").pop()
    : ""
  return (
    explodeSelector(rule.selector, options)
      .join("," + (options.lineBreak ? "\n" + indentation : " "))
  )
}
