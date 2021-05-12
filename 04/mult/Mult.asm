// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Mult.asm

// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)
//
// This program only needs to handle arguments that satisfy
// R0 >= 0, R1 >= 0, and R0*R1 < 32768.

// Put your code here.

@R1
D=M		// D = value of R1
@i
M=D		// i = value of R1
@product
M=0		// product initialized to zero

(LOOP)
    @i
    D=M		// D = value of i
    @END
    D;JEQ	// if i = 0, jump to END

    @i
    M=M-1	// decrement i by 1
    @R0
    D=M		// D = value of R0
    @product
    M=D+M	// increment product by value of R0

    @LOOP
    0;JMP	// jump back to LOOP
(END)
    @product
    D=M		// D = product
    @R2
    M=D		// R2 = product

    @END
    0;JMP	// termination loop