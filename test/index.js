import tape from "tape"

import postcss from "postcss"
import plugin from "../src"
import replaceRuleSelector from "../src/replaceRuleSelector"

function transform(css, options = {}) {
  return postcss(plugin(options)).process(css).css
}

tape("postcss-selector-matches", t => {
  t.ok(
    typeof replaceRuleSelector === "function",
    "expose 'replaceRuleSelector' function (for postcss-custom-selectors)"
  )

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
    transform("tag :matches(tag2, tag3) :matches(tag4, tag5), test {}"),
    "tag tag2 tag4, tag tag3 tag4, tag tag2 tag5, tag tag3 tag5, test {}",
    "should transform mutltiples :matches() with stuff after"
  )

  t.equal(
    transform(":matches(tag) :matches(tag2, tag3):hover {}"),
    "tag tag2:hover, tag tag3:hover {}",
    "should transform mutltiples :matches() with pseudo after"
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

  t.equal(
    transform("\n  .foo:matches(:nth-child(-n+2), .bar) {}", {lineBreak: true}),
    "\n  .foo:nth-child(-n+2),\n  .foo.bar {}",
    "should add line break if asked too, and respect indentation even with \n"
  )

  t.equal(
    transform(`
button:matches(:hover, :active),
.button:matches(:hover, :active) {}`),
    `
button:hover, button:active, .button:hover, .button:active {}`,
    "should avoid duplicates"
  )

  t.equal(
    transform(".foo:matches(:hover, :focus)::before {}"),
    ".foo:hover::before, .foo:focus::before {}",
    "should work with something after :matches()"
  )

  t.equal(
    transform("article :matches(h1, h2, h3) + p {}"),
    "article h1 + p, article h2 + p, article h3 + p {}",
    "should works correctly with adjacent selectors"
  )

  t.equal(
    transform("article :matches(h1, h2, h3) + p {}", {lineBreak: true}),
    `article h1 + p,
article h2 + p,
article h3 + p {}`,
    "should works correctly with adjacent selectors and line break"
  )

  t.equal(
    transform(".foo:matches(p) {color: red;}"),
    "p.foo {color: red;}",
    "should works correctly with a class and an element"
  )

  t.equal(
    transform(".fo--oo > :matches(h1, h2, h3) {}"),
    ".fo--oo > h1, .fo--oo > h2, .fo--oo > h3 {}",
    "regression https://github.com/postcss/postcss-selector-matches/issues/10"
  )

  t.equal(
    transform(":matches(h4, h5, h6):hover .ba--z {}"),
    "h4:hover .ba--z, h5:hover .ba--z, h6:hover .ba--z {}",
    "regression https://github.com/postcss/postcss-selector-matches/issues/10"
  )

  t.equal(
    transform(":matches(a, b).foo, .bar {}"),
    "a.foo, b.foo, .bar {}",
    "regression https://github.com/postcss/postcss-selector-matches/issues/10"
  )

  t.end()
})
