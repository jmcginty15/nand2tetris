// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// Runs an infinite loop that listens to the keyboard input.
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel;
// the screen should remain fully black as long as the key is pressed. 
// When no key is pressed, the program clears the screen, i.e. writes
// "white" in every pixel;
// the screen should remain fully clear as long as no key is pressed.

// Put your code here.

@screenref
M=0		// screenref = 0

(LOOP)
    @screenref
    D=M
    @8192
    D=A-D
    @RESET
    D;JEQ	// if current screenref is at keyboard reference, reset

    @KBD
    D=M
    @WHITE
    D;JEQ	// if keyboard input is zero, make the pixel WHITE
    @BLACK
    0;JMP	// else make the pixel BLACK
@LOOP
0;JMP		// infinite loop

(WHITE)
    @SCREEN
    D=A		// D = starting screen reference
    @screenref
    A=D+M	// A = current screen reference
    M=0		// set current pixel to empty
    @screenref
    M=M+1	// increment screenref by 1

    @LOOP
    0;JMP

(BLACK)
    @SCREEN
    D=A		// D = starting screen reference
    @screenref
    A=D+M	// A = current screen reference
    M=-1	// set current pixel to filled
    @screenref
    M=M+1	// increment screenref by 1

    @LOOP
    0;JMP

(RESET)
    @0
    D=M
    @screenref
    M=D		// screenref = starting screen reference

    @LOOP
    0;JMP