{
  // RFC 8610 Appendix B inspired grammar:
  // https://datatracker.ietf.org/doc/html/rfc8610#appendix-B
}

cddl
  = S rule:(rule S)+ !. { return rule.length; }

rule
  = typename genericparm? S assignt S type
  / groupname genericparm? S assigng S grpent

typename
  = id

groupname
  = id

assignt
  = "="
  / "/="

assigng
  = "="
  / "//="

genericparm
  = "<" S id S ("," S id S)* ">"

genericarg
  = "<" S type1 S ("," S type1 S)* ">"

type
  = type1 (S "/" S type1)*

type1
  = type2 (S (rangeop / ctlop) S type2)?

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

group
  = grpchoice (S "//" S grpchoice)*

grpchoice
  = (grpent optcom)*

grpent
  = occur? S? memberkey S type
  / occur? S? groupname genericarg?
  / occur? S? "(" S group S ")"

memberkey
  = type1 S "^"? S? "=>"
  / bareword S ":"
  / value S ":"

bareword
  = id

optcom
  = S ","? S

occur
  = uint? "*" uint?
  / "+"
  / "?"

uint
  = DIGIT1 DIGIT*
  / "0x" HEXDIG+
  / "0b" BINDIG+
  / "0"

value
  = number
  / text
  / bytes

int
  = "-"? uint

number
  = hexfloat
  / int ("." fraction)? ([eE] exponent)?

hexfloat
  = "-"? "0x" HEXDIG+ ("." HEXDIG+)? [pP] exponent

fraction
  = DIGIT+

exponent
  = [+-]? DIGIT+

text
  = "\"" SCHAR* "\""

SCHAR
  = [ !#-\[\]-~\u0080-\u{10FFFD}]
  / SESC

SESC
  = "\\" [\u0020-\u007E\u0080-\u{10FFFD}]

bytes
  = bsqual? "'" BCHAR* "'"

BCHAR
  = [ -&(-\[\]-\u{10FFFD}]
  / SESC
  / CRLF

bsqual
  = "h"
  / "b64"

id
  = EALPHA idtail*

idtail
  = ("-" / ".")* (EALPHA / DIGIT)

EALPHA
  = ALPHA
  / "@"
  / "_"
  / "$"

ALPHA
  = [A-Za-z]

DIGIT
  = [0-9]

DIGIT1
  = [1-9]

HEXDIG
  = [0-9A-F]
  / [a-f]

BINDIG
  = [01]

S
  = WS*

WS
  = SP
  / NL

SP
  = " "

NL
  = COMMENT
  / CRLF

COMMENT
  = ";" PCHAR* CRLF

PCHAR
  = [\u0020-\u007E\u0080-\u{10FFFD}]

CRLF
  = "\r\n"
  / "\n"
