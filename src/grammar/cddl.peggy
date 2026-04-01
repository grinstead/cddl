// Auto-generated from src/grammar/cddl.abnf via npm abnf.
// Source ABNF: RFC 8610 Appendix B
// https://datatracker.ietf.org/doc/html/rfc8610#appendix-B
cddl
  = S (rule S)+

S
  = WS*

rule
  = typename genericparm? S assignt S type
  / groupname genericparm? S assigng S grpent

WS
  = SP
  / NL

typename
  = id

genericparm
  = "<" S id S ("," S id S)* ">"

assignt
  = "="
  / "/="

type
  = type1 (S "/" S type1)*

groupname
  = id

assigng
  = "="
  / "//="

grpent
  = (occur S)? (memberkey S)? type
  / (occur S)? groupname genericarg?
  / (occur S)? "(" S group S ")"

SP
  = " "

NL
  = COMMENT
  / CRLF

id
  = EALPHA (("-" / ".")* (EALPHA / DIGIT))*

type1
  = type2 (S (rangeop / ctlop) S type2)?

occur
  = uint? "*" uint?
  / "+"
  / "?"

memberkey
  = type1 S ("^" S)? "=>"
  / bareword S ":"
  / value S ":"

genericarg
  = "<" S type1 S ("," S type1 S)* ">"

group
  = grpchoice (S "//" S grpchoice)*

COMMENT
  = ";" PCHAR* CRLF

CRLF
  = "\n"
  / "\r\n"

EALPHA
  = ALPHA
  / "@"
  / "_"
  / "$"

DIGIT
  = [\x30-\x39]

type2
  = value
  / typename genericarg?
  / "(" S type S ")"
  / "{" S group S "}"
  / "[" S group S "]"
  / "~" S typename genericarg?
  / "&" S "(" S group S ")"
  / "&" S groupname genericarg?
  / "#" "6" ("." uint)? "(" S type S ")"
  / "#" DIGIT ("." uint)?
  / "#"

rangeop
  = "..."
  / ".."

ctlop
  = "." id

uint
  = DIGIT1 DIGIT*
  / "0x"i HEXDIG+
  / "0b"i BINDIG+
  / "0"

bareword
  = id

value
  = number
  / text
  / bytes

grpchoice
  = (grpent optcom)*

PCHAR
  = [\x20-\x7e]
  / [\x80-\ud7ff]
  / [\ue000-\uffff]
  / "\ud800" [\udc00-\udfff]
  / [\ud801-\udbfe] [\udc00-\udfff]
  / "\udbff" [\udc00-\udffd]

ALPHA
  = [\x41-\x5a]
  / [\x61-\x7a]

DIGIT1
  = [\x31-\x39]

HEXDIG
  = DIGIT
  / "A"i
  / "B"i
  / "C"i
  / "D"i
  / "E"i
  / "F"i

BINDIG
  = [\x30\x31]

number
  = hexfloat
  / (int ("." fraction)? ("e"i exponent)?)

text
  = "\"" SCHAR* "\""

bytes
  = bsqual? "'" BCHAR* "'"

optcom
  = S ("," S)?

hexfloat
  = "-"? "0x"i HEXDIG+ ("." HEXDIG+)? "p"i exponent

int
  = "-"? uint

fraction
  = DIGIT+

exponent
  = ("+" / "-")? DIGIT+

SCHAR
  = [\x20\x21]
  / [\x23-\x5b]
  / [\x5d-\x7e]
  / [\x80-\ud7ff]
  / [\ue000-\uffff]
  / "\ud800" [\udc00-\udfff]
  / [\ud801-\udbfe] [\udc00-\udfff]
  / "\udbff" [\udc00-\udffd]
  / SESC

bsqual
  = "h"i
  / "b64"i

BCHAR
  = [\x20-\x26]
  / [\x28-\x5b]
  / [\x5d-\ud7ff]
  / [\ue000-\uffff]
  / "\ud800" [\udc00-\udfff]
  / [\ud801-\udbfe] [\udc00-\udfff]
  / "\udbff" [\udc00-\udffd]
  / SESC
  / CRLF

SESC
  = "\\" ([\x20-\x7e] / [\x80-\ud7ff] / [\ue000-\uffff] / "\ud800" [\udc00-\udfff] / [\ud801-\udbfe] [\udc00-\udfff] / "\udbff" [\udc00-\udffd])

