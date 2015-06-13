import tape from "tape"

import postcss from "postcss"
import selectorMatches from "../src/index.js"

function transform(css, options = {}) {
  return postcss(selectorMatches(options)).process(css).css
}

tape("postcss-selector-matches", t => {
  t.equal(
    transform("body {}"),
    "body {}",
    "should do nothing if there is no :matches"
  )

  t.equal(
    transform("body, matches {}"),
    "body, matches {}",
    "should really do nothing if there is no :matches"
  )

  t.equal(
    transform(":matches(a, b) {}"),
    "a, b {}",
    "should transform simple :matches()"
  )

  t.equal(
    transform("tag:matches(.class, .class2) {}"),
    "tag.class, tag.class2 {}",
    "should transform directes :matches()"
  )

  t.equal(
    transform("tag :matches(tag2, tag3) {}"),
    "tag tag2, tag tag3 {}",
    "should transform :matches()"
  )

  t.equal(
    transform("tag :matches(tag2, tag3) :matches(tag4, tag5) {}"),
    "tag tag2 tag4, tag tag3 tag4, tag tag2 tag5, tag tag3 tag5 {}",
    "should transform mutltiples :matches()"
  )

  t.equal(
    transform("tag :matches(tag2 :matches(tag4, tag5), tag3) {}"),
    "tag tag2 tag4, tag tag2 tag5, tag tag3 {}",
    "should transform :matches() recursively"
  )

  t.equal(
    transform("p:matches(a, span) {}"),
    "pa, pspan {}",
    "should transform shit if you ask for shit ?"
  )

  t.equal(
    transform(".foo:matches(:nth-child(-n+2), .bar) {}"),
    ".foo:nth-child(-n+2), .foo.bar {}",
    "should transform childs with parenthesis"
  )

  t.equal(
    transform(`a:matches(
  .b,
  .c
) {}`),
    "a.b, a.c {}",
    "should works with lots of whitespace"
  )

  t.equal(
    transform(".foo:matches(:nth-child(-n+2), .bar) {}", {lineBreak: true}),
    ".foo:nth-child(-n+2),\n.foo.bar {}",
    "should add line break if asked too"
  )

  t.equal(
    transform("  .foo:matches(:nth-child(-n+2), .bar) {}", {lineBreak: true}),
    "  .foo:nth-child(-n+2),\n  .foo.bar {}",
    "should add line break if asked too, and respect indentation"
  )

  t.end()
})
