# Template for HW2, problem #6 (Python 3)

import sys, re

# To test, use
#
#    python3 cleanup.py INPUTFILE
#
# or
#
#    python3 cleanup.py < INPUTFILE

# Replace the definition of ANSWER, below, to solve the problem (feel free
# to construct ANSWER out of string expressions other than the single literal
# shown). In ANSWER, the first captured group (i.e., captured by
# the (...) construct with the leftmost left parenthesis) should be the
# complete first set of lines for a block (headed by repo...), that is
# to be removed.  As indicated in the problem statement, you may assume
# the input has the correct form; it is NOT necessary that your pattern match
# only correct configurations (and it simplifies your task enormously if you
# make it forgiving of errors.)

# Assume every line of the file is properly terminated by an end-of-line
# sequence.  An end-of-line pattern that works on MacOS, Unix, and Windows is
#    \r?\n

ANSWER = r'REPLACE WITH SOMETHING'

if len(sys.argv) > 1:
    inp = open(sys.argv[1])
else:
    inp = sys.stdin


contents = inp.read()
pattern = re.compile(ANSWER, re.MULTILINE)
# MULTILINE means that ^ and $ will match the beginnings and ends of lines
#   (before and after end-of-line sequences), as well as the beginning and
#   end of the whole string.

while True:
    mat = pattern.search(contents)
    if mat:
        contents = contents[0 : mat.start(1)] + contents[mat.end(1): ]
    else:
        break
print(contents, end="")
