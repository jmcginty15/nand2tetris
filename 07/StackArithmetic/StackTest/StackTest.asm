@endPushToStack
0;JMP
(pushToStack)
@SP
A=M
M=D
@SP
M=M+1
@R13
A=M
0;JMP
(endPushToStack)
@returnAddress12
D=A
@R13
M=D
@17
D=A
@pushToStack
0;JMP
(returnAddress12)
@returnAddress13
D=A
@R13
M=D
@17
D=A
@pushToStack
0;JMP
(returnAddress13)
@endPopFromStack
0;JMP
(popFromStack)
@SP
M=M-1
A=M
D=M
@R13
A=M
0;JMP
(endPopFromStack)
@endEq
0;JMP
(eq)
@returnAddress3
D=A
@R13
M=D
@popFromStack
0;JMP
(returnAddress3)
@R15
M=D
@returnAddress4
D=A
@R13
M=D
@R15
D=M
@SP
M=M-1
A=M
D=M-D
@equals
D;JEQ
D=0
@enterResult
0;JMP
(equals)
D=-1
(enterResult)
@pushToStack
0;JMP
(returnAddress4)
@R14
A=M
0;JMP
(endEq)
@returnAddress14
D=A
@R14
M=D
@eq
0;JMP
(returnAddress14)
@returnAddress15
D=A
@R13
M=D
@17
D=A
@pushToStack
0;JMP
(returnAddress15)
@returnAddress16
D=A
@R13
M=D
@16
D=A
@pushToStack
0;JMP
(returnAddress16)
@returnAddress17
D=A
@R14
M=D
@eq
0;JMP
(returnAddress17)
@returnAddress18
D=A
@R13
M=D
@16
D=A
@pushToStack
0;JMP
(returnAddress18)
@returnAddress19
D=A
@R13
M=D
@17
D=A
@pushToStack
0;JMP
(returnAddress19)
@returnAddress20
D=A
@R14
M=D
@eq
0;JMP
(returnAddress20)
@returnAddress21
D=A
@R13
M=D
@892
D=A
@pushToStack
0;JMP
(returnAddress21)
@returnAddress22
D=A
@R13
M=D
@891
D=A
@pushToStack
0;JMP
(returnAddress22)
@endLt
0;JMP
(lt)
@returnAddress7
D=A
@R13
M=D
@popFromStack
0;JMP
(returnAddress7)
@R15
M=D
@returnAddress8
D=A
@R13
M=D
@R15
D=M
@SP
M=M-1
A=M
D=M-D
@equals
D;JLT
D=0
@enterResult
0;JMP
(equals)
D=-1
(enterResult)
@pushToStack
0;JMP
(returnAddress8)
@R14
A=M
0;JMP
(endLt)
@returnAddress23
D=A
@R14
M=D
@lt
0;JMP
(returnAddress23)
@returnAddress24
D=A
@R13
M=D
@891
D=A
@pushToStack
0;JMP
(returnAddress24)
@returnAddress25
D=A
@R13
M=D
@892
D=A
@pushToStack
0;JMP
(returnAddress25)
@returnAddress26
D=A
@R14
M=D
@lt
0;JMP
(returnAddress26)
@returnAddress27
D=A
@R13
M=D
@891
D=A
@pushToStack
0;JMP
(returnAddress27)
@returnAddress28
D=A
@R13
M=D
@891
D=A
@pushToStack
0;JMP
(returnAddress28)
@returnAddress29
D=A
@R14
M=D
@lt
0;JMP
(returnAddress29)
@returnAddress30
D=A
@R13
M=D
@32767
D=A
@pushToStack
0;JMP
(returnAddress30)
@returnAddress31
D=A
@R13
M=D
@32766
D=A
@pushToStack
0;JMP
(returnAddress31)
@endGt
0;JMP
(gt)
@returnAddress5
D=A
@R13
M=D
@popFromStack
0;JMP
(returnAddress5)
@R15
M=D
@returnAddress6
D=A
@R13
M=D
@R15
D=M
@SP
M=M-1
A=M
D=M-D
@equals
D;JGT
D=0
@enterResult
0;JMP
(equals)
D=-1
(enterResult)
@pushToStack
0;JMP
(returnAddress6)
@R14
A=M
0;JMP
(endGt)
@returnAddress32
D=A
@R14
M=D
@gt
0;JMP
(returnAddress32)
@returnAddress33
D=A
@R13
M=D
@32766
D=A
@pushToStack
0;JMP
(returnAddress33)
@returnAddress34
D=A
@R13
M=D
@32767
D=A
@pushToStack
0;JMP
(returnAddress34)
@returnAddress35
D=A
@R14
M=D
@gt
0;JMP
(returnAddress35)
@returnAddress36
D=A
@R13
M=D
@32766
D=A
@pushToStack
0;JMP
(returnAddress36)
@returnAddress37
D=A
@R13
M=D
@32766
D=A
@pushToStack
0;JMP
(returnAddress37)
@returnAddress38
D=A
@R14
M=D
@gt
0;JMP
(returnAddress38)
@returnAddress39
D=A
@R13
M=D
@57
D=A
@pushToStack
0;JMP
(returnAddress39)
@returnAddress40
D=A
@R13
M=D
@31
D=A
@pushToStack
0;JMP
(returnAddress40)
@returnAddress41
D=A
@R13
M=D
@53
D=A
@pushToStack
0;JMP
(returnAddress41)
@endAdd
0;JMP
(add)
@returnAddress0
D=A
@R13
M=D
@popFromStack
0;JMP
(returnAddress0)
@SP
M=M-1
A=M
M=D+M
@SP
M=M+1
@R14
A=M
0;JMP
(endAdd)
@returnAddress42
D=A
@R14
M=D
@add
0;JMP
(returnAddress42)
@returnAddress43
D=A
@R13
M=D
@112
D=A
@pushToStack
0;JMP
(returnAddress43)
@endSub
0;JMP
(sub)
@returnAddress1
D=A
@R13
M=D
@popFromStack
0;JMP
(returnAddress1)
@SP
M=M-1
A=M
M=M-D
@SP
M=M+1
@R14
A=M
0;JMP
(endSub)
@returnAddress44
D=A
@R14
M=D
@sub
0;JMP
(returnAddress44)
@endNeg
0;JMP
(neg)
@returnAddress2
D=A
@R13
M=D
@popFromStack
0;JMP
(returnAddress2)
@SP
A=M
M=-D
@SP
M=M+1
@R14
A=M
0;JMP
(endNeg)
@returnAddress45
D=A
@R14
M=D
@neg
0;JMP
(returnAddress45)
@endAnd
0;JMP
(and)
@returnAddress9
D=A
@R13
M=D
@popFromStack
0;JMP
(returnAddress9)
@SP
M=M-1
A=M
M=D&M
@SP
M=M+1
@R14
A=M
0;JMP
(endAnd)
@returnAddress46
D=A
@R14
M=D
@and
0;JMP
(returnAddress46)
@returnAddress47
D=A
@R13
M=D
@82
D=A
@pushToStack
0;JMP
(returnAddress47)
@endOr
0;JMP
(or)
@returnAddress10
D=A
@R13
M=D
@popFromStack
0;JMP
(returnAddress10)
@SP
M=M-1
A=M
M=D|M
@SP
M=M+1
@R14
A=M
0;JMP
(endOr)
@returnAddress48
D=A
@R14
M=D
@or
0;JMP
(returnAddress48)
@endNot
0;JMP
(not)
@returnAddress11
D=A
@R13
M=D
@popFromStack
0;JMP
(returnAddress11)
@SP
A=M
M=!D
@SP
M=M+1
@R14
A=M
0;JMP
(endNot)
@returnAddress49
D=A
@R14
M=D
@not
0;JMP
(returnAddress49)
(terminationLoop)
@terminationLoop
0;JMP